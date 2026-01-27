
import React, { useMemo } from 'react';
import { GameState } from '../types';
import { MAX_CREW_SIZE } from '../constants';
import MapModes from './MapModes';
import GameActionStatus from './GameActionStatus';

interface BottomBarProps {
    gameState: GameState;
    activeMenu: string | null;
    onToggleMenu: (menu: string) => void;
    activeMapMode: string;
    onSelectMapMode: (mode: string) => void;
    isMapModesOpen: boolean;
    onToggleMapModes: () => void;
    // New Props for Status
    isMoving: boolean;
    movementQueue: { x: number, y: number }[];
    onCancelTravel: () => void;
    locationLabel: string;
}

const BottomBar: React.FC<BottomBarProps> = ({ 
    gameState, 
    activeMenu, 
    onToggleMenu, 
    activeMapMode, 
    onSelectMapMode,
    isMapModesOpen,
    onToggleMapModes,
    isMoving,
    movementQueue,
    onCancelTravel,
    locationLabel,
}) => {
    const currentLeader = gameState.crew.find(c => c.isLeader) || gameState.crew[0];
    const pawnCount = gameState.crew.filter(c => !c.isLeader).length;
    const maxPawns = MAX_CREW_SIZE - 1;

    const factionColorClass = useMemo(() => {
        const f = (currentLeader?.faction || '').toLowerCase();
        // Bright/Neon colors for the logo bar
        if (f.includes('mafia') || f.includes('commission')) return 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]';
        if (f.includes('cartel')) return 'bg-[#ffb300] shadow-[0_0_15px_rgba(255,179,0,0.8)]';
        if (f.includes('gang')) return 'bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.8)]';
        return 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]';
    }, [currentLeader]);

    // Define Button Order Here - Combat before Inventory
    const MENU_BUTTONS = [
        { id: 'tags', label: 'Tags', icon: '🎨' },
        { id: 'profile', label: 'Boss', icon: '👤' },
        { id: 'crew', label: 'Crew', icon: '♟️', info: `${pawnCount}/${maxPawns}` },
        { id: 'family', label: 'Family', icon: '🦁' },
        { id: 'combat', label: 'Combat', icon: '⚔️' },      
        { id: 'inventory', label: 'Inventory', icon: '🎒' }, 
        { id: 'block', label: 'Operations', icon: '🏙️' }, 
        { id: 'daily_times', label: 'Daily Times', icon: '📰' },
        { id: 'journal', label: 'Journal', icon: '📓' },
        { id: 'map_modes', label: 'Map Modes', icon: '🗺️' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
        <div className="h-20 bg-slate-900 border-t-2 border-slate-800 z-50 flex items-center justify-between px-6 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] relative select-none">
            
            {/* LOGO SECTION */}
            <div className="flex flex-col items-start justify-center mr-8 flex-shrink-0 animate-fade-in group cursor-default">
                <div className="flex items-center gap-3 mb-0.5">
                     {/* The "II" Logo: White Bar + Faction Color Bar */}
                     <div className="flex h-8 gap-1.5 transform skew-x-[-10deg]">
                         <div className="w-2 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
                         <div className={`w-2 ${factionColorClass}`}></div>
                     </div>
                     
                     <div className="flex flex-col">
                        <h1 className="text-3xl font-black font-news text-white tracking-tighter uppercase leading-none drop-shadow-lg italic">
                            Streets of <span className="text-slate-300">New York</span>
                        </h1>
                        <div className="text-[8px] font-bold tracking-[0.4em] text-slate-500 uppercase w-full text-left group-hover:text-slate-300 transition-colors mt-0.5">
                            The City That Never Sleeps
                        </div>
                     </div>
                </div>
            </div>

            {/* MENU BUTTONS */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 h-full">
                {MENU_BUTTONS.map(btn => {
                    if (btn.id === 'map_modes') {
                        return (
                            <MapModes 
                                key={btn.id}
                                activeMapMode={activeMapMode}
                                onSelectMode={(mode) => onSelectMapMode(mode)}
                                isOpen={isMapModesOpen}
                                onToggle={onToggleMapModes}
                            />
                        );
                    }

                    return (
                        <div key={btn.id} className="relative flex flex-col justify-center">
                            <button 
                                onClick={() => onToggleMenu(btn.id)} 
                                className={`
                                    h-12 min-w-[70px] px-3 bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded flex flex-col items-center justify-center gap-0.5 transition-all group hover:-translate-y-0.5 hover:shadow-lg hover:border-amber-500 relative
                                    ${activeMenu === btn.id ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] from-slate-800 to-slate-800 translate-y-0' : ''}
                                `}
                            >
                                <span className="text-lg filter grayscale group-hover:grayscale-0 transition-all">{btn.icon}</span>
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${activeMenu === btn.id ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'}`}>{btn.label}</span>
                                {btn.info && <div className="absolute top-1 right-1 bg-slate-900 text-[8px] font-mono text-white px-1 rounded border border-slate-600">{btn.info}</div>}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* RIGHT SIDE: ACTION STATUS */}
            <GameActionStatus 
                isMoving={isMoving}
                movementQueue={movementQueue}
                onCancel={onCancelTravel}
                currentLocationLabel={locationLabel}
            />
        </div>
    );
};

export default BottomBar;
