



import React, { useState } from 'react';
import { CrewMember } from '../types';
import { CLASSES, TRAITS } from '../constants';

interface BottomCharacterPanelProps {
  boss: CrewMember;
  money: number;
  respect: number;
}

const BottomCharacterPanel: React.FC<BottomCharacterPanelProps> = ({ boss, money, respect }) => {
  const [hoveredTooltip, setHoveredTooltip] = useState<{ title: string, desc: string, typeLabel: string, stats?: Record<string, number>, duration?: string, rect: DOMRect } | null>(null);

  const classDef = CLASSES[boss.classType];
  
  // Calculate HP for display
  const hp = 20 + (boss.stats.strength * 3);
  
  // Parse Traits
  const activeTraits = boss.traits.map(t => {
      const def = TRAITS.find(def => def.id === t.id);
      return { ...def, rank: t.rank };
  }).filter(t => t.id); // Filter out undefined if any

  const getTraitStyle = (type: string | undefined) => {
    switch (type) {
        case 'buff': return 'bg-emerald-900/30 border-emerald-500 text-emerald-400';
        case 'debuff': return 'bg-red-900/30 border-red-500 text-red-400';
        default: return 'bg-slate-800 border-slate-500 text-slate-300'; // Neutral for traits
    }
  };

  const getTraitLabel = (type: string | undefined) => {
    switch (type) {
        case 'buff': return 'Buff';
        case 'debuff': return 'Debuff';
        default: return 'Trait';
    }
  };

  const handleMouseEnter = (e: React.MouseEvent, title: string, desc: string, typeLabel: string, stats?: Record<string, number>, duration?: string) => {
      setHoveredTooltip({
          title,
          desc,
          typeLabel,
          stats,
          duration,
          rect: e.currentTarget.getBoundingClientRect()
      });
  };

  const handleMouseLeave = () => {
      setHoveredTooltip(null);
  };

  return (
    <>
    <div className="absolute bottom-24 left-6 z-40 w-80 flex flex-col gap-3 font-waze animate-slide-up origin-bottom-left">
        
        {/* Main Card - Removed overflow-hidden to help with popups, applied radius to children */}
        <div className="bg-slate-900/95 backdrop-blur-md border-2 border-slate-600 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col">
            
            {/* Header / Class */}
            <div className={`p-4 pb-2 border-b border-slate-700 relative overflow-hidden rounded-t-xl`}>
                <div className="absolute inset-0 pattern-deco opacity-10"></div>
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-white font-news uppercase tracking-tight leading-none mb-1 drop-shadow-md">
                            {classDef.label.replace('The ', '')}
                        </h2>
                        <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest bg-slate-800/80 inline-block px-1.5 py-0.5 rounded border border-amber-500/30">
                            Lvl {boss.level} Boss
                        </div>
                    </div>
                    {/* Portrait Mini */}
                    <div className="w-12 h-12 rounded border-2 border-slate-500 overflow-hidden bg-slate-800 shadow-inner">
                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${boss.imageSeed}`} className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 divide-x divide-slate-700 bg-black/40">
                <div 
                    className="p-2 flex flex-col items-center justify-center hover:bg-white/5 transition-colors group cursor-help"
                    onMouseEnter={(e) => handleMouseEnter(e, "Funds", "Liquid assets available for recruitment and black market purchases.", "Resource")}
                    onMouseLeave={handleMouseLeave}
                >
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Funds</span>
                    <span className="font-mono font-bold text-emerald-400 text-lg">N$ {money.toLocaleString()}</span>
                </div>
                <div 
                    className="p-2 flex flex-col items-center justify-center hover:bg-white/5 transition-colors group cursor-help"
                    onMouseEnter={(e) => handleMouseEnter(e, "Influence", "Street Respect. Used to unlock higher tier operations.", "Resource")}
                    onMouseLeave={handleMouseLeave}
                >
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Influence</span>
                    <span className="font-mono font-bold text-amber-400 text-lg">{respect}</span>
                </div>
            </div>

            {/* HP Bar */}
            <div className="px-4 py-2 bg-slate-800/50 border-t border-slate-700">
                <div className="flex justify-between text-[9px] uppercase font-bold text-slate-400 mb-1">
                    <span>Condition</span>
                    <span>100%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                    <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 w-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                </div>
            </div>

            {/* Traits Section */}
            <div className="p-3 border-t border-slate-700 bg-slate-900 relative">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block pl-1">Personality Traits</span>
                 <div className="flex flex-wrap gap-2">
                     {activeTraits.length === 0 && (
                         <span className="text-xs text-slate-600 italic pl-1">No distinguishing traits.</span>
                     )}
                     {activeTraits.map((t, idx) => t && (
                         <div 
                            key={idx} 
                            className="group relative hover:z-50"
                            onMouseEnter={(e) => handleMouseEnter(e, t.label, t.description, getTraitLabel(t.type), t.statModifiers as any, t.duration)}
                            onMouseLeave={handleMouseLeave}
                         >
                             <div className={`w-8 h-8 rounded border-2 flex items-center justify-center shadow-sm cursor-help transition-transform hover:scale-110
                                ${getTraitStyle(t.type)}
                             `}>
                                 <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                     <path d={t.iconPath} />
                                 </svg>
                                 {t.rank > 1 && (
                                     <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-slate-900 border border-slate-500 rounded-full text-[8px] flex items-center justify-center text-white font-bold">
                                         {t.rank}
                                     </div>
                                 )}
                             </div>
                         </div>
                     ))}
                 </div>
            </div>

            {/* Backstory Accordion/Area */}
            <div className="bg-slate-950 p-4 border-t border-slate-800 max-h-32 overflow-y-auto custom-scrollbar group rounded-b-xl">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 block group-hover:text-slate-500 transition-colors">Origin Story</span>
                <p className="text-xs text-slate-400 font-serif leading-relaxed opacity-80 italic">
                    "{boss.backstory.split('[')[0].trim()}"
                </p>
                {/* Path info tiny */}
                <div className="mt-2 text-[8px] text-slate-700 font-mono uppercase truncate">
                    {boss.backstory.match(/\[Path: (.*?)\]/)?.[1] || 'Unknown Origin'}
                </div>
            </div>

        </div>
    </div>

    {/* Fixed Tooltip Layer */}
    {hoveredTooltip && (
        <div 
            className="fixed z-[9999] pointer-events-none w-64 animate-fade-in"
            style={{ 
                left: hoveredTooltip.rect.left + (hoveredTooltip.rect.width / 2), 
                top: hoveredTooltip.rect.top - 8,
                transform: 'translate(-50%, -100%)' 
            }}
        >
            <div className="bg-slate-900 border-2 border-slate-500 text-white p-3 rounded-xl shadow-2xl relative">
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-b-2 border-r-2 border-slate-500 transform rotate-45"></div>
                
                <div className="font-black uppercase text-xs mb-1 text-amber-400 flex justify-between items-center">
                    <span>{hoveredTooltip.title}</span>
                    <div className="flex gap-1">
                        {hoveredTooltip.duration && (
                            <span className="text-[9px] bg-slate-800 px-1 rounded text-slate-300 border border-slate-600 flex items-center gap-1">
                                <span>⏱</span> {hoveredTooltip.duration}
                            </span>
                        )}
                        <span className="text-[9px] bg-slate-800 px-1 rounded text-slate-400 border border-slate-700">{hoveredTooltip.typeLabel}</span>
                    </div>
                </div>
                <div className="text-xs text-slate-300 leading-tight mb-2 font-serif italic">
                    "{hoveredTooltip.desc}"
                </div>
                {hoveredTooltip.stats && (
                    <div className="flex flex-wrap gap-1 border-t border-slate-700 pt-2">
                        {Object.entries(hoveredTooltip.stats).map(([k, v]) => {
                            const val = v as number;
                            return (
                                <span key={k} className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-600 text-slate-300 uppercase">
                                    {val > 0 ? '+' : ''}{val} {k.substring(0,3)}
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    )}
    </>
  );
};

export default BottomCharacterPanel;