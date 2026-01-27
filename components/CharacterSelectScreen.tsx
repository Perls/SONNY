
import React, { useState } from 'react';
import { GameState } from '../types';
import { CLASSES, MAX_SAVES } from '../constants';
import AvatarDisplay from './AvatarDisplay';
import SafeImage from './SafeImage';

interface CharacterSelectScreenProps {
  saves: GameState[];
  onSelectCharacter: (saveId: string) => void;
  onCreateNew: () => void;
  onDeleteCharacter: (saveId: string) => void;
}

const CharacterSelectScreen: React.FC<CharacterSelectScreenProps> = ({ saves, onSelectCharacter, onCreateNew, onDeleteCharacter }) => {
  const [deleteMode, setDeleteMode] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Helper to get colors based on class (Art Deco / Waze Light Theme)
  const getClassBadgeStyle = (classLabel: string) => {
    if (classLabel.includes("Thug")) return "text-slate-700 bg-slate-100 border-slate-300";
    if (classLabel.includes("Smuggler")) return "text-amber-800 bg-amber-100 border-amber-200";
    if (classLabel.includes("Dealer")) return "text-blue-800 bg-blue-100 border-blue-200";
    if (classLabel.includes("Entertainer")) return "text-purple-800 bg-purple-100 border-purple-200";
    if (classLabel.includes("Hustler")) return "text-emerald-800 bg-emerald-100 border-emerald-200";
    return "text-slate-600 bg-slate-100 border-slate-200";
  };

  const getFactionBadgeStyle = (faction: string | undefined) => {
    const f = (faction || '').toLowerCase();
    if (f.includes('mafia') || f.includes('commission')) return 'text-red-900 bg-red-50 border-red-200';
    if (f.includes('cartel')) return 'text-[#ffb300] bg-amber-50 border-[#ffb300]';
    if (f.includes('gang') || f.includes('street')) return 'text-purple-900 bg-purple-50 border-purple-200';
    return 'text-slate-600 bg-slate-100 border-slate-200';
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
      if (confirmDeleteId) {
          onDeleteCharacter(confirmDeleteId);
          setConfirmDeleteId(null);
          // If no saves left, exit delete mode
          if (saves.length <= 1) setDeleteMode(false);
      }
  };

  return (
    <div className="absolute inset-0 overflow-hidden flex font-waze bg-slate-900">
      
      {/* 1. Retro NYC Skyline Background with SafeImage */}
      <div className="absolute inset-0 z-0">
          <SafeImage 
             src="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2670&auto=format&fit=crop"
             alt="NYC Skyline"
             className="w-full h-full transform scale-105"
             fallbackColorClass="bg-slate-900"
          />
          {/* Filter Overlay */}
          <div className="absolute inset-0" style={{ backdropFilter: 'grayscale(100%) contrast(1.2) brightness(0.4)', backgroundColor: 'rgba(0,0,0,0.5)' }}></div>
      </div>

      {/* 2. Art Deco Pattern Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-10 pattern-deco"></div>

      {/* Main Content Container */}
      <div className="relative z-20 w-full h-full flex">
        
        {/* Left: Cinematic Title Space & Data Connection Info */}
        <div className="flex-grow flex flex-col justify-between p-12">
             
             {/* Top Left: Golden Data Connection Info */}
             <div className="flex flex-col items-start animate-fade-in">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    <span className="text-amber-500 font-black font-mono text-xs tracking-widest">NET.LINK: ESTABLISHED</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-amber-700/80 font-mono uppercase tracking-wider border-l-2 border-amber-500/30 pl-3">
                    <span>Server: NYC-PRIME</span>
                    <span>Ping: 24ms</span>
                    <span>Ver: [ALPHA] 0.9.4</span>
                </div>
             </div>

             {/* Bottom Left: Title & Quote */}
             <div className="max-w-3xl pb-12">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-1 bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]"></div>
                    <span className="text-amber-400 font-black tracking-[0.4em] uppercase text-sm font-news drop-shadow-md">
                        The City That Never Sleeps
                    </span>
                </div>
                
                <h1 className="text-8xl font-black font-news tracking-tighter leading-none text-white mb-8 drop-shadow-2xl">
                  STREETS OF <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-600">NEW YORK</span>
                </h1>

                <div className="border-l-4 border-amber-500 pl-8 py-4 bg-black/40 backdrop-blur-sm rounded-r-xl border-t border-t-white/5 border-b border-b-white/5">
                    <p className="text-slate-100 font-news text-2xl leading-relaxed italic">
                    "Opportunity isn't given. It's taken. <br/>Welcome back to the jungle."
                    </p>
                </div>
             </div>
        </div>

        {/* Right: Boss List (Light Art Deco Sidebar) */}
        <div className="w-[500px] h-full flex-shrink-0 bg-slate-50/95 border-l-4 border-slate-900 shadow-2xl flex flex-col relative z-30">
            
            {/* Deco Header Pattern */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-slate-900 via-amber-500 to-slate-900"></div>

            {/* Header */}
            <div className="p-10 pb-6">
                 <div className="flex justify-between items-end mb-4">
                    <h2 className="text-4xl font-black font-news text-slate-900 uppercase tracking-tight">
                        Select Boss
                    </h2>
                    <span className="text-xs font-bold font-waze text-amber-600 uppercase tracking-widest border border-amber-200 px-2 py-1 rounded bg-amber-50">
                        {saves.length} / {MAX_SAVES} Slots
                    </span>
                 </div>
                 <p className="text-slate-500 text-sm font-bold">Resume your rise to power.</p>
                 <div className="w-full h-px bg-slate-200 mt-6 flex items-center justify-center">
                    <div className="w-2 h-2 bg-amber-400 transform rotate-45"></div>
                 </div>
            </div>
            
            {/* List */}
            <div className="flex-grow overflow-y-auto custom-scrollbar px-10 py-4 space-y-4">
                {saves.map((save) => {
                    const leader = save.crew.find(c => c.isLeader) || save.crew[0];
                    const classDef = CLASSES[leader.classType];
                    const badgeStyle = getClassBadgeStyle(classDef.label);
                    const factionStyle = getFactionBadgeStyle(leader.faction);
                    const isDeletingThis = confirmDeleteId === save.id;

                    return (
                        <div 
                            key={save.id}
                            onClick={() => !deleteMode && onSelectCharacter(save.id)}
                            className={`group relative bg-white border rounded-xl p-4 cursor-pointer flex gap-5 items-center shadow-sm transition-all duration-300
                                ${deleteMode 
                                    ? 'border-red-200 hover:border-red-500 hover:bg-red-50' 
                                    : 'border-slate-200 hover:shadow-xl hover:border-amber-400 hover:-translate-y-1'
                                }
                            `}
                        >
                            {/* Avatar using AvatarDisplay */}
                            <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 group-hover:border-amber-400 overflow-hidden flex-shrink-0 shadow-inner transition-colors">
                                <AvatarDisplay 
                                    seed={leader.imageSeed.toString()}
                                    role={leader.classType}
                                    className="w-full h-full transform scale-110 translate-y-1"
                                />
                            </div>

                            {/* Details */}
                            <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-lg font-black font-news text-slate-900 truncate">{leader.name}</h3>
                                    <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">LVL {leader.level}</span>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${badgeStyle}`}>
                                        {classDef.label.replace("The ", "")}
                                    </span>
                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${factionStyle}`}>
                                        {leader.faction || 'Independent'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-bold truncate ml-auto">"{leader.nickname}"</span>
                                </div>

                                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500 border-t border-slate-100 pt-2">
                                    <span className="flex items-center gap-1">
                                        <span className="text-emerald-600">N$</span> {save.money.toLocaleString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="text-amber-600">REP</span> {save.respect}
                                    </span>
                                    <span className="flex items-center gap-1 ml-auto text-[9px] text-slate-300 uppercase">
                                        {new Date(save.lastPlayed).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {/* Delete Button (Visible in Delete Mode) */}
                            {deleteMode && (
                                <button 
                                    onClick={(e) => handleDeleteClick(save.id, e)}
                                    className="absolute inset-0 bg-red-900/10 hover:bg-red-900/20 z-20 flex items-center justify-center rounded-xl transition-all"
                                >
                                    <div className="bg-red-600 text-white font-black uppercase tracking-widest px-4 py-2 rounded shadow-lg transform group-hover:scale-110 transition-transform">
                                        Delete
                                    </div>
                                </button>
                            )}
                        </div>
                    );
                })}
                
                {/* Create New Slot - Waze/Deco Style */}
                {saves.length < MAX_SAVES && !deleteMode && (
                    <button 
                        onClick={onCreateNew}
                        className="w-full py-6 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 font-bold uppercase tracking-widest hover:border-amber-400 hover:text-amber-600 hover:bg-white hover:shadow-lg transition-all flex flex-col items-center justify-center gap-2 group"
                    >
                         <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                         </div>
                         <span>Create New Boss</span>
                    </button>
                )}

                {/* SLIM DELETE TOGGLE BUTTON */}
                {saves.length > 0 && (
                    <button 
                        onClick={() => { setDeleteMode(!deleteMode); setConfirmDeleteId(null); }}
                        className={`w-full py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border
                            ${deleteMode 
                                ? 'bg-slate-200 text-slate-500 border-slate-300 hover:bg-slate-300' 
                                : 'bg-transparent text-slate-300 border-transparent hover:text-red-400 hover:bg-red-50'
                            }
                        `}
                    >
                        {deleteMode ? "Cancel Delete Mode" : "Delete Character Data"}
                    </button>
                )}
            </div>

            {/* Footer of Sidebar */}
            <div className="p-6 bg-slate-100 border-t border-slate-200 text-center">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                    Alpha Build • Streets of New York
                </span>
            </div>

            {/* DELETE CONFIRMATION MODAL */}
            {confirmDeleteId && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 animate-fade-in">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border-4 border-red-500 text-center animate-slide-up">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase mb-2 font-news">Confirm Deletion</h3>
                        <p className="text-sm text-slate-500 font-bold mb-6">
                            This action cannot be undone. Are you sure you want to retire this boss permanently?
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button 
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-6 py-3 rounded-lg border-2 border-slate-200 text-slate-500 font-black uppercase tracking-widest text-xs hover:bg-slate-100"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="px-6 py-3 rounded-lg bg-red-600 text-white font-black uppercase tracking-widest text-xs hover:bg-red-700 shadow-lg"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>

      </div>
    </div>
  );
};

export default CharacterSelectScreen;
