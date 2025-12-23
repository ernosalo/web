
import React, { useMemo, memo } from 'react';
import { Building, ResourceMap, ResourceType, Era, Manager, Rarity } from '../types';
import { ICON_MAP, ERA_ORDER, MILESTONES, REBIRTH_UPGRADES } from '../constants';
import { formatNumber, getMilestoneBoost, getRefineMilestoneBoost, calculateBulkCost, calculateBulkUpgradeCost } from '../logic';

interface BuildingCardProps {
  building: Building;
  currentEra: Era;
  onBuy: (id: string, qty: number | 'next' | 'max') => void;
  onRefine: (id: string, qty: number | 'next' | 'max') => void;
  onGather: (id: string, x: number, y: number) => void;
  currentResources: ResourceMap;
  buyQuantity: number | 'next' | 'max';
  bonuses: any;
  rebirthBonus: number;
  rebirthUpgradeIds: string[];
  manager?: Manager;
}

const RARITY_THEME: Record<Rarity, string> = {
  'Common': 'text-slate-400 border-slate-700 bg-slate-800/40',
  'Uncommon': 'text-emerald-400 border-emerald-800/30 bg-emerald-900/10',
  'Rare': 'text-sky-400 border-sky-800/30 bg-sky-900/10',
  'Epic': 'text-purple-400 border-purple-500/40 bg-purple-900/20 shadow-[0_0_15px_rgba(168,85,247,0.2)] border-purple-400/30',
  'Legendary': 'text-amber-400 border-amber-500/40 bg-amber-900/20 shadow-[0_0_20px_rgba(245,158,11,0.3)] border-amber-400/30',
  'God-like': 'text-rose-400 border-rose-500/50 bg-rose-900/30 shadow-[0_0_30px_rgba(244,63,94,0.4)] border-rose-400/50 ring-1 ring-rose-500/10'
};

const ERA_TAG_THEME: Record<Era, string> = {
  [Era.STONE_AGE]: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  [Era.CLASSICAL_AGE]: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  [Era.INDUSTRIAL_AGE]: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  [Era.ATOMIC_AGE]: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  [Era.INFORMATION_AGE]: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
  [Era.QUANTUM_AGE]: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  [Era.STELLAR_AGE]: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  [Era.GALACTIC_AGE]: 'text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/20',
  [Era.TRANSCENDENCE_AGE]: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
};

