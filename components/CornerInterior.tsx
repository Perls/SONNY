
import React, { useState } from 'react';
import { useGameEngine } from '../contexts/GameEngineContext';

interface CornerInteriorProps {
    building: any;
    isOwned: boolean;
    onClose: () => void;
}

const CornerInterior: React.FC<CornerInteriorProps> = ({ building, onClose }) => {
    const { gameState, handleUpdateCorner } = useGameEngine();
    const initialData = building.cornerData || {};
    
    const [selectedCrew, setSelectedCrew] = useState<string[]>(initialData.assignedCrewIds || []);
    // Default to stored config or 50
    const [cutLevel, setCutLevel] = useState(initialData.productionConfig?.cut ?? 50); 
    const [priceLevel, setPriceLevel] = useState(initialData.productionConfig?.price ?? 50);

    if (!gameState) return null;

    // Filter available crew (excluding leader and those busy elsewhere, unless already here)
    const availableCrew = gameState.crew.filter(c => {
        if (c.isLeader) return false;
        // Check if busy elsewhere
        const isBusyElsewhere = gameState.holdings.some(h => 
            h.id !== building.id && 
            h.cornerData?.assignedCrewIds.includes(c.id)
        );
        return !isBusyElsewhere;
    });

    const toggleCrew = (id: string) => {
        if (selectedCrew.includes(id)) {
            setSelectedCrew(prev => prev.filter(c => c !== id));
        } else {
            if (selectedCrew.length < 3) { // Max 3 per corner
                setSelectedCrew(prev => [...prev, id]);
            }
        }
    };

    const handleSave = () => {
        handleUpdateCorner(building.id, selectedCrew, ['Synth-Coke'], { cut: cutLevel, price: priceLevel }); 
        onClose();
    };

    // Calculate projected stats based on sliders
    const purity = 100 - cutLevel;
    const projectedIncome = Math.floor(100 + (priceLevel * 2) + (purity * 0.5) + (selectedCrew.length * 50));
    const projectedHeat = Math.floor((purity * 0.2) + (priceLevel * 0.1) + (selectedCrew.length * 5));
    
    let riskLabel = 'Low';
    let riskColor = 'text-blue-400';
    if (projectedHeat > 40) { riskLabel = 'Critical'; riskColor = 'text-red-600 animate-pulse'; }
    else if (projectedHeat > 25) { riskLabel = 'High'; riskColor = 'text-red-500'; }
    else if (projectedHeat > 15) { riskLabel = 'Medium'; riskColor = 'text-amber-500'; }

    return (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center font-waze animate-fade-in p-4">
            <div className="bg-slate-900 w-full max-w-6xl rounded-2xl shadow-2xl border-4 border-blue-600 overflow-hidden flex flex-col relative h-[700px]">
                
                {/* Header */}
                <div className="h-20 bg-slate-950 flex items-center justify-between px-8 border-b-2 border-blue-900 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(37,99,235,0.5)] border-2 border-blue-400">⚗️</div>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-widest font-news">{building.name}</h2>
                            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] flex gap-2">
                                <span>Distribution Hub</span>
                                <span className="text-slate-600">•</span>
                                <span>Level {building.level}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="bg-slate-800 hover:bg-red-900 text-slate-400 hover:text-white px-6 py-2 rounded-lg font-black uppercase text-xs transition-colors border border-slate-700">Close Ops</button>
                </div>

                <div className="flex flex-grow overflow-hidden">
                    
                    {/* LEFT COLUMN: VISUALS & CREW SCENE */}
                    <div className="w-5/12 relative bg-black border-r-4 border-slate-800 flex flex-col">
                        {/* Background */}
                        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1605218427306-0338d0140781?q=80&w=1000&auto=format&fit=crop")', backgroundSize: 'cover', filter: 'grayscale(100%) contrast(1.2)' }}></div>
                        <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply"></div>
                        
                        {/* Status Overlay */}
                        <div className="relative z-10 p-6 flex justify-between items-start gap-4">
                            <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 flex-1 shadow-lg">
                                <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Projected Revenue</div>
                                <div className="text-3xl font-mono text-emerald-400 font-bold tracking-tight">N$ {projectedIncome}/d</div>
                            </div>
                            <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 flex-1 text-right shadow-lg">
                                <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Heat Exposure</div>
                                <div className={`text-2xl font-black uppercase ${riskColor}`}>{riskLabel}</div>
                            </div>
                        </div>

                        {/* Crew Visualization (Paper Mario Style) */}
                        <div className="flex-grow relative mt-auto mb-10 flex items-end justify-center gap-6 px-4 z-20">
                            {selectedCrew.length === 0 && (
                                <div className="text-white/20 font-black text-xl uppercase tracking-widest text-center self-center border-2 border-dashed border-white/20 px-8 py-4 rounded-xl">
                                    Station Unmanned
                                </div>
                            )}
                            {selectedCrew.map(id => {
                                const member = gameState.crew.find(c => c.id === id);
                                if (!member) return null;
                                return (
                                    <div key={id} className="flex flex-col items-center group relative cursor-help animate-pop-in">
                                        {/* Avatar */}
                                        <div className="w-28 h-28 rounded-full border-4 border-white bg-slate-800 shadow-[0_10px_20px_rgba(0,0,0,0.5)] relative z-10 transition-transform transform group-hover:-translate-y-2 group-hover:scale-105">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.imageSeed}`} className="w-full h-full object-cover" />
                                            {/* Role Badge */}
                                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-xl border-2 border-white shadow-sm">
                                                {member.pawnType === 'heavy' ? '🛡️' : '♟️'}
                                            </div>
                                        </div>
                                        {/* Nameplate */}
                                        <div className="mt-4 bg-black/90 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-blue-500/50 shadow-lg backdrop-blur-sm tracking-wide">
                                            {member.name}
                                        </div>
                                    </div>
                                );
                            })}
                            {/* Add Slot Placeholder */}
                            {selectedCrew.length < 3 && selectedCrew.length > 0 && (
                                <div className="w-20 h-20 rounded-full border-4 border-dashed border-white/20 bg-white/5 flex items-center justify-center mb-8 animate-pulse">
                                    <span className="text-3xl text-white/20">+</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: CONTROLS */}
                    <div className="w-7/12 bg-slate-50 p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                        
                        {/* 1. Production Config */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 text-8xl grayscale">⚗️</div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
                                <span className="text-xl">🧪</span> The Lab
                            </h3>
                            
                            {/* Purity Slider */}
                            <div className="mb-8 relative z-10">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Mix</span>
                                    <span className="text-xs font-black text-slate-800 bg-slate-100 px-2 py-1 rounded">{cutLevel}% Filler</span>
                                </div>
                                <input 
                                    type="range" min="0" max="100" value={cutLevel} 
                                    onChange={(e) => setCutLevel(parseInt(e.target.value))}
                                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-wide">
                                    <span>Pure (High Heat)</span>
                                    <span>Stepped On (Low Demand)</span>
                                </div>
                            </div>

                            {/* Price Slider */}
                            <div className="relative z-10">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Street Price</span>
                                    <span className={`text-xs font-black bg-slate-100 px-2 py-1 rounded ${priceLevel > 75 ? 'text-red-500' : 'text-emerald-600'}`}>{priceLevel > 50 ? 'Premium' : 'Standard'}</span>
                                </div>
                                <input 
                                    type="range" min="0" max="100" value={priceLevel} 
                                    onChange={(e) => setPriceLevel(parseInt(e.target.value))}
                                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                />
                                <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-wide">
                                    <span>Liquidation</span>
                                    <span>Gouging</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Crew Management */}
                        <div className="flex-grow flex flex-col min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-xl">👥</span> Assignment
                                </h3>
                            </div>
                            
                            <div className="flex-grow overflow-y-auto custom-scrollbar p-2">
                                {availableCrew.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                                        <div className="text-4xl mb-2 grayscale opacity-50">😴</div>
                                        <div className="text-xs font-bold uppercase tracking-wide">No Soldiers Available</div>
                                        <div className="text-[10px] mt-1">Recruit more or relieve them from other duties.</div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2">
                                        {availableCrew.map(c => {
                                            const isSelected = selectedCrew.includes(c.id);
                                            return (
                                                <button 
                                                    key={c.id}
                                                    onClick={() => toggleCrew(c.id)}
                                                    disabled={!isSelected && selectedCrew.length >= 3}
                                                    className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all group
                                                        ${isSelected 
                                                            ? 'bg-blue-50 border-blue-500 shadow-sm' 
                                                            : (!isSelected && selectedCrew.length >= 3)
                                                                ? 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed'
                                                                : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-lg bg-slate-200 overflow-hidden border-2 ${isSelected ? 'border-blue-400' : 'border-slate-300'}`}>
                                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.imageSeed}`} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="text-left">
                                                            <div className={`text-xs font-black uppercase ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>{c.name}</div>
                                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{c.pawnType || 'Soldier'} • Lvl {c.level}</div>
                                                        </div>
                                                    </div>
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] transition-colors
                                                        ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-100 border-slate-300 text-transparent group-hover:border-blue-300'}
                                                    `}>
                                                        ✓
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Save Actions */}
                        <div className="pt-2">
                            <button 
                                onClick={handleSave}
                                className="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-xl transition-all active:translate-y-0.5 border-b-4 border-slate-950 active:border-b-0 hover:border-blue-800 flex items-center justify-center gap-3"
                            >
                                <span>Confirm Operations</span>
                                <span className="text-xl">🚀</span>
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default CornerInterior;
