
import React, { useState, useRef, useEffect, useMemo, memo } from 'react';
import { SaveMetadata } from '../types';
import { formatNumber } from '../logic';

interface SlotCardProps {
  slot: SaveMetadata;
  activeSlot: number;
  lastSavedId: number | null;
  confirmOverwriteId: number | null;
  isBootScreen: boolean;
  onStartNew: (id: number) => void;
  onLoad: (id: number) => void;
  onSave: (id: number, isEmpty: boolean) => void;
  onDeleteRequest: (id: number) => void;
  onSetMain: (id: number) => void;
}

const SlotCard = memo(({ 
  slot, activeSlot, lastSavedId, confirmOverwriteId, isBootScreen, 
  onStartNew, onLoad, onSave, onDeleteRequest, onSetMain 
}: SlotCardProps) => {
  const formattedTimestamp = useMemo(() => {
    if (slot.isEmpty) return '';
    const dateObj = new Date(slot.timestamp);
    const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    return `${dateObj.toLocaleDateString()} ${formattedTime}`;
  }, [slot.timestamp, slot.isEmpty]);

  const isConfirming = confirmOverwriteId === slot.id;

  return (
    <div className={`group relative w-full p-6 sm:p-8 rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center text-center gap-4
      ${activeSlot === slot.id ? 'border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_40px_rgba(16,185,129,0.08)]' : 'border-slate-800 bg-slate-800/20 hover:border-slate-700'} 
      ${lastSavedId === slot.id ? 'border-emerald-500 bg-emerald-500/10 scale-[1.02]' : ''} 
      ${isConfirming ? 'border-rose-500/60 bg-rose-500/5 shadow-rose-900/10' : ''}`}>
      
      {/* Slot Badge and Main Indicator */}
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest transition-colors ${activeSlot === slot.id ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-800 text-slate-400'}`}>
          Slot {slot.id}
        </span>
        {slot.isMain && (
          <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          </div>
        )}
      </div>

      {/* Save Information */}
      <div className="space-y-1 mb-2">
        {slot.isEmpty ? (
          <>
            <h3 className="text-xl sm:text-2xl font-black text-slate-500 uppercase tracking-tight">Available Slot</h3>
            <p className="text-xs sm:text-sm text-slate-600 italic font-medium">A clean slate for humanity</p>
          </>
        ) : (
          <>
            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight drop-shadow-sm">{slot.era}</h3>
            <div className="flex flex-col items-center gap-1">
              <p className="text-[10px] sm:text-xs text-slate-500 font-mono uppercase tracking-wider">{formattedTimestamp}</p>
              <div className="flex items-center gap-2 text-emerald-400/80 font-mono text-xs font-bold">
                <span>{formatNumber(slot.science)} 🧪</span>
                <span className="w-1 h-1 rounded-full bg-slate-700" />
                <span>R{slot.rebirthCount || 0}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Actions Container */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-2 w-full max-w-sm">
        {slot.isEmpty ? (
          <button 
            onClick={() => onStartNew(slot.id)} 
            className="w-full sm:w-48 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_15px_30px_rgba(16,185,129,0.3)] active:scale-95"
          >
            Initialize
          </button>
        ) : (
          <>
            {!isBootScreen && (
              <button
                onClick={() => onSave(slot.id, slot.isEmpty)}
                className={`px-6 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all border-b-4 active:border-b-0 active:translate-y-1
                  ${isConfirming 
                    ? 'bg-rose-600 border-rose-800 text-white animate-pulse' 
                    : lastSavedId === slot.id 
                      ? 'bg-emerald-600 border-emerald-800 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                      : 'bg-slate-800 border-slate-950 text-slate-300 hover:text-white hover:bg-slate-700'}`}
              >
                {isConfirming ? 'Confirm?' : lastSavedId === slot.id ? 'Saved!' : 'Save'}
              </button>
            )}
            <button 
              onClick={() => onLoad(slot.id)} 
              className="flex-1 sm:flex-none px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_15px_30px_rgba(16,185,129,0.3)] border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1"
            >
              Resume
            </button>
            
            <div className="flex gap-2 shrink-0">
              <button 
                onClick={() => onSetMain(slot.id)} 
                title={slot.isMain ? "Main Save" : "Set as Main"} 
                className={`w-14 h-14 rounded-2xl transition-all border-2 flex items-center justify-center shadow-lg active:scale-90
                  ${slot.isMain ? 'bg-amber-400 text-slate-950 border-amber-500' : 'bg-slate-800 text-amber-500/50 border-slate-700 hover:border-amber-500/50 hover:text-amber-500'}`}
              >
                <svg className="w-6 h-6" fill={slot.isMain ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              </button>
              
              {!slot.isMain && (
                <button 
                  onClick={() => onDeleteRequest(slot.id)} 
                  className="w-14 h-14 bg-rose-900/10 text-rose-500 hover:bg-rose-500 hover:text-white text-xs font-bold rounded-2xl transition-all border-2 border-rose-500/20 shadow-lg active:scale-90 flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
});

interface SavesProps {
  metadata: SaveMetadata[];
  activeSlot: number;
  isBootScreen?: boolean;
  onSave: (slotId: number) => void;
  onLoad: (slotId: number) => void;
  onStartNew: (slotId: number) => void;
  onSetMain: (slotId: number) => void;
  onDeleteRequest: (slotId: number) => void;
  onClose: () => void;
  onExport: () => void;
  onImport: (data: string) => void;
}

export const Saves: React.FC<SavesProps> = ({ 
  metadata, 
  activeSlot,
  isBootScreen = false,
  onSave, 
  onLoad,
  onStartNew,
  onSetMain,
  onDeleteRequest,
  onClose,
  onExport,
  onImport
}) => {
  const [lastSavedId, setLastSavedId] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [confirmOverwriteId, setConfirmOverwriteId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveClick = (slotId: number, isEmpty: boolean) => {
    if (!isEmpty && confirmOverwriteId !== slotId) {
      setConfirmOverwriteId(slotId);
      return;
    }
    onSave(slotId);
    setConfirmOverwriteId(null);
    setLastSavedId(slotId);
    setShowToast(true);
    setTimeout(() => setLastSavedId(null), 2000);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    if (confirmOverwriteId) {
      const t = setTimeout(() => setConfirmOverwriteId(null), 5000);
      return () => clearTimeout(t);
    }
  }, [confirmOverwriteId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onImport(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={`fixed inset-0 z-[400] flex items-center justify-center p-4 transition-all duration-700 
      ${isBootScreen ? 'bg-slate-950' : 'bg-slate-950/80 backdrop-blur-xl'}`}>
      
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] sm:rounded-[3rem] w-full max-w-2xl shadow-[0_0_150px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh] border-t-emerald-500/20 relative">
        <div className={`absolute top-10 left-1/2 -translate-x-1/2 z-[460] transition-all duration-500 pointer-events-none
          ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="bg-emerald-500 text-slate-950 px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-[0.2em] shadow-[0_0_30px_rgba(16,185,129,0.6)] flex items-center gap-2">
            Timeline Synchronized
          </div>
        </div>

        <div className="p-8 sm:p-10 border-b border-slate-800/60 flex justify-between items-start bg-slate-900/40 relative z-10">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black text-emerald-400 uppercase tracking-tighter italic">Era Tycoon</h1>
            <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-[0.2em] opacity-80">Timeline Hub</h2>
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={onExport} className="text-[10px] font-black uppercase tracking-widest bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-5 py-2 rounded-xl transition-all flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Export Archive
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black uppercase tracking-widest bg-sky-600/10 hover:bg-sky-600/20 text-sky-400 border border-sky-500/30 px-5 py-2 rounded-xl transition-all flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Import Archive
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".chronicle" />
            </div>
          </div>
          {!isBootScreen && (
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-all p-4 hover:bg-slate-800 rounded-2xl border border-transparent hover:border-slate-700 shadow-inner group">
              <svg className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 sm:p-10 space-y-6 sm:space-y-8 bg-slate-900/20">
          {metadata.map((slot) => (
            <SlotCard 
              key={slot.id} 
              slot={slot} 
              activeSlot={activeSlot} 
              lastSavedId={lastSavedId} 
              confirmOverwriteId={confirmOverwriteId} 
              isBootScreen={isBootScreen} 
              onStartNew={onStartNew} 
              onLoad={onLoad} 
              onSave={handleSaveClick} 
              onDeleteRequest={onDeleteRequest} 
              onSetMain={onSetMain} 
            />
          ))}
          <div className="pb-4" />
        </div>
      </div>
    </div>
  );
};
