
import type { GameState, Building, ResourceMap, ResourceType, Manager } from './types';
import { Era } from './types';
import { INITIAL_BUILDINGS, INITIAL_MANAGERS, RESEARCH_TECHS, MILESTONES, ERA_ORDER } from './constants';
import { pack, unpack } from './crypto';

// Re-export crypto for legacy imports
export { pack, unpack };

// --- CONFIGURATION ---
export const MASTER_REGISTRY_KEY = 'era-tycoon-registry-v15';
export const ACTIVE_SLOT_KEY = 'era-tycoon-active-v15';
export const SAVE_VERSION = 15;
export const INITIAL_RESOURCES: Readonly<ResourceMap> = {
  food: 20, wood: 0, stone: 0, ore: 0, tools: 0, metal: 0, energy: 0, science: 0
} as const;

// --- RAM OPTIMIZED EXTERNAL STORE ---
export class ResourceStore {
  private listeners: Set<() => void> = new Set();
  private state: Record<string, number> = {};

  constructor(initial: Record<string, number>) {
    this.state = { ...initial };
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.state;

  update(key: string, value: number) {
    if (this.state[key] === value) return;
    this.state = { ...this.state, [key]: value };
    this.listeners.forEach(l => l());
  }

  batchUpdate(updates: Record<string, number>) {
    let changed = false;
    const nextState = { ...this.state };
    for (const k in updates) {
      if (nextState[k] !== updates[k]) {
        nextState[k] = updates[k];
        changed = true;
      }
    }
    if (changed) {
      this.state = nextState;
      this.listeners.forEach(l => l());
    }
  }
}

// --- SECURITY ---
export const secure = (val: number) => val;
export const reveal = (val: number) => val;

// --- FORMATTING ---
export const formatNumber = (num: number): string => {
  if (num === 0) return "0";
  const absNum = Math.abs(num);
  if (absNum < 1000) return num.toFixed(2);
  
  const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "Ud", "Dd"] as const;
  const exp = Math.floor(Math.log10(absNum));
  const suffixIndex = Math.floor(exp / 3);
  
  if (suffixIndex < suffixes.length && suffixes[suffixIndex] !== undefined) {
    const shortValue = num / Math.pow(10, suffixIndex * 3);
    return shortValue.toFixed(2) + suffixes[suffixIndex];
  }
  
  return num.toExponential(2).replace('e+', 'e');
};

export const getMilestoneBoost = (count: number) => {
  let boost = 1;
  for (const m of MILESTONES) {
    if (count >= m) boost *= 2;
    else break;
  }
  return boost;
};

export const getRefineMilestoneBoost = (level: number) => {
  let boost = 1;
  for (const m of MILESTONES) {
    if (level >= m) boost *= 3;
    else break;
  }
  return boost;
};

export const getManagerRecruitCost = (era: Era, unlockedCount: number): number => {
  const eraIdx = ERA_ORDER.indexOf(era);
  return Math.floor(800 * Math.pow(8, eraIdx) * Math.pow(1.4, unlockedCount));
};

export const calculateBulkManagerRecruitCost = (
  era: Era,
  currentUnlocked: number,
  science: number,
  qty: number | 'next' | 'max',
  managers?: Manager[]
): { amount: number, costs: number, canAfford: boolean } => {
  let targetQty = 0;
  if (typeof qty === 'number') {
    targetQty = qty;
  } else if (qty === 'next') {
    if (managers && managers.length > 0) {
      const unlocked = managers.filter(m => m.unlocked);
      if (unlocked.length > 0) {
        const diffs = unlocked.map(m => Math.max(1, ((m.level + 1) * 2) - m.cards));
        targetQty = Math.min(...diffs);
      } else {
        targetQty = 1;
      }
    } else {
      targetQty = 1;
    }
  } else {
    targetQty = Infinity;
  }

  const eraIdx = ERA_ORDER.indexOf(era);
  const base = 800 * Math.pow(8, eraIdx);
  const rate = 1.4;

  if (targetQty === Infinity) {
    const factor = (base * Math.pow(rate, currentUnlocked)) / (rate - 1);
    const n = Math.floor(Math.log(science / factor + 1) / Math.log(rate));
    const affordableQty = Math.max(0, n);
    const totalCost = factor * (Math.pow(rate, affordableQty) - 1);
    return { amount: affordableQty, costs: totalCost, canAfford: affordableQty > 0 };
  } else {
    const factor = (base * Math.pow(rate, currentUnlocked)) / (rate - 1);
    const totalCost = factor * (Math.pow(rate, targetQty) - 1);
    return { amount: targetQty, costs: totalCost, canAfford: science >= totalCost };
  }
};

