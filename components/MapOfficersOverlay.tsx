
import React, { useState, useEffect } from 'react';
import { OfficerTravel } from '../types';

interface MapOfficersOverlayProps {
    travels: OfficerTravel[];
    viewBox?: string;
}

const MapOfficersOverlay: React.FC<MapOfficersOverlayProps> = ({ travels, viewBox = "0 0 1500 1000" }) => {
    // Force re-render for smooth animation
    const [, setTick] = useState(0);
    useEffect(() => {
        if (travels.length === 0) return;
        let frameId: number;
        const loop = () => {
            setTick(Date.now());
            frameId = requestAnimationFrame(loop);
        };
        frameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameId);
    }, [travels.length]);

    const getRoleColor = (role: string) => {
        const r = role.toLowerCase();
        if (r.includes('enforcer')) return '#dc2626'; // Red
        if (r.includes('consigliere')) return '#2563eb'; // Blue
        if (r.includes('underboss')) return '#9333ea'; // Purple
        if (r.includes('lawyer')) return '#10b981'; // Green
        return '#f59e0b'; // Amber
    };

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[25]">
            <svg className="absolute inset-0 w-full h-full" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
                <defs>
                    <clipPath id="officerClip">
                        <circle cx="0" cy="0" r="10" />
                    </clipPath>
                </defs>
                {travels.map(t => {
                    const now = Date.now();
                    const progress = Math.min(1, (now - t.startTime) / t.duration);
                    
                    const currentX = t.startX + (t.endX - t.startX) * progress;
                    const currentY = t.startY + (t.endY - t.startY) * progress;
                    
                    // Calculate distance to determine cadence
                    const dist = Math.sqrt(Math.pow(t.endX - t.startX, 2) + Math.pow(t.endY - t.startY, 2));
                    // 1 step every 40 pixels for walking simulation
                    const steps = Math.max(1, Math.ceil(dist / 40));
                    
                    // Sine wave for walking bob/hop
                    const hopHeight = 6;
                    const hopOffset = Math.abs(Math.sin(progress * Math.PI * steps)) * hopHeight;
                    
                    const scaleShadow = 1 - (hopOffset / 20);
                    const roleColor = getRoleColor(t.role);
                    
                    // Direction check
                    const isMovingRight = t.endX > t.startX;

                    return (
                        <g key={t.id} transform={`translate(${currentX}, ${currentY - hopOffset})`}>
                            {/* Shadow on ground - Moves with X/Y but not Z hop */}
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
                                <circle r="12" fill={roleColor} stroke="white" strokeWidth="2" />
                                <image 
                                    href={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.seed}`} 
                                    x="-10" y="-10" width="20" height="20" 
                                    clipPath="url(#officerClip)"
                                    preserveAspectRatio="xMidYMid slice"
                                />
                            </g>
                            
                            {/* Name Label */}
                            <g transform="translate(0, -22)">
                                <rect x="-24" y="-9" width="48" height="11" rx="2" fill="rgba(2, 6, 23, 0.8)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                                <text 
                                    y="-3" 
                                    textAnchor="middle" 
                                    fontSize="6" 
                                    fill="white" 
                                    fontWeight="bold" 
                                    className="uppercase tracking-wider font-mono"
                                    dominantBaseline="middle"
                                >
                                    {t.role}
                                </text>
                            </g>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default MapOfficersOverlay;
