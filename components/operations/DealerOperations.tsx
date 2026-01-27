
import React, { useState, useEffect } from 'react';
import { Holding } from '../../types';
import { useGameEngine } from '../../contexts/GameEngineContext';
import { ITEMS } from '../../constants';

interface DealerOperationsProps {
    holdings: Holding[];
}

// --- CONFIGURATION CONSTANTS ---

const DRUG_RECIPES = [
    { 
        id: 'crack', 
        name: 'Crack Cocaine', 
        outputLabel: 'Crack Rock',
        tool: { name: 'Metal Spoon', icon: '🥄' }, 
        inputs: [
            { name: 'Powder Cocaine', icon: '🍚' },
            { name: 'Baking Soda', icon: '🧂' },
            { name: 'Glass Vials', icon: '🧪' }
        ],
        baseTimeMs: 10000, // 10s
        displayTime: '1 Hour',
        batchSize: 10,
        difficulty: 1
    },
    { 
        id: 'heroin', 
        name: 'Street Heroin', 
        outputLabel: 'Heroin Dose',
        tool: { name: 'Sifting Screen', icon: '🕸️' }, 
        inputs: [
            { name: 'Heroin Base', icon: '🟤' },
            { name: 'Lactose Powder', icon: '🥛' },
            { name: 'Glassine Envelopes', icon: '✉️' }
        ],
        baseTimeMs: 20000, // 20s
        displayTime: '4 Hours',
        batchSize: 20,
        difficulty: 2
    },
    { 
        id: 'ecstasy', 
        name: 'Ecstasy (MDMA)', 
        outputLabel: 'Ecstasy Pill',
        tool: { name: 'Hand Pill Press', icon: '⚙️' }, 
        inputs: [
            { name: 'MDMA Powder', icon: '🔮' },
            { name: 'Magnesium Stearate', icon: '💊' },
            { name: 'Dye Pellets', icon: '🎨' }
        ],
        baseTimeMs: 40000, // 40s
        displayTime: '8 Hours',
        batchSize: 50,
        difficulty: 3
    },
    { 
        id: 'ketamine', 
        name: 'Ketamine', 
        outputLabel: 'Ketamine Powder',
        tool: { name: 'Hot Plate', icon: '♨️' }, 
        inputs: [
            { name: 'Ketamine Vials', icon: '💉' },
            { name: 'Denatured Alcohol', icon: '🍶' },
            { name: 'Pen Casing', icon: '🖊️' }
        ],
        baseTimeMs: 60000, // 60s
        displayTime: '12 Hours',
        batchSize: 15,
        difficulty: 4
    }
];

const LAB_UPGRADES = [
    { 
        id: 'scanner', 
        label: 'Police Scanner', 
        icon: '📻', 
        desc: 'Detects raids early. Reduces Heat generation by 10% per level.', 
        maxLevel: 3, 
        baseCost: 500,
        stat: 'heatReduction'
    },
    { 
        id: 'ppe', 
        label: 'PPE Gear', 
        icon: '🥽', 
        desc: 'Gloves and masks. Reduces accident chance by 15% per level.', 
        maxLevel: 3, 
        baseCost: 300,
        stat: 'safety'
    },
    { 
        id: 'ventilation', 
        label: 'Ventilation', 
        icon: '💨', 
        desc: 'Industrial fans. Increases batch size speed. Restricted in Tenements.', 
        maxLevel: 3, 
        baseCost: 2000,
        stat: 'speed',
        restrictedIn: ['tenement'] 
    },
    { 
        id: 'scale', 
        label: 'Digital Scale', 
        icon: '⚖️', 
        desc: 'Precision measurement. Increases yield by 10% per level.', 
        maxLevel: 3, 
        baseCost: 800,
        stat: 'yield'
    },
    { 
        id: 'sealer', 
        label: 'Heat Sealer', 
        icon: '🔌', 
        desc: 'Professional packaging. Increases sell value by 5% per level.', 
        maxLevel: 3, 
        baseCost: 1200,
        stat: 'value'
    }
];

