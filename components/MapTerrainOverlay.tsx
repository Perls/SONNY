
import React from 'react';
import { isWater, isBeach } from '../utils/waterUtils';

interface MapTerrainOverlayProps {
    viewBox?: string;
}

const MapTerrainOverlay: React.FC<MapTerrainOverlayProps> = ({ viewBox = "0 0 1500 1000" }) => {
    
    // Grid Setup
    const cols = 15;
    const rows = 10;
    const blockSize = 100;

    // Helper for deterministic random icons on water
    const getWaterIcon = (x: number, y: number) => {
        const seed = (x * 17 + y * 23);
        const mod = seed % 10;
        if (mod === 0) return '🦆'; // Duck
        if (mod === 1) return '⛵'; // Boat
        if (mod === 2) return '🛥️'; // Motorboat
        if (mod === 3) return '🌊'; // Wave
        if (mod === 4) return '🚧'; // Buoy/Construction (Rare)
        return null;
    };

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[25] animate-fade-in">
            <svg className="absolute inset-0 w-full h-full" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
                <defs>
                    <pattern id="wavePattern" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 0 10 Q 5 5 10 10 T 20 10" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
                    </pattern>
                    <pattern id="hazardStripes" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <rect width="5" height="10" fill="#fbbf24" /> {/* Amber */}
                        <rect x="5" width="5" height="10" fill="#000" /> {/* Black */}
                    </pattern>
                    
                    <filter id="waterGlow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    
                    <pattern id="sandPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                         <circle cx="2" cy="2" r="1" fill="#b45309" opacity="0.2" />
                         <circle cx="12" cy="12" r="1" fill="#b45309" opacity="0.2" />
                         <circle cx="18" cy="4" r="1" fill="#b45309" opacity="0.2" />
                    </pattern>

                    <style>{`
                        @keyframes bob {
                            0%, 100% { transform: translateY(0); }
                            50% { transform: translateY(-3px); }
                        }
                        .animate-bob {
                            animation: bob 2s ease-in-out infinite;
                        }
                        @keyframes wave-slide {
                            from { x: 0; }
                            to { x: -20px; }
                        }
                    `}</style>
                </defs>

                {Array.from({ length: cols }).map((_, col) => 
                    Array.from({ length: rows }).map((_, row) => {
                        const x = col * blockSize;
                        const y = row * blockSize;

                        // BEACH LOGIC
                        if (isBeach(col, row)) {
                            return (
                                <g key={`beach-${col}-${row}`} transform={`translate(${x}, ${y})`}>
                                     {/* Base Sand Tile */}
                                     <rect 
                                         x="5" y="5" width="90" height="90" rx="15" ry="15" 
                                         fill="#fde047" // Yellow-300
                                         stroke="#fbbf24" // Amber-400
                                         strokeWidth="2"
                                         opacity="0.9"
                                         className="drop-shadow-sm"
                                     />
                                     <rect 
                                         x="5" y="5" width="90" height="90" rx="15" ry="15" 
                                         fill="url(#sandPattern)" 
                                         opacity="0.5"
                                     />
                                     {/* Half-Submerged Look (Blue Wave at bottom) */}
                                     <path 
                                         d="M 5 60 Q 25 50 50 60 T 95 60 V 80 Q 50 95 5 80 Z" 
                                         fill="#7dd3fc" 
                                         opacity="0.4"
                                     />
                                     {/* Icon */}
                                     <text 
                                         x="50" y="50" 
                                         textAnchor="middle" 
                                         dominantBaseline="central" 
                                         fontSize="12"
                                     >
                                         🏖️
                                     </text>
                                </g>
                            );
                        }

                        if (!isWater(col, row)) return null;

                        // WATER LOGIC
                        const icon = getWaterIcon(col, row);
                        
                        // Determine boundaries for "Coastline" barriers
                        const neighbors = [
                            { dx: 0, dy: -1, side: 'top' },
                            { dx: 0, dy: 1, side: 'bottom' },
                            { dx: -1, dy: 0, side: 'left' },
                            { dx: 1, dy: 0, side: 'right' }
                        ];

                        return (
                            <g key={`terrain-${col}-${row}`} transform={`translate(${x}, ${y})`}>
                                {/* 1. Base Water Tile (Rounded Squircles for cuteness) */}
                                <rect 
                                    x="5" y="5" width="90" height="90" rx="15" ry="15" 
                                    fill="#7dd3fc" // Sky-300
                                    stroke="#38bdf8" // Sky-400
                                    strokeWidth="2"
                                    opacity="0.9"
                                    className="drop-shadow-sm"
                                />
                                
                                {/* 2. Wave Pattern Overlay */}
                                <rect 
                                    x="5" y="5" width="90" height="90" rx="15" ry="15" 
                                    fill="url(#wavePattern)" 
                                    opacity="0.5"
                                />

                                {/* 3. Cute Icon */}
                                {icon && (
                                    <text 
                                        x="50" y="50" 
                                        textAnchor="middle" 
                                        dominantBaseline="central" 
                                        fontSize="24"
                                        className="animate-bob"
                                        style={{ animationDelay: `${(col + row) * 0.2}s` }}
                                    >
                                        {icon}
                                    </text>
                                )}

                                {/* 4. Waze-style Coastline Barriers */}
                                {neighbors.map(({dx, dy, side}) => {
                                    const nx = col + dx;
                                    const ny = row + dy;
                                    if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                                        if (!isWater(nx, ny) && !isBeach(nx, ny)) {
                                            // Coordinates for line (Edge of 100x100 block)
                                            let x1=0, y1=0, x2=0, y2=0;
                                            
                                            if (side === 'top') { x1=0; y1=2; x2=100; y2=2; }
                                            if (side === 'bottom') { x1=0; y1=98; x2=100; y2=98; }
                                            if (side === 'left') { x1=2; y1=0; x2=2; y2=100; }
                                            if (side === 'right') { x1=98; y1=0; x2=98; y2=100; }
                                            
                                            // Hazard Stripe Box coords (Inner)
                                            let bx=0, by=0, bw=0, bh=0;
                                            if (side === 'top') { bx = 10; by = 5; bw = 80; bh = 6; }
                                            if (side === 'bottom') { bx = 10; by = 89; bw = 80; bh = 6; }
                                            if (side === 'left') { bx = 5; by = 10; bw = 6; bh = 80; }
                                            if (side === 'right') { bx = 89; by = 10; bw = 6; bh = 80; }

                                            return (
                                                <g key={side}>
                                                    {/* Thick Coastline Border */}
                                                    <line 
                                                        x1={x1} y1={y1} x2={x2} y2={y2}
                                                        stroke="#bae6fd" // Sky-200 (Light Blue/White-ish)
                                                        strokeWidth="8"
                                                        strokeLinecap="round"
                                                        opacity="0.8"
                                                    />
                                                    <line 
                                                        x1={x1} y1={y1} x2={x2} y2={y2}
                                                        stroke="white"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                    />

                                                    {/* Caution Stripe (Moved slightly inward) */}
                                                    <rect 
                                                        x={bx} y={by} width={bw} height={bh} rx="2"
                                                        fill="url(#hazardStripes)"
                                                        stroke="white"
                                                        strokeWidth="1"
                                                        filter="drop-shadow(0 1px 1px rgba(0,0,0,0.2))"
                                                    />
                                                    
                                                    {/* "Road Closed" Icon */}
                                                    {(side === 'top' || side === 'bottom') && (
                                                        <circle cx="50" cy={side === 'top' ? 8 : 92} r="3" fill="#ef4444" stroke="white" strokeWidth="1" />
                                                    )}
                                                    {(side === 'left' || side === 'right') && (
                                                        <circle cx={side === 'left' ? 8 : 92} cy="50" r="3" fill="#ef4444" stroke="white" strokeWidth="1" />
                                                    )}
                                                </g>
                                            );
                                        }
                                    }
                                    return null;
                                })}

                            </g>
                        );
                    })
                )}

                {/* Floating Labels for Big Water Bodies */}
                <g transform="translate(1100, 600) rotate(-15)">
                    <text 
                        x="0" y="0" textAnchor="middle" 
                        fill="white" fontSize="40" fontWeight="900" 
                        className="font-news tracking-widest opacity-40 uppercase drop-shadow-md select-none"
                    >
                        East River
                    </text>
                </g>
                <g transform="translate(100, 900) rotate(5)">
                    <text 
                        x="0" y="0" textAnchor="middle" 
                        fill="white" fontSize="40" fontWeight="900" 
                        className="font-news tracking-widest opacity-40 uppercase drop-shadow-md select-none"
                    >
                        Hudson Bay
                    </text>
                </g>

            </svg>

            {/* UI Key/Legend */}
            <div className="absolute bottom-24 left-24 z-50 animate-slide-up origin-bottom-left">
                <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg p-3 flex flex-col gap-2 min-w-[180px]">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 mb-1">
                        Terrain Guide
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-[#7dd3fc] border border-[#38bdf8] flex items-center justify-center text-xs">🌊</div>
                        <div className="text-[10px] font-bold text-slate-600 uppercase">Water / Deep</div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                         <div className="w-6 h-6 rounded bg-[#fde047] border border-[#fbbf24] flex items-center justify-center text-xs">🏖️</div>
                         <div className="text-[10px] font-bold text-slate-600 uppercase">Beach / Shallow</div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-[repeating-linear-gradient(45deg,#fbbf24,#fbbf24_5px,#000_5px,#000_10px)] border border-slate-400"></div>
                        <div className="text-[10px] font-bold text-slate-600 uppercase">Blocked Route</div>
                    </div>

                    <div className="mt-1 text-[9px] text-slate-400 italic leading-tight">
                        "If it looks wet, don't drive on it."
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapTerrainOverlay;
