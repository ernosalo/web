
import React, { useMemo } from 'react';
import { REBIRTH_UPGRADES } from '../constants';
import { formatNumber } from '../logic';

interface RebirthTabProps {
  rebirthPoints: number;
  pointsToEarn: number;
  researchedUpgrades: string[];
  onRebirth: () => void;
  onBuyUpgrade: (id: string) => void;
}

export const RebirthTab: React.FC<RebirthTabProps> = ({ rebirthPoints, pointsToEarn, researchedUpgrades, onRebirth, onBuyUpgrade }) => {
  const sortedUpgrades = useMemo(() => {
    return [...REBIRTH_UPGRADES].sort((a, b) => a.cost - b.cost);
  }, []);

  return (
    <div className="space-y-8 sm:space-y-12 pb-32">
      <div className="bg-rose-950/20 border-2 border-rose-500/30 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 flex flex-col md:flex-row items-stretch md:items-center gap-6 sm:gap-10 shadow-[0_0_50px_rgba(244,63,94,0.1)] relative overflow-hidden shrink-0">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px]" />
        
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase italic tracking-tighter">Collapse the Timeline</h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
            Surrendering your current reality allows your consciousness to transcend. You will lose all buildings, resources, and research, but carry forward <span className="text-rose-400 font-black">Ethereal Knowledge</span> for your next incarnation.
          </p>
          <div className="flex items-center gap-6 pt-2 sm:pt-4">
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] uppercase font-black text-rose-500 tracking-widest">Available Rewards</span>
              <span className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                {pointsToEarn.toFixed(2)} <span className="text-rose-500">✨</span>
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => pointsToEarn >= 1 && onRebirth()}
          disabled={pointsToEarn < 1}
          className={`px-8 sm:px-12 py-5 sm:py-6 rounded-3xl font-black uppercase text-[10px] sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] transition-all border-b-4 sm:border-b-8 active:translate-y-1 active:border-b-4 shrink-0 w-full md:w-auto
            ${pointsToEarn >= 1 
              ? 'bg-rose-600 border-rose-800 hover:bg-rose-500 text-white shadow-[0_0_30px_rgba(244,63,94,0.4)]' 
              : 'bg-slate-800 border-slate-900 text-slate-500 cursor-not-allowed opacity-50'}`}
        >
          Transcend Reality
        </button>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase italic">Legacy Upgrades</h3>
            <p className="text-slate-500 text-[10px] sm:text-xs mt-1">Permanent enhancements that persist across all future timelines.</p>
          </div>
          <div className="bg-slate-900 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl border border-slate-800 flex flex-col items-start sm:items-end shadow-inner shrink-0 w-full sm:w-auto">
            <span className="text-[9px] sm:text-[10px] uppercase font-black text-slate-500 tracking-widest">Knowledge Bank</span>
            <span className="text-lg sm:text-xl font-black text-rose-400">{rebirthPoints.toFixed(2)} ✨</span>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {sortedUpgrades.map(upgrade => {
            const isOwned = researchedUpgrades.includes(upgrade.id);
            const canAfford = rebirthPoints >= upgrade.cost;
            
            return (
              <div key={upgrade.id} className={`p-5 sm:p-6 rounded-3xl border-2 transition-all relative flex flex-col min-h-[18rem] sm:min-h-[20rem] w-full overflow-hidden
                ${isOwned 
                  ? 'bg-rose-500/10 border-rose-500/40 shadow-rose-500/10' 
                  : 'bg-slate-900/40 border-slate-800 hover:border-rose-500/20'}`}>
                
                <div className="flex justify-between items-start mb-3 sm:mb-4 shrink-0">
                  <span className="text-3xl sm:text-4xl">{upgrade.icon}</span>
                  {!isOwned && (
                    <div className="text-right">
                      <span className={`text-base sm:text-lg font-black font-mono ${canAfford ? 'text-rose-400' : 'text-slate-600'}`}>{upgrade.cost}</span>
                      <span className="text-[9px] sm:text-[10px] block font-black text-slate-700 uppercase leading-none">Cost</span>
                    </div>
                  )}
                  {isOwned && (
                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-rose-400 bg-rose-400/10 px-2 sm:px-3 py-1 rounded-full border border-rose-400/20">Legacy Active</span>
                  )}
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                  <h4 className={`text-lg sm:text-xl font-black truncate shrink-0 ${isOwned ? 'text-white' : 'text-slate-200'}`}>{upgrade.name}</h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-2 leading-relaxed line-clamp-4">{upgrade.description}</p>
                </div>

                <div className="mt-4 shrink-0">
                  {!isOwned ? (
                    <button
                      onClick={() => onBuyUpgrade(upgrade.id)}
                      disabled={!canAfford}
                      className={`w-full py-3 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all
                        ${canAfford 
                          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg active:scale-95' 
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                    >
                      {canAfford ? 'Anchor to Legacy' : 'Insufficient Essence'}
                    </button>
                  ) : (
                    <div className="w-full py-3 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-center text-rose-400/50 border border-rose-500/10 bg-rose-500/5">
                      Sync Established
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
