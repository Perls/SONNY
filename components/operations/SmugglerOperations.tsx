
import React, { useState } from 'react';
import { useGameEngine } from '../../contexts/GameEngineContext';
import { Holding, InventoryItem, CrewMember } from '../../types';
import { ITEMS } from '../../constants';

type OpView = 'dashboard' | 'intel' | 'market' | 'transport' | 'heist';

const SmugglerOperations: React.FC = () => {
    const { gameState, updateSave, triggerConsigliere, handleStartMission } = useGameEngine();
    const [currentView, setCurrentView] = useState<OpView>('dashboard');
    
    // --- STATE: SHARED ---
    const [target, setTarget] = useState({ x: 4, y: 4 });
    const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
    
    // --- STATE: INTEL ---
    const [intelDuration, setIntelDuration] = useState(50);

    // --- STATE: MARKET ---
    // (Uses shared state)

    // --- STATE: HEIST ---
    const [heistType, setHeistType] = useState<'stealth' | 'loud'>('stealth');

    // --- STATE: TRANSPORT ---
    const [transportCargo, setTransportCargo] = useState<'weapons' | 'drugs' | 'luxury'>('drugs');

    if (!gameState) return null;

    // --- DATA HELPERS ---
    const leader = gameState.crew.find(c => c.isLeader) || gameState.crew[0];
    
    // Available Crew Filter
    const availableCrew = gameState.crew.filter(c => {
        if (c.isLeader) return false;
        const isBusy = gameState.holdings.some(h => 
            h.cornerData?.assignedCrewIds.includes(c.id) || 
            h.protectionData?.assignedCrewIds.includes(c.id) ||
            h.brothelData?.securityCrewIds.includes(c.id)
        );
        const onMission = gameState.activeMissions?.some(m => m.crewIds.includes(c.id));
        const isSelected = selectedCrew.includes(c.id);
        return !isBusy && !onMission && !isSelected; // Show if available OR currently selected
    });

    const getCrewMember = (id: string) => gameState.crew.find(c => c.id === id);

    // Active Operations Lists
    const activeMissions = gameState.activeMissions || [];
    const activeMarkets = gameState.holdings.filter(h => h.slotIndex === 888); // Black Markets

    // --- SHARED HANDLERS ---
    const toggleCrew = (id: string, max: number) => {
        if (selectedCrew.includes(id)) {
            setSelectedCrew(prev => prev.filter(c => c !== id));
        } else if (selectedCrew.length < max) {
            setSelectedCrew(prev => [...prev, id]);
        }
    };

    const resetForm = () => {
        setSelectedCrew([]);
        setCurrentView('dashboard');
    };

    // --- OPERATION LOGIC ---

    const deployIntel = () => {
        if (selectedCrew.length === 0) return alert("Assign crew.");
        const durationSeconds = 30 + (intelDuration * 2.7);
        const qualityScore = (intelDuration * 0.6) + (selectedCrew.length * 25 * 0.4);
        let qualityLabel = 'Low';
        if (qualityScore > 80) qualityLabel = 'Excellent';
        else if (qualityScore > 60) qualityLabel = 'Good';

        handleStartMission(
            'intel',
            target.x, target.y,
            selectedCrew,
            durationSeconds,
            `Gathering Intel (${qualityLabel})`
        );
        triggerConsigliere(`Spies sent to Block ${target.x}-${target.y}.`);
        resetForm();
    };

    const deployTransport = () => {
        if (selectedCrew.length === 0) return alert("Assign crew.");
        
        // Cost check (buying the goods to move)
        const cost = transportCargo === 'weapons' ? 1000 : transportCargo === 'luxury' ? 500 : 200;
        if (gameState.money < cost) return alert("Insufficient funds to buy cargo.");

        updateSave({ ...gameState, money: gameState.money - cost });

        const duration = 60; // Fixed 60s run
        handleStartMission(
            'transport',
            target.x, target.y,
            selectedCrew,
            duration,
            `Transporting ${transportCargo}`
        );
        triggerConsigliere(`Convoy rolling to Block ${target.x}-${target.y}. Risk is high.`);
        resetForm();
    };

    const deployHeist = () => {
        if (selectedCrew.length === 0) return alert("Assign crew.");
        
        const duration = heistType === 'stealth' ? 120 : 45; // Stealth takes longer
        const desc = heistType === 'stealth' ? "Quiet Burglary" : "Smash & Grab";
        
        handleStartMission(
            'heist',
            target.x, target.y,
            selectedCrew,
            duration,
            `${desc} Operation`
        );
        
        const heatGain = heistType === 'stealth' ? 5 : 20;
        updateSave({ ...gameState, heat: gameState.heat + heatGain });
        
        triggerConsigliere(`${desc} initiated on Block ${target.x}-${target.y}. Heat increased.`);
        resetForm();
    };

    const establishMarket = () => {
        if (selectedCrew.length === 0) return alert("Assign crew.");
        
        // Check overlap
        const exists = gameState.holdings.find(h => h.x === target.x && h.y === target.y && (h.type === 'corner' || h.slotIndex === 888));
        if (exists) return alert("Turf already occupied.");

        const newHolding: Holding = {
            id: Math.random().toString(36).substr(2, 9),
            x: target.x, y: target.y,
            slotIndex: 888,
            name: `Black Market ${target.x}-${target.y}`,
            type: 'corner',
            level: 1, maxLevel: 5,
            income: 120 + (selectedCrew.length * 40),
            cost: 0, ownerFaction: 'player',
            icon: '📦',
            cornerData: { assignedCrewIds: selectedCrew, activeProducts: ['Contraband'] }
        };

        updateSave({
            ...gameState,
            holdings: [...gameState.holdings, newHolding],
            respect: gameState.respect + 5
        });

        triggerConsigliere(`Black Market opened on Block ${target.x}-${target.y}.`);
        resetForm();
    };

    // --- COMPONENT: CREW SELECTOR ---
    const CrewSelector = ({ max }: { max: number }) => (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign Operatives</span>
                <span className="text-[10px] font-bold text-slate-500">{selectedCrew.length} / {max}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                {availableCrew.length === 0 && selectedCrew.length === 0 && (
                    <div className="col-span-2 text-center text-xs text-slate-400 italic py-2">No active crew available.</div>
                )}
                
                {/* Show currently selected first */}
                {selectedCrew.map(id => {
                    const c = getCrewMember(id);
                    if (!c) return null;
                    return (
                        <button key={id} onClick={() => toggleCrew(id, max)} className="flex items-center gap-3 p-2 rounded-lg border text-left transition-all bg-amber-50 border-amber-400 shadow-sm">
                            <div className="w-8 h-8 rounded bg-slate-200 overflow-hidden"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.imageSeed}`} /></div>
                            <div><div className="text-[10px] font-black uppercase text-slate-800">{c.name}</div><div className="text-[8px] font-bold text-amber-600 uppercase">Assigned</div></div>
                        </button>
                    );
                })}

                {/* Show available */}
                {gameState.crew.filter(c => !c.isLeader && !selectedCrew.includes(c.id) && !gameState.activeMissions?.some(m => m.crewIds.includes(c.id))).map(c => (
                    <button key={c.id} onClick={() => toggleCrew(c.id, max)} className="flex items-center gap-3 p-2 rounded-lg border text-left transition-all bg-white border-slate-200 hover:border-slate-300">
                        <div className="w-8 h-8 rounded bg-slate-200 overflow-hidden"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.imageSeed}`} /></div>
                        <div><div className="text-[10px] font-black uppercase text-slate-800">{c.name}</div><div className="text-[8px] font-bold text-slate-400 uppercase">{c.pawnType || 'Pawn'}</div></div>
                    </button>
                ))}
            </div>
        </div>
    );

    // --- COMPONENT: TARGET SELECTOR ---
    const TargetSelector = () => (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Target Sector</label>
            <div className="flex items-center gap-2">
                <div className="flex flex-col items-center flex-1">
                    <span className="text-[8px] font-bold text-slate-400 uppercase mb-1">Block X</span>
                    <input type="number" min="0" max="14" value={target.x} onChange={(e) => setTarget(prev => ({ ...prev, x: parseInt(e.target.value) }))} className="w-full text-center font-black bg-white border border-slate-300 rounded py-2" />
                </div>
                <div className="flex flex-col items-center flex-1">
                    <span className="text-[8px] font-bold text-slate-400 uppercase mb-1">Block Y</span>
                    <input type="number" min="0" max="9" value={target.y} onChange={(e) => setTarget(prev => ({ ...prev, y: parseInt(e.target.value) }))} className="w-full text-center font-black bg-white border border-slate-300 rounded py-2" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-6 animate-fade-in h-full pb-8">
            
            {/* Header */}
            <div className="bg-slate-900 rounded-xl p-6 border-l-4 border-amber-500 shadow-lg relative overflow-hidden shrink-0">
                <div className="absolute right-0 top-0 opacity-10 text-9xl pointer-events-none transform translate-x-1/4 -translate-y-1/4">🗺️</div>
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <div className="text-amber-400 text-xs font-black uppercase tracking-widest mb-1">Smuggler Network</div>
                        <h2 className="text-2xl font-black font-news text-white uppercase tracking-tight">Logistics & Acquisitions</h2>
                    </div>
                    {currentView !== 'dashboard' && (
                        <button onClick={() => setCurrentView('dashboard')} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded text-xs font-bold uppercase border border-slate-600">
                            Back to Dashboard
                        </button>
                    )}
                </div>
            </div>

            {/* --- DASHBOARD VIEW --- */}
            {currentView === 'dashboard' && (
                <div className="flex flex-col gap-6 flex-grow overflow-y-auto custom-scrollbar">
                    
                    {/* Active Ops Summary */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Ongoing Missions</div>
                            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                {activeMissions.length === 0 && <div className="text-[10px] text-slate-400 italic">No active missions.</div>}
                                {activeMissions.map(m => {
                                    const timeLeft = Math.max(0, Math.ceil((m.startTime + m.duration - Date.now()) / 1000));
                                    return (
                                        <div key={m.id} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{m.type === 'intel' ? '🕵️' : m.type === 'heist' ? '💰' : '🚚'}</span>
                                                <div>
                                                    <div className="text-[10px] font-black uppercase text-slate-700">{m.type}</div>
                                                    <div className="text-[9px] text-slate-500">Block {m.targetX}-{m.targetY}</div>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">{timeLeft}s</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Active Networks</div>
                            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                {activeMarkets.length === 0 && <div className="text-[10px] text-slate-400 italic">No markets established.</div>}
                                {activeMarkets.map(m => (
                                    <div key={m.id} className="flex justify-between items-center bg-amber-50 p-2 rounded border border-amber-100">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">📦</span>
                                            <div>
                                                <div className="text-[10px] font-black uppercase text-amber-900">{m.name}</div>
                                                <div className="text-[9px] text-amber-700/70">Income: {m.income}/d</div>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-bold text-amber-600">Active</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* New Operation Grid */}
                    <div>
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Launch Operation</div>
                        <div className="grid grid-cols-4 gap-4">
                            <button onClick={() => setCurrentView('intel')} className="bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-xl shadow-lg border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 transition-all group">
                                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🕵️</div>
                                <div className="text-xs font-black uppercase">Gather Intel</div>
                                <div className="text-[9px] text-slate-400 mt-1">Recon Block</div>
                            </button>
                            <button onClick={() => setCurrentView('market')} className="bg-amber-600 hover:bg-amber-500 text-white p-4 rounded-xl shadow-lg border-b-4 border-amber-800 active:border-b-0 active:translate-y-1 transition-all group">
                                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📦</div>
                                <div className="text-xs font-black uppercase">Black Market</div>
                                <div className="text-[9px] text-amber-200 mt-1">Passive Income</div>
                            </button>
                            <button onClick={() => setCurrentView('transport')} className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all group">
                                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🚚</div>
                                <div className="text-xs font-black uppercase">Transport</div>
                                <div className="text-[9px] text-blue-200 mt-1">Move Contraband</div>
                            </button>
                            <button onClick={() => setCurrentView('heist')} className="bg-red-700 hover:bg-red-600 text-white p-4 rounded-xl shadow-lg border-b-4 border-red-900 active:border-b-0 active:translate-y-1 transition-all group">
                                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💰</div>
                                <div className="text-xs font-black uppercase">Heist</div>
                                <div className="text-[9px] text-red-200 mt-1">Target & Rob</div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- CONFIG FORMS --- */}
            
            {/* 1. INTEL FORM */}
            {currentView === 'intel' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 flex gap-6 h-full shadow-sm animate-slide-up">
                    <div className="w-1/3 flex flex-col gap-4">
                        <TargetSelector />
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex justify-between items-end mb-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Duration</label>
                                <span className="text-xs font-bold text-slate-800">{30 + Math.floor(intelDuration * 2.7)}s</span>
                            </div>
                            <input type="range" min="0" max="100" value={intelDuration} onChange={(e) => setIntelDuration(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600" />
                            <div className="flex justify-between text-[8px] font-bold text-slate-400 mt-1 uppercase"><span>Rush</span><span>Deep Cover</span></div>
                        </div>
                    </div>
                    <div className="flex-grow flex flex-col">
                        <CrewSelector max={3} />
                        <button onClick={deployIntel} className="mt-auto w-full py-4 bg-slate-800 text-white font-black uppercase tracking-widest rounded-xl hover:bg-slate-700 shadow-lg">Dispatch Spies</button>
                    </div>
                </div>
            )}

            {/* 2. MARKET FORM */}
            {currentView === 'market' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 flex gap-6 h-full shadow-sm animate-slide-up">
                    <div className="w-1/3 flex flex-col gap-4">
                        <TargetSelector />
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                            <div className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Estimated Returns</div>
                            <div className="text-2xl font-mono font-black text-emerald-600">N$ {120 + (selectedCrew.length * 40)}/d</div>
                            <p className="text-[9px] text-amber-600 mt-2">Requires 1-3 active crew members to maintain operations.</p>
                        </div>
                    </div>
                    <div className="flex-grow flex flex-col">
                        <CrewSelector max={3} />
                        <button onClick={establishMarket} className="mt-auto w-full py-4 bg-amber-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 shadow-lg">Establish Market</button>
                    </div>
                </div>
            )}

            {/* 3. HEIST FORM */}
            {currentView === 'heist' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 flex gap-6 h-full shadow-sm animate-slide-up">
                    <div className="w-1/3 flex flex-col gap-4">
                        <TargetSelector />
                        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                            <label className="text-[9px] font-black text-red-800/60 uppercase tracking-widest block mb-2">Approach</label>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => setHeistType('stealth')} className={`p-3 rounded border text-left transition-all ${heistType === 'stealth' ? 'bg-red-100 border-red-400 shadow-sm' : 'bg-white border-red-100'}`}>
                                    <div className="font-black text-xs uppercase text-red-900">Stealth</div>
                                    <div className="text-[9px] text-red-700">Low Heat • Medium Reward</div>
                                </button>
                                <button onClick={() => setHeistType('loud')} className={`p-3 rounded border text-left transition-all ${heistType === 'loud' ? 'bg-red-100 border-red-400 shadow-sm' : 'bg-white border-red-100'}`}>
                                    <div className="font-black text-xs uppercase text-red-900">Loud & Fast</div>
                                    <div className="text-[9px] text-red-700">High Heat • High Reward</div>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-grow flex flex-col">
                        <CrewSelector max={4} />
                        <button onClick={deployHeist} className="mt-auto w-full py-4 bg-red-700 text-white font-black uppercase tracking-widest rounded-xl hover:bg-red-600 shadow-lg">Execute Heist</button>
                    </div>
                </div>
            )}

            {/* 4. TRANSPORT FORM */}
            {currentView === 'transport' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 flex gap-6 h-full shadow-sm animate-slide-up">
                    <div className="w-1/3 flex flex-col gap-4">
                        <TargetSelector />
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                            <label className="text-[9px] font-black text-blue-800/60 uppercase tracking-widest block mb-2">Cargo Type</label>
                            <div className="flex flex-col gap-2">
                                {['drugs', 'weapons', 'luxury'].map(type => (
                                    <button key={type} onClick={() => setTransportCargo(type as any)} className={`p-2 rounded border text-left flex justify-between items-center ${transportCargo === type ? 'bg-blue-100 border-blue-400' : 'bg-white border-blue-100'}`}>
                                        <span className="text-xs font-bold uppercase text-blue-900">{type}</span>
                                        <span className="text-[9px] font-mono text-blue-700">Cost: {type === 'weapons' ? 1000 : type === 'luxury' ? 500 : 200}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex-grow flex flex-col">
                        <CrewSelector max={4} />
                        <button onClick={deployTransport} className="mt-auto w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 shadow-lg">Start Convoy</button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SmugglerOperations;
