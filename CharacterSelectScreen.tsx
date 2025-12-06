
import React from 'react';
import { GameState } from '../types';
import { CLASSES, MAX_SAVES } from '../constants';

interface CharacterSelectScreenProps {
  saves: GameState[];
  onSelectCharacter: (saveId: string) => void;
  onCreateNew: () => void;
  onDeleteCharacter: (saveId: string) => void;
}

const CharacterSelectScreen: React.FC<CharacterSelectScreenProps> = ({ saves, onSelectCharacter, onCreateNew, onDeleteCharacter }) => {
  
  // Helper to get colors based on class (Art Deco / Waze Light Theme)
  const getClassBadgeStyle = (classLabel: string) => {
    if (classLabel.includes("Thug")) return "text-red-800 bg-red-100 border-red-200";
    if (classLabel.includes("Smuggler")) return "text-amber-800 bg-amber-100 border-amber-200";
    if (classLabel.includes("Dealer")) return "text-blue-800 bg-blue-100 border-blue-200";
    if (classLabel.includes("Entertainer")) return "text-purple-800 bg-purple-100 border-purple-200";
    if (classLabel.includes("Hustler")) return "text-emerald-800 bg-emerald-100 border-emerald-200";
    return "text-slate-600 bg-slate-100 border-slate-200";
  };

  return (
    <div className="absolute inset-0 overflow-hidden flex font-waze bg-slate-900">
      
      {/* 1. Retro NYC Skyline Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transform scale-105"
        style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2670&auto=format&fit=crop")',
            // Clean Noir Filter
            filter: 'grayscale(100%) contrast(1.2) brightness(0.4)' 
        }}
      ></div>

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

                    return (
                        <div 
                            key={save.id}
                            onClick={() => onSelectCharacter(save.id)}
                            className="group relative bg-white border border-slate-200 rounded-xl p-4 cursor-pointer flex gap-5 items-center shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Avatar (Full Color Waze Style) */}
                            <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 group-hover:border-amber-400 overflow-hidden flex-shrink-0 shadow-inner transition-colors">
                                <img 
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.imageSeed}/200/200`} 
                                    alt={leader.name}
                                    className="w-full h-full object-cover transform scale-110 translate-y-1"
                                />
                            </div>

                            {/* Details */}
                            <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-lg font-black font-news text-slate-900 truncate">{leader.name}</h3>
                                    <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">LVL {leader.level}</span>
                                </div>
                                
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${badgeStyle}`}>
                                        {classDef.label.replace("The ", "")}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-bold truncate">"{leader.nickname}"</span>
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

                            {/* Delete Button (Visible on Hover) */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteCharacter(save.id); }}
                                className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 text-slate-300 hover:text-red-500 p-1.5 transition-all"
                                title="Delete Save"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                    );
                })}
                
                {/* Create New Slot - Waze/Deco Style */}
                {saves.length < MAX_SAVES && (
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
            </div>

            {/* Footer of Sidebar */}
            <div className="p-6 bg-slate-100 border-t border-slate-200 text-center">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                    Alpha Build • Streets of New York
                </span>
            </div>

        </div>

      </div>
    </div>
  );
};

export default CharacterSelectScreen;
