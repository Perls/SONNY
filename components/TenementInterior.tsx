
import React, { useState, useMemo, useEffect } from 'react';
import { useGameEngine } from '../contexts/GameEngineContext';
import { Holding } from '../types';
import { generateAddress } from '../utils/mapUtils';

interface TenementInteriorProps {
    building: any;
    onClose: () => void;
}

const VIOLATIONS = [
    "NO COOKING METH ON FIRE ESCAPE",
    "UNAUTHORIZED LIVESTOCK WILL BE EATEN",
    "DO NOT FEED THE RATS (THEY ARE BIG ENOUGH)",
    "RENT IS DUE YESTERDAY",
    "ELEVATOR OUT OF ORDER (FOREVER)",
    "NO LOUD MUSIC AFTER 3 AM (EXCEPT TECHNO)",
    "REPORT LEAKS TO NO ONE (WE DON'T CARE)",
    "KEEP HALLWAYS CLEAR OF BODIES",
    "WATER IS OFF TUESDAYS AND THURSDAYS",
    "MAIL THEFT IS A FELONY (AND HILARIOUS)"
];

// Helper for deterministic randomness
const hashCode = (str: string) => {
    if (!str) return 0;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
};

const TenementInterior: React.FC<TenementInteriorProps> = ({ building, onClose }) => {
    const { gameState, handlePurchaseHolding } = useGameEngine();
    const [cockroachRun, setCockroachRun] = useState<number | null>(null);

    const playerLeader = gameState?.crew.find(c => c.isLeader) || gameState?.crew[0];
    const playerName = playerLeader?.name || "Player";

    // Cockroach Loop (Every 30s)
    useEffect(() => {
        const interval = setInterval(() => {
            setCockroachRun(Date.now());
            setTimeout(() => setCockroachRun(null), 5000); // Animation duration is approx 4-5s
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    // Generate a consistent seed string if ID is missing (e.g. unowned building)
    const buildingSeed = useMemo(() => {
        return building.id || `${building.x}-${building.y}-${building.slotIndex}-${building.name}`;
    }, [building]);

    // 1. Determine Building Size & Layout based on ID Hash
    const { layout, sizeLabel, unitCount } = useMemo(() => {
        const hash = hashCode(buildingSeed);
        const roll = hash % 100;
        
        if (roll < 50) {
            // Small: 3 Floors x 2 Units = 6
            return { 
                layout: { floors: 3, unitsPerFloor: 2, widthClass: 'w-48', scale: 1 }, 
                sizeLabel: 'Small Tenement',
                unitCount: 6
            };
        } else if (roll < 85) {
            // Medium: 5 Floors x 4 Units = 20
            return { 
                layout: { floors: 5, unitsPerFloor: 4, widthClass: 'w-32', scale: 0.65 }, 
                sizeLabel: 'Medium Tenement',
                unitCount: 20
            };
        } else {
            // Large: 10 Floors x 6 Units = 60
            return { 
                layout: { floors: 10, unitsPerFloor: 6, widthClass: 'w-24', scale: 0.45 }, 
                sizeLabel: 'Mega-Block Housing',
                unitCount: 60
            };
        }
    }, [buildingSeed]);

    // 2. Generate Units & Pre-Occupancy
    const units = useMemo(() => {
        const generated = [];
        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        const hash = hashCode(buildingSeed);
        const roll = hash % 100;

        for (let f = 1; f <= layout.floors; f++) {
            for (let u = 0; u < layout.unitsPerFloor; u++) {
                const id = `${f}${letters[u]}`;
                // Deterministic occupancy (approx 50%) based on unit ID + building ID
                const isOccupied = (hash + f + u) % 2 === 0;
                
                // Deterministic Crack check (~50%)
                const hasCrack = (hash + f * u * 7) % 10 < 5;

                // Pricing Logic
                let cost = 0;
                let income = 0;
                
                // Small variance for flavor
                const variance = (hash + f + u) % 50000;

                if (roll < 50) {
                    // Small Tenement: ~500k base
                    cost = 450000 + (f * 10000) + variance;
                    income = Math.floor(cost * 0.001); // ~0.1% daily (approx N$500/day)
                } else if (roll < 85) {
                    // Medium Tenement: ~1.5m base
                    cost = 1400000 + (f * 25000) + (variance * 2);
                    income = Math.floor(cost * 0.0008); // ~0.08% daily (approx N$1200/day)
                } else {
                    // Large Mega-Block: 5m - 8m range
                    const largeVariance = (hash + f * u * 13) % 3000000; // 0 to 3m variance
                    cost = 5000000 + largeVariance + (f * 50000);
                    income = Math.floor(cost * 0.0005); // ~0.05% daily (approx N$2500-4000/day)
                }

                generated.push({ id, floor: f, cost, income, isOccupied, hasCrack });
            }
        }
        return generated;
    }, [buildingSeed, layout]);

    // 3. Select Random Violations
    const notices = useMemo(() => {
        const hash = hashCode(buildingSeed);
        return [
            VIOLATIONS[hash % VIOLATIONS.length],
            VIOLATIONS[(hash + 1) % VIOLATIONS.length],
            VIOLATIONS[(hash + 2) % VIOLATIONS.length]
        ];
    }, [buildingSeed]);

    // 4. Generate Random Stoops (1 or 2, Symmetrical)
    const stoops = useMemo(() => {
        const hash = hashCode(buildingSeed);
        const count = 1 + (hash % 2); // 1 or 2
        const result = [];
        
        if (count === 1) {
            result.push(50); // Center
        } else {
            result.push(20);
            result.push(80);
        }
        return result;
    }, [buildingSeed]);
    
    // Address String
    const address = generateAddress(building.x, building.y, building.slotIndex);

    if (!gameState) return null;

    // Find all owned units in this building
    const ownedUnits = gameState.holdings
        .filter(h => h.x === building.x && h.y === building.y && h.slotIndex === building.slotIndex && h.unitId)
        .map(h => h.unitId);

    const handleBuyUnit = (unit: typeof units[0]) => {
        if (gameState.money < unit.cost) {
            alert(`Insufficient funds (N$ ${unit.cost.toLocaleString()})`);
            return;
        }

        const newHolding: Holding = {
            id: Math.random().toString(), 
            x: building.x,
            y: building.y,
            slotIndex: building.slotIndex,
            name: `${building.name} - Apt ${unit.id}`,
            type: 'residential',
            level: 1,
            maxLevel: 1,
            income: unit.income,
            cost: unit.cost,
            icon: '🚪',
            ownerFaction: 'player',
            unitId: unit.id,
            description: `Apartment ${unit.id}`
        };

        handlePurchaseHolding(newHolding);
    };

    return (
        <div className="absolute inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center font-waze animate-fade-in p-6">
            <style>{`
                @keyframes flicker {
                    0% { opacity: 1; }
                    5% { opacity: 0.1; }
                    10% { opacity: 1; }
                    15% { opacity: 1; }
                    20% { opacity: 0.1; }
                    50% { opacity: 1; }
                    100% { opacity: 1; }
                }
                .animate-flicker { animation: flicker 4s infinite; }
                .animate-flicker-fast { animation: flicker 0.5s infinite; }
                
                @keyframes run-across {
                    0% { left: -50px; opacity: 1; }
                    100% { left: 100%; opacity: 1; }
                }
                .animate-run-across { animation: run-across 3s linear forwards; }

                @keyframes plateSwing {
                    0% { transform: translateX(-50%) rotate(0deg); }
                    25% { transform: translateX(-50%) rotate(2deg); }
                    75% { transform: translateX(-50%) rotate(-2deg); }
                    100% { transform: translateX(-50%) rotate(0deg); }
                }
                .animate-plate-swing {
                    transform-origin: top center;
                    animation: plateSwing 4s ease-in-out infinite;
                }

                @keyframes doorSlam {
                    0% { transform: perspective(200px) rotateY(0deg); }
                    20% { transform: perspective(200px) rotateY(-40deg); }
                    40% { transform: perspective(200px) rotateY(-10deg); }
                    100% { transform: perspective(200px) rotateY(0deg); }
                }
                .group:hover .animate-door-slam {
                    animation: doorSlam 0.5s ease-in;
                }
                .door-open {
                    transform: perspective(200px) rotateY(-35deg);
                }
            `}</style>

            <div className="bg-[#1a1a1a] w-full max-w-6xl rounded-xl shadow-2xl border-4 border-slate-700 overflow-hidden flex flex-col relative h-[800px]">
                
                {/* Header */}
                <div className="bg-[#0f0f0f] border-b-4 border-slate-800 p-6 flex justify-between items-center relative z-20 shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center text-4xl shadow-inner relative overflow-hidden">
                            🏚️
                            <div className="absolute inset-0 bg-yellow-500/10 animate-flicker"></div>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-3">
                                <h2 className="text-3xl font-black text-slate-200 uppercase font-news tracking-tighter leading-none">{building.name}</h2>
                                <span className="text-amber-600 font-mono font-bold text-xs uppercase bg-black/50 px-2 py-1 rounded border border-amber-900/50">
                                    BLK {building.x}-{building.y}
                                </span>
                            </div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                                {sizeLabel} • {unitCount} Units
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Available Funds</div>
                        <div className="text-2xl font-mono font-black text-emerald-500">N$ {gameState.money.toLocaleString()}</div>
                    </div>

                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors text-xl font-bold"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex flex-grow overflow-hidden relative">
                    
                    {/* LEFT: Building Grid */}
                    <div className="flex-grow bg-[#222] relative overflow-y-auto custom-scrollbar px-12 pt-12 pb-0 flex justify-center items-end">
                        {/* Background Textures */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/concrete-wall.png")' }}></div>
                        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05)_0%,_#000_80%)]"></div>

                        {/* Fire Escape Structure Container with Dynamic Zoom */}
                        <div 
                            className="relative border-x-8 border-slate-800 bg-[#1a1a1a] p-4 pt-12 pb-8 shadow-2xl rounded-sm inline-block"
                            style={{ transform: `scale(${layout.scale})`, transformOrigin: 'bottom center' }}
                        >
                            
                            {/* Roof */}
                            <div className="absolute top-0 left-[-30px] right-[-30px] h-8 bg-slate-900 border-b-4 border-black z-10 flex items-center justify-center">
                                <div className="text-[10px] text-slate-600 font-black uppercase tracking-[0.5em]">{address}</div>
                            </div>

                            <div className="flex flex-col-reverse gap-8 relative z-10">
                                {/* Floors Rendered Bottom Up */}
                                {Array.from({ length: layout.floors }).map((_, fIdx) => {
                                    const floorNum = fIdx + 1;
                                    const floorUnits = units.filter(u => u.floor === floorNum);

                                    return (
                                        <div key={floorNum} className="relative">
                                            {/* Floor Label */}
                                            <div className="absolute -left-12 top-1/2 -translate-y-1/2 text-slate-600 font-mono font-bold text-xs opacity-50">
                                                FL{floorNum}
                                            </div>

                                            <div className="flex gap-4 border-b-4 border-slate-800 pb-1 px-4 bg-[#222]">
                                                {floorUnits.map(unit => {
                                                    const isOwned = ownedUnits?.includes(unit.id);
                                                    const isOccupied = unit.isOccupied && !isOwned;

                                                    return (
                                                        <div key={unit.id} className="relative group">
                                                            
                                                            {/* Apartment Box - Slightly Shorter to flatten large buildings */}
                                                            <div className={`
                                                                ${layout.widthClass} h-28 border-4 transition-all relative flex flex-col items-center justify-end rounded-xl overflow-visible p-2
                                                                ${isOwned 
                                                                    ? 'bg-emerald-900/20 border-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                                                                    : isOccupied
                                                                        ? 'bg-red-900/10 border-slate-700 opacity-70'
                                                                        : 'bg-black/40 border-slate-600 hover:border-amber-500 hover:bg-slate-800'
                                                                }
                                                            `}>
                                                                {/* Cracked Wall Overlay */}
                                                                {unit.hasCrack && (
                                                                    <div className="absolute inset-0 pointer-events-none opacity-30">
                                                                        <svg viewBox="0 0 100 100" width="100%" height="100%">
                                                                            <path d="M10 10 L30 30 M25 25 L40 20 M10 80 L30 60 M70 10 L60 30" stroke="#000" strokeWidth="2" fill="none" />
                                                                        </svg>
                                                                    </div>
                                                                )}

                                                                {/* Nameplate - Only if Owned - BIGGER */}
                                                                {isOwned && (
                                                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 animate-plate-swing">
                                                                        <div className="bg-amber-100 border-2 border-amber-300 shadow-xl px-4 py-1.5 rounded flex flex-col items-center min-w-[80px]">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mb-1 border border-slate-500"></div>
                                                                            <span className="text-[10px] font-black uppercase text-slate-900 whitespace-nowrap leading-none tracking-tight">
                                                                                {playerName}
                                                                            </span>
                                                                        </div>
                                                                        {/* Strings */}
                                                                        <div className="absolute -top-2 left-2 w-0.5 h-3 bg-slate-400"></div>
                                                                        <div className="absolute -top-2 right-2 w-0.5 h-3 bg-slate-400"></div>
                                                                    </div>
                                                                )}

                                                                {/* The Door (Replaces Window for Vacant, kept for consistency) */}
                                                                <div className="relative w-12 h-20 perspective-container mb-2">
                                                                    {/* Door Frame (Background) */}
                                                                    <div className="absolute inset-0 bg-black border-x-2 border-t-2 border-slate-700 flex items-center justify-center">
                                                                        {/* Interior darkness or light */}
                                                                        {isOwned ? (
                                                                            <div className="w-full h-full bg-yellow-100/10 animate-pulse"></div>
                                                                        ) : isOccupied ? (
                                                                            <div className="w-full h-full bg-red-900/10"></div>
                                                                        ) : (
                                                                             /* Reveal Price on Open */
                                                                             <div className="flex flex-col items-center justify-center h-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <span className="text-[8px] text-amber-500 font-bold">BUY</span>
                                                                                <span className="text-[6px] text-white font-mono">N${(unit.cost/1000).toFixed(0)}k</span>
                                                                             </div>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    {/* The Door Panel */}
                                                                    <div 
                                                                        onClick={() => !isOwned && !isOccupied && handleBuyUnit(unit)}
                                                                        className={`absolute inset-0 bg-[#3f2e18] border border-[#281d10] origin-left transition-transform duration-300
                                                                            ${!isOwned && !isOccupied ? 'group-hover:door-open cursor-pointer' : ''}
                                                                            ${isOccupied && Math.random() > 0.9 ? 'animate-door-slam' : ''}
                                                                        `}
                                                                    >
                                                                        {/* Panels */}
                                                                        <div className="absolute top-2 left-2 right-2 h-6 border border-[#281d10] bg-[#4a361e] opacity-50"></div>
                                                                        <div className="absolute bottom-2 left-2 right-2 h-8 border border-[#281d10] bg-[#4a361e] opacity-50"></div>
                                                                        
                                                                        {/* Knob */}
                                                                        <div className="absolute top-1/2 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-600 shadow-sm"></div>
                                                                        
                                                                        {/* Window Light leakage if occupied */}
                                                                        {isOccupied && (
                                                                            <div className="absolute bottom-0 w-full h-0.5 bg-yellow-500/30"></div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Label */}
                                                                <div className={`absolute top-2 left-2 text-[10px] font-mono font-bold ${isOwned ? 'text-emerald-500' : 'text-slate-500'}`}>{unit.id}</div>

                                                                {/* Status / Action Footer */}
                                                                <div className="h-4 flex items-center justify-center w-full">
                                                                    {isOwned ? (
                                                                        <div className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Home</div>
                                                                    ) : isOccupied ? (
                                                                        <div className="text-[8px] font-bold text-red-800 uppercase tracking-widest">Taken</div>
                                                                    ) : (
                                                                        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-amber-500 transition-colors">Vacant</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            
                                            {/* Floor Fire Escape Balcony */}
                                            <div className="absolute bottom-[-10px] left-0 right-0 h-3 border-b-2 border-slate-700 flex justify-between px-2 pointer-events-none">
                                                {[...Array(layout.unitsPerFloor * 2)].map((_, i) => <div key={i} className="w-0.5 h-full bg-slate-700"></div>)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* STOOPS / STAIRS (Anchored Bottom) */}
                            {stoops.map((pos, i) => (
                                <div 
                                    key={`stoop-${i}`} 
                                    className="absolute bottom-0 z-0 flex flex-col items-center"
                                    style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
                                >
                                    {/* The Door on top of Stoop */}
                                    <div className="w-10 h-16 bg-[#2c1e12] border-2 border-[#1a110a] mb-[-2px] relative flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full absolute right-1.5 top-1/2"></div>
                                        {/* Address Plate */}
                                        <div className="absolute top-1 w-6 h-3 bg-slate-800 text-[6px] text-white flex items-center justify-center font-mono">
                                            {i === 0 ? '1A' : '1B'}
                                        </div>
                                    </div>

                                    {/* Stairs */}
                                    <div className="w-12 h-2 bg-slate-700 border-t border-slate-600"></div>
                                    <div className="w-16 h-2 bg-slate-700 border-t border-slate-600"></div>
                                    <div className="w-20 h-2 bg-slate-700 border-t border-slate-600"></div>
                                    <div className="w-24 h-2 bg-slate-700 border-t border-slate-600"></div>
                                </div>
                            ))}

                            {/* Fire Escape Ladder overlay centered */}
                            <div className="absolute top-0 bottom-16 left-1/2 -translate-x-1/2 w-10 border-x-2 border-slate-800/50 flex flex-col items-center py-2 z-0 pointer-events-none">
                                {[...Array(40)].map((_, i) => <div key={i} className="w-full h-0.5 bg-slate-800/50 my-4"></div>)}
                            </div>
                        </div>
                    </div>

                    {/* COCKROACH OVERLAY - Absolute to container to prevent layout shift */}
                    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
                        {cockroachRun && (
                            <div className="absolute bottom-4 left-0 animate-run-across opacity-80">
                                <svg width="24" height="24" viewBox="0 0 20 20" fill="#3e2723" transform="scale(-1, 1)">
                                    <ellipse cx="10" cy="10" rx="4" ry="8" transform="rotate(90 10 10)" />
                                    <path d="M2 10 L-2 6 M2 10 L-2 14" stroke="#3e2723" strokeWidth="1" />
                                    <path d="M6 6 L4 2 M6 14 L4 18 M10 6 L10 2 M10 14 L10 18 M14 6 L16 2 M14 14 L16 18" stroke="#3e2723" strokeWidth="1" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Violations Board & Info */}
                    <div className="w-72 bg-[#1f1f1f] border-l-4 border-black p-6 flex flex-col gap-6 relative shadow-[inset_10px_0_20px_rgba(0,0,0,0.5)] z-20">
                        
                        {/* Violations Board */}
                        <div className="bg-[#d4b483] p-2 rounded shadow-lg transform rotate-1 border-4 border-[#8d6e63] relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-800 shadow-sm border border-red-900"></div>
                            <div className="text-center border-b-2 border-[#8d6e63]/50 pb-2 mb-2">
                                <h3 className="font-black text-[#5d4037] uppercase text-xs tracking-widest leading-tight">Committee on Safety</h3>
                                <div className="text-[8px] font-bold text-[#5d4037] uppercase">Notice to Tenants</div>
                            </div>
                            <div className="space-y-2 font-mono text-[9px] text-[#3e2723] leading-tight">
                                {notices.map((note, i) => (
                                    <div key={i} className="bg-[#f5f5f5]/50 p-1.5 shadow-sm transform rotate-[-1deg] border border-[#8d6e63]/20">
                                        • {note}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 text-[8px] text-center font-bold text-red-900 uppercase transform -rotate-2 border-2 border-red-900 inline-block px-1">
                                VIOLATORS WILL BE EVICTED
                            </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="mt-auto bg-black/40 p-4 rounded-xl border border-slate-700">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-700 pb-1">Building Stats</div>
                            <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                                <span>Vacancy</span>
                                <span>{unitCount - ownedUnits?.length - Math.floor(unitCount/2)} / {unitCount}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-slate-300">
                                <span>Condition</span>
                                <span className="text-red-500">Poor</span>
                            </div>
                        </div>

                        <div className="text-[9px] text-slate-600 font-mono text-center">
                            Slumlord Properties LLC<br/>
                            "We ignore complaints so you don't have to."
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TenementInterior;
