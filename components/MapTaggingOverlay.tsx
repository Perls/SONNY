
import React, { useState, useEffect } from 'react';
import { TaggingOperation, CrewMember, MapTagData } from '../types';
import { generateBlockBuildings } from '../utils/mapUtils';

interface MapTaggingOverlayProps {
    activeTaggingOps: TaggingOperation[];
    mapTags?: MapTagData;
    crew: CrewMember[];
    viewBox?: string;
}

// Extension to handle visual lingering locally
interface VisualTaggingOp extends TaggingOperation {
    isLingering?: boolean;
    completionTime?: number;
}

const getFactionColor = (faction?: string) => {
    const f = faction?.toLowerCase() || '';
    if (f.includes('mafia') || f.includes('commission')) return '#dc2626'; // Crimson
    if (f.includes('gang') || f.includes('street')) return '#9333ea'; // Purple
    if (f.includes('cartel')) return '#ffb300'; // #ffb300
    // Default fallback to Crimson if undefined to match "testing characters are mafia" request
    return '#dc2626'; 
};

const MapTaggingOverlay: React.FC<MapTaggingOverlayProps> = ({ activeTaggingOps, mapTags = {}, crew, viewBox = "0 0 1500 1000" }) => {
    // Timer for animation ticks
    const [, setTick] = useState(0);
    
    // Local state to manage lingering "Success" popups
    const [visualOps, setVisualOps] = useState<VisualTaggingOp[]>([]);

    // 1. Sync Props with Local State
    useEffect(() => {
        setVisualOps(prevVisuals => {
            const now = Date.now();
            const currentIds = new Set(activeTaggingOps.map(op => op.id));
            const newVisuals: VisualTaggingOp[] = [];

            // Add/Update currently active ops
            activeTaggingOps.forEach(op => {
                newVisuals.push({ ...op, isLingering: false });
            });

            // Handle ops that just finished or are already lingering
            prevVisuals.forEach(vOp => {
                // If already lingering, keep it (Cleanup effect will remove it)
                if (vOp.isLingering) {
                    newVisuals.push(vOp);
                    return;
                }

                // If it WAS active but is NO LONGER in props, it finished naturally
                if (!currentIds.has(vOp.id)) {
                    // Check if we already added it via active list (unlikely)
                    if (!newVisuals.find(n => n.id === vOp.id)) {
                        newVisuals.push({ 
                            ...vOp, 
                            isLingering: true, 
                            completionTime: now 
                        });
                    }
                }
            });

            return newVisuals;
        });
    }, [activeTaggingOps]);

    // 2. Cleanup Lingering Ops - Increased to 5000ms
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setVisualOps(prev => {
                const next = prev.filter(op => {
                    if (op.isLingering && op.completionTime) {
                        // Remove after 5 seconds (animation duration)
                        return (now - op.completionTime) < 5000;
                    }
                    return true; // Keep active ops
                });
                return next.length !== prev.length ? next : prev;
            });
        }, 200); // Check frequently
        return () => clearInterval(interval);
    }, []);

    // Animation Loop
    useEffect(() => {
         const interval = setInterval(() => setTick(t => t + 1), 100);
         return () => clearInterval(interval);
    }, []);

    const getSlotCoordinates = (slotIndex: number, buildings: any[]) => {
        const building = buildings.find(b => b.slotIndex === slotIndex);
        if (building) {
            return {
                x: building.x + (building.w / 2),
                y: building.y + (building.h / 2)
            };
        }
        // Fallback Grid Layout
        const col = slotIndex % 3;
        const row = Math.floor(slotIndex / 3);
        if (slotIndex === 9) return { x: 85, y: 85 }; 
        return { x: 25 + (col * 25), y: 25 + (row * 25) };
    };

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[45]">
            <svg className="absolute inset-0 w-full h-full transition-all duration-500 ease-in-out" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
                <defs>
                    <clipPath id="taggingAvatarClip">
                        <circle cx="0" cy="0" r="12" /> 
                    </clipPath>
                    <filter id="sprayGlow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    <style>
                        {`
                            @keyframes rattle {
                                0% { transform: translate(0, 0); }
                                25% { transform: translate(-0.5px, 0.5px); }
                                50% { transform: translate(0.5px, -0.5px); }
                                75% { transform: translate(-0.5px, -0.5px); }
                                100% { transform: translate(0, 0); }
                            }
                            .animate-rattle {
                                animation: rattle 0.25s linear infinite;
                            }
                            @keyframes spray-jet {
                                0% { opacity: 0; transform: translateX(0) scale(0.5); }
                                20% { opacity: 1; }
                                100% { opacity: 0; transform: translateX(30px) scale(2); }
                            }
                            .spray-jet-particle {
                                animation: spray-jet 0.6s linear infinite;
                            }
                            @keyframes popHand {
                                0% { transform: scale(0) rotate(-45deg); opacity: 0; }
                                60% { transform: scale(1.5) rotate(10deg); opacity: 1; }
                                100% { transform: scale(1) rotate(0deg); opacity: 1; }
                            }
                            .animate-pop-hand {
                                animation: popHand 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                            }
                        `}
                    </style>
                </defs>
                
                {/* 1. Static Green Dots for Existing Map Tags */}
                {Object.keys(mapTags).map(key => {
                    const parts = key.split(',');
                    if (parts.length < 3) return null;
                    const x = parseInt(parts[0]);
                    const y = parseInt(parts[1]);
                    const slotIndex = parseInt(parts[2]);
                    
                    const buildings = generateBlockBuildings(x, y);
                    const coords = getSlotCoordinates(slotIndex, buildings);
                    const targetAbsX = (x * 100) + coords.x;
                    const targetAbsY = (y * 100) + coords.y;

                    return (
                        <circle 
                            key={`static-tag-${key}`} 
                            cx={targetAbsX} 
                            cy={targetAbsY} 
                            r="4" 
                            fill="#10b981" 
                        />
                    );
                })}

                {/* 2. Active Operations (and Lingering Effects) */}
                {visualOps.map(op => {
                    const buildings = generateBlockBuildings(op.x, op.y);
                    const coords = getSlotCoordinates(op.slotIndex, buildings);

                    // Absolute Coordinates
                    const blockAbsX = op.x * 100;
                    const blockAbsY = op.y * 100;
                    const targetAbsX = blockAbsX + coords.x;
                    const targetAbsY = blockAbsY + coords.y;
                    
                    const member = crew.find(c => c.id === op.crewId);
                    
                    // Logic: If lingering, force 100% state. If active, calculate.
                    const now = Date.now();
                    let progress = Math.min(1, (now - op.startTime) / op.duration);
                    if (op.isLingering) progress = 1;

                    const isComplete = progress >= 1;
                    
                    // Style Config
                    const radius = 14;
                    const circumference = 87.96;
                    const strokeDashoffset = circumference * (1 - progress); 
                    
                    // Color Logic
                    const factionColor = getFactionColor(member?.faction);
                    const sprayColor = factionColor;
                    const ringColor = isComplete ? '#10b981' : factionColor; 
                    
                    // Text Color
                    const textColor = '#64748b'; // Slate-500

                    // --- GEOMETRY ---
                    const dx = coords.x - 50;
                    const dy = coords.y - 50;
                    const angle = Math.atan2(dy, dx); 
                    
                    const streetDist = 75;
                    const avatarRelX = 50 + Math.cos(angle) * streetDist;
                    const avatarRelY = 50 + Math.sin(angle) * streetDist;

                    const avOffsetX = avatarRelX - coords.x;
                    const avOffsetY = avatarRelY - coords.y;

                    // Angle pointing from Avatar to Target
                    const aimAngle = Math.atan2(-avOffsetY, -avOffsetX) * (180 / Math.PI);

                    return (
                        <g key={op.id} transform={`translate(${targetAbsX}, ${targetAbsY})`}>
                            
                            {/* Target Marker - Shown if not already drawn by static tags (mostly for active) */}
                            <circle r="4" fill={isComplete ? "#10b981" : "rgba(0,0,0,0.2)"} className="transition-colors duration-500" />

                            {/* AVATAR GROUP */}
                            <g transform={`translate(${avOffsetX}, ${avOffsetY})`}>
                                
                                {/* 1. Avatar Base */}
                                <circle r="16" fill="#1e293b" stroke="white" strokeWidth="1" />

                                {/* 2. Avatar Image */}
                                {member && (
                                    <image 
                                        href={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.imageSeed}`} 
                                        x="-12" y="-12" width="24" height="24" 
                                        clipPath="url(#taggingAvatarClip)"
                                        preserveAspectRatio="xMidYMid slice"
                                    />
                                )}

                                {/* 3. Progress Ring */}
                                {!isComplete && (
                                    <>
                                        <circle r={radius} fill="none" stroke="#334155" strokeWidth="2.5" />
                                        <circle 
                                            r={radius} 
                                            fill="none" 
                                            stroke={ringColor} 
                                            strokeWidth="2.5" 
                                            strokeDasharray={circumference} 
                                            strokeDashoffset={strokeDashoffset} 
                                            transform="rotate(-90)"
                                            strokeLinecap="round"
                                        />
                                    </>
                                )}

                                {/* 4. Spray Paint Can (Floating between avatar and target) */}
                                {!isComplete && (
                                    <g transform={`rotate(${aimAngle})`}>
                                        {/* Shifted away from avatar center towards target. Offset Y for style. */}
                                        <g transform="translate(18, 5)">
                                            
                                            {/* Rattle Animation Group */}
                                            <g className="animate-rattle">
                                                
                                                {/* Tilted Container for vertical hold */}
                                                <g transform="rotate(-10)">
                                                    {/* Can Body - Vertical Construction */}
                                                    <g>
                                                        {/* Main Cylinder */}
                                                        <rect x="-4" y="2" width="8" height="12" rx="1" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
                                                        
                                                        {/* Colored Band (Brand) */}
                                                        <rect x="-4" y="6" width="8" height="4" fill={sprayColor} opacity="0.8" />
                                                        
                                                        {/* Neck/Top */}
                                                        <rect x="-3" y="0" width="6" height="2" fill="#64748b" /> 
                                                        
                                                        {/* Nozzle Button */}
                                                        <rect x="-2" y="-2" width="4" height="2" fill="#fff" stroke="#334155" strokeWidth="0.5" />
                                                    </g>

                                                    {/* Spray Mist */}
                                                    <g transform="translate(3, -1)" filter="url(#sprayGlow)">
                                                        {[...Array(5)].map((_, i) => (
                                                            <circle 
                                                                key={`spray-${i}`}
                                                                r={2 + Math.random() * 2}
                                                                fill={sprayColor}
                                                                className="spray-jet-particle"
                                                                style={{ animationDelay: `${i * 0.05}s` }}
                                                            />
                                                        ))}
                                                    </g>
                                                </g>
                                            </g>
                                        </g>
                                    </g>
                                )}

                                {/* 5. Action Indicator (Completion) */}
                                <g transform="translate(12, -8)">
                                    {isComplete && (
                                        <text 
                                            fontSize="24"
                                            alignmentBaseline="middle"
                                            textAnchor="middle"
                                            className="animate-pop-hand"
                                        >
                                            👌
                                        </text>
                                    )}
                                </g>

                                {/* 6. Text Label */}
                                <g transform="translate(0, -26)">
                                    <text 
                                        textAnchor="middle" 
                                        fill={textColor} 
                                        fontSize="10" 
                                        fontWeight="800" 
                                        className="uppercase tracking-widest"
                                        style={{ textShadow: "0px 1px 0px rgba(255,255,255,0.8)" }}
                                    >
                                        {isComplete ? "FRESH!" : "TAGGING..."}
                                    </text>
                                </g>
                            </g>

                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default MapTaggingOverlay;
