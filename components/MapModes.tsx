
import React from 'react';

interface MapModesProps {
  activeMapMode: string;
  onSelectMode: (mode: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const MODES = [
    { id: 'holdings', label: 'Holdings', icon: '🏠' },
    { id: 'streets', label: 'Streets', icon: '🛣️' },
    { id: 'faction', label: 'Faction', icon: '🏴' },
    { id: 'heat', label: 'Heat Map', icon: '🔥' },
    { id: 'terrain', label: 'Terrain', icon: '🚧' },
    { id: 'avoid', label: 'No Go Zone', icon: '⛔' },
    { id: 'damage', label: 'Damage', icon: '🏚️' },
    { id: 'imports', label: 'Logistics', icon: '🚢' },
    { id: 'payphones', label: 'Comms', icon: '📞' },
    { id: 'jobs', label: 'Jobs', icon: '👷' },
    { id: 'medical', label: 'Medical', icon: '✚' },
];

const MapModes: React.FC<MapModesProps> = ({ activeMapMode, onSelectMode, isOpen, onToggle }) => {
  return (
    <div className="relative font-waze select-none z-50">
        
        {/* Popup Window - Sleek/Modern Aesthetic */}
        {isOpen && (
            <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 z-50">
                <div className="w-72 animate-slide-up origin-bottom">
                    
                    {/* Main Panel */}
                    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden">
                        
                        {/* Header */}
                        <div className="bg-slate-800/50 p-3 border-b border-slate-700 flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Tactical Overlays
                            </span>
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500/50"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="p-3 grid grid-cols-4 gap-2">
                            {MODES.map(mode => {
                                const isActive = activeMapMode === mode.id;
                                return (
                                    <button 
                                        key={mode.id} 
                                        onClick={() => onSelectMode(mode.id)}
                                        className={`
                                            flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-200 group
                                            ${isActive 
                                                ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                                                : 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600'
                                            }
                                        `}
                                    >
                                        <div className={`text-xl mb-1 filter ${isActive ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'} transition-all`}>
                                            {mode.icon}
                                        </div>
                                        <div className={`text-[8px] font-bold uppercase tracking-wide text-center leading-tight
                                            ${isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'}
                                        `}>
                                            {mode.label}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        
                        {/* Footer Decoration */}
                        <div className="h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent w-full"></div>
                    </div>

                    {/* Arrow Pointer */}
                    <div className="w-4 h-4 bg-slate-900 border-b border-r border-slate-700 transform rotate-45 absolute -bottom-2 left-1/2 -translate-x-1/2"></div>
                </div>
            </div>
        )}
        
        {/* Trigger Button */}
        <button 
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`
                h-12 min-w-[70px] px-3 border rounded flex flex-col items-center justify-center gap-0.5 transition-all group relative
                ${isOpen 
                    ? 'bg-slate-800 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] translate-y-0' 
                    : 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700 hover:-translate-y-0.5 hover:border-amber-500 hover:shadow-lg'
                }
            `}
        >
            <span className={`text-lg filter ${isOpen ? 'grayscale-0' : 'grayscale'} group-hover:grayscale-0 transition-all`}>🗺️</span>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${isOpen ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                Map Modes
            </span>
            {isOpen && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(245,158,11,1)]"></div>}
        </button>
    </div>
  );
};

export default MapModes;