const DealerOperations: React.FC<DealerOperationsProps> = ({ holdings }) => {
    const { gameState, updateSave, triggerConsigliere, handleUpdateCorner } = useGameEngine();
    
    // --- STATE ---
    const [activeTab, setActiveTab] = useState<'production' | 'distribution'>('production');
    
    // Lab UI State
    const [selectedRecipeId, setSelectedRecipeId] = useState<string>(DRUG_RECIPES[0].id);
    const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
    const [showUpgrades, setShowUpgrades] = useState(false);
    const [showSupply, setShowSupply] = useState(false);
    
    // Distribution UI State
    const [managingCornerId, setManagingCornerId] = useState<string | null>(null);
    const [cornerConfig, setCornerConfig] = useState<{ cut: number, price: number, crew: string[] }>({ cut: 50, price: 50, crew: [] });

    // Active Data
    const activeLabHolding = holdings.find(h => h.labData?.active);
    const cornerHoldings = holdings.filter(h => h.type === 'corner');
    
    // Timer
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    if (!gameState) return null;

    // --- DERIVED DATA ---
    const housingType = gameState.playerHousing?.type || 'tenement';
    
    // Lab Data
    const currentLabData = activeLabHolding?.labData || {
        active: false,
        upgrades: { scanner: 0, ppe: 0, vent: 0, scale: 0, sealer: 0 },
        activeBatch: null,
        heat: 10,
        stash: {} // Ingredients stash
    };
    const labStash = currentLabData.stash || {};

    const currentRecipe = DRUG_RECIPES.find(r => r.id === selectedRecipeId)!;

    // Crew Filtering
    const getAvailableCrew = (excludeIds: string[] = []) => {
        return gameState.crew.filter(c => {
            if (c.isLeader) return false;
            if (excludeIds.includes(c.id)) return true; // Include if actively selected in current context

            // Check if busy elsewhere
            const isBusyElsewhere = gameState.holdings.some(h => 
                h.id !== activeLabHolding?.id && h.id !== managingCornerId && // Ignore current context holding
                (h.cornerData?.assignedCrewIds.includes(c.id) || h.protectionData?.assignedCrewIds.includes(c.id))
            );
            
            // Check active batch assignment
            if (currentLabData.activeBatch?.assignedCrew.includes(c.id)) return false;

            return !isBusyElsewhere;
        });
    };

    // --- ACTIONS: LAB ---

    const handleEstablishLab = (propertyId: string) => {
        if (gameState.money < 2000) return alert("Need N$ 2000");
        const newHoldings = holdings.map(h => {
            if (h.id === propertyId) {
                return { ...h, labData: { active: true, upgrades: { scanner: 0, ppe: 0, vent: 0, scale: 0, sealer: 0 }, heat: 10, stash: {} } };
            }
            return h;
        });
        updateSave({ ...gameState, money: gameState.money - 2000, holdings: newHoldings });
        triggerConsigliere("Lab established. Get cooking.");
    };

    const handleBuySupply = (name: string, cost: number) => {
        if (gameState.money < cost) return alert("Insufficient Funds");
        
        const newStash = { ...labStash, [name]: (labStash[name] || 0) + 10 };
        
        const newHoldings = holdings.map(h => {
            if (h.id === activeLabHolding?.id) {
                return { ...h, labData: { ...h.labData, stash: newStash } };
            }
            return h;
        });

        updateSave({ ...gameState, money: gameState.money - cost, holdings: newHoldings });
    };

    const handleUpgrade = (upgradeId: string) => {
        const upgrade = LAB_UPGRADES.find(u => u.id === upgradeId)!;
        const currentLevel = currentLabData.upgrades[upgradeId] || 0;
        
        if (upgrade.restrictedIn?.includes(housingType) && currentLevel >= 1) {
            alert(`Cannot upgrade ${upgrade.label} further in a ${housingType}.`);
            return;
        }
        if (currentLevel >= upgrade.maxLevel) return;
        
        const cost = upgrade.baseCost * (currentLevel + 1);
        if (gameState.money < cost) return alert("Insufficient Funds");

        const newHoldings = holdings.map(h => {
            if (h.id === activeLabHolding?.id) {
                return {
                    ...h,
                    labData: {
                        ...h.labData,
                        upgrades: { ...h.labData.upgrades, [upgradeId]: currentLevel + 1 }
                    }
                };
            }
            return h;
        });

        updateSave({ ...gameState, money: gameState.money - cost, holdings: newHoldings });
        triggerConsigliere(`${upgrade.label} upgraded to Level ${currentLevel + 1}.`);
    };

    const handleStartBatch = () => {
        const missing = currentRecipe.inputs.filter(ing => (labStash[ing.name] || 0) < 1);
        if (missing.length > 0) {
            alert(`Missing ingredients: ${missing.map(m => m.name).join(', ')}`);
            return;
        }

        const newStash = { ...labStash };
        currentRecipe.inputs.forEach(ing => {
            newStash[ing.name] -= 1;
        });

        const ventLevel = currentLabData.upgrades.vent || 0;
        const crewBonus = selectedCrew.length * 0.15;
        const speedMultiplier = 1 + (ventLevel * 0.2) + crewBonus;
        const duration = currentRecipe.baseTimeMs / speedMultiplier;
        const finishTime = Date.now() + duration;

        const scaleLevel = currentLabData.upgrades.scale || 0;
        const baseYield = currentRecipe.batchSize;
        const finalYield = Math.floor(baseYield * (1 + (scaleLevel * 0.1)));

        const newHoldings = holdings.map(h => {
            if (h.id === activeLabHolding?.id) {
                return {
                    ...h,
                    labData: {
                        ...h.labData,
                        stash: newStash,
                        activeBatch: {
                            recipeId: currentRecipe.id,
                            startTime: Date.now(),
                            finishTime,
                            assignedCrew: selectedCrew,
                            yield: finalYield
                        }
                    }
                };
            }
            return h;
        });

        updateSave({ ...gameState, holdings: newHoldings });
        setSelectedCrew([]);
    };

    const handleCollectBatch = () => {
        if (!currentLabData.activeBatch) return;
        const batch = currentLabData.activeBatch;
        const recipe = DRUG_RECIPES.find(r => r.id === batch.recipeId)!;
        
        let itemId = 'meth'; 
        if (recipe.id === 'crack') itemId = 'coke';
        else if (recipe.id === 'heroin') itemId = 'meth'; // Use meth item ID for heroin logic for now or add new
        else if (recipe.id === 'ecstasy') itemId = 'stimpack';
        else if (recipe.id === 'ketamine') itemId = 'painkillers';

        const newInventory = [...gameState.inventory];
        const existing = newInventory.find(i => i.itemId === itemId);
        if (existing) existing.quantity += batch.yield;
        else newInventory.push({ id: Math.random().toString(), itemId, quantity: batch.yield });

        const newHoldings = holdings.map(h => {
            if (h.id === activeLabHolding?.id) {
                return { ...h, labData: { ...h.labData, activeBatch: null } };
            }
            return h;
        });

        updateSave({ ...gameState, inventory: newInventory, holdings: newHoldings });
        triggerConsigliere(`Batch complete. ${batch.yield} units added.`);
    };

    // --- ACTIONS: CORNER ---

    const handleOpenCornerManage = (cornerId: string) => {
        const h = holdings.find(ho => ho.id === cornerId);
        if (!h) return;
        setManagingCornerId(cornerId);
        setCornerConfig({
            cut: h.cornerData?.productionConfig?.cut ?? 50,
            price: h.cornerData?.productionConfig?.price ?? 50,
            crew: h.cornerData?.assignedCrewIds || []
        });
    };

    const handleSaveCorner = () => {
        if (!managingCornerId) return;
        handleUpdateCorner(managingCornerId, cornerConfig.crew, ['Product'], { cut: cornerConfig.cut, price: cornerConfig.price });
        setManagingCornerId(null);
    };

    const toggleCornerCrew = (id: string) => {
        const current = cornerConfig.crew;
        if (current.includes(id)) {
            setCornerConfig(p => ({ ...p, crew: p.crew.filter(c => c !== id) }));
        } else if (current.length < 3) {
            setCornerConfig(p => ({ ...p, crew: [...p.crew, id] }));
        }
    };

    // --- RENDER HELPERS ---

    const renderOverlay = (title: string, onClose: () => void, children: React.ReactNode) => (
        <div className="absolute inset-0 bg-slate-900/95 z-20 flex flex-col animate-fade-in p-6">
            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                <h3 className="text-xl font-black text-white uppercase font-news tracking-tight">{title}</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-white font-bold px-3 py-1 bg-slate-800 rounded">✕ CLOSE</button>
            </div>
            <div className="flex-grow overflow-y-auto custom-scrollbar">
                {children}
            </div>
        </div>
    );

    if (!activeLabHolding && activeTab === 'production') {
        const potentialProperties = holdings.filter(h => h.type === 'residential' && h.ownerFaction === 'player');
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in bg-slate-50">
                <div className="text-6xl mb-4 text-slate-300">⚗️</div>
                <h3 className="text-xl font-black text-slate-700 uppercase mb-2">Establish Lab</h3>
                <p className="text-xs text-slate-500 max-w-md mb-6">Select a residential property to convert into a chemical production facility.</p>
                <div className="w-full max-w-sm space-y-2">
                    {potentialProperties.map(h => (
                        <button key={h.id} onClick={() => handleEstablishLab(h.id)} className="w-full p-4 bg-white border-2 border-emerald-200 rounded-xl hover:border-emerald-500 shadow-sm flex justify-between items-center group">
                            <div className="text-left"><div className="font-bold text-slate-800 text-xs uppercase">{h.name}</div><div className="text-[9px] text-slate-400">Block {h.x}-{h.y}</div></div>
                            <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">N$ 2000</div>
                        </button>
                    ))}
                    {potentialProperties.length === 0 && <div className="text-xs font-bold text-red-400">No properties available.</div>}
                </div>
            </div>
        );
    }

    const batch = currentLabData.activeBatch;
    const isBatchActive = !!batch;
    const isBatchReady = batch && now >= batch.finishTime;
    
    // Progress
    let progress = 0;
    let timeLeftStr = "";
    if (batch) {
        const total = batch.finishTime - batch.startTime;
        const elapsed = now - batch.startTime;
        progress = Math.min(100, (elapsed / total) * 100);
        const secondsLeft = Math.max(0, Math.ceil((batch.finishTime - now) / 1000));
        timeLeftStr = secondsLeft > 60 ? `${Math.ceil(secondsLeft/60)}m` : `${secondsLeft}s`;
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 font-waze relative overflow-hidden">
            
            {/* TAB NAV */}
            <div className="flex bg-slate-900 border-b border-slate-800 flex-shrink-0 px-4 pt-2">
                 <button onClick={() => setActiveTab('production')} className={`px-8 py-4 text-sm font-black uppercase tracking-widest transition-all rounded-t-lg flex items-center gap-2 ${activeTab === 'production' ? 'bg-slate-50 text-slate-900 translate-y-0.5' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}>
                     <span className="text-lg">🧪</span> Production
                 </button>
                 <button onClick={() => setActiveTab('distribution')} className={`px-8 py-4 text-sm font-black uppercase tracking-widest transition-all rounded-t-lg flex items-center gap-2 ${activeTab === 'distribution' ? 'bg-slate-50 text-slate-900 translate-y-0.5' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}>
                     <span className="text-lg">🏙️</span> Distribution
                 </button>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-grow relative overflow-hidden bg-slate-50 p-6">
                
                {/* --- PRODUCTION TAB --- */}
                {activeTab === 'production' && activeLabHolding && (
                    <div className="h-full flex flex-col gap-6">
                        {/* 1. Header Card */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                            <div>
                                <h3 className="font-black text-slate-800 uppercase text-lg">{activeLabHolding.name}</h3>
                                <div className="flex gap-4 text-[10px] font-bold uppercase text-slate-500 mt-1">
                                    <span>Heat: <span className="text-red-500">{currentLabData.heat}%</span></span>
                                    <span>Equipment: Lvl {currentLabData.upgrades.scale + 1}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setShowUpgrades(true)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-black uppercase text-slate-600 border border-slate-300 flex items-center gap-2 transition-all">
                                    <span>🔧</span> Equipment
                                </button>
                                <button onClick={() => setShowSupply(true)} className="px-4 py-2 bg-amber-50 hover:bg-amber-100 rounded-lg text-[10px] font-black uppercase text-amber-700 border border-amber-200 flex items-center gap-2 transition-all">
                                    <span>📦</span> Supplier
                                </button>
                            </div>
                        </div>

                        {/* 2. Main Floor */}
                        <div className="flex-grow flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                            {isBatchActive ? (
                                <div className="bg-slate-800 rounded-xl p-8 text-white border-2 border-slate-700 shadow-lg relative overflow-hidden flex flex-col items-center justify-center flex-grow">
                                    <div className="absolute inset-0 bg-emerald-900/20 animate-pulse"></div>
                                    <div className="relative z-10 w-full max-w-lg text-center">
                                        <div className="text-4xl mb-4">⚗️</div>
                                        <h2 className="text-2xl font-black uppercase tracking-widest mb-2">Synthesizing...</h2>
                                        <div className="text-emerald-400 font-mono text-4xl font-bold mb-6">{isBatchReady ? 'COMPLETE' : timeLeftStr}</div>
                                        
                                        <div className="w-full h-4 bg-slate-900 rounded-full border border-slate-600 overflow-hidden mb-8">
                                            <div className="h-full bg-emerald-500 transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }}></div>
                                        </div>

                                        {isBatchReady && (
                                            <button onClick={handleCollectBatch} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-xl shadow-xl transition-all transform hover:scale-105">
                                                Collect Product
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col lg:flex-row gap-6 h-full">
                                    {/* Recipe Selector */}
                                    <div className="w-full lg:w-1/3 bg-white border border-slate-200 rounded-xl p-4 overflow-y-auto custom-scrollbar">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Formulas</h4>
                                        <div className="space-y-2">
                                            {DRUG_RECIPES.map(r => (
                                                <button key={r.id} onClick={() => setSelectedRecipeId(r.id)} className={`w-full p-3 rounded-lg border-2 text-left transition-all ${selectedRecipeId === r.id ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                                                    <div className="font-black text-xs uppercase text-slate-800">{r.name}</div>
                                                    <div className="text-[9px] text-slate-500">{r.displayTime} • Lvl {r.difficulty}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Setup Panel */}
                                    <div className="w-full lg:w-2/3 bg-white border border-slate-200 rounded-xl p-6 flex flex-col">
                                        <div className="flex justify-between mb-6 border-b border-slate-100 pb-4">
                                            <h3 className="text-xl font-black text-slate-800 uppercase">{currentRecipe.outputLabel}</h3>
                                            <div className="text-right">
                                                <div className="text-[10px] text-slate-400 uppercase font-bold">Yield Estimate</div>
                                                <div className="text-lg font-mono font-bold text-emerald-600">{currentRecipe.batchSize} Units</div>
                                            </div>
                                        </div>

                                        {/* Ingredients */}
                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            {currentRecipe.inputs.map((ing, i) => {
                                                const has = (labStash[ing.name] || 0) > 0;
                                                return (
                                                    <div key={i} className={`p-3 rounded-lg border flex flex-col items-center text-center ${has ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-200'}`}>
                                                        <div className="text-xl mb-1">{ing.icon}</div>
                                                        <div className="text-[9px] font-bold text-slate-600 uppercase">{ing.name}</div>
                                                        <div className={`text-[8px] font-black uppercase mt-1 ${has ? 'text-emerald-600' : 'text-red-500'}`}>{has ? `Ready (${labStash[ing.name]})` : 'Missing'}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Crew */}
                                        <div className="mb-6 flex-grow">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assign Lab Techs</div>
                                            <div className="flex gap-2 flex-wrap">
                                                {getAvailableCrew(selectedCrew).map(c => {
                                                    const sel = selectedCrew.includes(c.id);
                                                    return (
                                                        <button key={c.id} onClick={() => { sel ? setSelectedCrew(p => p.filter(id => id !== c.id)) : setSelectedCrew(p => [...p, c.id]) }} className={`flex items-center gap-2 p-1.5 pr-3 rounded-full border transition-all ${sel ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                                            <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.imageSeed}`} /></div>
                                                            <span className={`text-[9px] font-bold uppercase ${sel ? 'text-blue-800' : 'text-slate-600'}`}>{c.name}</span>
                                                        </button>
                                                    );
                                                })}
                                                {getAvailableCrew(selectedCrew).length === 0 && <div className="text-[10px] text-slate-400 italic">No available crew.</div>}
                                            </div>
                                        </div>

                                        <button onClick={handleStartBatch} className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-lg hover:bg-emerald-600 transition-all">Start Production</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* OVERLAYS */}
                        {showUpgrades && renderOverlay("Lab Equipment", () => setShowUpgrades(false), (
                            <div className="grid grid-cols-2 gap-4">
                                {LAB_UPGRADES.map(u => {
                                    const lvl = currentLabData.upgrades[u.id] || 0;
                                    const cost = u.baseCost * (lvl + 1);
                                    const maxed = lvl >= u.maxLevel;
                                    return (
                                        <div key={u.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex gap-4">
                                            <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-2xl">{u.icon}</div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between"><h4 className="font-bold text-white text-sm uppercase">{u.label}</h4><span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 border border-slate-700">Lvl {lvl}</span></div>
                                                <p className="text-[10px] text-slate-400 mt-1 mb-2">{u.desc}</p>
                                                {!maxed ? (
                                                    <button onClick={() => handleUpgrade(u.id)} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded">Upgrade (N$ {cost})</button>
                                                ) : <div className="text-[10px] text-emerald-500 font-bold uppercase text-center bg-emerald-900/20 py-1 rounded">Max Level</div>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}

                        {showSupply && renderOverlay("Supply Network", () => setShowSupply(false), (
                            <div className="grid grid-cols-3 gap-4">
                                {Array.from(new Set(DRUG_RECIPES.flatMap(r => r.inputs))).map((ing, i) => (
                                    <button key={i} onClick={() => handleBuySupply(ing.name, 200)} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-amber-500 transition-all text-left group">
                                        <div className="flex justify-between mb-2"><span className="text-3xl group-hover:scale-110 transition-transform">{ing.icon}</span><span className="text-[10px] font-mono text-slate-400">Owned: {labStash[ing.name] || 0}</span></div>
                                        <div className="font-bold text-white text-xs uppercase mb-1">{ing.name}</div>
                                        <div className="text-[10px] text-emerald-400 font-mono">Buy 10 (N$ 200)</div>
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                )}

                {/* --- DISTRIBUTION TAB --- */}
                {activeTab === 'distribution' && (
                    <div className="h-full flex flex-col gap-6">
                        {cornerHoldings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                                <span className="text-6xl mb-4 grayscale">🏙️</span>
                                <h3 className="text-xl font-black text-slate-800 uppercase">No Active Turf</h3>
                                <p className="text-sm text-slate-500 max-w-sm mt-2">Visit blocks on the map and use "Claim Corner" to expand your distribution network.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 overflow-y-auto custom-scrollbar">
                                {cornerHoldings.map(corner => {
                                    const isManaging = managingCornerId === corner.id;
                                    const crewIds = isManaging ? cornerConfig.crew : (corner.cornerData?.assignedCrewIds || []);
                                    
                                    return (
                                        <div key={corner.id} className={`bg-white border-2 rounded-xl p-4 shadow-sm transition-all ${isManaging ? 'border-blue-500 ring-4 ring-blue-100' : 'border-slate-200'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl border border-blue-200">🏙️</div>
                                                    <div>
                                                        <h4 className="font-black text-slate-800 uppercase text-lg">{corner.name}</h4>
                                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Block {corner.x}-{corner.y} • Level {corner.level}</div>
                                                    </div>
                                                </div>
                                                
                                                {!isManaging ? (
                                                    <div className="text-right">
                                                        <div className="text-2xl font-mono font-black text-emerald-600">+{corner.income}/d</div>
                                                        <button onClick={() => handleOpenCornerManage(corner.id)} className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 transition-colors mt-1">Manage Ops</button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => setManagingCornerId(null)} className="px-3 py-1 rounded border border-slate-300 text-[10px] font-bold uppercase text-slate-500 hover:bg-slate-50">Cancel</button>
                                                        <button onClick={handleSaveCorner} className="px-3 py-1 rounded bg-blue-600 text-white text-[10px] font-bold uppercase hover:bg-blue-500 shadow-md">Save Changes</button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Crew Grid */}
                                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex justify-between">
                                                    <span>Assigned Soldiers ({crewIds.length}/3)</span>
                                                    {isManaging && <span className="text-emerald-600">Click to Assign/Dismiss</span>}
                                                </div>
                                                <div className="flex gap-2 flex-wrap">
                                                    {isManaging ? (
                                                        getAvailableCrew(cornerConfig.crew).map(c => {
                                                            const isAssigned = cornerConfig.crew.includes(c.id);
                                                            return (
                                                                <button key={c.id} onClick={() => toggleCornerCrew(c.id)} disabled={!isAssigned && cornerConfig.crew.length >= 3} className={`flex items-center gap-2 p-1.5 pr-3 rounded-full border transition-all ${isAssigned ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                                                    <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.imageSeed}`} /></div>
                                                                    <span className={`text-[9px] font-bold uppercase ${isAssigned ? 'text-blue-800' : 'text-slate-600'}`}>{c.name}</span>
                                                                    {isAssigned && <span className="text-[8px] text-blue-500 font-black">✓</span>}
                                                                </button>
                                                            );
                                                        })
                                                    ) : (
                                                        crewIds.length > 0 ? crewIds.map(id => {
                                                            const c = gameState.crew.find(m => m.id === id);
                                                            if (!c) return null;
                                                            return (
                                                                <div key={id} className="w-8 h-8 rounded-full border-2 border-white shadow-sm bg-slate-200 overflow-hidden relative group" title={c.name}>
                                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.imageSeed}`} className="w-full h-full object-cover" />
                                                                </div>
                                                            )
                                                        }) : <span className="text-[10px] text-slate-400 italic">No crew assigned.</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Sliders (Only if Managing) */}
                                            {isManaging && (
                                                <div className="grid grid-cols-2 gap-4 mt-4 animate-fade-in">
                                                    <div>
                                                        <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase mb-1">
                                                            <span>Purity Cut</span>
                                                            <span>{cornerConfig.cut}%</span>
                                                        </div>
                                                        <input type="range" min="0" max="100" value={cornerConfig.cut} onChange={(e) => setCornerConfig(p => ({ ...p, cut: parseInt(e.target.value) }))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase mb-1">
                                                            <span>Street Price</span>
                                                            <span className={cornerConfig.price > 75 ? 'text-red-500' : 'text-emerald-600'}>{cornerConfig.price > 50 ? 'Premium' : 'Standard'}</span>
                                                        </div>
                                                        <input type="range" min="0" max="100" value={cornerConfig.price} onChange={(e) => setCornerConfig(p => ({ ...p, price: parseInt(e.target.value) }))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default DealerOperations;