export const calculateBulkCost = (
  building: Building,
  resources: ResourceMap,
  bonuses: any,
  qty: number | 'next' | 'max'
): { amount: number, targetAmount: number, costs: Partial<ResourceMap>, canAfford: boolean } => {
  const costReds = bonuses.cost_reduction || {};
  const currentCount = building.count;
  const rate = 1.25;
  const denom = rate - 1;
  
  const costKeys = Object.keys(building.baseCosts) as ResourceType[];
  const multipliers: Partial<ResourceMap> = {};
  
  for (const res of costKeys) {
    let m = building.baseCosts[res]!;
    if (costReds[res]) m *= costReds[res];
    if (costReds['all']) m *= costReds['all'];
    multipliers[res] = m;
  }

  let n = 0;
  if (typeof qty === 'number') {
    n = qty;
  } else if (qty === 'next') {
    const nextMilestone = MILESTONES.find(m => m > currentCount) || MILESTONES[MILESTONES.length - 1];
    n = Math.max(1, nextMilestone - currentCount);
  } else {
    let minN = Infinity;
    for (const res of costKeys) {
      const a = multipliers[res]! * Math.pow(rate, currentCount);
      const affordableN = Math.floor(Math.log((resources[res] * denom / a) + 1) / Math.log(rate));
      minN = Math.min(minN, Math.max(0, affordableN));
    }
    n = minN === Infinity ? 0 : minN;
  }

  const totalCosts: Partial<ResourceMap> = {};
  let canAfford = true;

  for (const res of costKeys) {
    const a = multipliers[res]! * Math.pow(rate, currentCount);
    const cost = a * (Math.pow(rate, n) - 1) / denom;
    totalCosts[res] = cost;
    if (resources[res] < cost) canAfford = false;
  }

  return { amount: n, targetAmount: n, costs: totalCosts, canAfford: n > 0 && canAfford };
};

export const calculateBulkUpgradeCost = (
  building: Building,
  resources: ResourceMap,
  bonuses: any,
  qty: number | 'next' | 'max'
): { amount: number, targetAmount: number, costs: Partial<ResourceMap>, canAfford: boolean } | null => {
  if (!building.upgradeBaseCosts) return null;
  const costReds = bonuses.cost_reduction || {};
  const currentLevel = building.upgradeLevel;
  const rate = 2.5;
  const denom = rate - 1;

  const costKeys = Object.keys(building.upgradeBaseCosts) as ResourceType[];
  const multipliers: Partial<ResourceMap> = {};
  
  for (const res of costKeys) {
    let m = building.upgradeBaseCosts[res]!;
    if (costReds[res]) m *= costReds[res];
    if (costReds['all']) m *= costReds['all'];
    multipliers[res] = m;
  }

  let n = 0;
  if (typeof qty === 'number') {
    n = qty;
  } else if (qty === 'next') {
    const nextMilestone = MILESTONES.find(m => m > currentLevel) || MILESTONES[MILESTONES.length - 1];
    n = Math.max(1, nextMilestone - currentLevel);
  } else {
    let minN = Infinity;
    for (const res of costKeys) {
      const a = multipliers[res]! * Math.pow(rate, currentLevel);
      const affordableN = Math.floor(Math.log((resources[res] * denom / a) + 1) / Math.log(rate));
      minN = Math.min(minN, Math.max(0, affordableN));
    }
    n = minN === Infinity ? 0 : Math.min(100, minN);
  }

  const totalCosts: Partial<ResourceMap> = {};
  let canAfford = true;

  for (const res of costKeys) {
    const a = multipliers[res]! * Math.pow(rate, currentLevel);
    const cost = a * (Math.pow(rate, n) - 1) / denom;
    totalCosts[res] = cost;
    if (resources[res] < cost) canAfford = false;
  }

  return { amount: n, targetAmount: n, costs: totalCosts, canAfford: n > 0 && canAfford };
};

