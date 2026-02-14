
import React, { useMemo } from 'react';
import { Holding, ClassType, PlayerHousing } from '../types';
import { generateBlockBuildings, AVENUE_NAMES, STREET_NAMES, PRIORITY_TILES, BlockSubPlot, MEGABLOCK_TILES, CENTRAL_PARK_TILES, HIGHLAND_PARK_TILES, getBlockHeat } from '../utils/mapUtils';
import { BEACH_TILES } from '../utils/waterUtils';

interface MapBackgroundProps {
    holdings: Holding[];
    playerClass: ClassType;
    mapMode: string;
    view: string;
    viewBox?: string;
    isNight?: boolean;
    playerGridPos?: { x: number, y: number };
}

// Helper to determine if a building should be on the top priority layer
const isHighPriorityBuilding = (b: BlockSubPlot) => {
    return b.type === 'landmark' || b.name.includes('Dock') || b.name.includes('Point') || b.name.includes('Port');
};

// Police Pointer Icon Component
const PolicePointer = ({ x, y }: { x: number, y: number }) => (
    <g transform={`translate(${x}, ${y})`}>
        {/* Offset to anchor pointer tip to coordinate. Tip is at y=25, so shift -25 */}
        <g transform="translate(0, -25)">
            <path d="M -7 15 L 7 15 L 0 25 Z" fill="#3b82f6" stroke="none" />
            <circle r="18" fill="#3b82f6" stroke="white" strokeWidth="2" />
            <path d="M -12 -12 Q 0 -20 12 -12 L 12 -8 Q 0 -12 -12 -8 Z" fill="#1e3a8a" stroke="#1e3a8a" strokeWidth="1" />
            <defs>
                <clipPath id={`policeClip-${x}-${y}`}>
                    <circle cx="0" cy="0" r="18" />
                </clipPath>
            </defs>
            <image 
                href={`https://api.dicebear.com/7.x/avataaars/svg?seed=Officer${x}${y}&clothing=blazerShirt&clothingColor=2563eb&top=hat`} 
                x="-18" y="-18" width="36" height="36" 
                clipPath={`url(#policeClip-${x}-${y})`}
                preserveAspectRatio="xMidYMid slice"
            />
            <circle cx="12" cy="12" r="5" fill="#f59e0b" stroke="white" strokeWidth="1" />
            <text x="12" y="14" fontSize="6" textAnchor="middle" fill="white" fontWeight="bold">👮</text>
        </g>
    </g>
);

