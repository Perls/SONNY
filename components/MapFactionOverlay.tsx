
import React, { useMemo } from 'react';
import { isWater } from '../utils/waterUtils';

interface MapFactionOverlayProps {
    viewBox?: string;
}

const FACTIONS = [
    { id: 'mafia', color: '#ef4444', origin: { x: 11, y: 8 }, label: 'The Commission', icon: '🦁' }, // Red
    { id: 'cartel', color: '#ffb300', origin: { x: 2, y: 7 }, label: 'Cartel', icon: '🦂' }, // #ffb300
    { id: 'gangs', color: '#9333ea', origin: { x: 4, y: 3 }, label: 'Street Gangs', icon: '👊' } // Purple
];

// --- GEOMETRY HELPERS ---
type Point = { x: number, y: number };

// Converts a set of grid blocks into a smooth SVG Path string
const getSmoothedContourPath = (blocks: {x: number, y: number}[], gridSize = 100, cornerRadius = 25): string => {
    // 1. Identify Edges
    const blockSet = new Set(blocks.map(b => `${b.x},${b.y}`));
    const edges: Record<string, string> = {}; // startKey "x,y" -> endKey "x,y"

    blocks.forEach(b => {
        // Top Edge: (x, y) -> (x+1, y) [If block above is empty]
        if (!blockSet.has(`${b.x},${b.y-1}`)) edges[`${b.x},${b.y}`] = `${b.x+1},${b.y}`;
        
        // Right Edge: (x+1, y) -> (x+1, y+1) [If block right is empty]
        if (!blockSet.has(`${b.x+1},${b.y}`)) edges[`${b.x+1},${b.y}`] = `${b.x+1},${b.y+1}`;
        
        // Bottom Edge: (x+1, y+1) -> (x, y+1) [If block below is empty]
        if (!blockSet.has(`${b.x},${b.y+1}`)) edges[`${b.x+1},${b.y+1}`] = `${b.x},${b.y+1}`;
        
        // Left Edge: (x, y+1) -> (x, y) [If block left is empty]
        if (!blockSet.has(`${b.x-1},${b.y}`)) edges[`${b.x},${b.y+1}`] = `${b.x},${b.y}`;
    });

    // 2. Trace Loops (Contiguous Shapes)
    const paths: string[] = [];
    const visitedStarts = new Set<string>();

    Object.keys(edges).forEach(startKey => {
        if (visitedStarts.has(startKey)) return;

        let currKey = startKey;
        const points: Point[] = [];
        let safety = 0;

        // Walk the perimeter
        while (safety++ < 1000) {
            visitedStarts.add(currKey);
            const [cx, cy] = currKey.split(',').map(Number);
            points.push({ x: cx * gridSize, y: cy * gridSize });

            const nextKey = edges[currKey];
            
            // Loop Closed?
            if (nextKey === startKey) break;
            
            // Broken path? (Shouldn't happen in valid grid)
            if (!nextKey) break; 
            
            currKey = nextKey;
        }

        // 3. Smooth Vertices (Squircle Logic)
        if (points.length < 3) return;

        let d = "";
        const len = points.length;
        
        for (let i = 0; i < len; i++) {
            const curr = points[i];
            const prev = points[(i - 1 + len) % len];
            const next = points[(i + 1) % len];

            // Calculate vectors to determine edge lengths
            const vIn = { x: curr.x - prev.x, y: curr.y - prev.y };
            const vOut = { x: next.x - curr.x, y: next.y - curr.y };
            const distIn = Math.sqrt(vIn.x*vIn.x + vIn.y*vIn.y);
            const distOut = Math.sqrt(vOut.x*vOut.x + vOut.y*vOut.y);
            
            // Normalize direction vectors
            const uIn = { x: vIn.x/distIn, y: vIn.y/distIn };
            const uOut = { x: vOut.x/distOut, y: vOut.y/distOut };

            // Clamp radius so curves don't overlap (max 50% of edge length)
            const r = Math.min(cornerRadius, distIn/2, distOut/2);

            // Calculate curve start/end points
            // Start: Retract from corner back along incoming edge
            const startX = curr.x - uIn.x * r;
            const startY = curr.y - uIn.y * r;

            // End: Advance from corner along outgoing edge
            const endX = curr.x + uOut.x * r;
            const endY = curr.y + uOut.y * r;

            if (i === 0) {
                d += `M ${startX} ${startY}`;
            } else {
                d += ` L ${startX} ${startY}`;
            }
            
            // Quadratic Bezier from Start -> End, using Corner as Control Point
            d += ` Q ${curr.x} ${curr.y} ${endX} ${endY}`;
        }
        
        d += " Z"; // Close Path
        paths.push(d);
    });

    return paths.join(' ');
};

