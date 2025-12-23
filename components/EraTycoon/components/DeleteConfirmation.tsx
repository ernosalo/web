
import React, { useState, useEffect, useRef } from 'react';

interface DeleteConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
  slotName: string;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ onConfirm, onCancel, slotName }) => {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const HOLD_DURATION = 5000; 

  useEffect(() => {
    const tick = (now: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = now;
      }
      
      const elapsed = now - startTimeRef.current;
      const p = Math.min(1, elapsed / HOLD_DURATION);
      setProgress(p);

      if (p < 1) {
        timerRef.current = requestAnimationFrame(tick);
      } else {
        // Force reset before confirm to avoid potential re-triggers
        startTimeRef.current = null;
        setIsHolding(false);
        onConfirm();
      }
    };

    if (isHolding) {
      timerRef.current = requestAnimationFrame(tick);
    } else {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
      startTimeRef.current = null;
      setProgress(0);
    }

    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [isHolding, onConfirm]);

  const handleContextMenu = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center space-y-8 border-t-rose-500/30">
        <div className="space-y-3">
          <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Wipe Save Data?</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Erase <span className="text-rose-400 font-mono font-bold bg-rose-400/10 px-2 py-0.5 rounded">{slotName}</span> permanently? This action will incinerate all progress and cannot be undone.
          </p>
        </div>

        <div className="relative h-24 w-full flex items-center justify-center group">
          <div className="absolute inset-0 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 group-hover:border-rose-500/30 transition-colors">
            <div 
              className={`h-full shadow-[0_0_30px_rgba(225,29,72,0.6)]
                ${progress > 0.9 ? 'bg-rose-400' : progress > 0.5 ? 'bg-rose-500' : 'bg-rose-600'}`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          
          <button
            onMouseDown={() => setIsHolding(true)}
            onMouseUp={() => setIsHolding(false)}
            onMouseLeave={() => setIsHolding(false)}
            onTouchStart={() => setIsHolding(true)}
            onTouchEnd={() => setIsHolding(false)}
            onContextMenu={handleContextMenu}
            className={`relative z-10 w-full h-full font-black uppercase tracking-[0.2em] transition-all select-none text-xs
              ${isHolding ? 'text-white scale-95' : 'text-slate-400 hover:text-white'}`}
          >
            {isHolding 
              ? `Deleting in ${Math.ceil((HOLD_DURATION - (progress * HOLD_DURATION)) / 1000)}s...` 
              : 'Hold for 5 Seconds to Erase'}
          </button>
        </div>

        <button 
          onClick={onCancel}
          className="px-6 py-2 text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-white/5 rounded-full"
        >
          Cancel Deletion
        </button>

        {isHolding && (
          <div className="text-[9px] text-rose-500/60 font-mono animate-pulse">
            CRITICAL: PERMANENT DATA LOSS IMMINENT
          </div>
        )}
      </div>
    </div>
  );
};
