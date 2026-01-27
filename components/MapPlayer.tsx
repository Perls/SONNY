
import React from 'react';
import { ClassType, PlayerHousing } from '../types';

interface MapPlayerProps {
    playerPos: { x: number, y: number };
    isMoving: boolean;
    isArriving: boolean;
    isRejected?: boolean;
    visitedPath: { x: number, y: number, id: string }[];
    leaderImageSeed: number | string;
    moveDuration?: number;
    mapMode: string;
    viewBox?: string;
    playerClass: ClassType;
    playerHousing?: PlayerHousing;
    tilt?: number;
}

const MapPlayer: React.FC<MapPlayerProps> = ({ 
    playerPos, 
    isMoving, 
    isArriving, 
    isRejected = false,
    visitedPath, 
    leaderImageSeed,
    moveDuration = 600,
    mapMode,
    viewBox = "0 0 1500 1000",
    playerClass,
    playerHousing,
    tilt = 0
}) => {
    const isStreetsMode = mapMode === 'streets';

    const CLASS_COLORS: Record<ClassType, string> = { 
        [ClassType.Thug]: '#64748b', 
        [ClassType.Smuggler]: '#eab308', 
        [ClassType.Dealer]: '#3b82f6', 
        [ClassType.Entertainer]: '#a855f7', 
        [ClassType.Hustler]: '#10b981' 
    };
    const playerColor = CLASS_COLORS[playerClass] || '#fbbf24';

    // If moveDuration is 0 (RAF mode), disable transition
    const transitionStyle = moveDuration > 0 && isMoving ? `transform ${moveDuration}ms linear` : 'none';

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            <style>{`
                @keyframes shake-no {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-5px); }
                    40%, 80% { transform: translateX(5px); }
                }
                .animate-shake-no {
                    animation: shake-no 0.4s ease-in-out;
                }
            `}</style>
            <svg className="absolute inset-0 w-full h-full transition-all duration-500 ease-in-out" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
                <defs>
                    {/* Avatar Clip Path - Size increased 1.5x (r=18) */}
                    <clipPath id="avatarClip">
                        <circle cx="0" cy="0" r="18" />
                    </clipPath>
                </defs>

                {/* Movement Trail - Fading Segments - Rendered FIRST to stay BEHIND avatar (Stays Flat) */}
                {visitedPath.map((p, i) => {
                    if (i === 0) return null;
                    const prev = visitedPath[i-1];
                    return (
                        <line
                            key={p.id}
                            x1={prev.x} y1={prev.y}
                            x2={p.x} y2={p.y}
                            stroke="#fbbf24"
                            strokeWidth="3"
                            strokeDasharray="8 8"
                            strokeLinecap="round"
                            className="animate-trail-fade"
                        />
                    );
                })}

                {/* Active Instant Trail Segment */}
                {isMoving && moveDuration > 0 && visitedPath.length > 0 && (
                    (() => {
                        const last = visitedPath[visitedPath.length - 1];
                        const dist = Math.sqrt(Math.pow(playerPos.x - last.x, 2) + Math.pow(playerPos.y - last.y, 2));
                        if (dist < 1) return null;
                        
                        return (
                            <line
                                key={`active-trail-${visitedPath.length}`}
                                x1={last.x} y1={last.y}
                                x2={playerPos.x} y2={playerPos.y}
                                stroke="#fbbf24"
                                strokeWidth="3"
                                strokeDasharray={dist}
                                strokeDashoffset={dist}
                                strokeLinecap="round"
                                className="animate-draw-line"
                                style={{ 
                                    '--line-length': dist, 
                                    animationDuration: `${moveDuration}ms` 
                                } as React.CSSProperties}
                            />
                        );
                    })()
                )}

                {/* Safehouse Marker - Flat on map */}
                {playerHousing && !isStreetsMode && (
                    <g transform={`translate(${playerHousing.location.x * 100 + 50}, ${playerHousing.location.y * 100 + 50})`} className="pointer-events-none z-50">
                        {/* Shadow */}
                        <ellipse cx="0" cy="0" rx="10" ry="5" fill="black" opacity="0.3" />
                        {/* Flat Marker Body */}
                        <g>
                            <path d="M 0 0 C -2 0 -15 -20 -15 -35 A 15 15 0 1 1 15 -35 C 15 -20 2 0 0 0 Z" fill={playerColor} stroke="white" strokeWidth="2" />
                            <text x="0" y="-35" textAnchor="middle" dominantBaseline="central" fontSize="16">🏠</text>
                        </g>
                    </g>
                )}

                {/* Player Avatar Group */}
                <g style={{ transform: `translate(${playerPos.x}px, ${playerPos.y}px)`, transition: transitionStyle }}>
                    {/* No Rotation - Stays Flat */}
                    <g>
                        
                        {/* Animation Wrapper (Hop/Shake) */}
                        <g className={isRejected ? 'animate-shake-no' : (isArriving ? 'animate-jump' : (isMoving && visitedPath.length <= 1 ? 'animate-hop-start' : ''))}>
                            
                            {/* Visual Offset Group - To align Tip to (0,0) */}
                            {/* Tip is at y=25, so we shift up by -25 to place tip at origin */}
                            <g transform="translate(0, -25)">
                                
                                {/* Triangle Pointer - Overlaps with circle to prevent gap */}
                                <path d="M -7 15 L 7 15 L 0 25 Z" fill={playerColor} stroke="none" />

                                {/* Main Circle Body - Solid Color, White Stroke - 1.5x size */}
                                <circle r="18" fill={playerColor} stroke="white" strokeWidth="2" />

                                {/* Avatar Image */}
                                <image 
                                    href={`https://api.dicebear.com/7.x/avataaars/svg?seed=${leaderImageSeed}&backgroundColor=transparent`} 
                                    x="-18" y="-18" width="36" height="36" 
                                    clipPath="url(#avatarClip)"
                                    preserveAspectRatio="xMidYMid slice"
                                />
                            </g>
                        </g>
                    </g>
                </g>
            </svg>
        </div>
    );
};

export default MapPlayer;