const MapFactionOverlay: React.FC<MapFactionOverlayProps> = ({ viewBox = "0 0 1500 1000" }) => {
    
    // Deterministic Territory Generation
    const territories = useMemo(() => {
        const gridW = 15;
        const gridH = 10;
        const results: { faction: typeof FACTIONS[0], blocks: {x: number, y: number}[] }[] = [];
        const globalVisited = new Set<string>();

        // Seeded random for consistency
        let seed = 5678; 
        const random = () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };

        FACTIONS.forEach(faction => {
            const blocks: {x: number, y: number}[] = [];
            const queue = [faction.origin];
            
            // Mark origin if valid
            if (!isWater(faction.origin.x, faction.origin.y)) {
                const originKey = `${faction.origin.x},${faction.origin.y}`;
                globalVisited.add(originKey);
                blocks.push(faction.origin);
            }

            // Size: Mafia gets a big blob, others slightly smaller
            const size = faction.id === 'mafia' ? 24 : 14 + Math.floor(random() * 6);

            for(let i=0; i<size; i++) {
                if (queue.length === 0) break;
                
                // Pick random from queue to expand from (organic blob growth)
                const idx = Math.floor(random() * queue.length);
                const curr = queue[idx];

                // Neighbors
                const neighbors = [
                    { x: curr.x + 1, y: curr.y },
                    { x: curr.x - 1, y: curr.y },
                    { x: curr.x, y: curr.y + 1 },
                    { x: curr.x, y: curr.y - 1 },
                ].filter(n => n.x >= 0 && n.x < gridW && n.y >= 0 && n.y < gridH);

                // Filter valid unvisited AND NOT WATER
                const available = neighbors.filter(n => {
                    const k = `${n.x},${n.y}`;
                    return !globalVisited.has(k) && !isWater(n.x, n.y);
                });
                
                if (available.length > 0) {
                    const next = available[Math.floor(random() * available.length)];
                    const nextKey = `${next.x},${next.y}`;
                    globalVisited.add(nextKey);
                    blocks.push(next);
                    queue.push(next);
                } else {
                    // Dead end, remove from queue
                    queue.splice(idx, 1);
                    i--; 
                }
            }
            results.push({ faction, blocks });
        });
        
        return results;
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[22] animate-fade-in">
            <svg className="absolute inset-0 w-full h-full" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
                <defs>
                    <pattern id="diagStripes" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <rect width="5" height="10" fill="white" fillOpacity="0.2" />
                    </pattern>
                    <filter id="blobGlow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <style>
                        {`
                            @keyframes march {
                                to { stroke-dashoffset: -40; }
                            }
                            .animate-march {
                                animation: march 15s linear infinite;
                            }
                        `}
                    </style>
                </defs>

                {territories.map((t) => {
                    // Calculate Center of Mass for Label
                    const avgX = t.blocks.reduce((sum, b) => sum + b.x, 0) / t.blocks.length;
                    const avgY = t.blocks.reduce((sum, b) => sum + b.y, 0) / t.blocks.length;
                    const centerX = avgX * 100 + 50;
                    const centerY = avgY * 100 + 50;

                    // Generate the one unified path
                    const pathData = getSmoothedContourPath(t.blocks);

                    return (
                        <g key={t.faction.id}>
                            
                            {/* 1. Base Fill (Translucent) */}
                            <path 
                                d={pathData} 
                                fill={t.faction.color} 
                                fillOpacity="0.15" 
                                stroke="none" 
                            />

                            {/* 2. Texture Overlay */}
                            <path 
                                d={pathData} 
                                fill="url(#diagStripes)" 
                                stroke="none" 
                            />

                            {/* 3. Fat Dashed Stroke (Animated) */}
                            <path 
                                d={pathData} 
                                fill="none" 
                                stroke={t.faction.color} 
                                strokeWidth="5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                strokeDasharray="15 25"
                                className="animate-march"
                                filter="url(#blobGlow)"
                                opacity="0.8"
                            />

                            {/* 4. Thin Inner Line (Definition) */}
                            <path 
                                d={pathData} 
                                fill="none" 
                                stroke="white" 
                                strokeWidth="1" 
                                strokeOpacity="0.5"
                            />
                            
                            {/* 5. Modern Glassmorphism Nameplate */}
                            <foreignObject x={centerX - 80} y={centerY - 25} width={160} height={50} style={{ overflow: 'visible' }}>
                                <div className="flex items-center justify-center w-full h-full p-1">
                                    <div className="bg-white/90 backdrop-blur-md rounded-full shadow-lg border-2 border-white flex items-center gap-3 px-4 py-2 transform hover:scale-110 transition-transform duration-300 cursor-default group" style={{ borderColor: t.faction.color }}>
                                        
                                        {/* Icon Bubble */}
                                        <div 
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-lg text-white shadow-sm flex-shrink-0"
                                            style={{ backgroundColor: t.faction.color }}
                                        >
                                            {t.faction.icon}
                                        </div>
                                        
                                        {/* Text Info */}
                                        <div className="flex flex-col">
                                            <span 
                                                className="text-[10px] font-black uppercase tracking-widest leading-none mb-0.5"
                                                style={{ color: t.faction.color }} 
                                            >
                                                {t.faction.label}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <span className="text-[8px] font-bold text-slate-500 uppercase">Contested</span>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </foreignObject>

                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default MapFactionOverlay;
