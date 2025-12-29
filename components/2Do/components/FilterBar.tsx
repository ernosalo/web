import React from 'react';
import { FilterType } from '../hooks/useTodos';

interface FilterBarProps {
  activeFilters: FilterType[];
  onToggleFilter: (f: FilterType) => void;
  onMoveCompleted: () => void;
  showMoveCompleted: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  activeFilters, 
  onToggleFilter, 
  onMoveCompleted, 
  showMoveCompleted 
}) => {
  return (
    <nav className="flex items-center justify-between mb-8 border-b border-slate-100 dark:border-zinc-900 pb-4">
      <div className="flex gap-6">
        {(['active', 'completed'] as const).map((f) => {
          const isActive = activeFilters.includes(f);
          return (
            <button
              key={f}
              onClick={() => onToggleFilter(f)}
              className={`text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
                isActive 
                ? 'text-black dark:text-white' 
                : 'text-slate-300 dark:text-zinc-700 hover:text-slate-400 dark:hover:text-zinc-500'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isActive ? 'bg-black dark:bg-white' : 'bg-transparent border border-slate-200 dark:border-zinc-800'}`} />
              {f}
            </button>
          );
        })}
      </div>

      {showMoveCompleted && (
        <button
          onClick={onMoveCompleted}
          className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-600 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5 group/btn"
          title="Move completed to bottom"
        >
          <svg className="w-3.5 h-3.5 transform transition-transform group-hover/btn:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
          </svg>
          <span>Move Completed</span>
        </button>
      )}
    </nav>
  );
};

export default FilterBar;
