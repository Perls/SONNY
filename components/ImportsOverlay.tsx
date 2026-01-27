
import React from 'react';

interface ImportsOverlayProps {
    viewBox?: string;
}

const ImportsOverlay: React.FC<ImportsOverlayProps> = ({ viewBox = "0 0 1500 1000" }) => {
    const lanes = [
        // Red Hook (2, 7) - Center approx 250, 750
        { id: 'lane-bk', path: 'M 250 1200 L 250 750', delay: '0s' },
        // Hunters Point (12, 8) - Center approx 1250, 850
        { id: 'lane-qn', path: 'M 1250 1200 L 1250 850', delay: '5s' },
        // Port Morris (13, 4) - Center approx 1350, 450 (Coming from North/Top)
        { id: 'lane-bx', path: 'M 1350 -200 L 1350 450', delay: '10s' },
    ];

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-30 animate-fade-in">
            {/* Title Overlay */}
            <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur text-white px-4 py-2 rounded-full border border-blue-500/50 flex items-center gap-2 shadow-xl">
                <span className="text-xl">🚢</span>
                <span className="text-xs font-black uppercase tracking-widest text-blue-200">Live Import Traffic</span>
            </div>

            <svg className="absolute inset-0 w-full h-full" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
                <defs>
                    <g id="cargo-ship">
                        {/* Hull */}
                        <path d="M -15 0 L 15 0 L 12 8 L -12 8 Z" fill="#334155" stroke="#1e293b" strokeWidth="1" />
                        {/* Cabin */}
                        <rect x="-8" y="-6" width="10" height="6" fill="#cbd5e1" />
                        <rect x="-6" y="-4" width="2" height="2" fill="#0ea5e9" />
                        <rect x="-2" y="-4" width="2" height="2" fill="#0ea5e9" />
                        {/* Containers */}
                        <rect x="4" y="-4" width="4" height="4" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.5" />
                        <rect x="9" y="-4" width="4" height="4" fill="#eab308" stroke="#713f12" strokeWidth="0.5" />
                        <rect x="4" y="-8" width="4" height="4" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="0.5" />
                    </g>
                    
                    <filter id="glow-lane">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                {lanes.map(lane => (
                    <g key={lane.id}>
                        {/* Lane Marker */}
                        <path 
                            d={lane.path} 
                            stroke="#3b82f6" 
                            strokeWidth="2" 
                            strokeDasharray="10 10" 
                            opacity="0.3" 
                            fill="none"
                        />
                        
                        {/* Moving Dash Effect */}
                        <path 
                            d={lane.path} 
                            stroke="#60a5fa" 
                            strokeWidth="2" 
                            strokeDasharray="10 20" 
                            opacity="0.6" 
                            fill="none"
                            filter="url(#glow-lane)"
                        >
                            <animate 
                                attributeName="stroke-dashoffset" 
                                from="30" 
                                to="0" 
                                dur="1s" 
                                repeatCount="indefinite" 
                            />
                        </path>

                        {/* Ship Animation */}
                        <g>
                            <use href="#cargo-ship" />
                            <animateMotion 
                                dur="20s" 
                                repeatCount="indefinite" 
                                path={lane.path} 
                                rotate="auto"
                                begin={lane.delay}
                            />
                        </g>
                    </g>
                ))}
            </svg>
        </div>
    );
};

export default ImportsOverlay;