export const BuildingCard: React.FC<BuildingCardProps> = memo(({ 
  building, currentEra, onBuy, onRefine, onGather, currentResources, buyQuantity, bonuses, rebirthBonus, rebirthUpgradeIds, manager 
}) => {
  const { nextMilestone, progress } = useMemo(() => {
    const next = MILESTONES.find(m => m > building.count) || MILESTONES[MILESTONES.length - 1];
    const prev = [...MILESTONES].reverse().find(m => m <= building.count) || 0;
    return {
      nextMilestone: next,
      progress: ((building.count - prev) / (next - prev)) * 100
    };
  }, [building.count]);

  const refineMilestone = useMemo(() => {
    const next = MILESTONES.find(m => m > building.upgradeLevel) || MILESTONES[MILESTONES.length - 1];
    const prev = [...MILESTONES].reverse().find(m => m <= building.upgradeLevel) || 0;
    return {
      next: next,
      progress: ((building.upgradeLevel - prev) / (next - prev)) * 100
    };
  }, [building.upgradeLevel]);

  const { multiplier, specialMult, isHighRarity, activeLegacyUpgrades } = useMemo(() => {
    const currentEraIdx = ERA_ORDER.indexOf(currentEra);
    const buildingEraIdx = ERA_ORDER.indexOf(building.era);
    const mastery = 1 + (Math.max(0, currentEraIdx - buildingEraIdx) * 0.5); 
    const mBoost = getMilestoneBoost(building.count);
    const rBoost = getRefineMilestoneBoost(building.upgradeLevel);

    let yM = 1, sM = 1, specM = 1;
    let high = false;
    if (manager && manager.isActive) {
      if (['Epic', 'Legendary', 'God-like'].includes(manager.rarity)) high = true;
      for (const b of manager.boosts) {
        if (b.type === 'yield') yM += b.value * manager.level;
        if (b.type === 'speed') sM += b.value * manager.level;
        if (b.type === 'special') specM *= (1 + (b.value * manager.level));
      }
    }

    const globalProdMult = (bonuses.production['all'] || 1);
    const specificProdMult = (bonuses.production[building.produces.resource] || 1);

    const mult = (1 + (building.upgradeLevel * 0.5)) * specificProdMult * globalProdMult * mastery * rebirthBonus * mBoost * rBoost * yM * sM;
    
    // CONTEXT-AWARE FILTERING: Only show legacy upgrades that are relevant to THIS facility
    const legacy = REBIRTH_UPGRADES.filter(u => {
      // 1. Must be owned
      if (!rebirthUpgradeIds.includes(u.id)) return false;

      const { type, target } = u.bonus;

      // 2. Production/Yield checks
      if (type === 'production' || type === 'manual_yield') {
        if (target === 'all') return true;
        return target === building.produces.resource;
      }

      // 3. Science Gain checks
      if (type === 'science_gain') {
        return building.produces.resource === 'science';
      }

      // 4. Cost Reduction checks
      if (type === 'cost_reduction') {
        // Handle specific hard-coded description logic (like Earthly Affinity for Wood/Stone)
        if (u.id === 'rb_res_1') {
           const usesStoneOrWood = 
             building.baseCosts.wood !== undefined || 
             building.baseCosts.stone !== undefined || 
             (building.upgradeBaseCosts && (building.upgradeBaseCosts.wood !== undefined || building.upgradeBaseCosts.stone !== undefined));
           return usesStoneOrWood;
        }

        if (target === 'all') return true;
        
        // Target-specific check
        const usesTarget = 
          building.baseCosts[target!] !== undefined || 
          (building.upgradeBaseCosts && building.upgradeBaseCosts[target!] !== undefined);
        return usesTarget;
      }

      // 5. Consumption Reduction checks
      if (type === 'consumption_reduction') {
        if (!building.consumes) return false;
        if (target === 'all') return true;
        return target === building.consumes.resource;
      }

      return false;
    }); 

    return { multiplier: mult, specialMult: specM, isHighRarity: high, activeLegacyUpgrades: legacy };
  }, [building.count, building.upgradeLevel, building.era, building.produces.resource, currentEra, manager?.level, manager?.isActive, manager?.rarity, rebirthBonus, bonuses, rebirthUpgradeIds]);

  const bulkData = useMemo(() => {
    let res = calculateBulkCost(building, currentResources, bonuses, buyQuantity);
    if (buyQuantity === 'max' && res.amount === 0) {
      const displayRes = calculateBulkCost(building, currentResources, bonuses, 1);
      return { ...displayRes, amount: 0, targetAmount: 0, canAfford: false };
    }
    return res;
  }, [building, currentResources, bonuses, buyQuantity]);

  const bulkRefineData = useMemo(() => {
    const res = calculateBulkUpgradeCost(building, currentResources, bonuses, buyQuantity);
    if (!res) return null;
    if (buyQuantity === 'max' && res.amount === 0) {
      const displayRes = calculateBulkUpgradeCost(building, currentResources, bonuses, 1);
      if (displayRes) {
        return { ...displayRes, amount: 0, targetAmount: 0, canAfford: false };
      }
    }
    return res;
  }, [building, currentResources, bonuses, buyQuantity]);

  const isAutomated = !!(manager && manager.isActive && manager.level > 0);
  const hasLegacyBoost = rebirthBonus > 1 || activeLegacyUpgrades.length > 0;

  const displayRefineAmount = useMemo(() => {
    if (!bulkRefineData) return 0;
    return buyQuantity === 'max' ? bulkRefineData.amount : bulkRefineData.targetAmount;
  }, [buyQuantity, bulkRefineData]);

  return (
    <div 
      onClick={(e) => onGather(building.id, e.clientX, e.clientY)}
      className={`p-5 rounded-3xl border-2 bg-slate-900/60 border-slate-800 transition-all cursor-pointer select-none active:scale-[0.98] hover:bg-slate-800/80 group overflow-hidden flex flex-col h-full min-h-[30rem] ${isHighRarity ? 'border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]' : ''}`}
    >
      <div className="flex justify-between items-start mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
             <span className="text-4xl drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">{ICON_MAP[building.icon] || '🏗️'}</span>
             {isAutomated && (
               <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse" />
             )}
          </div>
          <div>
            <h3 className="font-black text-lg text-white leading-tight">{building.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{building.type}</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span className={`text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded border whitespace-nowrap ${ERA_TAG_THEME[building.era]}`}>
                {building.era}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex flex-col items-end">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-tighter">Owned: {building.count}</span>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${isAutomated ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                {isAutomated ? 'AUTO' : 'MANUAL'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description Box - Using min-height and proper alignment to prevent clipping */}
      <div className="min-h-[2.5rem] mb-4 shrink-0 flex items-center">
        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{building.description}</p>
      </div>

      {/* Manager Status Block */}
      <div className="h-32 mb-4 overflow-hidden shrink-0">
        {manager && manager.isActive ? (
          <div className={`h-full p-4 rounded-2xl border flex flex-col justify-center gap-2 transition-all duration-300 ${RARITY_THEME[manager.rarity]} border-current/20 shadow-inner`}>
            <div className="flex justify-between items-center">
              <span className="text-[12px] font-black uppercase tracking-widest opacity-90 leading-none">LVL {manager.level} MANAGER</span>
            </div>
            
            <div className="w-full h-[1px] bg-current/10 my-0.5" />
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {manager.boosts.map((b, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-[10px] uppercase font-black opacity-60 leading-none mb-1">{b.type}</span>
                  <span className="text-[17px] font-black tracking-tight leading-none">
                    {b.type === 'special' ? 'x' : '+'}{formatNumber(b.type === 'special' ? (1 + b.value * manager.level) : b.value * manager.level * 100)}{b.type === 'special' ? '' : '%'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-full border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center bg-slate-900/40 gap-1 text-center p-4">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">No Manager Active</span>
            <span className="text-[8px] text-slate-600 font-bold uppercase leading-tight">Passive collection inactive<br/>Requires manager</span>
          </div>
        )}
      </div>

      {/* Legacy Synergy Section - Context-filtered legacy boosts */}
      {hasLegacyBoost && (
        <div className="mb-4 bg-rose-500/5 border border-rose-500/20 p-3 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-500 shrink-0 h-32 flex flex-col overflow-hidden">
           <div className="flex items-center gap-2 mb-2 shrink-0">
              <span className="text-rose-400 text-sm animate-pulse">✨</span>
              <span className="text-[9px] font-black uppercase text-rose-500/80 tracking-widest">Legacy Synergy Active</span>
           </div>
           <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
             <div className="flex flex-wrap gap-1.5">
                {rebirthBonus > 1 && (
                  <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded-md border border-rose-500/20 whitespace-nowrap">Mastery X{rebirthBonus}</span>
                )}
                {activeLegacyUpgrades.map(u => (
                  <span key={u.id} className="text-[8px] font-black uppercase px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded-md border border-rose-500/20 whitespace-nowrap">{u.shortDescription}</span>
                ))}
             </div>
           </div>
        </div>
      )}

      <div className="mt-auto space-y-4 shrink-0">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] uppercase font-black text-slate-500">
              <span>Progress to {nextMilestone}</span>
              <span className="text-sky-400">x2.0 Production</span>
            </div>
            <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
              <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] uppercase font-black text-slate-500">
              <span>Refine to Lv.{refineMilestone.next}</span>
              <span className="text-amber-400">x3.0 Production</span>
            </div>
            <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
              <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${refineMilestone.progress}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 shrink-0">
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              if (bulkData.canAfford) onBuy(building.id, buyQuantity); 
            }} 
            disabled={!bulkData.canAfford}
            className={`flex flex-col items-center justify-center py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all active:scale-95 border-b-2 h-14
              ${bulkData.canAfford ? 'bg-emerald-600 border-emerald-800 text-white' : 'bg-slate-800 border-slate-900 text-slate-500 opacity-60'}`}
          >
            <span className="truncate w-full text-center">Build {buyQuantity === 'max' ? bulkData.amount : bulkData.targetAmount}x</span>
            <div className="flex flex-wrap justify-center gap-x-1.5 gap-y-0.5 mt-0.5">
               {Object.entries(bulkData.costs).map(([res, val]) => (val as number > 0 || (buyQuantity === 'max' && bulkData.targetAmount === 0)) && (
                  <span key={res} className={`text-[10px] font-black flex items-center gap-0.5 ${(currentResources[res as ResourceType] < (val as number)) ? 'text-rose-400' : 'text-emerald-50'}`}>
                    {formatNumber(val as number)}{ICON_MAP[res]}
                  </span>
               ))}
            </div>
          </button>
          {bulkRefineData && (
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                if (bulkRefineData.canAfford) onRefine(building.id, buyQuantity); 
              }} 
              disabled={!bulkRefineData.canAfford}
              className={`flex flex-col items-center justify-center py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all active:scale-95 border-b-2 h-14
                ${bulkRefineData.canAfford ? 'bg-sky-600 border-sky-800 text-white' : 'bg-slate-800 border-slate-900 text-slate-500 opacity-60'}`}
            >
              <span className="truncate w-full text-center">Refine {displayRefineAmount}x</span>
              <div className="flex flex-wrap justify-center gap-x-1.5 gap-y-0.5 mt-0.5">
                 {Object.entries(bulkRefineData.costs).map(([res, val]) => (val as number > 0 || (buyQuantity === 'max' && bulkRefineData.targetAmount === 0)) && (
                    <span key={res} className={`text-[10px] font-black flex items-center gap-0.5 ${(currentResources[res as ResourceType] < (val as number)) ? 'text-rose-400' : 'text-sky-50'}`}>
                      {formatNumber(val as number)}{ICON_MAP[res]}
                    </span>
                 ))}
              </div>
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-800/60 flex justify-between items-center text-[11px] font-mono shrink-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-slate-500 uppercase font-black text-[10px]">Efficiency</span>
            {hasLegacyBoost && (
              <span className="text-rose-400 text-[10px] animate-pulse" title="Permanent Legacy Boost Active">✨</span>
            )}
          </div>
          <span className={`font-black text-sm transition-all duration-700 ${hasLegacyBoost ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]' : multiplier > 100 ? 'text-amber-400' : 'text-sky-400'}`}>
            x{formatNumber(multiplier)}
          </span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-slate-500 uppercase font-black text-[10px]">Total Yield</span>
          <span className="text-slate-200 font-black text-sm">{formatNumber(building.produces.amount * multiplier * specialMult)} {ICON_MAP[building.produces.resource]}/s</span>
        </div>
      </div>
    </div>
  );
});
