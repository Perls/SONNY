
import React, { useState, useEffect } from 'react';
import { ActiveMission, CrewMember } from '../types';

interface MapMissionOverlayProps {
    missions: ActiveMission[];
    crew: CrewMember[];
    viewBox?: string;
}

const MapMissionOverlay: React.FC<MapMissionOverlayProps> = ({ missions, crew, viewBox = "0 0 1500 1000" }) => {
    // Force re-render for smooth animation
    const [, setTick] = useState(0);
    useEffect(() => {
        if (missions.length === 0) return;
        let frameId: number;
        const loop = () => {
            setTick(Date.now());
            frameId = requestAnimationFrame(loop);
        };
        frameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameId);
    }, [missions.length]);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[25]">
            <svg className="absolute inset-0 w-full h-full" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
                <defs>
                    <clipPath id="missionCrewClip">
                        <circle cx="0" cy="0" r="10" />
                    </clipPath>
                </defs>
                {missions.map(m => {
                    // Only animate if within travel duration
                    const now = Date.now();
                    if (now > m.startTime + m.travelDuration) return null;

                    const progress = Math.min(1, (now - m.startTime) / m.travelDuration);
                    
                    // Destination in Pixels
                    const endX = m.targetX * 100 + 50;
                    const endY = m.targetY * 100 + 50;

                    const currentX = m.startX + (endX - m.startX) * progress;
                    const currentY = m.startY + (endY - m.startY) * progress;
                    
                    // Calculate distance to determine cadence
                    const dist = Math.sqrt(Math.pow(endX - m.startX, 2) + Math.pow(endY - m.startY, 2));
                    // 1 step every 40 pixels for walking simulation
                    const steps = Math.max(1, Math.ceil(dist / 40));
                    
                    // Sine wave for walking bob/hop
                    const hopHeight = 12; // Higher hop for crew energy
                    const hopOffset = Math.abs(Math.sin(progress * Math.PI * steps)) * hopHeight;
                    
                    const scaleShadow = 1 - (hopOffset / 25);
                    
                    // Direction check
                    const isMovingRight = endX > m.startX;

                    // Get first crew member assigned to visualize
                    const crewMember = crew.find(c => c.id === m.crewIds[0]);
                    const seed = crewMember?.imageSeed || 123;

                    return (
                        <g key={m.id} transform={`translate(${currentX}, ${currentY - hopOffset})`}>
                            {/* Shadow on ground */}
                            <ellipse 
                                cx="0" 
                                cy={hopOffset + 5} 
                                rx={6 * scaleShadow} 
                                ry={3 * scaleShadow} 
                                fill="black" 
                                opacity="0.3" 
                            />
                            
                            {/* Avatar Group - Flip based on direction */}
                            <g transform={isMovingRight ? "scale(-1, 1)" : ""}>
                                {/* Background Circle */}
                                <circle r="14" fill="#fbbf24" stroke="white" strokeWidth="2" />
                                <image 
                                    href={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} 
                                    x="-12" y="-12" width="24" height="24" 
                                    clipPath="url(#missionCrewClip)"
                                    preserveAspectRatio="xMidYMid slice"
                                />
                            </g>
                            
                            {/* Mission Label Bubble */}
                            <g transform="translate(0, -25)">
                                <rect x="-20" y="-10" width="40" height="12" rx="4" fill="white" stroke="#fbbf24" strokeWidth="1" />
                                <text 
                                    y="-3" 
                                    textAnchor="middle" 
                                    fontSize="7" 
                                    fill="#b45309" 
                                    fontWeight="900" 
                                    className="uppercase tracking-widest font-mono"
                                    dominantBaseline="middle"
                                >
                                    {m.type}
                                </text>
                            </g>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default MapMissionOverlay;
