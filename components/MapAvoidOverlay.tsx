
import React, { useMemo } from 'react';

interface MapAvoidOverlayProps {
    avoidedAreas: { x: number, y: number }[];
    onClearAll: () => void;
    viewBox?: string;
}

// Helper to convert grid points to smooth SVG path
const getMergedAreaPath = (allBlocks: { x: number, y: number }[], gridSize = 100, cornerRadius = 15): string => {
    if (allBlocks.length === 0) return "";

    // 1. Cluster blocks into 4-connected groups to prevent diagonal overlap bugs
    // (Diagonal touches should be treated as separate shapes to avoid pinched vertices)
    const blockSet = new Set(allBlocks.map(b => `${b.x},${b.y}`));
    const visited = new Set<string>();
    const clusters: { x: number, y: number }[][] = [];

    allBlocks.forEach(startBlock => {
        const key = `${startBlock.x},${startBlock.y}`;
        if (visited.has(key)) return;

        const cluster: { x: number, y: number }[] = [];
        // BFS to find all connected neighbors
        const queue = [startBlock];
        visited.add(key);
        cluster.push(startBlock);

        let head = 0;
        while (head < cluster.length) {
            const curr = cluster[head++];
            const neighbors = [
                { x: curr.x, y: curr.y - 1 },
                { x: curr.x, y: curr.y + 1 },
                { x: curr.x - 1, y: curr.y },
                { x: curr.x + 1, y: curr.y }
            ];
            for (const n of neighbors) {
                const nKey = `${n.x},${n.y}`;
                if (blockSet.has(nKey) && !visited.has(nKey)) {
                    visited.add(nKey);
                    cluster.push(n);
                }
            }
        }
        clusters.push(cluster);
    });

    const finalPaths: string[] = [];

    // 2. Trace edges for each cluster separately
    clusters.forEach(blocks => {
        const clusterBlockSet = new Set(blocks.map(b => `${b.x},${b.y}`));
        const edges: Record<string, string> = {};

        blocks.forEach(b => {
            // Logic: If neighbor is NOT in this cluster, we have an edge.
            // Top Edge: (x, y) -> (x+1, y)
            if (!clusterBlockSet.has(`${b.x},${b.y - 1}`)) edges[`${b.x},${b.y}`] = `${b.x + 1},${b.y}`;

            // Right Edge: (x+1, y) -> (x+1, y+1)
            if (!clusterBlockSet.has(`${b.x + 1},${b.y}`)) edges[`${b.x + 1},${b.y}`] = `${b.x + 1},${b.y + 1}`;

            // Bottom Edge: (x+1, y+1) -> (x, y+1)
            if (!clusterBlockSet.has(`${b.x},${b.y + 1}`)) edges[`${b.x + 1},${b.y + 1}`] = `${b.x},${b.y + 1}`;

            // Left Edge: (x, y+1) -> (x, y)
            if (!clusterBlockSet.has(`${b.x - 1},${b.y}`)) edges[`${b.x},${b.y + 1}`] = `${b.x},${b.y}`;
        });

        // 3. Trace Loops from Edges
        const visitedStarts = new Set<string>();
        Object.keys(edges).forEach(startKey => {
            if (visitedStarts.has(startKey)) return;

            let currKey = startKey;
            const points: { x: number, y: number }[] = [];
            let safety = 0;

            // Follow the directed edges until we loop back
            while (safety++ < 5000) {
                visitedStarts.add(currKey);
                const [cx, cy] = currKey.split(',').map(Number);
                points.push({ x: cx * gridSize, y: cy * gridSize });

                const nextKey = edges[currKey];
                if (!nextKey) break; // Should not happen in closed loops
                if (nextKey === startKey) break; // Loop closed
                currKey = nextKey;
            }

            // 4. Construct Smooth Path with Rounded Corners
            if (points.length < 3) return;

            let d = "";
            const len = points.length;

            for (let i = 0; i < len; i++) {
                const curr = points[i];
                const prev = points[(i - 1 + len) % len];
                const next = points[(i + 1) % len];

                const vIn = { x: curr.x - prev.x, y: curr.y - prev.y };
                const vOut = { x: next.x - curr.x, y: next.y - curr.y };
                const distIn = Math.sqrt(vIn.x * vIn.x + vIn.y * vIn.y);
                const distOut = Math.sqrt(vOut.x * vOut.x + vOut.y * vOut.y);

                const uIn = { x: vIn.x / distIn, y: vIn.y / distIn };
                const uOut = { x: vOut.x / distOut, y: vOut.y / distOut };

                const r = Math.min(cornerRadius, distIn / 2, distOut / 2);

                const startX = curr.x - uIn.x * r;
                const startY = curr.y - uIn.y * r;
                const endX = curr.x + uOut.x * r;
                const endY = curr.y + uOut.y * r;

                if (i === 0) d += `M ${startX} ${startY}`;
                else d += ` L ${startX} ${startY}`;

                d += ` Q ${curr.x} ${curr.y} ${endX} ${endY}`;
            }
            d += " Z";
            finalPaths.push(d);
        });
    });

    return finalPaths.join(' ');
};

