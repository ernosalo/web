
import React, { useMemo, useState } from 'react';
import { Manager, Building, Era, Rarity } from '../types';
import { formatNumber, calculateBulkManagerRecruitCost } from '../logic';
import { ICON_MAP, INITIAL_BUILDINGS } from '../constants';

interface ManagerTabProps {
  managers: Manager[];
  science: number;
  currentEra: Era;
  buildings: Record<string, Building>;
  buyQuantity: number | 'next' | 'max';
  onFind: (qty: number | 'next' | 'max') => void;
  onUpgrade: (managerId: string) => void;
  onToggle: (managerId: string) => void;
}

const RARITY_COLORS: Record<Rarity, string> = {
  'Common': 'border-slate-500 text-slate-400 bg-slate-500/10',
  'Uncommon': 'border-emerald-500 text-emerald-400 bg-emerald-500/10',
  'Rare': 'border-sky-500 text-sky-400 bg-sky-500/10',
  'Epic': 'border-purple-500 text-purple-400 bg-purple-500/10',
  'Legendary': 'border-amber-500 text-amber-400 bg-amber-500/10',
  'God-like': 'border-rose-500 text-rose-400 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
};

const RARITY_RANK: Record<Rarity, number> = {
  'God-like': 5,
  'Legendary': 4,
  'Epic': 3,
  'Rare': 2,
  'Uncommon': 1,
  'Common': 0
};

const BOOST_LABELS: Record<string, string> = {
  'yield': 'Yield',
  'speed': 'Throughput',
  'efficiency': 'Resource Save',
  'special': 'Temporal Mastery'
};

type SortMode = 'facility' | 'rarity' | 'owned';

