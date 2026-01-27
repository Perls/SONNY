
import React, { useState } from 'react';
import { Holding, CrewMember, InventoryItem } from '../../types';
import { useGameEngine } from '../../contexts/GameEngineContext';
import { ITEMS } from '../../constants';

interface ThugOperationsProps {
    holdings: Holding[];
}

const ThugOperations: React.FC<ThugOperationsProps> = ({ holdings }) => {
    const { gameState, handleUpdateProtection, handleEquipItem } = useGameEngine();
    
    // Check if player has an active Protection Racket
    const racketHolding = holdings.find(h => h.type === 'protection_racket');
    const hasRacket = !!racketHolding;
    const hasTags = (gameState?.tags?.length || 0) > 0;

    // --- DEFENSE STATE ---
    const initialCrew = racketHolding?.protectionData?.assignedCrewIds || [];
    const [selectedDefenseCrew, setSelectedDefenseCrew] = useState<string[]>(initialCrew);
    const patrolLevel = racketHolding?.protectionData?.patrolLevel || 1;

    // --- RAID STATE ---
    const [raidParty, setRaidParty] = useState<(string | null)[]>([null, null, null, null]);
    const [raidType, setRaidType] = useState<'damage' | 'kill' | 'kidnap'>('damage');
    const [raidPressure, setRaidPressure] = useState(50);
    
    // Raid Logistics (Inventory Slots)
    const [raidLogistics, setRaidLogistics] = useState<{
        intel: string | null;
        weapons: string | null;
        vehicle: string | null;
    }>({ intel: null, weapons: null, vehicle: null });

    // Modals
    const [selectingRaidSlot, setSelectingRaidSlot] = useState<number | null>(null);
    const [selectingLogisticsType, setSelectingLogisticsType] = useState<'intel' | 'weapons' | 'vehicle' | null>(null);

    if (!gameState) return null;

    const leader = gameState.crew.find(c => c.isLeader) || gameState.crew[0];
    const leaderLevel = leader.level;
    const canDoublePatrol = leaderLevel >= 5;

    // Filter available crew (not leader, not busy elsewhere)
    const availableCrew = gameState.crew.filter(c => {
        if (c.isLeader) return false;
        
        // Check if busy in other operations
        const isBusyElsewhere = gameState.holdings.some(h => 
            h.id !== racketHolding?.id && 
            (h.cornerData?.assignedCrewIds.includes(c.id) || h.brothelData?.securityCrewIds.includes(c.id))
        );
        
        // Check if busy in Raid Party (if checking for Defense)
        // Check if busy in Defense (if checking for Raid)
        // For simplicity in combined view:
        // A member can be in Defense OR Raid, but logic below handles assignment overlap check dynamically
        
        return !isBusyElsewhere;
    });

    // --- HANDLERS ---

    const toggleDefenseCrew = (id: string) => {
        // If in raid party, remove from raid
        if (raidParty.includes(id)) {
            setRaidParty(prev => prev.map(pid => pid === id ? null : pid));
        }

        if (selectedDefenseCrew.includes(id)) {
            if (selectedDefenseCrew.length > 1) {
                const newSelection = selectedDefenseCrew.filter(c => c !== id);
                setSelectedDefenseCrew(newSelection);
                if (racketHolding) handleUpdateProtection(racketHolding.id, newSelection);
            } else {
                alert("Protection Racket requires at least 1 defender.");
            }
        } else {
            if (selectedDefenseCrew.length < 3) {
                const newSelection = [...selectedDefenseCrew, id];
                setSelectedDefenseCrew(newSelection);
                if (racketHolding) handleUpdateProtection(racketHolding.id, newSelection);
            }
        }
    };

    const handleSetPatrolLevel = (level: number) => {
        if (level === 2 && !canDoublePatrol) return;
        if (racketHolding) {
            handleUpdateProtection(racketHolding.id, selectedDefenseCrew, { patrolLevel: level });
        }
    };

    const assignRaidMember = (slotIndex: number, memberId: string) => {
        // Remove from Defense if present
        if (selectedDefenseCrew.includes(memberId)) {
            if (selectedDefenseCrew.length <= 1) {
                alert("Cannot pull the last defender from Protection!");
                return;
            }
            const newDefense = selectedDefenseCrew.filter(c => c !== memberId);
            setSelectedDefenseCrew(newDefense);
            if (racketHolding) handleUpdateProtection(racketHolding.id, newDefense);
        }

        const newParty = [...raidParty];
        // Remove member from other raid slots if present
        const existingIdx = newParty.indexOf(memberId);
        if (existingIdx !== -1) newParty[existingIdx] = null;
        
        newParty[slotIndex] = memberId;
        setRaidParty(newParty);
        setSelectingRaidSlot(null);
    };

    const removeRaidMember = (slotIndex: number) => {
        const newParty = [...raidParty];
        newParty[slotIndex] = null;
        setRaidParty(newParty);
    };

    const handleLogisticsSelect = (itemId: string) => {
        if (selectingLogisticsType) {
            setRaidLogistics(prev => ({ ...prev, [selectingLogisticsType]: itemId }));
            setSelectingLogisticsType(null);
        }
    };

    const handleClearLogistics = (type: 'intel' | 'weapons' | 'vehicle', e: React.MouseEvent) => {
        e.stopPropagation();
        setRaidLogistics(prev => ({ ...prev, [type]: null }));
    };

    // Calculate Raid Power
    const raidPartyPower = raidParty.reduce((acc, memberId) => {
        if (!memberId) return acc;
        const member = gameState.crew.find(c => c.id === memberId);
        if (!member) return acc;
        
        let power = member.stats.strength * 2 + member.level * 5;
        if (member.equipment?.main_hand) power += 20; 
        return acc + power;
    }, 0);

    // Logistics Power Bonus
    const logisticsBonus = 
        (raidLogistics.weapons ? 25 : 0) + 
        (raidLogistics.vehicle ? 15 : 0) + 
        (raidLogistics.intel ? 10 : 0);

    const totalPower = raidPartyPower + logisticsBonus;

    const handleRaidAction = () => {
        if (raidPartyPower === 0) {
            alert("Assign crew to the Raid Party first.");
            return;
        }
        
        let pressureLabel = "";
        if (raidPressure < 30) pressureLabel = "Patient (1 Week)";
        else if (raidPressure > 70) pressureLabel = "Rush (3 Hours)";
        else pressureLabel = "Standard";

        alert(`Launching ${raidType.toUpperCase()} Raid!\nTotal Power: ${totalPower} (Crew: ${raidPartyPower} + Assets: ${logisticsBonus})\nAssets: ${raidLogistics.intel ? 'Intel' : '-'} / ${raidLogistics.weapons ? 'Weps' : '-'} / ${raidLogistics.vehicle ? 'Car' : '-'}\nTempo: ${pressureLabel}`);
    };

    const getPressureLabel = (val: number) => {
        if (val < 30) return "Methodical";
        if (val > 70) return "Blitzkrieg";
        return "Standard";
    };

    const getPressureDescription = (val: number) => {
        if (val < 30) return "High Intel / Low Risk / 1 Week";
        if (val > 70) return "High Damage / High Risk / 3 Hours";
        return "Balanced Approach / 24 Hours";
    };

    const getAvailableLogisticsItems = (type: 'intel' | 'weapons' | 'vehicle') => {
        return gameState.inventory.filter(item => {
            const def = ITEMS[item.itemId];
            if (!def) return false;
            
            if (type === 'vehicle') return def.name.toLowerCase().includes('car') || def.name.toLowerCase().includes('vehicle');
            if (type === 'weapons') return def.type === 'weapon';
            if (type === 'intel') return item.itemId === 'burner' || def.name.toLowerCase().includes('intel');
            return false;
        });
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 font-waze overflow-hidden">
            
            <div className="flex-grow overflow-y-auto custom-scrollbar">
                
                {/* --- PROTECTION SECTION (COMPACT) --- */}
                <div className="bg-slate-100 p-4 border-b-2 border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-xl">🛡️</span>
                        <h3 className="font-black text-slate-700 uppercase tracking-widest text-sm">Turf Protection</h3>
                        {hasRacket && (
                            <span className="ml-auto text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                                Active (+{racketHolding.income}/d)
                            </span>
                        )}
                    </div>

                    {hasRacket ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    {selectedDefenseCrew.map(id => {
                                        const m = gameState.crew.find(c => c.id === id);
                                        return (
                                            <div key={id} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden relative z-10 shadow-sm" title={m?.name}>
                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m?.imageSeed}`} className="w-full h-full object-cover" />
                                            </div>
                                        );
                                    })}
                                    {selectedDefenseCrew.length < 3 && (
                                        <button 
                                            className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-600 hover:border-slate-400 text-lg z-0"
                                            onClick={() => alert("Manage Defense via Crew roster or drag-drop (Coming Soon)")}
                                        >
                                            +
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Defenders</span>
                                    <span className="text-xs font-black text-slate-800">{selectedDefenseCrew.length} / 3 Assigned</span>
                                </div>
                            </div>

                            {/* Patrol Toggle */}
                            <button
                                onClick={() => handleSetPatrolLevel(patrolLevel === 1 ? 2 : 1)}
                                disabled={!canDoublePatrol && patrolLevel === 1}
                                className={`px-4 py-2 rounded-lg border-2 text-[9px] font-bold uppercase transition-all
                                    ${patrolLevel === 2 
                                        ? 'bg-slate-800 text-white border-slate-900 shadow-md' 
                                        : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-white'}
                                `}
                            >
                                {patrolLevel === 2 ? 'Heavy Patrol' : 'Standard Patrol'}
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-4 flex items-center gap-4 opacity-70">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-xl">🚫</div>
                            <div>
                                <div className="text-xs font-black text-slate-600 uppercase">No Active Racket</div>
                                <div className="text-[9px] text-slate-400">Tag a block and select "Establish Protection" to secure turf.</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- RAIDING SECTION (EXPANDED) --- */}
                <div className="p-4 space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">⚔️</span>
                        <h3 className="font-black text-red-700 uppercase tracking-widest text-sm">Raid Operations</h3>
                    </div>

                    {/* 1. Objective Selector */}
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'damage', label: 'Vandalize', icon: '🔨', desc: 'Lower Control' },
                            { id: 'kidnap', label: 'Abduct', icon: '🚐', desc: 'Ransom Money' },
                            { id: 'kill', label: 'Liquidate', icon: '☠️', desc: 'Eliminate' }
                        ].map(opt => (
                            <button 
                                key={opt.id}
                                onClick={() => setRaidType(opt.id as any)}
                                className={`py-3 px-1 rounded-xl border-2 flex flex-col items-center justify-center transition-all
                                    ${raidType === opt.id 
                                        ? 'bg-red-50 border-red-500 shadow-md' 
                                        : 'bg-white border-slate-200 hover:border-red-200'}
                                `}
                            >
                                <span className="text-xl mb-1">{opt.icon}</span>
                                <span className={`text-[9px] font-black uppercase ${raidType === opt.id ? 'text-red-700' : 'text-slate-600'}`}>{opt.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* 2. Raid Crew Slots */}
                    <div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Assault Team</div>
                        <div className="grid grid-cols-4 gap-3">
                            {[0, 1, 2, 3].map(slotIdx => {
                                const memberId = raidParty[slotIdx];
                                const member = memberId ? gameState.crew.find(c => c.id === memberId) : null;
                                
                                return (
                                    <button 
                                        key={slotIdx}
                                        onClick={() => setSelectingRaidSlot(slotIdx)}
                                        className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative overflow-hidden transition-all
                                            ${member ? 'bg-white border-slate-800 shadow-sm' : 'bg-slate-100 border-dashed border-slate-300 hover:bg-slate-200'}
                                        `}
                                    >
                                        {member ? (
                                            <>
                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.imageSeed}`} className="w-full h-full object-cover opacity-80" />
                                                <div className="absolute bottom-0 w-full bg-slate-900 text-white text-[7px] font-black uppercase py-0.5 text-center truncate px-1">
                                                    {member.name}
                                                </div>
                                                <div 
                                                    onClick={(e) => { e.stopPropagation(); removeRaidMember(slotIdx); }}
                                                    className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold z-10"
                                                >
                                                    ✕
                                                </div>
                                            </>
                                        ) : (
                                            <span className="text-2xl text-slate-300">+</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. Raid Logistics (Waze-style buttons) */}
                    <div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Raid Logistics</div>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { type: 'intel', label: 'Intel', icon: '🧠', itemId: raidLogistics.intel },
                                { type: 'weapons', label: 'Arsenal', icon: '🔫', itemId: raidLogistics.weapons },
                                { type: 'vehicle', label: 'Transport', icon: '🚗', itemId: raidLogistics.vehicle },
                            ].map((slot) => {
                                const itemDef = slot.itemId ? ITEMS[slot.itemId] : null;
                                return (
                                    <button
                                        key={slot.type}
                                        onClick={() => setSelectingLogisticsType(slot.type as any)}
                                        className={`
                                            h-20 rounded-2xl flex flex-col items-center justify-center gap-1 border-2 transition-all relative group
                                            ${itemDef 
                                                ? 'bg-amber-50 border-amber-400 shadow-sm' 
                                                : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-sm'
                                            }
                                        `}
                                    >
                                        <div className="text-2xl filter drop-shadow-sm">{itemDef ? itemDef.icon : slot.icon}</div>
                                        <div className={`text-[9px] font-black uppercase tracking-wide ${itemDef ? 'text-amber-800' : 'text-slate-500'}`}>
                                            {itemDef ? (
                                                <span className="truncate max-w-[60px] block">{itemDef.name}</span>
                                            ) : slot.label}
                                        </div>
                                        
                                        {/* Clear Button (if filled) */}
                                        {itemDef && (
                                            <div 
                                                onClick={(e) => handleClearLogistics(slot.type as any, e)}
                                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ✕
                                            </div>
                                        )}
                                        {/* Add Indicator (if empty) */}
                                        {!itemDef && (
                                            <div className="absolute top-1 right-1 w-4 h-4 bg-slate-100 rounded-full flex items-center justify-center text-[8px] text-slate-400 border border-slate-200">
                                                +
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 4. Pressure Slider */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Operational Tempo</span>
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${raidPressure > 70 ? 'bg-red-100 text-red-600' : raidPressure < 30 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                                {getPressureLabel(raidPressure)}
                            </span>
                        </div>
                        <input 
                            type="range" min="0" max="100" value={raidPressure} 
                            onChange={(e) => setRaidPressure(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600 mb-2"
                        />
                        <div className="text-[9px] text-slate-400 text-center italic">
                            {getPressureDescription(raidPressure)}
                        </div>
                    </div>

                    {/* 5. Launch Button */}
                    <button 
                        onClick={handleRaidAction}
                        className="w-full py-4 bg-red-700 text-white font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-red-600 border-b-4 border-red-900 active:border-b-0 active:translate-y-0.5 flex items-center justify-center gap-3 transition-all"
                    >
                        <span>Launch Raid</span>
                        <div className="bg-red-800 px-2 py-0.5 rounded text-[10px] font-mono opacity-80">PWR {totalPower}</div>
                    </button>

                </div>
            </div>

            {/* --- MODAL: CREW SELECTOR --- */}
            {selectingRaidSlot !== null && (
                <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex flex-col p-6 animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-white font-black uppercase tracking-widest text-lg">Select Raider</h3>
                        <button onClick={() => setSelectingRaidSlot(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
                    </div>
                    <div className="flex-grow overflow-y-auto custom-scrollbar space-y-2">
                        {availableCrew.length === 0 && <div className="text-slate-500 text-center text-xs italic">No available crew.</div>}
                        {availableCrew.map(c => {
                            const inDefense = selectedDefenseCrew.includes(c.id);
                            return (
                                <button 
                                    key={c.id}
                                    onClick={() => assignRaidMember(selectingRaidSlot, c.id)}
                                    className={`w-full flex items-center gap-4 p-3 rounded-xl border-2 transition-all text-left group
                                        ${inDefense ? 'bg-amber-900/20 border-amber-700/50' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}
                                    `}
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden border-2 border-slate-600">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.imageSeed}`} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-white uppercase">{c.name}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                            Lvl {c.level} • {c.pawnType || 'Soldier'}
                                            {inDefense && <span className="text-amber-500 ml-2">(On Patrol)</span>}
                                        </div>
                                    </div>
                                    {inDefense && <div className="ml-auto text-amber-500 text-xs font-bold">⚠️</div>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* --- MODAL: INVENTORY PICKER --- */}
            {selectingLogisticsType !== null && (
                <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex flex-col p-6 animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-white font-black uppercase tracking-widest text-lg">Select {selectingLogisticsType}</h3>
                        <button onClick={() => setSelectingLogisticsType(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 overflow-y-auto custom-scrollbar content-start">
                        {getAvailableLogisticsItems(selectingLogisticsType).map((invItem) => {
                            const def = ITEMS[invItem.itemId];
                            return (
                                <button 
                                    key={invItem.id}
                                    onClick={() => handleLogisticsSelect(invItem.itemId)}
                                    className="aspect-square bg-slate-800 rounded-xl border-2 border-slate-700 hover:border-amber-500 flex flex-col items-center justify-center p-2 group transition-all"
                                >
                                    <div className="text-3xl mb-2 filter drop-shadow-md group-hover:scale-110 transition-transform">{def.icon}</div>
                                    <div className="text-[8px] font-black text-slate-300 uppercase text-center leading-tight">{def.name}</div>
                                    <div className="mt-1 text-[8px] font-bold bg-slate-900 text-slate-500 px-1.5 rounded">x{invItem.quantity}</div>
                                </button>
                            );
                        })}
                        {getAvailableLogisticsItems(selectingLogisticsType).length === 0 && (
                            <div className="col-span-3 text-center text-slate-500 text-xs italic py-8 border-2 border-dashed border-slate-700 rounded-xl">
                                No valid items in inventory.
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};

export default ThugOperations;
