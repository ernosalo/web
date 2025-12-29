import React, { useRef } from 'react';
import { Theme } from '../hooks/useTheme';

interface HeaderProps {
  progress: number;
  theme: Theme;
  onToggleTheme: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
}

const Header: React.FC<HeaderProps> = ({ progress, theme, onToggleTheme, onImport, onExport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="mb-12 relative">
      <div className="absolute -top-10 -right-2 flex items-center gap-1 sm:gap-2">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="group flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 transition-all text-slate-400 dark:text-zinc-600 hover:text-black dark:hover:text-white"
          aria-label="Import tasks"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Import</span>
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onImport} 
          accept=".json" 
          className="hidden" 
        />
        
        <button 
          onClick={onExport}
          className="group flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 transition-all text-slate-400 dark:text-zinc-600 hover:text-black dark:hover:text-white"
          aria-label="Export tasks"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Export</span>
        </button>

        <div className="w-[1px] h-6 bg-slate-200 dark:bg-zinc-900 mx-1 self-center" />

        <button 
          onClick={onToggleTheme}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 transition-all text-slate-400 dark:text-zinc-600 hover:text-black dark:hover:text-white"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2 font-mono italic">2Do</h1>
      <div className="flex items-center justify-between">
        <p className="text-slate-500 dark:text-zinc-500 text-sm font-light">Focus on what matters.</p>
        <span className="text-xs font-medium text-slate-400 dark:text-zinc-600 uppercase tracking-widest">{progress}% DONE</span>
      </div>
      <div className="mt-4 w-full h-[2px] bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden">
        <div 
          className="h-full bg-black dark:bg-white transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  );
};

export default Header;