const MapBackground: React.FC<MapBackgroundProps> = React.memo(({ 
    holdings, 
    playerClass, 
    mapMode, 
    view, 
    viewBox = "0 0 1500 1000",
    isNight,
    playerGridPos
}) => {
    // Pre-compute ALL block building layouts once (fixes Rules of Hooks violation & deduplicates generation)
    const allBuildings = useMemo(() => {
        const grid: BlockSubPlot[][] = [];
        for (let col = 0; col < 15; col++) {
            for (let row = 0; row < 10; row++) {
                grid[col * 10 + row] = generateBlockBuildings(col, row);
            }
        }
        return grid;
    }, []);
    const getOwnedHolding = (gx: number, gy: number, slotIdx: number) => 
        holdings.find(h => h.x === gx && h.y === gy && h.slotIndex === slotIdx && !h.unitId);
        
    const CLASS_COLORS: Record<ClassType, string> = { [ClassType.Thug]: '#525252', [ClassType.Smuggler]: '#eab308', [ClassType.Dealer]: '#3b82f6', [ClassType.Entertainer]: '#a855f7', [ClassType.Hustler]: '#10b981' };
    const playerColor = CLASS_COLORS[playerClass] || '#525252';
    const isStreetsMode = mapMode === 'streets';
    const isPayphoneMode = mapMode === 'payphones';
    const isJobsMode = mapMode === 'jobs';
    const isMedicalMode = mapMode === 'medical';
    const isHeatMode = mapMode === 'heat';

    const renderBuildingGroup = (col: number, row: number, buildings: BlockSubPlot[]) => {
        return buildings.map((b, idx) => {
            if (b.isHidden) return null;

            if (b.type === 'payphone') {
                if (!isPayphoneMode) return null;
                return (
                    <g key={`payphone-${col}-${row}`} transform={`translate(${col * 100 + 50}, ${row * 100 + 50})`}>
                        <circle r={14} fill="#3b82f6" stroke="white" strokeWidth={2} className="shadow-lg animate-pulse" />
                        <text textAnchor="middle" dominantBaseline="central" fontSize="14" fill="white" pointerEvents="none">📞</text>
                    </g>
                );
            }

            const owned = getOwnedHolding(col, row, b.slotIndex);
            const isLandmark = b.type === 'landmark' || b.name.includes('Dock') || b.name.includes('Point') || b.name.includes('Port');
            // NEUTRAL GRAYS (Was Slate/Blue-ish)
            let fillColor = "#e5e5e5"; // Neutral Gray-200
            let strokeColor = "transparent"; 
            let strokeWidth = 0; 
            let strokeDash = "none";
            let opacity = 1;

            if (b.landmarkId === 'central_park' || b.landmarkId === 'highland_park') {
                if (!b.isVisualMaster) return null; 
                fillColor = '#bef264'; strokeColor = '#bef264'; 
            } else if (b.landmarkId === 'mafia_hq') {
                fillColor = '#fee2e2'; strokeColor = '#ef4444'; strokeWidth = 2;
            } else if (b.landmarkId === 'megablock_tower') {
                fillColor = '#f5f5f5'; strokeColor = '#d4d4d4'; strokeWidth = 3;
            } else if (owned && owned.ownerFaction === 'player') { 
                fillColor = "white"; strokeColor = playerColor; strokeWidth = 3; strokeDash = "6 4";
            } else if (isLandmark) { 
                fillColor = "white"; strokeColor = "#a3a3a3"; strokeWidth = 2; strokeDash = "6 4"; // Gray-400
            }

            if (isJobsMode) {
                if (b.type === 'industrial') {
                    fillColor = "#f59e0b"; strokeColor = "#ffffff"; strokeWidth = 2; opacity = 1;
                } else {
                    opacity = 0.15; 
                }
            }

            if (isMedicalMode) {
                const isMedical = b.type === 'medical' || b.landmarkId === 'hospital';
                if (isMedical) {
                    fillColor = "#ef4444"; strokeColor = "#ffffff"; strokeWidth = 2; opacity = 1;
                } else {
                    opacity = 0.15; 
                }
            }

            if (isHeatMode) {
                opacity = 0.8;
            }

            const isLarge = b.w >= 85 && b.h >= 85;
            const isBeachBuilding = b.name === 'Coastal Ruins';
            let displayName = b.name.toUpperCase();
            if (displayName.includes('NEIGHBORHOOD')) displayName = displayName.replace('NEIGHBORHOOD ', '');
            if (displayName.includes("ST. JUDE'S")) displayName = "HOSPITAL";
            if (displayName.includes("ST. MICHAEL'S")) displayName = "CATHEDRAL";

            if (b.landmarkId === 'megablock_tower') {
                if (!b.isVisualMaster) return null;
                return (
                    <g key={`bld-${idx}`} transform={`translate(${col * 100}, ${row * 100})`} opacity={opacity}>
                        <rect x={b.x + 8} y={b.y + 12} width={b.w} height={b.h} rx={24} ry={24} fill="#000" opacity="0.1" filter="url(#softShadow)" />
                        <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={24} ry={24} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} className="transition-colors group-hover:stroke-gray-400" />
                        <path d={`M ${b.x + 40} ${b.y + 50} H ${b.x + b.w - 40}`} fill="none" stroke="#e5e5e5" strokeWidth="3" strokeLinecap="round" />
                        <path d={`M ${b.x + 40} ${b.y + 80} H ${b.x + b.w - 40}`} fill="none" stroke="#e5e5e5" strokeWidth="3" strokeLinecap="round" />
                        <path d={`M ${b.x + 40} ${b.y + 110} H ${b.x + b.w - 40}`} fill="none" stroke="#e5e5e5" strokeWidth="3" strokeLinecap="round" />
                        <path d={`M ${b.x + 40} ${b.y + 140} H ${b.x + b.w - 40}`} fill="none" stroke="#e5e5e5" strokeWidth="3" strokeLinecap="round" />

                        <g transform={`translate(${b.x + b.w/2}, ${b.y + b.h/2})`}>
                            <circle r={24} fill="white" stroke="#a3a3a3" strokeWidth={2} className="shadow-sm" />
                            <text textAnchor="middle" dominantBaseline="central" fontSize="24" fill="#525252" pointerEvents="none">🏢</text>
                            <text y={42} textAnchor="middle" fontSize="12" fontWeight="900" fill="#404040" className="uppercase tracking-widest font-mono pointer-events-none select-none" style={{ textShadow: '0px 1px 0px rgba(255,255,255,1)' }}>THE TOWER</text>
                        </g>
                    </g>
                );
            }

            return (
                <g key={`bld-${idx}`} transform={`translate(${col * 100}, ${row * 100})`} opacity={opacity}>
                    <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={5} ry={5} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={strokeDash} filter={owned || isLandmark || isJobsMode || isMedicalMode ? "url(#softShadow)" : ""} className={`transition-colors ${!owned && !isLandmark && !isJobsMode && !isMedicalMode && b.name !== 'Central Park' && b.name !== 'Highland Park' && b.landmarkId !== 'mafia_hq' ? 'group-hover:fill-gray-300' : ''}`} />
                    {!isJobsMode && !isMedicalMode && (owned || isLandmark || b.name === 'Shipping Dock' || isBeachBuilding) && (
                        <g transform={`translate(${b.x + b.w/2}, ${b.y + b.h/2})`}>
                            {!isBeachBuilding && <circle r={12} fill={owned ? playerColor : (b.name === 'Central Park' || b.name === 'Highland Park') ? '#ecfccb' : b.landmarkId === 'mafia_hq' ? '#fecaca' : "#f5f5f5"} stroke={owned ? "white" : (b.name === 'Central Park' || b.name === 'Highland Park') ? '#84cc16' : b.landmarkId === 'mafia_hq' ? '#dc2626' : "#d4d4d4"} strokeWidth={2} />}
                            <text textAnchor="middle" dominantBaseline="central" fontSize={isBeachBuilding ? 36 : 12} fill={owned ? "white" : "#404040"} pointerEvents="none" className={isBeachBuilding ? "drop-shadow-sm opacity-90" : ""}>{owned ? (owned.icon || '🏠') : b.icon}</text>
                            {isLarge && !owned && <text y={24} textAnchor="middle" fontSize="6" fontWeight="900" fill="#525252" className="uppercase tracking-widest font-mono pointer-events-none select-none" style={{ textShadow: '0px 1px 0px rgba(255,255,255,0.8)' }}>{displayName}</text>}
                        </g>
                    )}
                    {isJobsMode && b.type === 'industrial' && (
                        <g transform={`translate(${b.x + b.w/2}, ${b.y + b.h/2})`}>
                            <circle r={14} fill="#f59e0b" stroke="white" strokeWidth={2} className="shadow-lg animate-bounce" />
                            <text textAnchor="middle" dominantBaseline="central" fontSize="14" fill="white" pointerEvents="none">👷</text>
                        </g>
                    )}
                    {isMedicalMode && (b.type === 'medical' || b.landmarkId === 'hospital') && (
                        <g transform={`translate(${b.x + b.w/2}, ${b.y + b.h/2})`}>
                            <rect x="-10" y="-3" width="20" height="6" fill="white" rx="1" className="shadow-sm" />
                            <rect x="-3" y="-10" width="6" height="20" fill="white" rx="1" className="shadow-sm" />
                        </g>
                    )}
                </g>
            );
        });
    };

    return (
        <div className={`absolute inset-0 overflow-hidden select-none pointer-events-none ${isStreetsMode ? 'bg-[#18181b]' : 'bg-[#f5f5f4]'}`}>
            <svg className="absolute inset-0 w-full h-full transition-all duration-500 ease-in-out" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
                <defs>
                    <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                        <path d="M 100 0 L 0 0 0 100" fill="none" stroke={isStreetsMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"} strokeWidth="1"/>
                    </pattern>
                    
                    {/* Paper Texture Filter - Lightened */}
                    <filter id="paper" x="0%" y="0%" width="100%" height="100%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/>
                        <feDiffuseLighting in="noise" lightingColor="#ffffff" surfaceScale="0.4">
                            <feDistantLight azimuth="45" elevation="50"/>
                        </feDiffuseLighting>
                    </filter>

                    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.1" /></filter>
                    <pattern id="wazeWave" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 0 10 Q 5 5 10 10 T 20 10" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.3" /></pattern>
                    <pattern id="sandPattern" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#b45309" opacity="0.2" /><circle cx="12" cy="12" r="1" fill="#b45309" opacity="0.2" /><circle cx="18" cy="4" r="1" fill="#b45309" opacity="0.2" /></pattern>
                    <clipPath id="smallBeachClip"><rect x="25" y="25" width="50" height="50" rx="8" ry="8" /></clipPath>
                    <linearGradient id="tribecaGradient" x1="1" y1="0" x2="0" y2="0"><stop offset="0%" stopColor="#0f172a" stopOpacity="0.1" /><stop offset="100%" stopColor="#0f172a" stopOpacity="0.45" /></linearGradient>
                    <linearGradient id="sohoGradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#0f172a" stopOpacity="0.1" /><stop offset="100%" stopColor="#0f172a" stopOpacity="0.45" /></linearGradient>
                    <pattern id="lockPattern" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="20" stroke="#000" strokeWidth="2" opacity="0.1" /></pattern>
                    <pattern id="heatPattern" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" stroke="#ef4444" strokeWidth="1" opacity="0.3" /></pattern>
                    <style>{`
                        @keyframes gleamPulse { 0% { opacity: 0; transform: scale(0.8) rotate(0deg); } 50% { opacity: 0.3; transform: scale(1.1) rotate(45deg); } 100% { opacity: 0; transform: scale(0.8) rotate(90deg); } }
                        .animate-gleam { animation: gleamPulse 2.5s infinite ease-in-out; }
                        @keyframes borderFlash { 0%, 100% { stroke-opacity: 0.4; stroke-width: 2px; } 50% { stroke-opacity: 1; stroke-width: 3px; } }
                        .animate-border-flash { animation: borderFlash 2s infinite ease-in-out; }
                        @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
                        .animate-bob { animation: bob 3s ease-in-out infinite; }
                    `}</style>
                </defs>
                
                {/* 1. Base Layer (Color) */}
                <rect width="100%" height="100%" fill={isStreetsMode ? "#18181b" : "#ffffff"} />
                
                {/* 2. Paper Texture Layer (Light Mode Only) */}
                {!isStreetsMode && (
                    <rect width="100%" height="100%" filter="url(#paper)" opacity="0.25" style={{ mixBlendMode: 'multiply' }} />
                )}

                {/* 3. Grid Pattern Layer */}
                <rect width="100%" height="100%" fill="url(#grid)" />

                <g className="pointer-events-none select-none">
                    <rect x="-250" y="0" width="250" height="1000" fill="url(#tribecaGradient)" />
                    <line x1="0" y1="0" x2="0" y2="1000" stroke="#a3a3a3" strokeWidth="2" strokeDasharray="12 8" opacity="0.4" />
                    <text x="-100" y="500" textAnchor="middle" dominantBaseline="central" fill="#d4d4d4" fillOpacity="0.15" fontSize="60" fontWeight="900" transform="rotate(-90 -100 500)" className="font-news tracking-[0.5em] uppercase">Tribeca</text>
                    <rect x="-250" y="0" width="250" height="1000" fill="url(#lockPattern)" />
                </g>
                <g className="pointer-events-none select-none">
                    <rect x="1500" y="0" width="250" height="1000" fill="url(#sohoGradient)" />
                    <line x1="1500" y1="0" x2="1500" y2="1000" stroke="#a3a3a3" strokeWidth="2" strokeDasharray="12 8" opacity="0.4" />
                    <text x="1625" y="500" textAnchor="middle" dominantBaseline="central" fill="#d4d4d4" fillOpacity="0.15" fontSize="60" fontWeight="900" transform="rotate(90 1625 500)" className="font-news tracking-[0.5em] uppercase">SoHo</text>
                    <rect x="1500" y="0" width="250" height="1000" fill="url(#lockPattern)" />
                </g>
                {isStreetsMode && (
                    <g className="animate-fade-in">
                        {Array.from({ length: 15 }).map((_, col) => (
                            <g key={`ave-${col}`}>
                                <line x1={col * 100} y1="0" x2={col * 100} y2="1000" stroke="#f59e0b" strokeWidth="40" opacity="0.4" strokeLinecap="square" />
                                {col > 0 && <text x={col * 100} y="50" fill="white" fontSize="12" fontWeight="900" textAnchor="middle" dominantBaseline="central" transform={`rotate(-90 ${col * 100} 50)`} className="uppercase tracking-widest font-mono drop-shadow-md">{AVENUE_NAMES[col] || `${col}th Ave`}</text>}
                            </g>
                        ))}
                        {Array.from({ length: 10 }).map((_, row) => (
                            <g key={`st-${row}`}>
                                <line x1="0" y1={row * 100} x2="1500" y2={row * 100} stroke="#f59e0b" strokeWidth="2" opacity="0.3" />
                                {row > 0 && <text x="50" y={row * 100} fill="white" fontSize="10" fontWeight="900" textAnchor="middle" dominantBaseline="central" className="uppercase tracking-widest font-mono opacity-90">{STREET_NAMES[row] || `${row}0th St`}</text>}
                            </g>
                        ))}
                    </g>
                )}
                {Array.from({ length: 15 }).map((_, col) => 
                    Array.from({ length: 10 }).map((_, row) => {
                        const isPriority = PRIORITY_TILES.some(t => t.col === col && t.row === row);
                        const buildings = allBuildings[col * 10 + row];
                        const isMegablockTile = MEGABLOCK_TILES.some(t => t.col === col && t.row === row);
                        let highlightX = 4; let highlightY = 4; let highlightW = 92; let highlightH = 92;
                        if (isMegablockTile) {
                            if (col === 0 && row === 5) { highlightW = 192; highlightH = 192; } 
                            else if (col === 1 && row === 5) { highlightX = -96; highlightW = 192; highlightH = 192; } 
                            else if (col === 0 && row === 6) { highlightY = -96; highlightW = 192; highlightH = 192; } 
                            else if (col === 1 && row === 6) { highlightX = -96; highlightY = -96; highlightW = 192; highlightH = 192; }
                        }
                        
                        let heatFill = 'transparent';
                        const heatLevel = isHeatMode ? getBlockHeat(col, row) : 0;
                        const isHighHeat = heatLevel >= 80;
                        const isMediumHeat = heatLevel >= 20 && heatLevel < 80;
                        if (isHeatMode) {
                            if (isMediumHeat) { heatFill = '#fed7aa'; } else if (isHighHeat) { heatFill = 'rgba(220, 38, 38, 0.6)'; }
                        }

                        return (
                            <g key={`grid-cell-${col}-${row}`} className="group">
                                <rect x={col * 100} y={row * 100} width="100" height="100" fill={heatFill} className="transition-colors duration-500" />
                                {isStreetsMode ? (
                                    <g transform={`translate(${col * 100}, ${row * 100})`}>
                                        <rect x="5" y="5" width="90" height="90" rx="4" fill="#262626" stroke="#404040" strokeWidth="2" className="group-hover:stroke-amber-500 group-hover:fill-zinc-800 transition-colors"/>
                                        <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fill="#737373" fontSize="14" fontWeight="900" className="pointer-events-none opacity-50 group-hover:opacity-100 group-hover:fill-amber-500 transition-all">{col}-{row}</text>
                                    </g>
                                ) : (
                                    renderBuildingGroup(col, row, isPriority ? buildings.filter(b => !isHighPriorityBuilding(b)) : buildings)
                                )}
                                <rect x={col * 100 + highlightX} y={row * 100 + highlightY} width={highlightW} height={highlightH} fill="none" stroke={isStreetsMode ? "#f59e0b" : "#d4d4d4"} strokeWidth="2" strokeDasharray="8 8" opacity="0" rx={isMegablockTile ? 40 : 8} className="group-hover:opacity-100 transition-opacity pointer-events-none" />
                                {isHeatMode && isHighHeat && <PolicePointer x={col * 100 + 50} y={row * 100 + 50} />}
                            </g>
                        );
                    })
                )}
                {!isStreetsMode && (
                    <>
                        <path d="M 200 0 L 600 0 L 600 400 L 200 400 Z" fill="#3b82f6" opacity="0.03" pointerEvents="none" />
                        <path d="M 800 0 L 1500 0 L 1500 500 L 800 300 Z" fill="#ef4444" opacity="0.03" pointerEvents="none" />
                        <path d="M 0 600 L 500 600 L 500 1000 L 0 1000 Z" fill="#10b981" opacity="0.03" pointerEvents="none" />
                        <g className="pointer-events-none">
                            <path d="M -50 200 Q 400 250 800 100 T 1600 200" fill="none" stroke="#d4d4d8" strokeWidth="14" strokeLinecap="round" />
                            <path d="M -50 200 Q 400 250 800 100 T 1600 200" fill="none" stroke="#71717a" strokeWidth="10" strokeDasharray="3 6" strokeLinecap="butt" />
                            <path d="M -50 200 Q 400 250 800 100 T 1600 200" fill="none" stroke="#e4e4e7" strokeWidth="1" opacity="0.5" />
                        </g>
                        <path d="M 800 0 Q 750 400 800 1000" fill="none" stroke="#fcd34d" strokeWidth="20" strokeLinecap="round" pointerEvents="none" />
                        <path d="M 200 1000 L 1400 -100" fill="none" stroke="#fcd34d" strokeWidth="16" strokeLinecap="round" pointerEvents="none" />
                        <text x="360" y="245" fill="#71717a" opacity="0.8" fontSize="10" fontWeight="900" transform="rotate(-5 360 245)" className="pointer-events-none uppercase tracking-widest" style={{ textShadow: '0 1px 0px rgba(255,255,255,0.8)' }}>Metro Rail Line</text>
                    </>
                )}
                {isStreetsMode && (
                    <g className="pointer-events-none opacity-70">
                        <circle r="3" fill="#ef4444"><animateMotion dur="10s" repeatCount="indefinite" path="M 100 0 V 1000" /></circle>
                        <circle r="3" fill="#ef4444"><animateMotion dur="8s" repeatCount="indefinite" path="M 500 1000 V 0" /></circle>
                        <circle r="3" fill="#ffffff"><animateMotion dur="12s" repeatCount="indefinite" path="M 0 300 H 1500" /></circle>
                        <circle r="3" fill="#ffffff"><animateMotion dur="15s" repeatCount="indefinite" path="M 1500 600 H 0" /></circle>
                         <circle r="3" fill="#ef4444"><animateMotion dur="20s" repeatCount="indefinite" path="M 800 0 V 1000" /></circle>
                    </g>
                )}
                <g><path d="M -100 700 Q 250 650 400 820 Q 480 880 500 980 Q 600 1010 700 980 Q 800 960 880 980 L 900 850 Q 1000 800 1100 850 L 1120 980 Q 1200 1010 1300 980 L 1320 820 Q 1400 780 1600 820 V 1200 H -100 Z" fill="#7dd3fc" stroke="none"/><path d="M 1200 0 Q 1250 300 1400 500 V 0 Z" fill="#7dd3fc" stroke="none"/></g>
                <g><path d="M -100 700 Q 250 650 400 820 Q 480 880 500 980 Q 600 1010 700 980 Q 800 960 880 980 L 900 850 Q 1000 800 1100 850 L 1120 980 Q 1200 1010 1300 980 L 1320 820 Q 1400 780 1600 820 V 1200 H -100 Z" fill="url(#wazeWave)" stroke="none"/><path d="M 1200 0 Q 1250 300 1400 500 V 0 Z" fill="url(#wazeWave)" stroke="none"/></g>
                <g className="pointer-events-none select-none">
                    <text x="200" y="900" fontSize="24" className="animate-bob" style={{ animationDelay: '0s' }}>⛵</text>
                    <text x="400" y="950" fontSize="20" className="animate-bob" style={{ animationDelay: '1s' }}>🦆</text>
                    <text x="1300" y="200" fontSize="24" className="animate-bob" style={{ animationDelay: '2s' }}>🛥️</text>
                </g>
                <g className="pointer-events-none">
                    <path d="M 1160 210 L 1440 210" stroke="black" strokeWidth="20" opacity="0.1" strokeLinecap="round" />
                    <rect x="1230" y="200" width="10" height="50" fill="#71717a" />
                    <rect x="1370" y="200" width="10" height="50" fill="#71717a" />
                    <path d="M 1160 200 L 1440 200" stroke="#d4d4d8" strokeWidth="24" strokeLinecap="butt" />
                    <path d="M 1160 200 L 1440 200" stroke="#f4f4f5" strokeWidth="18" strokeLinecap="butt" />
                    <path d="M 1160 190 L 1440 190" stroke="#a1a1aa" strokeWidth="2" />
                    <path d="M 1160 210 L 1440 210" stroke="#a1a1aa" strokeWidth="2" />
                    <path d="M 1230 160 L 1230 200" stroke="#a1a1aa" strokeWidth="2" />
                    <path d="M 1370 160 L 1370 200" stroke="#a1a1aa" strokeWidth="2" />
                    <path d="M 1160 200 Q 1230 160 1300 200 T 1440 200" fill="none" stroke="#71717a" strokeWidth="2" />
                </g>
                {!isStreetsMode && BEACH_TILES.map((t, i) => (
                    <g key={`beach-base-${i}`} transform={`translate(${t.x * 100}, ${t.y * 100})`} className="pointer-events-none">
                         <g clipPath="url(#smallBeachClip)">
                             <rect x="25" y="25" width="50" height="50" rx="8" ry="8" fill="#fde047" stroke="#fbbf24" strokeWidth="2" opacity="0.9" />
                             <rect x="25" y="25" width="50" height="50" rx="8" ry="8" fill="url(#sandPattern)" opacity="0.5" />
                             <path d="M 25 60 Q 37.5 55 50 60 T 75 60 V 75 H 25 Z" fill="#7dd3fc" opacity="0.4" />
                         </g>
                    </g>
                ))}
                {!isStreetsMode && PRIORITY_TILES.map((t) => {
                     const buildings = allBuildings[t.col * 10 + t.row];
                     const highPriorityBuildings = buildings.filter(b => isHighPriorityBuilding(b));
                     if (highPriorityBuildings.length === 0) return null;
                     return (
                         <g key={`priority-${t.col}-${t.row}`} className="group">
                             {renderBuildingGroup(t.col, t.row, highPriorityBuildings)}
                         </g>
                     );
                })}
            </svg>
        </div>
    );
});

MapBackground.displayName = 'MapBackground';

export default MapBackground;
