
import React from 'react';
import { ResearchTech, Era, ResourceMap } from '../types';
import { ICON_MAP, RESEARCH_TECHS, ERA_ORDER } from '../constants';

interface ResearchTabProps {
  currentEra: Era;
  science: number;
  researchedIds: string[];
  onResearch: (techId: string) => void;
}

export const ResearchTab: React.FC<ResearchTabProps> = ({
  currentEra,
  science,
  researchedIds,
  onResearch
}) => {
  const currentEraIndex = ERA_ORDER.indexOf(currentEra);

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {RESEARCH_TECHS.map(tech => {
        const isResearched = researchedIds.includes(tech.id);
        const canAfford = science >= tech.cost;
        const eraLocked = ERA_ORDER.indexOf(tech.era) > currentEraIndex;
        const icon = ICON_MAP[tech.icon] || '🧪';

        if (eraLocked && !isResearched) {
          return (
            <div key={tech.id} className="p-6 rounded-2xl bg-slate-900/50 border-2 border-slate-800 opacity-50 flex flex-col items-center justify-center space-y-2">
              <span className="text-3xl grayscale">🔒</span>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{tech.era} Tech</p>
            </div>
          );
        }

        return (
          <div 
            key={tech.id}
            className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col min-h-[220px] shadow-lg
              ${isResearched 
                ? 'bg-emerald-500/10 border-emerald-500/40 shadow-emerald-500/10' 
                : 'bg-slate-800/80 border-slate-700 hover:border-sky-500/50'}`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`text-4xl ${isResearched ? 'animate-pulse' : ''}`}>{icon}</span>
              {isResearched ? (
                <span className="text-[9px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Active</span>
              ) : (
                <div className="flex flex-col items-end">
                  <span className={`text-xs font-mono font-black ${canAfford ? 'text-sky-400' : 'text-rose-400'}`}>
                    {tech.cost.toLocaleString()}
                  </span>
                  <span className="text-[8px] text-slate-500 uppercase font-black">Science Cost</span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <h3 className={`font-black text-base ${isResearched ? 'text-emerald-400' : 'text-slate-100'}`}>
                {tech.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {tech.description}
              </p>
            </div>

            {!isResearched && (
              <button
                onClick={() => canAfford && onResearch(tech.id)}
                disabled={!canAfford}
                className={`mt-4 w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                  ${canAfford 
                    ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg active:scale-95' 
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
              >
                {canAfford ? 'Launch Research' : 'Insufficient Science'}
              </button>
            )}
            
            {isResearched && (
              <div className="mt-4 pt-3 border-t border-emerald-500/20 text-[10px] text-emerald-400/80 font-bold uppercase tracking-widest italic">
                Knowledge Gained
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
