
import React, { useState } from 'react';
import { useGameEngine } from '../../contexts/GameEngineContext';
import { CrewMember } from '../../types';

interface OperationState {
    crewIds: string[];
    sliderValue: number; // 0-100
}

const HustlerOperations: React.FC = () => {
    const { gameState, updateSave, triggerConsigliere } = useGameEngine();

    // --- STATE MANAGEMENT ---
    // 1. Money Laundering (Slider: Aggressiveness/Fee)
    const [laundering, setLaundering] = useState<OperationState>({ crewIds: [], sliderValue: 20 });
    // 2. Loan Sharking (Slider: Interest Rate)
    const [sharking, setSharking] = useState<OperationState>({ crewIds: [], sliderValue: 15 });
    // 3. Gambling House (Slider: House Edge/Rigging)
    const [gambling, setGambling] = useState<OperationState>({ crewIds: [], sliderValue: 5 }); 
    // 4. Black Market (Slider: Markup)
    const [market, setMarket] = useState<OperationState>({ crewIds: [], sliderValue: 50 });

    if (!gameState) return null;

    const leader = gameState.crew.find(c => c.isLeader) || gameState.crew[0];

    // Filter available crew (Not leader, not busy elsewhere, not assigned to these ops)
    const availableCrew = gameState.crew.filter(c => {
        if (c.isLeader) return false;
        const isBusyElsewhere = gameState.holdings.some(h => 
            h.cornerData?.assignedCrewIds.includes(c.id) || 
            h.protectionData?.assignedCrewIds.includes(c.id) ||
            h.brothelData?.securityCrewIds.includes(c.id)
        );
        const onMission = gameState.activeMissions?.some(m => m.crewIds.includes(c.id));
        const assignedHere = 
            laundering.crewIds.includes(c.id) || 
            sharking.crewIds.includes(c.id) || 
            gambling.crewIds.includes(c.id) || 
            market.crewIds.includes(c.id);
        
        return !isBusyElsewhere && !onMission && !assignedHere;
    });

    const getCrewMember = (id: string) => gameState.crew.find(c => c.id === id);

    const toggleCrew = (id: string, opType: 'laundering' | 'sharking' | 'gambling' | 'market') => {
        const setterMap = { laundering: setLaundering, sharking: setSharking, gambling: setGambling, market: setMarket };
        const stateMap = { laundering, sharking, gambling, market };
        
        const setter = setterMap[opType];
        const currentState = stateMap[opType];

        if (currentState.crewIds.includes(id)) {
            setter(prev => ({ ...prev, crewIds: prev.crewIds.filter(c => c !== id) }));
        } else {
            if (currentState.crewIds.length < 3) {
                setter(prev => ({ ...prev, crewIds: [...prev.crewIds, id] }));
            } else {
                alert("Maximum 3 operators per racket.");
            }
        }
    };

    const handleConfirm = () => {
        // In a real implementation, this would save to a persistent "HustlerOps" object in GameState
        // For now, we simulate the setup
        const totalIncome = 
            (laundering.crewIds.length * 100) + 
            (sharking.crewIds.length * 150) + 
            (gambling.crewIds.length * 120) + 
            (market.crewIds.length * 200);
            
        updateSave({
            ...gameState,
            money: gameState.money // No cost to adjust settings
        });
        
        triggerConsigliere(`Operations updated. Projected revenue: N$ ${totalIncome}/day.`);
    };

    // --- RENDER HELPERS ---

    const renderCrewSelector = (
        opType: 'laundering' | 'sharking' | 'gambling' | 'market', 
        currentIds: string[]
    ) => (
        <div className="mt-4">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex justify-between">
                <span>Assign Operators ({currentIds.length}/3)</span>
                {availableCrew.length > 0 && <span className="text-emerald-600">Available: {availableCrew.length}</span>}
            </div>
            
            {/* Assigned Slots */}
            <div className="flex gap-2 mb-3 min-h-[40px]">
                {currentIds.map(id => {
                    const c = getCrewMember(id);
                    if (!c) return null;
                    return (
                        <div key={id} onClick={() => toggleCrew(id, opType)} className="relative group cursor-pointer">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.imageSeed}`} className="w-10 h-10 rounded-full border-2 border-slate-300 group-hover:border-red-400" />
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100">✕</div>
                        </div>
                    );
                })}
                {currentIds.length === 0 && <div className="text-xs text-slate-300 italic self-center">No crew assigned.</div>}
            </div>

            {/* Available Pool */}
            {availableCrew.length > 0 && (
                <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto custom-scrollbar p-1 bg-slate-50 rounded border border-slate-200">
                    {availableCrew.map(c => (
                        <button 
                            key={c.id}
                            onClick={() => toggleCrew(c.id, opType)}
                            className="flex items-center gap-2 p-1 hover:bg-white rounded border border-transparent hover:border-slate-200 text-left transition-all"
                        >
                            <div className="w-6 h-6 rounded bg-slate-200 overflow-hidden shrink-0">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.imageSeed}`} />
                            </div>
                            <div className="text-[9px] font-bold text-slate-600 truncate">{c.name}</div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col gap-6 animate-fade-in h-full pb-8">
            
            {/* Header */}
            <div className="bg-slate-900 rounded-xl p-6 border-l-4 border-emerald-500 shadow-lg relative overflow-hidden shrink-0">
                <div className="absolute right-0 top-0 opacity-10 text-9xl pointer-events-none transform translate-x-1/4 -translate-y-1/4">💸</div>
                <div className="relative z-10">
                    <div className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-2">Wisdom of "Lucky" Luciano</div>
                    <p className="text-slate-300 font-serif italic leading-relaxed text-sm mb-0 border-l-2 border-slate-600 pl-4">
                        "There's money on the street, money in the bank, and money in the air. A Hustler knows how to grab it from all three places without anyone seeing his hands move. Diversify your portfolio, kid."
                    </p>
                </div>
            </div>

            {/* 2x2 Grid */}
            <div className="grid grid-cols-2 gap-6">
                
                {/* 1. MONEY LAUNDERING */}
                <div className="bg-white rounded-xl border-2 border-slate-200 shadow-sm p-5 relative group hover:border-emerald-300 transition-all">
                    <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-2xl border border-emerald-200">
                            🧼
                        </div>
                        <div>
                            <h4 className="font-black text-slate-800 uppercase text-sm">Laundering</h4>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Clean Dirty Cash</div>
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 mb-1">
                            <span>Processing Rate</span>
                            <span className={laundering.sliderValue > 70 ? 'text-red-500' : 'text-emerald-600'}>
                                {laundering.sliderValue > 70 ? 'Aggressive' : laundering.sliderValue < 30 ? 'Slow & Safe' : 'Standard'}
                            </span>
                        </div>
                        <input 
                            type="range" min="0" max="100" 
                            value={laundering.sliderValue} 
                            onChange={(e) => setLaundering(prev => ({ ...prev, sliderValue: parseInt(e.target.value) }))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                    </div>

                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded mb-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Est. Cleaned</span>
                        <span className="text-xs font-mono font-bold text-emerald-600">N$ {Math.floor(laundering.crewIds.length * 500 * (laundering.sliderValue / 50))}/d</span>
                    </div>

                    {renderCrewSelector('laundering', laundering.crewIds)}
                </div>

                {/* 2. LOAN SHARKING */}
                <div className="bg-white rounded-xl border-2 border-slate-200 shadow-sm p-5 relative group hover:border-red-300 transition-all">
                    <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                        <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-2xl border border-red-200">
                            🦈
                        </div>
                        <div>
                            <h4 className="font-black text-slate-800 uppercase text-sm">Loan Sharking</h4>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">High Interest Debt</div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 mb-1">
                            <span>Interest Rate</span>
                            <span className="text-red-600">{sharking.sliderValue}% Weekly</span>
                        </div>
                        <input 
                            type="range" min="5" max="50" 
                            value={sharking.sliderValue} 
                            onChange={(e) => setSharking(prev => ({ ...prev, sliderValue: parseInt(e.target.value) }))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                    </div>

                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded mb-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Collections</span>
                        <span className="text-xs font-mono font-bold text-emerald-600">N$ {Math.floor(sharking.crewIds.length * 200 * (sharking.sliderValue / 10))}/d</span>
                    </div>

                    {renderCrewSelector('sharking', sharking.crewIds)}
                </div>

                {/* 3. GAMBLING HOUSE */}
                <div className="bg-white rounded-xl border-2 border-slate-200 shadow-sm p-5 relative group hover:border-amber-300 transition-all">
                    <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-2xl border border-amber-200">
                            🎲
                        </div>
                        <div>
                            <h4 className="font-black text-slate-800 uppercase text-sm">Gambling Den</h4>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">House Edge Config</div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 mb-1">
                            <span>Rigged Level</span>
                            <span className={gambling.sliderValue > 10 ? 'text-red-500' : 'text-slate-700'}>
                                {gambling.sliderValue}% Edge
                            </span>
                        </div>
                        <input 
                            type="range" min="1" max="20" 
                            value={gambling.sliderValue} 
                            onChange={(e) => setGambling(prev => ({ ...prev, sliderValue: parseInt(e.target.value) }))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                    </div>

                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded mb-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">The Take</span>
                        <span className="text-xs font-mono font-bold text-emerald-600">N$ {Math.floor(gambling.crewIds.length * 300 * (1 + gambling.sliderValue / 100))}/d</span>
                    </div>

                    {renderCrewSelector('gambling', gambling.crewIds)}
                </div>

                {/* 4. BLACK MARKET */}
                <div className="bg-white rounded-xl border-2 border-slate-200 shadow-sm p-5 relative group hover:border-purple-300 transition-all">
                    <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-2xl border border-purple-200">
                            💍
                        </div>
                        <div>
                            <h4 className="font-black text-slate-800 uppercase text-sm">Black Market</h4>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Luxury Fence</div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 mb-1">
                            <span>Resale Markup</span>
                            <span className="text-purple-600">{market.sliderValue}%</span>
                        </div>
                        <input 
                            type="range" min="10" max="200" 
                            value={market.sliderValue} 
                            onChange={(e) => setMarket(prev => ({ ...prev, sliderValue: parseInt(e.target.value) }))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                    </div>

                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded mb-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Sales Volume</span>
                        <span className="text-xs font-mono font-bold text-emerald-600">N$ {Math.floor(market.crewIds.length * 150 * (market.sliderValue / 50))}/d</span>
                    </div>

                    {renderCrewSelector('market', market.crewIds)}
                </div>

            </div>

            {/* Footer Action */}
            <div className="flex justify-center pt-4">
                <button 
                    onClick={handleConfirm}
                    className="bg-slate-900 hover:bg-emerald-600 text-white px-12 py-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-xl border-b-4 border-slate-950 active:border-b-0 active:translate-y-0.5 transition-all flex items-center gap-3"
                >
                    <span>Confirm Operations</span>
                    <span className="text-xl">💰</span>
                </button>
            </div>

        </div>
    );
};

export default HustlerOperations;