const LEGACY_MANAGER_MAPPING: Record<string, string> = {
  'm1': 'm_b1_common', 'm2': 'm_worker1_common', 'm3': 'm_worker2_uncommon', 'm4': 'm_b2_uncommon',
  'm5': 'm_b_sci1_rare', 'm6': 'm_b3_common', 'm7': 'm_b_ind_wood_rare', 'm8': 'm_b_ind_tools_epic',
  'm9': 'm_worker3_uncommon', 'm10': 'm_b4_rare', 'm11': 'm_b5_rare', 'm12': 'm_b6_epic',
  'm13': 'm_b7_legendary', 'm14': 'm_b8_legendary', 'm15': 'm_b9_legendary', 'm16': 'm_b_q1_epic',
  'm17': 'm_b_q2_epic', 'm18': 'm_b_s1_legendary', 'm19': 'm_b_s2_legendary', 'm20': 'm_b_g1_god-like',
  'm21': 'm_b_g2_god-like', 'm22': 'm_b_t1_god-like', 'm23': 'm_b_t2_god-like',
};

export const sanitizeManagers = (loadedManagers: Record<string, Manager>): Record<string, Manager> => {
  const sanitized: Record<string, Manager> = { ...INITIAL_MANAGERS };
  
  if (loadedManagers) {
    Object.keys(loadedManagers).forEach(id => {
      let targetId = id;
      const loaded = loadedManagers[id];
      if (LEGACY_MANAGER_MAPPING[id]) targetId = LEGACY_MANAGER_MAPPING[id];

      if (sanitized[targetId]) {
        sanitized[targetId] = {
          ...sanitized[targetId],
          unlocked: loaded.unlocked ?? sanitized[targetId].unlocked,
          level: loaded.level ?? sanitized[targetId].level,
          cards: loaded.cards ?? sanitized[targetId].cards,
          isActive: loaded.isActive ?? sanitized[targetId].isActive
        };
      }
    });
  }

  const activeBuildings = new Set<string>();
  Object.keys(sanitized).forEach(id => {
    if (sanitized[id].isActive) {
      if (activeBuildings.has(sanitized[id].buildingId)) {
        sanitized[id].isActive = false;
      } else {
        activeBuildings.add(sanitized[id].buildingId);
      }
    }
  });

  return sanitized;
};

export const createInitialGameState = (slotId: number): GameState => {
  const initialBuildingMap: Record<string, Building> = {};
  INITIAL_BUILDINGS.forEach(b => { initialBuildingMap[b.id] = { ...b }; });
  return {
    resources: { ...INITIAL_RESOURCES },
    totalScienceEarned: 0,
    currentEra: Era.STONE_AGE,
    buildings: initialBuildingMap,
    researchedTechIds: [],
    managers: sanitizeManagers({}), // Pass empty to get initial set
    lastUpdate: Date.now(),
    slotId: Number(slotId),
    rebirthCount: 0,
    rebirthPoints: 0,
    totalRebirthPointsEarned: 0,
    rebirthUpgradeIds: []
  };
};

export const migrateGameState = (loaded: any, slotId: number): GameState => {
  const base = createInitialGameState(slotId);
  if (!loaded) return base;
  base.totalScienceEarned = loaded.totalScienceEarned ?? 0;
  base.rebirthCount = loaded.rebirthCount ?? 0;
  base.rebirthPoints = loaded.rebirthPoints ?? 0;
  base.totalRebirthPointsEarned = loaded.totalRebirthPointsEarned ?? 0;
  base.rebirthUpgradeIds = loaded.rebirthUpgradeIds ?? [];
  base.currentEra = loaded.currentEra || base.currentEra;
  base.lastUpdate = Date.now();
  if (loaded.resources) {
    (Object.keys(base.resources) as ResourceType[]).forEach(r => {
      if (loaded.resources[r] !== undefined) base.resources[r] = loaded.resources[r];
    });
  }
  if (Array.isArray(loaded.researchedTechIds)) {
    const validIds = RESEARCH_TECHS.map(t => t.id);
    base.researchedTechIds = loaded.researchedTechIds.filter((id: string) => validIds.includes(id));
  }
  if (loaded.buildings) {
    Object.keys(base.buildings).forEach(id => {
      if (loaded.buildings[id]) {
        base.buildings[id].count = loaded.buildings[id].count || 0;
        base.buildings[id].upgradeLevel = loaded.buildings[id].upgradeLevel || 0;
      }
    });
  }
  if (loaded.managers) base.managers = sanitizeManagers(loaded.managers);
  return base;
};
