
// Added React import to resolve namespace issues
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ResourceType, Building, Manager } from './types';
import { Era } from './types';
import { ERA_ORDER, ERA_REQUIREMENTS, ICON_MAP, REBIRTH_UPGRADES } from './constants';
import { 
  formatNumber, INITIAL_RESOURCES, ACTIVE_SLOT_KEY
} from './logic';
import { useGameEngine } from './engine';
import { BuildingCard } from './components/BuildingCard';
import { ResearchTab } from './components/ResearchTab';
import { ManagerTab } from './components/ManagerTab';
import { RebirthTab } from './components/RebirthTab';
import { Saves } from './components/Saves';
import { DeleteConfirmation } from './components/DeleteConfirmation';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'buildings' | 'research' | 'managers' | 'rebirth'>('buildings');
  const [savesOpen, setSavesOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isTickerVisible, setIsTickerVisible] = useState(true);
  const [buyQuantity, setBuyQuantity] = useState<number | 'next' | 'max'>(1);
  const [deleteRequestSlot, setDeleteRequestSlot] = useState<number | null>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [showSidebarScrollIndicator, setShowSidebarScrollIndicator] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sidebarScrollRef = useRef<HTMLDivElement>(null);

  // Ref for ticker container to detect overflow
  const tickerContainerRef = useRef<HTMLDivElement>(null);
  const tickerListRef = useRef<HTMLDivElement>(null);
  const [isTickerScrolling, setIsTickerScrolling] = useState(false);

  const [activeSlotId, setActiveSlotId] = useState<number>(() => {
    return Number(localStorage.getItem(ACTIVE_SLOT_KEY)) || 1;
  });

  const { 
    gameState, saveMetadata, isGameRunning, setIsGameRunning, store, 
    resources, resourceRates, totalScienceEarned, rebirthBonus, bonuses, particles, particlePool,
    lastAutosave, isSaving, pointsToEarn,
    actions 
  } = useGameEngine(activeSlotId, setActiveSlotId, setSavesOpen);

  // Auto-close sidebar on small screens when a tab is selected
  const handleTabChange = (tab: 'buildings' | 'research' | 'managers' | 'rebirth') => {
    setActiveTab(tab);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Robust ticker overflow monitoring
  useEffect(() => {
    const container = tickerContainerRef.current;
    const list = tickerListRef.current;
    if (!container || !list) return;

    const checkTickerOverflow = () => {
      const containerWidth = container.offsetWidth;
      const listWidth = list.scrollWidth;
      setIsTickerScrolling(listWidth >= containerWidth - 20); 
    };

    const resizeObserver = new ResizeObserver(checkTickerOverflow);
    resizeObserver.observe(container);
    resizeObserver.observe(list);

    checkTickerOverflow();
    const timer = setTimeout(checkTickerOverflow, 100);
    
    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [gameState.rebirthUpgradeIds, isTickerVisible, sidebarOpen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let frame: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 12px Inter';
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.y -= 1; p.alpha -= 0.02; p.life--;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = '#10b981';
        ctx.fillText(p.text, p.x, p.y);
        if (p.life <= 0) {
          particlePool.current.push(p);
          particles.current.splice(i, 1);
        }
      }
      ctx.globalAlpha = 1.0;
      frame = requestAnimationFrame(render);
    };
    if (isGameRunning) render();
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', handleResize); };
  }, [isGameRunning]);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) {
      const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 40;
      const hasMoreContent = el.scrollHeight > el.clientHeight;
      setShowScrollIndicator(hasMoreContent && !isAtBottom);
    }
    const sEl = sidebarScrollRef.current;
    if (sEl) {
      const isAtBottom = sEl.scrollHeight - sEl.scrollTop <= sEl.clientHeight + 40;
      const hasMoreContent = sEl.scrollHeight > sEl.clientHeight;
      setShowSidebarScrollIndicator(hasMoreContent && !isAtBottom);
    }
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    const sEl = sidebarScrollRef.current;
    const observer = new ResizeObserver(handleScroll);
    if (el) { el.addEventListener('scroll', handleScroll); observer.observe(el); }
    if (sEl) { sEl.addEventListener('scroll', handleScroll); observer.observe(sEl); }
    setTimeout(handleScroll, 200);
    return () => {
      if (el) el.removeEventListener('scroll', handleScroll);
      if (sEl) sEl.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [activeTab, gameState.currentEra, handleScroll, isGameRunning, sidebarOpen]);

  const activeResources = (Object.keys(INITIAL_RESOURCES) as ResourceType[]).filter(res => {
    const val = resources[res], rate = resourceRates[res];
    return (val !== 0 || rate !== 0 || res === 'food');
  });

  const totalLegacyUpgrades = gameState.rebirthUpgradeIds.length;
  const showLegacyIndicator = totalLegacyUpgrades > 0 || gameState.rebirthCount > 0;

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden text-slate-100 relative">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[999]" />

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && isGameRunning && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[190] lg:hidden animate-in fade-in duration-300" 
        />
      )}

      {/* Sidebar Toggle for Small Screens */}
      {!sidebarOpen && isGameRunning && (
        <button 
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 left-6 z-[300] w-14 h-14 bg-emerald-600 hover:bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] border border-emerald-400 transition-all hover:scale-110 active:scale-95 group"
        >
          <svg className="w-6 h-6 text-white group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
        </button>
      )}

      {isGameRunning && (
        <aside className={`fixed inset-y-0 left-0 w-[85%] sm:w-80 lg:w-80 border-r border-slate-800 bg-slate-900/95 backdrop-blur-2xl flex flex-col z-[200] transition-transform duration-300 shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0 relative">
            <h1 className="text-2xl font-black italic text-emerald-400 uppercase tracking-tighter ml-2">Era Tycoon</h1>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="w-10 h-10 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-90 hover:bg-slate-700/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-900 to-transparent pointer-events-none z-10" />
            
            <div ref={sidebarScrollRef} className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
              <div className="grid grid-cols-2 gap-1 mb-2">
                {(['buildings', 'research'] as const).map(t => (
                  <button key={t} onClick={() => handleTabChange(t)} className={`py-3 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${activeTab === t ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300'}`}>{t}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1">
                {(['managers', 'rebirth'] as const).map(t => (
                  <button key={t} onClick={() => handleTabChange(t)} className={`py-3 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${activeTab === t ? (t === 'rebirth' ? 'bg-rose-600 border-rose-400 text-white' : 'bg-emerald-600 border-emerald-400 text-white') : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300'}`}>{t}</button>
                ))}
              </div>

              <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50 shadow-inner group">
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">Active Era</label>
                <div className="text-xl font-black italic uppercase text-white group-hover:text-emerald-400 transition-colors">{gameState.currentEra}</div>
              </div>

              <div className="space-y-2">
                {activeResources.map(res => {
                  const val = resources[res], rate = resourceRates[res];
                  return (
                    <div key={res} className="flex flex-col bg-slate-800/40 p-3 rounded-xl border border-slate-800/60 hover:border-emerald-500/30 transition-all hover:bg-slate-800/60 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] uppercase font-black text-slate-500 flex items-center gap-1.5">{ICON_MAP[res]} {res}</span>
                        <span className={`text-[11px] font-mono font-bold ${rate >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{rate >= 0 ? '+' : ''}{formatNumber(rate)}/s</span>
                      </div>
                      <span className="text-xl font-mono font-black text-slate-200">{formatNumber(val)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-800">
                {ERA_ORDER.indexOf(gameState.currentEra) < ERA_ORDER.length - 1 && (
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                     <div className="flex flex-col mb-2 gap-0.5">
                       <span className="text-slate-500 uppercase font-bold tracking-tighter text-[9px]">To Next Era</span>
                       <div className="flex items-center justify-between">
                         <span className="text-emerald-400 font-black text-xs leading-none">Progress: {formatNumber(resources.science)}🧪</span>
                         <span className="text-emerald-500/50 font-black text-[9px] leading-none">Goal: {formatNumber(ERA_REQUIREMENTS[ERA_ORDER[ERA_ORDER.indexOf(gameState.currentEra) + 1]])}🧪 Science</span>
                       </div>
                     </div>
                     <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                       <div 
                        className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-150" 
                        style={{ width: `${Math.min(100, (resources.science / ERA_REQUIREMENTS[ERA_ORDER[ERA_ORDER.indexOf(gameState.currentEra) + 1]]) * 100)}%` }} 
                       />
                     </div>
                     {resources.science >= ERA_REQUIREMENTS[ERA_ORDER[ERA_ORDER.indexOf(gameState.currentEra) + 1]] && (
                       <button onClick={actions.advanceEra} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl mt-3 text-[10px] font-black uppercase tracking-widest border border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse">Evolve Now</button>
                     )}
                  </div>
                )}
                {pointsToEarn >= 1 && (
                  <div className="mt-4 p-3 bg-rose-900/20 rounded-xl border border-rose-500/30 animate-in fade-in zoom-in duration-500">
                    <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest block mb-2">Rebirth Available</span>
                    <button onClick={() => handleTabChange('rebirth')} className="w-full py-2 bg-rose-600 hover:bg-rose-500 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] text-white">Collapse Timeline</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 pt-0 space-y-4 shrink-0 bg-slate-900/95 relative z-[30]">
            <button onClick={() => setSavesOpen(true)} className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-700 transition-all text-slate-300 hover:text-white flex items-center justify-center gap-2">
              <span className="text-base">💾</span> SAVES
            </button>
          </div>
        </aside>
      )}

      <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen && isGameRunning ? 'lg:pl-80' : 'pl-0'} relative overflow-hidden h-full`}>
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-6 lg:px-10 bg-slate-900/40 backdrop-blur-xl shrink-0 z-[110]">
          <div className="flex items-center gap-4 shrink-0 max-w-[50%] lg:max-w-none">
            <h2 className="font-black text-xs uppercase tracking-[0.3em] text-slate-500 hidden sm:block">{activeTab}</h2>
            {showLegacyIndicator && (
              <button 
                onClick={() => setIsTickerVisible(!isTickerVisible)}
                className={`flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-all hover:bg-rose-500/20 active:scale-95 ${!isTickerVisible ? 'border-rose-500/20 grayscale-[0.2]' : 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.4)]'}`}
              >
                <span className="text-rose-400 text-sm animate-pulse">✨</span>
                <div className="hidden md:flex flex-col leading-none text-left">
                  <span className="text-[8px] font-black uppercase text-rose-500/60 tracking-widest">Legacy Aura</span>
                  <span className="text-[10px] font-black text-rose-400 uppercase">{totalLegacyUpgrades} Upgrades</span>
                </div>
              </button>
            )}
            <div className="h-4 w-[1px] bg-slate-800 hidden md:block" />
            <div className="flex items-center gap-3 h-8 min-w-[60px] md:min-w-[120px]">
              {isSaving && (
                <div className="flex items-center gap-2 animate-in fade-in duration-300">
                  <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)] animate-pulse" />
                  <span className="text-[8px] md:text-[10px] font-mono uppercase font-black tracking-[0.15em] whitespace-nowrap text-amber-500">
                    SAVING...
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 bg-slate-800/50 p-1 sm:p-2 rounded-2xl border border-slate-700 shadow-lg shrink-0 scale-90 sm:scale-100 origin-right">
            {([1, 10, 100, 'next', 'max'] as const).map(q => (
              <button key={String(q)} onClick={() => setBuyQuantity(q)} className={`px-2 sm:px-4 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase transition-all ${buyQuantity === q ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>{q === 'max' ? 'Max' : q === 'next' ? 'Next' : `${q}x`}</button>
            ))}
          </div>
        </header>

        {/* Floating Resource Ticker for Mobile/Small Screens when Sidebar is Closed */}
        {!sidebarOpen && (
          <div className="h-16 bg-slate-950/40 border-b border-slate-800/50 flex items-center px-4 lg:px-10 overflow-x-auto no-scrollbar shrink-0 z-[105] animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-4 sm:gap-8 min-w-max">
              {activeResources.map(res => (
                <div key={res} className="flex items-center gap-2.5 bg-slate-900/40 px-3 py-1.5 rounded-2xl border border-slate-800/60 hover:border-emerald-500/30 transition-colors">
                  <span className="text-xl">{ICON_MAP[res]}</span>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-mono font-black leading-none text-slate-200">{formatNumber(resources[res])}</span>
                    <span className={`text-[9px] font-mono font-bold ${resourceRates[res] >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {resourceRates[res] >= 0 ? '+' : ''}{formatNumber(resourceRates[res])}/s
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rebirth Upgrade Ticker Bar */}
        {gameState.rebirthUpgradeIds.length > 0 && isTickerVisible && (
          <div className="h-12 bg-slate-900/80 border-b border-rose-500/20 flex items-center overflow-hidden shrink-0 z-[104] group relative backdrop-blur-md">
            <div className="hidden sm:flex items-center gap-3 px-6 lg:px-10 border-r border-rose-500/20 bg-slate-950 h-full z-20">
              <span className="text-rose-400 animate-pulse text-lg">✨</span>
              <span className="text-[10px] font-black uppercase text-rose-500/80 tracking-[0.2em] whitespace-nowrap">Legacy Buffs</span>
            </div>
            <div ref={tickerContainerRef} className="flex-1 overflow-hidden relative h-full flex items-center">
               <div className={`whitespace-nowrap flex items-center gap-12 py-2 ${isTickerScrolling ? 'animate-marquee' : 'px-8'}`}>
                  <div ref={tickerListRef} className="flex items-center gap-12 w-max">
                    {gameState.rebirthUpgradeIds.map(id => {
                      const upgrade = REBIRTH_UPGRADES.find(u => u.id === id);
                      if (!upgrade) return null;
                      return (
                        <div key={upgrade.id} className="flex items-center gap-3 border-r border-slate-800/50 pr-12 h-full shrink-0">
                          <span className="text-xl drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]">{upgrade.icon}</span>
                          <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{upgrade.shortDescription}</span>
                        </div>
                      );
                    })}
                  </div>
                  {isTickerScrolling && (
                    <div className="flex items-center gap-12 w-max">
                      {gameState.rebirthUpgradeIds.map(id => {
                        const upgrade = REBIRTH_UPGRADES.find(u => u.id === id);
                        if (!upgrade) return null;
                        return (
                          <div key={upgrade.id + '-clone'} className="flex items-center gap-3 border-r border-slate-800/50 pr-12 h-full shrink-0">
                            <span className="text-xl drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]">{upgrade.icon}</span>
                            <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{upgrade.shortDescription}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}

        <div className="relative flex-1 overflow-hidden flex flex-col h-full">
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-slate-950 via-slate-950/40 to-transparent pointer-events-none z-20" />
          
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 no-scrollbar relative scroll-smooth h-full">
            <div className="pt-2" />
            
            {activeTab === 'buildings' && (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 pb-32">
                {(Object.values(gameState.buildings) as Building[])
                  .filter(b => ERA_ORDER.indexOf(b.era) <= ERA_ORDER.indexOf(gameState.currentEra))
                  .map(b => (
                    <BuildingCard 
                      key={b.id} 
                      building={b} 
                      currentEra={gameState.currentEra} 
                      currentResources={resources} 
                      buyQuantity={buyQuantity} 
                      onBuy={actions.buyBuilding} 
                      onRefine={actions.handleUpgradeBuilding} 
                      onGather={actions.manualGather} 
                      bonuses={bonuses} 
                      rebirthBonus={rebirthBonus} 
                      rebirthUpgradeIds={gameState.rebirthUpgradeIds}
                      manager={(Object.values(gameState.managers) as Manager[]).find(m => m.buildingId === b.id && m.isActive)} 
                    />
                ))}
              </div>
            )}
            
            {activeTab === 'research' && <ResearchTab currentEra={gameState.currentEra} science={resources.science} researchedIds={gameState.researchedTechIds} onResearch={actions.handleResearch} />}
            {activeTab === 'managers' && <ManagerTab managers={Object.values(gameState.managers)} science={resources.science} currentEra={gameState.currentEra} buildings={gameState.buildings} buyQuantity={buyQuantity} onFind={actions.handleRecruitManager} onUpgrade={actions.handleUpgradeManager} onToggle={actions.handleToggleManager} />}
            {activeTab === 'rebirth' && <RebirthTab rebirthPoints={gameState.rebirthPoints} pointsToEarn={pointsToEarn} researchedUpgrades={gameState.rebirthUpgradeIds} onRebirth={actions.handleRebirth} onBuyUpgrade={actions.handleBuyRebirthUpgrade} />}
            
            <div className="pb-20 lg:pb-0" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none z-20" />
        </div>
      </main>

      {savesOpen && (
        <Saves 
          metadata={saveMetadata} 
          activeSlot={activeSlotId} 
          isGameRunning={isGameRunning} 
          onSave={actions.persistState} 
          onLoad={actions.handleLoadFromSlot} 
          onStartNew={actions.handleStartNew} 
          onSetMain={actions.handleSetMain} 
          onDeleteRequest={setDeleteRequestSlot} 
          onClose={() => setSavesOpen(false)} 
          onExport={actions.handleExport} 
          onImport={actions.handleImport} 
        />
      )}
      
      {deleteRequestSlot !== null && (
        <DeleteConfirmation 
          slotName={`Slot ${deleteRequestSlot}`} 
          onConfirm={() => {
            actions.handleDeleteSlot(deleteRequestSlot);
            setDeleteRequestSlot(null);
          }} 
          onCancel={() => setDeleteRequestSlot(null)} 
        />
      )}
    </div>
  );
};

export default App;
