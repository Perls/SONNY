
import React, { useState, useEffect } from 'react';
import { Bounty } from '../types';

interface BountiesProps {
    locationType: 'hq' | 'bar'; // 'hq' = Mafia HQ, 'bar' = Entertainment/Bar
    playerFaction: string;
    money: number;
    onPlaceBounty: (bounty: Bounty) => void;
    onClose: () => void;
}

interface Target {
    id: string;
    name: string;
    faction: string;
    role: string;
    difficulty: 'Low' | 'Medium' | 'High' | 'Suicide';
    cost: number;
    reward: string;
    seed: string;
    desc: string;
}

const FACTIONS = ['The Commission', 'The Cartels', 'The Street Gangs'];

const Bounties: React.FC<BountiesProps> = ({ locationType, playerFaction, money, onPlaceBounty, onClose }) => {
    const [targets, setTargets] = useState<Target[]>([]);
    const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);

    // --- TARGET GENERATION ---
    useEffect(() => {
        const generated: Target[] = [];
        const count = 6;

        for (let i = 0; i < count; i++) {
            // Determine Faction based on Location Rules
            let faction = '';
            
            if (locationType === 'hq') {
                // HQ: Targets MUST be from opposing factions
                const enemies = FACTIONS.filter(f => f !== playerFaction);
                faction = enemies[Math.floor(Math.random() * enemies.length)] || 'Rival Faction';
            } else {
                // Bar: Targets can be ANYONE from the 3 factions
                faction = FACTIONS[Math.floor(Math.random() * FACTIONS.length)];
            }

            // Difficulty & Cost Logic
            const diffRoll = Math.random();
            let difficulty: Target['difficulty'] = 'Low';
            let role = 'Snitch';
            let cost = 500;
            let reward = "Respect +2";

            if (diffRoll > 0.9) {
                difficulty = 'Suicide';
                role = 'Boss';
                cost = 5000;
                reward = "Respect +25, Loot";
            } else if (diffRoll > 0.6) {
                difficulty = 'High';
                role = 'Capo';
                cost = 2500;
                reward = "Respect +10";
            } else if (diffRoll > 0.3) {
                difficulty = 'Medium';
                role = 'Lieutenant';
                cost = 1200;
                reward = "Respect +5";
            }

            const firstNames = ["Vinny", "Sal", "Diego", "Marcus", "Chen", "Ivan", "Tommy", "Rico"];
            const lastNames = ["The Rat", "Two-Times", "Gomez", "King", "Wu", "Drago", "Gunz", "Serrano"];
            const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;

            generated.push({
                id: `target-${i}-${Date.now()}`,
                name,
                faction,
                role,
                difficulty,
                cost,
                reward,
                seed: name.replace(' ', ''),
                desc: locationType === 'hq' 
                    ? "Sanctioned hit. Do it quiet." 
                    : "He's making too much noise. Needs to be silenced."
            });
        }
        setTargets(generated);
    }, [locationType, playerFaction]);

    const handleConfirm = () => {
        if (!selectedTarget) return;
        if (money < selectedTarget.cost) {
            alert("Insufficient funds to place this contract.");
            return;
        }

        const newBounty: Bounty = {
            id: Math.random().toString(36).substr(2, 9),
            targetName: selectedTarget.name,
            targetFaction: selectedTarget.faction,
            targetRole: selectedTarget.role,
            cost: selectedTarget.cost,
            reward: selectedTarget.reward,
            difficulty: selectedTarget.difficulty,
            status: 'active',
            description: selectedTarget.desc,
            location: `Block ${Math.floor(Math.random()*15)}-${Math.floor(Math.random()*10)}`
        };

        onPlaceBounty(newBounty);
        onClose();
    };

    const getFactionColor = (f: string) => {
        if (locationType === 'bar') {
            // Muted colors for the paper theme
            if (f === 'The Commission') return 'bg-red-50 text-red-900 border-red-200';
            if (f === 'The Cartels') return 'bg-amber-50 text-amber-900 border-amber-200';
            if (f === 'The Street Gangs') return 'bg-purple-50 text-purple-900 border-purple-200';
            return 'bg-slate-50 text-slate-600 border-slate-200';
        }
        if (f === 'The Commission') return 'bg-red-100 text-red-800 border-red-200';
        if (f === 'The Cartels') return 'bg-amber-100 text-amber-800 border-amber-200';
        if (f === 'The Street Gangs') return 'bg-purple-100 text-purple-800 border-purple-200';
        return 'bg-slate-100 text-slate-600 border-slate-200';
    };

    const getDiffColor = (d: string) => {
        if (locationType === 'bar') {
             switch(d) {
                case 'Low': return 'text-emerald-700';
                case 'Medium': return 'text-amber-700';
                case 'High': return 'text-red-700';
                case 'Suicide': return 'text-purple-900';
                default: return 'text-slate-500';
            }
        }
        switch(d) {
            case 'Low': return 'text-emerald-500';
            case 'Medium': return 'text-amber-500';
            case 'High': return 'text-red-500';
            case 'Suicide': return 'text-purple-600';
            default: return 'text-slate-500';
        }
    };

    const isHQ = locationType === 'hq';

    return (
        <div 
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-waze"
            onWheel={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onMouseMove={(e) => e.stopPropagation()}
        >
            <div className={`w-full max-w-4xl h-[600px] rounded-xl shadow-2xl border-4 flex flex-col overflow-hidden relative
                ${isHQ ? 'bg-slate-900 border-slate-700' : 'bg-[#fdfbf7] border-[#451a03]'}
            `}>
                
                {/* --- SUSPICIOUS MAN MOTIF OVERLAY (BAR ONLY) --- */}
                {!isHQ && (
                    <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none opacity-10 mix-blend-multiply z-0">
                        <svg viewBox="0 0 100 100" fill="currentColor" className="text-[#451a03]">
                            <path d="M50 20 C50 10, 70 10, 70 20 L80 25 L80 35 L20 35 L20 25 L30 20 C30 10, 50 10, 50 20 Z" /> {/* Hat */}
                            <circle cx="50" cy="45" r="15" /> {/* Head */}
                            <path d="M20 100 L20 60 C20 50, 80 50, 80 60 L80 100 Z" /> {/* Coat */}
                            <path d="M60 40 L70 35" stroke="currentColor" strokeWidth="2" /> {/* Cigarette */}
                            <circle cx="72" cy="33" r="1" fill="gray"><animate attributeName="cy" from="33" to="20" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" from="1" to="0" dur="2s" repeatCount="indefinite"/></circle> 
                        </svg>
                    </div>
                )}

                {/* --- HEADER --- */}
                <div className={`p-6 border-b-2 flex justify-between items-center z-10 relative
                    ${isHQ ? 'bg-slate-950 border-red-900' : 'bg-white/50 border-[#451a03]'}
                `}>
                    <div>
                        <h2 className={`text-4xl font-black font-news uppercase tracking-tighter leading-none
                            ${isHQ ? 'text-red-600' : 'text-[#451a03]'}
                        `}>
                            {isHQ ? 'The Hit List' : 'The Suspicious Man'}
                        </h2>
                        <p className={`text-xs font-bold uppercase tracking-widest mt-1
                            ${isHQ ? 'text-slate-500' : 'text-[#78350f] italic'}
                        `}>
                            {isHQ ? 'Commission Sanctioned Targets Only' : '"Keep your voice down. Here\'s who needs to go."'}
                        </p>
                    </div>
                    <button onClick={onClose} className={`${isHQ ? 'text-white hover:text-red-500' : 'text-[#451a03] hover:text-[#78350f]'} text-2xl font-bold transition-colors`}>✕</button>
                </div>

                {/* --- CONTENT AREA --- */}
                <div className="flex-grow flex overflow-hidden z-10">
                    
                    {/* LIST OF TARGETS */}
                    <div className={`w-1/2 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3
                        ${isHQ ? 'bg-slate-900' : 'bg-transparent'}
                    `}>
                        {targets.map(target => (
                            <button
                                key={target.id}
                                onClick={() => setSelectedTarget(target)}
                                className={`flex items-center gap-4 p-3 rounded-lg border-2 text-left transition-all group relative overflow-hidden
                                    ${selectedTarget?.id === target.id 
                                        ? (isHQ ? 'bg-red-900/30 border-red-600' : 'bg-[#fffbeb] border-[#451a03] shadow-md transform scale-[1.02]') 
                                        : (isHQ ? 'bg-slate-800 border-slate-700 hover:border-slate-500' : 'bg-white border-slate-200 hover:border-[#a8a29e] hover:bg-[#fafaf9]')
                                    }
                                `}
                            >
                                <div className={`w-12 h-12 rounded border-2 overflow-hidden flex-shrink-0
                                    ${isHQ ? 'border-slate-600 bg-slate-700' : 'border-slate-300 bg-slate-100'}
                                `}>
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${target.seed}`} className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all" />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className={`font-black uppercase text-sm truncate pr-2 ${isHQ ? 'text-slate-200' : 'text-slate-800'}`}>{target.name}</div>
                                        <div className={`text-[10px] font-black uppercase ${getDiffColor(target.difficulty)}`}>{target.difficulty}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${getFactionColor(target.faction)}`}>
                                            {target.faction}
                                        </span>
                                        <span className={`text-[9px] font-bold uppercase ${isHQ ? 'text-slate-500' : 'text-slate-500'}`}>{target.role}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`text-[10px] font-bold uppercase ${isHQ ? 'text-slate-500' : 'text-amber-900/50'}`}>Cost</span>
                                    <span className={`font-mono font-bold ${isHQ ? 'text-red-500' : 'text-[#451a03]'}`}>${target.cost}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* DETAILS PANEL */}
                    <div className={`w-1/2 p-8 flex flex-col items-center justify-center text-center border-l-2
                        ${isHQ ? 'bg-slate-950 border-slate-800' : 'bg-[#f5f5f4] border-[#d6d3d1]'}
                    `}>
                        {selectedTarget ? (
                            <div className="w-full max-w-sm animate-slide-up">
                                {/* Wanted Poster Style for HQ, Folder Style for Bar */}
                                <div className="relative w-40 h-40 mx-auto mb-6">
                                    {isHQ ? (
                                        <>
                                            <div className="absolute inset-0 border-4 transform rotate-3 border-red-600"></div>
                                            <div className="absolute inset-0 border-4 transform -rotate-2 border-slate-600"></div>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 border-8 border-white shadow-lg bg-white transform rotate-1"></div>
                                    )}
                                    
                                    <img 
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedTarget.seed}`} 
                                        className="w-full h-full object-cover grayscale contrast-125 border-2 border-white shadow-xl relative z-10" 
                                    />
                                    
                                    {/* Stamps */}
                                    <div className={`absolute top-2 right-[-20px] text-white text-xs font-black uppercase px-8 py-1 transform rotate-45 z-20 shadow-md ${isHQ ? 'bg-red-600' : 'bg-[#451a03]'}`}>
                                        Target
                                    </div>
                                </div>

                                <h3 className={`text-3xl font-black font-news uppercase tracking-wide mb-2 ${isHQ ? 'text-white' : 'text-slate-900'}`}>
                                    {selectedTarget.name}
                                </h3>
                                
                                <div className={`text-xs font-bold uppercase tracking-widest mb-6 ${isHQ ? 'text-red-500' : 'text-amber-700'}`}>
                                    {selectedTarget.role} • {selectedTarget.faction}
                                </div>

                                <div className={`p-4 rounded-lg text-left mb-6 border-2
                                    ${isHQ ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}
                                `}>
                                    <div className="flex justify-between mb-2 border-b pb-2 border-current opacity-70">
                                        <span className="text-[10px] font-black uppercase tracking-widest">Difficulty</span>
                                        <span className={`text-xs font-bold uppercase ${getDiffColor(selectedTarget.difficulty)}`}>{selectedTarget.difficulty}</span>
                                    </div>
                                    <div className="flex justify-between mb-2 border-b pb-2 border-current opacity-70">
                                        <span className="text-[10px] font-black uppercase tracking-widest">Reward</span>
                                        <span className={`text-xs font-bold ${isHQ ? 'text-white' : 'text-slate-900'}`}>{selectedTarget.reward}</span>
                                    </div>
                                    <div className="mt-2 text-xs italic font-serif">
                                        "{selectedTarget.desc}"
                                    </div>
                                </div>

                                <button
                                    onClick={handleConfirm}
                                    disabled={money < selectedTarget.cost}
                                    className={`w-full py-4 font-black uppercase tracking-[0.2em] rounded shadow-lg transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed
                                        ${money >= selectedTarget.cost 
                                            ? (isHQ ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-[#451a03] hover:bg-[#78350f] text-white border-2 border-[#451a03]') 
                                            : 'bg-slate-700 text-slate-500'
                                        }
                                    `}
                                >
                                    {money >= selectedTarget.cost ? `Accept Contract ($${selectedTarget.cost})` : 'Insufficient Funds'}
                                </button>
                            </div>
                        ) : (
                            <div className="opacity-30 flex flex-col items-center">
                                <span className={`text-6xl mb-4 ${isHQ ? 'text-slate-600' : 'text-[#a8a29e]'}`}>🎯</span>
                                <span className={`text-sm font-bold uppercase tracking-widest ${isHQ ? 'text-slate-500' : 'text-[#78716c]'}`}>Select a target</span>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Bounties;
