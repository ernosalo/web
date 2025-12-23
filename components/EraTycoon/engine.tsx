
import { useState, useEffect, useCallback, useMemo, useSyncExternalStore, useRef } from 'react';
import type { GameState, Building, ResourceType, ResourceMap, SaveMetadata, Manager } from './types';
import { Era } from './types';
import { ERA_ORDER, ERA_REQUIREMENTS, RESEARCH_TECHS, REBIRTH_UPGRADES } from './constants';
import { 
  ResourceStore, getMilestoneBoost, getRefineMilestoneBoost, secure, reveal, 
  INITIAL_RESOURCES, migrateGameState, createInitialGameState,
  ACTIVE_SLOT_KEY, MASTER_REGISTRY_KEY, SAVE_VERSION, formatNumber, calculateBulkCost, calculateBulkUpgradeCost, getManagerRecruitCost, calculateBulkManagerRecruitCost
} from './logic';
import { pack } from './crypto';
import { parseArchive } from './compat';

interface Particle {
  x: number;
  y: number;
  text: string;
  alpha: number;
  life: number;
}

export const useGameEngine = (activeSlotId: number, setActiveSlotId: (id: number) => void, setSavesOpen: (v: boolean) => void) => {
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [lastAutosave, setLastAutosave] = useState<number>(Date.now());
  const [isSaving, setIsSaving] = useState(false);
  
  // PERFORMANCE: Track session ID to force store resets when initializing/loading
  const [sessionKey, setSessionKey] = useState<number>(Date.now());
  
  const particles = useRef<Particle[]>([]);
  const particlePool = useRef<Particle[]>([]);
  const tickUpdatesScratchpad = useRef<Record<string, number>>({});
  const manualGainsBuffer = useRef<Record<string, number>>({});

  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem(`era-tycoon-v15-slot-${activeSlotId}`);
    if (saved) {
      try { return migrateGameState(JSON.parse(saved), activeSlotId); } catch (e) {}
    }
    return createInitialGameState(activeSlotId);
  });

  const [saveMetadata, setSaveMetadata] = useState<SaveMetadata[]>(() => {
    const raw = localStorage.getItem(MASTER_REGISTRY_KEY);
    return raw ? JSON.parse(raw) : Array.from({ length: 5 }, (_, i) => ({
      id: i + 1, era: Era.STONE_AGE, science: 0, timestamp: Date.now(), isEmpty: true, isMain: i === 0, rebirthCount: 0
    }));
  });

  const store = useMemo(() => {
    const initial: any = {};
    Object.entries(gameState.resources).forEach(([k, v]) => initial[k] = secure(v as number));
    initial.totalScienceEarned = secure(gameState.totalScienceEarned as number);
    return new ResourceStore(initial);
  }, [gameState.slotId, gameState.rebirthCount, gameState.rebirthUpgradeIds.length, sessionKey]);

  const vault = useSyncExternalStore<Record<string, number>>(store.subscribe, store.getSnapshot);

  const resources = useMemo(() => {
    const r: any = {};
    for (const k in INITIAL_RESOURCES) {
        r[k] = reveal(vault[k] || secure(0));
    }
    return r as ResourceMap;
  }, [vault]);

  const totalScienceEarned = useMemo(() => reveal(vault['totalScienceEarned'] || secure(0)), [vault]);
  const rebirthBonus = useMemo(() => 1 + (gameState.rebirthCount * 2), [gameState.rebirthCount]);

  const bonuses = useMemo(() => {
    const b = { production: {} as any, cost_reduction: {} as any, consumption_reduction: {} as any, manual_yield: 1, science_gain: 1 };
    
    [...gameState.researchedTechIds, ...gameState.rebirthUpgradeIds].forEach(id => {
      const u = (RESEARCH_TECHS as any).find((t: any) => t.id === id) || (REBIRTH_UPGRADES as any).find((r: any) => r.id === id);
      if (!u) return;
      const { type, value, target } = u.bonus;
      if (type === 'production') b.production[target!] = (b.production[target!] || 1) * value;
      else if (type === 'cost_reduction') b.cost_reduction[target!] = (b.cost_reduction[target!] || 1) * value;
      else if (type === 'consumption_reduction') b.consumption_reduction[target!] = (b.consumption_reduction[target!] || 1) * value;
      else if (type === 'manual_yield') b.manual_yield *= value;
      else if (type === 'science_gain') b.science_gain *= value;
    });

    return b;
  }, [gameState.researchedTechIds, gameState.rebirthUpgradeIds]);

  const resourceRates = useMemo(() => {
    const rates: any = { food: 0, wood: 0, stone: 0, ore: 0, tools: 0, metal: 0, energy: 0, science: 0 };
    const eraIdx = ERA_ORDER.indexOf(gameState.currentEra);
    const buildingsArr = Object.values(gameState.buildings) as Building[];
    const managersArr = Object.values(gameState.managers) as Manager[];

    for (const b of buildingsArr) {
      if (b.count === 0) continue;
      const mgr = managersArr.find(m => m.buildingId === b.id && m.isActive);
      if (!mgr || mgr.level === 0) continue;

      const mastery = 1 + (Math.max(0, eraIdx - ERA_ORDER.indexOf(b.era)) * 0.5);
      const mBoost = getMilestoneBoost(b.count);
      const rBoost = getRefineMilestoneBoost(b.upgradeLevel);
      let yieldMult = 1, speedMult = 1, efficiencyMult = 1;

      for (const boost of mgr.boosts) {
        const val = boost.value * mgr.level;
        if (boost.type === 'yield') yieldMult += val;
        else if (boost.type === 'speed') speedMult += val;
        else if (boost.type === 'efficiency') efficiencyMult = Math.max(0.01, efficiencyMult - val);
        else if (boost.type === 'special') yieldMult *= (1 + val);
      }

      const globalProdMult = (bonuses.production['all'] || 1);
      const specificProdMult = (bonuses.production[b.produces.resource] || 1);
      const mult = (1 + (b.upgradeLevel * 0.5)) * specificProdMult * globalProdMult * mastery * rebirthBonus * mBoost * rBoost * yieldMult * speedMult;
      
      rates[b.produces.resource] += (b.count * b.produces.amount * mult);
      if (b.consumes) {
        let cMult = (bonuses.consumption_reduction[b.consumes.resource] || 1) * (bonuses.consumption_reduction['all'] || 1) * efficiencyMult * speedMult;
        rates[b.consumes.resource] -= (b.count * b.consumes.amount * cMult);
      }
    }
    rates['science'] *= (bonuses.science_gain || 1);
    return rates;
  }, [gameState.buildings, gameState.managers, gameState.currentEra, bonuses, rebirthBonus]);

  const pointsToEarn = useMemo(() => {
    const totalWealth = (resources.food * 0.0001) + (resources.wood * 0.0005) + (resources.stone * 0.001) + (resources.ore * 0.005) + (resources.tools * 0.05) + (resources.metal * 0.2) + (resources.energy * 1) + (totalScienceEarned * 10);
    return Math.max(0, Math.sqrt(totalWealth / 5e11));
  }, [resources, totalScienceEarned]);

  const persistState = useCallback(() => {
    setIsSaving(true);
    const stateToSave = { ...gameState, resources, totalScienceEarned };
    
    // PERFORMANCE: Unblock UI thread for critical feedback
    setTimeout(() => {
      localStorage.setItem(`era-tycoon-v15-slot-${gameState.slotId}`, JSON.stringify(stateToSave));
      localStorage.setItem(ACTIVE_SLOT_KEY, gameState.slotId.toString());
      
      setSaveMetadata(prev => {
        const nextMeta = prev.map(m => m.id === gameState.slotId ? { ...m, era: gameState.currentEra, science: resources.science, timestamp: Date.now(), isEmpty: false, rebirthCount: gameState.rebirthCount } : m);
        localStorage.setItem(MASTER_REGISTRY_KEY, JSON.stringify(nextMeta));
        return nextMeta;
      });
      setLastAutosave(Date.now());
      setIsSaving(false);
    }, 0);
  }, [gameState, resources, totalScienceEarned]);

  const saveRef = useRef(persistState);
  useEffect(() => { saveRef.current = persistState; }, [persistState]);

  useEffect(() => {
    if (!isGameRunning) return;
    const timer = setInterval(() => {
      const snap = store.getSnapshot();
      let hasChanges = false;
      const updates = tickUpdatesScratchpad.current;
      for (const key in updates) delete updates[key];

      for (const r in resourceRates) {
        const delta = resourceRates[r] * 0.1;
        if (delta !== 0) {
          const curVal = reveal(updates[r] || snap[r] || secure(0));
          updates[r] = secure(Math.max(0, curVal + delta));
          hasChanges = true;
          if (r === 'science' && delta > 0) {
            const curTotal = reveal(updates.totalScienceEarned || snap['totalScienceEarned'] || secure(0));
            updates.totalScienceEarned = secure(curTotal + delta);
          }
        }
      }

      for (const r in manualGainsBuffer.current) {
        const gain = manualGainsBuffer.current[r];
        if (gain > 0) {
          const curVal = reveal(updates[r] || snap[r] || secure(0));
          updates[r] = secure(Math.max(0, curVal + gain));
          if (r === 'science') {
            const curTotal = reveal(updates.totalScienceEarned || snap['totalScienceEarned'] || secure(0));
            updates.totalScienceEarned = secure(curTotal + gain);
          }
          manualGainsBuffer.current[r] = 0;
          hasChanges = true;
        }
      }

      if (hasChanges) store.batchUpdate(updates);
    }, 100);
    return () => clearInterval(timer);
  }, [isGameRunning, resourceRates, store]);

  useEffect(() => {
    if (!isGameRunning) return;
    const saveTimer = setInterval(() => saveRef.current(), 10000);
    return () => clearInterval(saveTimer);
  }, [isGameRunning]);

  const spawnParticle = useCallback((x: number, y: number, text: string) => {
    if (particles.current.length > 50) return;
    const p = particlePool.current.pop() || { x: 0, y: 0, text: '', alpha: 1, life: 60 };
    p.x = x; p.y = y; p.text = `+${text}`; p.alpha = 1.0; p.life = 60;
    particles.current.push(p);
  }, []);

  const manualGather = useCallback((id: string, x: number, y: number) => {
    const b = gameState.buildings[id];
    const eraIdx = ERA_ORDER.indexOf(gameState.currentEra);
    const mastery = 1 + (Math.max(0, eraIdx - ERA_ORDER.indexOf(b.era)) * 0.5);
    const globalProdMult = (bonuses.production['all'] || 1);
    const specificProdMult = (bonuses.production[b.produces.resource] || 1);
    const mult = (1 + (b.upgradeLevel * 0.5)) * bonuses.manual_yield * globalProdMult * specificProdMult * mastery * rebirthBonus * getMilestoneBoost(b.count) * getRefineMilestoneBoost(b.upgradeLevel);
    const gain = (1 + b.count) * mult;
    
    manualGainsBuffer.current[b.produces.resource] = (manualGainsBuffer.current[b.produces.resource] || 0) + gain;
    spawnParticle(x, y, formatNumber(gain));
  }, [gameState.buildings, gameState.currentEra, bonuses, rebirthBonus, spawnParticle]);

  const buyBuilding = useCallback((id: string, qty: number | 'next' | 'max') => {
    const b = gameState.buildings[id];
    const { amount, costs, canAfford } = calculateBulkCost(b, resources, bonuses, qty);
    if (canAfford) {
      const snap = store.getSnapshot();
      Object.entries(costs).forEach(([res, val]) => {
        const curVal = reveal(snap[res] || secure(0));
        store.update(res, secure(curVal - (val as number)));
      });
      setGameState(p => ({ ...p, buildings: { ...p.buildings, [id]: { ...b, count: b.count + amount } } }));
    }
  }, [gameState.buildings, resources, bonuses, store]);

  const handleUpgradeBuilding = useCallback((id: string, qty: number | 'next' | 'max') => {
    const b = gameState.buildings[id];
    const bulk = calculateBulkUpgradeCost(b, resources, bonuses, qty);
    if (!bulk || !bulk.canAfford) return;

    const snap = store.getSnapshot();
    Object.entries(bulk.costs).forEach(([res, val]) => {
      const curVal = reveal(snap[res] || secure(0));
      store.update(res, secure(curVal - (val as number)));
    });
    setGameState(p => ({ ...p, buildings: { ...p.buildings, [id]: { ...b, upgradeLevel: b.upgradeLevel + bulk.amount } } }));
  }, [gameState.buildings, resources, bonuses, store]);

  const handleResearch = useCallback((techId: string) => {
    const tech = RESEARCH_TECHS.find(t => t.id === techId);
    if (tech && resources.science >= tech.cost) {
      const snap = store.getSnapshot();
      store.update('science', secure(reveal(snap['science'] || secure(0)) - tech.cost));
      setGameState(p => ({ ...p, researchedTechIds: [...p.researchedTechIds, techId] }));
    }
  }, [resources.science, store]);

  const handleRecruitManager = useCallback((qty: number | 'next' | 'max') => {
    const managersList = Object.values(gameState.managers) as Manager[];
    const unlockedCount = managersList.filter(m => m.unlocked).length;
    const bulk = calculateBulkManagerRecruitCost(gameState.currentEra, unlockedCount, resources.science, qty, managersList);

    if (bulk.canAfford) {
      const snap = store.getSnapshot();
      store.update('science', secure(reveal(snap['science'] || secure(0)) - bulk.costs));
      const rarityWeights: Record<string, number> = { 'Common': 400, 'Uncommon': 300, 'Rare': 250, 'Epic': 150, 'Legendary': 60, 'God-like': 20 };
      const totalWeight = managersList.reduce((acc, m) => acc + (rarityWeights[m.rarity] || 1), 0);

      setGameState(p => {
        const nextManagers = { ...p.managers };
        for (let i = 0; i < bulk.amount; i++) {
          let roll = Math.random() * totalWeight;
          let selectedId = managersList[0].id;
          for (const m of managersList) {
            const weight = rarityWeights[m.rarity] || 1;
            if (roll < weight) { selectedId = m.id; break; }
            roll -= weight;
          }
          const target = nextManagers[selectedId];
          if (!target.unlocked) { target.unlocked = true; target.level = 1; target.cards = 1; }
          else target.cards += 1;
        }
        return { ...p, managers: nextManagers };
      });
    }
  }, [gameState.currentEra, gameState.managers, resources.science, store]);

  const handleUpgradeManager = useCallback((id: string) => {
    const m = gameState.managers[id];
    const req = (m.level + 1) * 2;
    if (m.cards >= req) setGameState(p => ({ ...p, managers: { ...p.managers, [id]: { ...m, level: m.level + 1, cards: m.cards - req } } }));
  }, [gameState.managers]);

  const handleToggleManager = useCallback((id: string) => {
    const m = gameState.managers[id];
    setGameState(p => {
      const next = { ...p.managers };
      const nextActiveState = !m.isActive;
      if (nextActiveState) {
        Object.keys(next).forEach(mid => {
          if (next[mid].buildingId === m.buildingId) next[mid] = { ...next[mid], isActive: false };
        });
      }
      next[id] = { ...m, isActive: nextActiveState };
      return { ...p, managers: next };
    });
  }, [gameState.managers]);

  const handleRebirth = useCallback(() => {
    if (pointsToEarn < 1) return;
    setGameState(p => {
      const fresh = createInitialGameState(p.slotId);
      return { ...fresh, rebirthCount: p.rebirthCount + 1, rebirthPoints: p.rebirthPoints + pointsToEarn, totalRebirthPointsEarned: p.totalRebirthPointsEarned + pointsToEarn, rebirthUpgradeIds: p.rebirthUpgradeIds, managers: p.managers };
    });
    setSessionKey(Date.now());
  }, [pointsToEarn]);

  const handleBuyRebirthUpgrade = useCallback((upgradeId: string) => {
    const upgrade = REBIRTH_UPGRADES.find(u => u.id === upgradeId);
    if (upgrade && gameState.rebirthPoints >= upgrade.cost && !gameState.rebirthUpgradeIds.includes(upgradeId)) {
      setGameState(p => ({ ...p, rebirthPoints: p.rebirthPoints - upgrade.cost, rebirthUpgradeIds: [...p.rebirthUpgradeIds, upgradeId] }));
    }
  }, [gameState.rebirthPoints, gameState.rebirthUpgradeIds]);

  const advanceEra = useCallback(() => {
    const idx = ERA_ORDER.indexOf(gameState.currentEra);
    if (idx < ERA_ORDER.length - 1) {
      const next = ERA_ORDER[idx + 1];
      if (resources.science >= ERA_REQUIREMENTS[next]) setGameState(p => ({ ...p, currentEra: next }));
    }
  }, [gameState.currentEra, resources.science]);

  const handleLoadFromSlot = useCallback((slotId: number) => {
    const saved = localStorage.getItem(`era-tycoon-v15-slot-${slotId}`);
    if (saved) {
      const parsed = migrateGameState(JSON.parse(saved), slotId);
      setSessionKey(Date.now()); // Force reset store with new data
      setGameState(parsed);
      setActiveSlotId(slotId);
      setIsGameRunning(true);
      setSavesOpen(false);
      localStorage.setItem(ACTIVE_SLOT_KEY, slotId.toString());
    }
  }, [setActiveSlotId, setSavesOpen]);

  const handleStartNew = useCallback((slotId: number) => {
    const newState = createInitialGameState(slotId);
    setSessionKey(Date.now()); // Force reset store with new data
    setGameState(newState);
    setActiveSlotId(slotId);
    setIsGameRunning(true);
    setSavesOpen(false);
    
    // PERFORMANCE: Deferred I/O
    setTimeout(() => {
      localStorage.setItem(`era-tycoon-v15-slot-${slotId}`, JSON.stringify(newState));
      localStorage.setItem(ACTIVE_SLOT_KEY, slotId.toString());
      setSaveMetadata(prev => {
        const next = prev.map(m => m.id === slotId ? { ...m, era: Era.STONE_AGE, science: 0, timestamp: Date.now(), isEmpty: false, rebirthCount: 0 } : m);
        localStorage.setItem(MASTER_REGISTRY_KEY, JSON.stringify(next));
        return next;
      });
    }, 0);
  }, [setActiveSlotId, setSavesOpen]);

  const handleSetMain = useCallback((id: number) => {
    setSaveMetadata(prev => {
      const next = prev.map(m => ({ ...m, isMain: m.id === id }));
      localStorage.setItem(MASTER_REGISTRY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleDeleteSlot = useCallback((slotId: number) => {
    localStorage.removeItem(`era-tycoon-v15-slot-${slotId}`);
    setSaveMetadata(prev => {
      const nextMeta = prev.map(m => m.id === slotId ? { ...m, isEmpty: true, science: 0, era: Era.STONE_AGE } : m);
      localStorage.setItem(MASTER_REGISTRY_KEY, JSON.stringify(nextMeta));
      return nextMeta;
    });
  }, []);

  const handleExport = useCallback(() => {
    const archive = { version: SAVE_VERSION, registry: saveMetadata, slots: {} as any };
    saveMetadata.forEach(m => { 
      const data = localStorage.getItem(`era-tycoon-v15-slot-${m.id}`); 
      if (data) archive.slots[m.id] = JSON.parse(data); 
    });
    const content = pack(JSON.stringify(archive));
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `era-tycoon-v${SAVE_VERSION}-${Date.now()}.chronicle`;
    a.click();
    URL.revokeObjectURL(url);
  }, [saveMetadata]);

  const handleImport = useCallback((data: string) => {
    const parsedArchive = parseArchive(data);
    if (parsedArchive) {
      if (parsedArchive.version === SAVE_VERSION) {
        localStorage.setItem(MASTER_REGISTRY_KEY, JSON.stringify(parsedArchive.registry));
        Object.entries(parsedArchive.slots).forEach(([id, slotData]) => { 
          localStorage.setItem(`era-tycoon-v15-slot-${id}`, JSON.stringify(slotData)); 
        });
        window.location.reload();
      } else alert(`Version mismatch: Archive is v${parsedArchive.version}, app is v${SAVE_VERSION}`);
    } else alert("Import failed: Archive is corrupted or using an incompatible encryption version.");
  }, []);

  return {
    gameState, saveMetadata, isGameRunning, setIsGameRunning, store, vault,
    resources, resourceRates, totalScienceEarned, rebirthBonus, bonuses, particles, particlePool,
    lastAutosave, isSaving, pointsToEarn,
    actions: { 
      buyBuilding, handleUpgradeBuilding, handleResearch, handleRecruitManager, handleUpgradeManager, 
      handleToggleManager, advanceEra, manualGather, persistState, 
      handleLoadFromSlot, handleStartNew, handleSetMain, handleDeleteSlot, 
      handleExport, handleImport, handleRebirth, handleBuyRebirthUpgrade
    }
  };
};