const MapAvoidOverlay: React.FC<MapAvoidOverlayProps> = ({ avoidedAreas, onClearAll, viewBox = "0 0 1500 1000" }) => {

    const pathData = useMemo(() => {
        return getMergedAreaPath(avoidedAreas);
    }, [avoidedAreas]);

    return (
        <>
            {/* Visual Layer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-[40]">
                <svg className="absolute inset-0 w-full h-full" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
                    <defs>
                        <pattern id="avoidHatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                            <line x1="0" y1="0" x2="0" y2="10" stroke="#ef4444" strokeWidth="2" opacity="0.6" />
                        </pattern>
                        <filter id="hazardGlow">
                            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#dc2626" />
                        </filter>
                    </defs>

                    {/* Unified Blob */}
                    <g filter="url(#hazardGlow)">
                        {/* Fill */}
                        <path
                            d={pathData}
                            fill="url(#avoidHatch)"
                            opacity="0.8"
                        />
                        {/* Stroke */}
                        <path
                            d={pathData}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="4"
                            strokeDasharray="10 5"
                        />
                    </g>

                    {/* Icons still rendered per block for clarity */}
                    {avoidedAreas.map((area, i) => (
                        <g key={`avoid-icon-${i}`}>
                            <text
                                x={area.x * 100 + 50}
                                y={area.y * 100 + 50}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize="30"
                                opacity="0.8"
                                className="drop-shadow-md"
                            >
                                ⛔
                            </text>
                        </g>
                    ))}
                </svg>
            </div>

            {/* Child Menu / Control Panel */}
            <div className="absolute bottom-24 left-24 z-50 animate-slide-up origin-bottom-left">
                <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] p-4 flex flex-col gap-3 min-w-[200px]">
                    <div className="flex items-center gap-3 border-b border-slate-700 pb-3">
                        <div className="w-8 h-8 rounded bg-red-900/50 flex items-center justify-center text-lg border border-red-800 text-red-500">
                            🚧
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tactical Override</div>
                            <div className="text-xs font-bold text-white uppercase">Restricted Zones</div>
                        </div>
                    </div>

                    <div className="text-[10px] text-slate-400 leading-relaxed font-mono bg-black/30 p-2 rounded">
                        &gt; CLICK MAP TO TOGGLE ZONES <br />
                        &gt; UNITS WILL AVOID THESE BLOCKS
                    </div>

                    <button
                        onClick={onClearAll}
                        disabled={avoidedAreas.length === 0}
                        className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[9px] border transition-all
                            ${avoidedAreas.length > 0
                                ? 'bg-red-600 text-white border-red-500 hover:bg-red-500 shadow-md'
                                : 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
                            }
                        `}
                    >
                        Clear All Zones
                    </button>
                </div>
            </div>
        </>
    );
};

export default MapAvoidOverlay;