export const ManagerTab: React.FC<ManagerTabProps> = ({ managers, science, currentEra, buildings, buyQuantity, onFind, onUpgrade, onToggle }) => {
  const [sortMode, setSortMode] = useState<SortMode>('facility');
  const unlockedCount = managers.filter(m => m.unlocked).length;
  const buildingOrder = INITIAL_BUILDINGS.map(b => b.id);
  
  const sortedManagers = useMemo(() => {
    return [...managers].sort((a, b) => {
      if (sortMode === 'owned') {
        if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
        const aIdx = buildingOrder.indexOf(a.buildingId);
        const bIdx = buildingOrder.indexOf(b.buildingId);
        if (aIdx !== bIdx) return aIdx - bIdx;
        const aRank = RARITY_RANK[a.rarity];
        const bRank = RARITY_RANK[b.rarity];
        return bRank - aRank;
      }
      if (sortMode === 'facility') {
        const aIdx = buildingOrder.indexOf(a.buildingId);
        const bIdx = buildingOrder.indexOf(b.buildingId);
        if (aIdx !== bIdx) return aIdx - bIdx;
        if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
        const aRank = RARITY_RANK[a.rarity];
        const bRank = RARITY_RANK[b.rarity];
        return bRank - aRank;
      } else {
        const aRank = RARITY_RANK[a.rarity];
        const bRank = RARITY_RANK[b.rarity];
        if (aRank !== bRank) return bRank - aRank;
        const aIdx = buildingOrder.indexOf(a.buildingId);
        const bIdx = buildingOrder.indexOf(b.buildingId);
        if (aIdx !== bIdx) return aIdx - bIdx;
        return (a.unlocked === b.unlocked) ? 0 : (a.unlocked ? -1 : 1);
      }
    });
  }, [managers, buildingOrder, sortMode]);

  const bulkRecruit = useMemo(() => {
    return calculateBulkManagerRecruitCost(currentEra, unlockedCount, science, buyQuantity, managers);
  }, [currentEra, unlockedCount, science, buyQuantity, managers]);

  const canAffordFind = bulkRecruit.canAfford;

  return (
    <div className="space-y-6 sm:space-y-10">
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center bg-slate-900/60 p-6 sm:p-8 rounded-[2rem] border border-slate-800 gap-6">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-black text-emerald-400 uppercase italic">Recruitment Office</h2>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-1">Personnel pool for automation. Now with advanced filtering for your owned roster.</p>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest self-center mr-1">Sort By:</span>
            {(['facility', 'rarity', 'owned'] as SortMode[]).map(mode => (
              <button 
                key={mode}
                onClick={() => setSortMode(mode)}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest border transition-all 
                  ${sortMode === mode 
                    ? (mode === 'rarity' ? 'bg-amber-600 border-amber-400' : mode === 'owned' ? 'bg-sky-600 border-sky-400' : 'bg-emerald-600 border-emerald-400') + ' text-white shadow-lg' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => onFind(buyQuantity)}
          disabled={!canAffordFind}
          className={`px-6 sm:px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95 border-b-4 w-full lg:w-auto lg:min-w-[280px]
            ${canAffordFind ? 'bg-sky-600 border-sky-800 hover:bg-sky-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.3)]' : 'bg-slate-800 border-slate-900 text-slate-500 cursor-not-allowed opacity-50'}`}
        >
          <div className="flex flex-col">
            <span>Recruit {bulkRecruit.amount}x</span>
            <span className={`text-[9px] mt-0.5 ${canAffordFind ? 'text-sky-100' : 'text-rose-400 font-bold'}`}>
              ({formatNumber(bulkRecruit.costs)} Science)
            </span>
          </div>
        </button>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-20">
        {sortedManagers.map(m => {
          const upgradeReq = (m.level + 1) * 2;
          const canUpgrade = m.cards >= upgradeReq;
          const building = buildings[m.buildingId];
          const icon = building ? ICON_MAP[building.icon] : '👤';
          
          return (
            <div key={m.id} className={`p-5 sm:p-6 rounded-3xl border-2 bg-slate-800/80 transition-all group overflow-hidden relative flex flex-col h-full ${!m.unlocked ? 'opacity-30 grayscale pointer-events-none' : (m.isActive ? 'border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-slate-700 opacity-80 hover:opacity-100')}`}>
              <div className={`absolute -top-10 -right-10 w-24 h-24 blur-[40px] rounded-full opacity-20 ${RARITY_COLORS[m.rarity].split(' ')[1]}`} />
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-inner border ${m.isActive ? 'border-emerald-500/30' : 'border-slate-700/50'}`}>
                  {icon}
                </div>
                <div className="text-right">
                  <span className={`inline-block text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest mb-2 border ${RARITY_COLORS[m.rarity]}`}>
                    {m.rarity}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Archive</span>
                    <span className="text-base sm:text-lg font-mono font-black text-slate-200">{m.cards} / {upgradeReq}</span>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <h3 className="font-black text-lg sm:text-xl text-white leading-tight truncate">{m.name}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest">Level {m.level} Specialized</span>
                </div>
                {building && (
                  <div className="mt-2 text-[9px] sm:text-[10px] text-emerald-400/80 font-black uppercase tracking-tighter flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${m.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
                    Station: {building.name}
                  </div>
                )}
              </div>
              <div className="p-3 sm:p-4 bg-slate-900/50 rounded-2xl border border-slate-700 space-y-2 flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] sm:text-[10px] uppercase font-black text-slate-500">Status</span>
                  <button onClick={() => onToggle(m.id)} disabled={m.level === 0 || !m.unlocked} className={`text-[8px] sm:text-[9px] px-2 sm:px-3 py-1 rounded-full font-black tracking-widest border transition-all active:scale-90 ${m.isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-emerald-500/10 hover:text-emerald-500'}`}>{m.isActive ? 'ENABLED' : 'DISABLED'}</button>
                </div>
                {m.boosts.map((boost, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-[9px] sm:text-[10px] uppercase font-black text-slate-500">{BOOST_LABELS[boost.type]}</span>
                    <span className={`font-mono font-bold text-xs sm:text-sm ${boost.type === 'special' ? 'text-rose-400' : 'text-sky-400'}`}>
                      {boost.type === 'special' ? 'x' : '+'}{boost.type === 'special' ? (1 + (boost.value * m.level)).toFixed(1) : ((boost.value * m.level) * 100).toFixed(0) + '%'}
                    </span>
                  </div>
                ))}
              </div>
              <button onClick={() => onUpgrade(m.id)} disabled={!canUpgrade || !m.unlocked} className={`mt-5 sm:mt-6 w-full py-3 sm:py-3.5 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all border-b-4 ${canUpgrade ? 'bg-emerald-600 border-emerald-800 hover:bg-emerald-500 text-white shadow-lg active:scale-95' : 'bg-slate-700 border-slate-800 text-slate-500 opacity-40 cursor-not-allowed'}`}>{canUpgrade ? 'Advance Mastery' : 'Need More Cards'}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
