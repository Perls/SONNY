
import React, { useEffect, useRef } from 'react';
import { CrewMember, ClassType } from '../types';
import { CLASSES, XP_TO_LEVEL_2, XP_TO_LEVEL_3 } from '../constants';
import { useGameEngine } from '../contexts/GameEngineContext';
import AvatarDisplay from './AvatarDisplay';

interface CharacterWindowProps {
  boss: CrewMember;
  money: number;
}

const CharacterWindow: React.FC<CharacterWindowProps> = ({ boss, money }) => {
  const { addNotification, triggerLevelUpFlash } = useGameEngine(); // Using addNotification
  const classDef = CLASSES[boss.classType];
  const maxHp = boss.stats.maxHp || (20 + boss.stats.strength * 3);
  const currentHp = boss.hp ?? maxHp;
  const hpPercent = Math.min(100, (currentHp / maxHp) * 100);

  const xp = boss.xp || 0;
  const maxXp = boss.maxXp || (boss.level === 1 ? XP_TO_LEVEL_2 : XP_TO_LEVEL_3);
  const xpPercent = Math.min(100, (xp / maxXp) * 100);

  // --- LEVEL UP LISTENER START ---
  const prevLevelRef = useRef(boss.level);
  const prevBossIdRef = useRef(boss.id);

  useEffect(() => {
      // 1. If Boss ID changed (save loaded), just sync refs, don't trigger
      if (boss.id !== prevBossIdRef.current) {
          prevBossIdRef.current = boss.id;
          prevLevelRef.current = boss.level;
          return;
      }

      // 2. If Level Increased
      if (boss.level > prevLevelRef.current) {
          // Play sound via Notification system now
          // We can push a level up notification here if not handled elsewhere
          // But GameEngineContext already handles it in handleAddXp logic usually.
          // This listener is mostly visual flash now.
          triggerLevelUpFlash();
          prevLevelRef.current = boss.level;
      } 
      // 3. Sync if level decreased (rare/debug case)
      else if (boss.level < prevLevelRef.current) {
          prevLevelRef.current = boss.level;
      }
  }, [boss.level, boss.id, triggerLevelUpFlash]);
  // --- LEVEL UP LISTENER END ---

  const getFactionColors = (faction: string | undefined) => {
    const f = (faction || '').toLowerCase();
    if (f.includes('mafia') || f.includes('commission')) {
        return {
            bg: 'bg-red-800',
            border: 'border-red-900',
            fillPrimary: '#991b1b', // red-800
            fillSecondary: '#ef4444', // red-500
            gradient: 'from-red-700 to-red-300/50',
            textContrast: 'text-white',
        };
    }
    if (f.includes('cartel')) {
        return {
            bg: 'bg-[#ffb300]',
            border: 'border-[#ffb300]',
            fillPrimary: '#b37d00', 
            fillSecondary: '#ffb300', 
            gradient: 'from-[#ffb300] to-amber-300/50',
            textContrast: 'text-black', // Ensure readability on #ffb300
        };
    }
    if (f.includes('gang') || f.includes('street')) {
        return {
            bg: 'bg-purple-800',
            border: 'border-purple-900',
            fillPrimary: '#6b21a8', // purple-800
            fillSecondary: '#a855f7', // purple-500
            gradient: 'from-purple-700 to-purple-300/50',
            textContrast: 'text-white',
        };
    }
    // Default
    return {
        bg: 'bg-slate-800',
        border: 'border-slate-900',
        fillPrimary: '#1e293b',
        fillSecondary: '#64748b',
        gradient: 'from-slate-700 to-slate-300/50',
        textContrast: 'text-white',
    };
  };

  const colors = getFactionColors(boss.faction);

  const getClassIcon = (type: ClassType) => {
    switch(type) {
        case ClassType.Thug: return <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>;
        case ClassType.Smuggler: return <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>;
        case ClassType.Dealer: return <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z"/>;
        case ClassType.Entertainer: return <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.07 0-3.75-1.68-3.75-3.75S9.93 9 12 9s3.75 1.68 3.75 3.75S14.07 16.5 12 16.5zm0-9c-.69 0-1.25-.56-1.25-1.25S11.31 5 12 5s1.25.56 1.25 1.25S12.69 7.5 12 7.5z"/>;
        case ClassType.Hustler: return <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>;
    }
  }

  return (
    <div className="fixed top-0 left-0 z-50 h-24 flex items-start font-waze select-none">
        
        {/* Main Panel Body - White Theme */}
        <div className="bg-white/95 backdrop-blur-md h-full pl-0 pr-8 flex items-center gap-4 border-r border-b-2 border-slate-200 rounded-br-3xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] relative group overflow-visible min-w-[360px]">
            
            {/* Background Container - Contains Texture & Corner Motif clipped to border radius */}
            <div className="absolute inset-0 pointer-events-none rounded-br-3xl overflow-hidden">
                <div className="absolute inset-0 pattern-deco opacity-30"></div>
                
                {/* Faction Filigree Arrow - Bottom Right */}
                <div className="absolute bottom-0 right-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M24 24H0L24 0V24Z" fill={colors.fillPrimary} opacity="0.8"/>
                        <path d="M20 20H8L20 8V20Z" fill={colors.fillSecondary}/>
                    </svg>
                </div>
            </div>
            
            {/* Top Accent Line - FACTION COLORED */}
            <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${colors.gradient} to-transparent z-20`}></div>

            {/* Avatar Section with CLASS Background */}
            <div className="relative flex-shrink-0 group-hover:scale-105 transition-transform duration-500 z-10">
                <div className={`w-24 h-24 rounded-br-full border-r-4 border-b-4 border-white shadow-xl overflow-hidden relative ${classDef.color}`}>
                    
                    {/* Class Icon Background Pattern - Motif */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 text-white transform scale-125 rotate-12 pointer-events-none z-0">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                            {getClassIcon(boss.classType)}
                        </svg>
                    </div>

                    <AvatarDisplay 
                        seed={boss.imageSeed.toString()}
                        role={boss.classType}
                        className="w-full h-full transform scale-110 translate-y-2 relative z-10"
                    />
                </div>
                
                {/* Level Badge - FACTION Colored */}
                <div className={`absolute bottom-0 left-0 ${colors.textContrast} w-9 h-9 flex items-center justify-center font-black text-sm border-2 border-white shadow-md z-20 rounded-sm ${colors.bg}`}>
                    {boss.level}
                </div>
            </div>

            {/* Info Section */}
            <div className="flex flex-col justify-center flex-grow min-w-0 py-2">
                
                {/* Name */}
                <div className="flex items-baseline justify-between mb-1">
                    <h1 className={`text-[#1b1b1b] font-black font-news uppercase tracking-tighter leading-none text-xl truncate pr-2`}>
                        {boss.name}
                    </h1>
                </div>

                {/* Bars - Ultra Slim */}
                <div className="w-full space-y-1.5 mb-2">
                    {/* HP */}
                    <div className="relative h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                        <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                            style={{ width: `${hpPercent}%` }}
                        ></div>
                    </div>
                    {/* XP */}
                    <div className="relative h-1.5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                        <div 
                            className="h-full bg-blue-400"
                            style={{ width: `${xpPercent}%` }}
                        ></div>
                    </div>
                </div>

                {/* Resources */}
                <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono font-bold text-emerald-600 flex items-center gap-1 text-sm">
                        <span className="text-[10px] opacity-60 text-emerald-700">N$</span> {money.toLocaleString()}
                    </span>
                    <div className="w-[1px] h-3 bg-slate-300"></div>
                    <span className={`font-bold text-[10px] uppercase tracking-wide text-[#1b1b1b]`}>
                        "{boss.nickname}"
                    </span>
                </div>
            </div>
            
        </div>
    </div>
  );
};

export default CharacterWindow;
