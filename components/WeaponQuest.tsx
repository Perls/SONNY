
import React, { useState, useEffect } from 'react';
import { useGameEngine } from '../contexts/GameEngineContext';
import { CrewMember, InventoryItem } from '../types';
import { ITEMS } from '../constants';

interface WeaponQuestProps {
    onClose: () => void;
}

type QuestStage = 'briefing' | 'select_agent' | 'select_target' | 'simulation' | 'event_customs' | 'event_rival' | 'resolution';

interface QuestState {
    agentId: string | null;
    targetId: 'port' | 'warehouse' | 'rival' | null;
    successChance: number;
    captureRisk: number;
    log: string[];
    finalOutcome: 'success' | 'minor_success' | 'failure' | null;
    rewardItemId: string | null;
}

const WeaponQuest: React.FC<WeaponQuestProps> = ({ onClose }) => {
    const { gameState, updateSave, triggerConsigliere } = useGameEngine();
    const [stage, setStage] = useState<QuestStage>('briefing');
    const [questState, setQuestState] = useState<QuestState>({
        agentId: null,
        targetId: null,
        successChance: 60, // Base
        captureRisk: 20, // Base
        log: [],
        finalOutcome: null,
        rewardItemId: null
    });

    if (!gameState) return null;

    // --- REQUIREMENTS ---
    const hasManual = gameState.inventory.some(i => i.itemId === 'manual_parts');
    const hasCash = gameState.money >= 500;

    // --- HELPERS ---
    const getAgentStats = (crew: CrewMember) => {
        // Intrigue = Agility + Intelligence (Stealth/Smarts)
        const intrigue = crew.stats.agility + crew.stats.intelligence;
        // Prowess = Strength + Luck (Combat)
        const prowess = crew.stats.strength + crew.stats.luck;
        return { intrigue, prowess };
    };

    const calculateOdds = (crew: CrewMember) => {
        const { intrigue, prowess } = getAgentStats(crew);
        let chance = 60;
        let risk = 20;

        if (intrigue >= 10) { chance += 15; risk -= 5; }
        if (prowess >= 12) { chance += 10; }
        
        // Trait modifiers (mocked based on trait IDs)
        if (crew.traits.some(t => t.id === 'smooth_talker')) chance += 5;
        if (crew.traits.some(t => t.id === 'clumsy')) risk += 10;

        return { chance: Math.min(95, chance), risk: Math.max(5, risk) };
    };

    const handleSelectAgent = (crewId: string) => {
        const crew = gameState.crew.find(c => c.id === crewId);
        if (!crew) return;
        const odds = calculateOdds(crew);
        setQuestState(prev => ({
            ...prev,
            agentId: crewId,
            successChance: odds.chance,
            captureRisk: odds.risk
        }));
        setStage('select_target');
    };

    const handleSelectTarget = (targetId: 'port' | 'warehouse' | 'rival') => {
        // Cost Check
        let costMet = false;
        let costDesc = "";
        
        if (targetId === 'port') {
            // Cost: 2 Coke
            const coke = gameState.inventory.find(i => i.itemId === 'coke');
            if (coke && coke.quantity >= 2) {
                costMet = true;
                // Deduct logic would go here in a real transaction commit
            }
            costDesc = "2x Coke";
        } else if (targetId === 'warehouse') {
            // Cost: 1500 Cash
            if (gameState.money >= 2000) { // 500 base + 1500
                costMet = true;
            }
            costDesc = "N$ 1,500";
        } else if (targetId === 'rival') {
            // Cost: Trade "Tec-9" (id: tec9_kit)
            const tec9 = gameState.inventory.find(i => i.itemId === 'tec9_kit');
            if (tec9) {
                costMet = true;
            }
            costDesc = "Tec-9 Kit";
        }

        if (!costMet) {
            alert(`Missing required tribute: ${costDesc}`);
            return;
        }

        // Commit Costs
        let newMoney = gameState.money - 500; // Initial Bribe
        let newInventory = [...gameState.inventory];

        if (targetId === 'warehouse') newMoney -= 1500;
        if (targetId === 'port') {
             const idx = newInventory.findIndex(i => i.itemId === 'coke');
             if (idx > -1) newInventory[idx].quantity -= 2;
             if (newInventory[idx].quantity <= 0) newInventory.splice(idx, 1);
        }
        if (targetId === 'rival') {
             const idx = newInventory.findIndex(i => i.itemId === 'tec9_kit');
             if (idx > -1) newInventory.splice(idx, 1);
        }

        updateSave({ ...gameState, money: newMoney, inventory: newInventory });
        setQuestState(prev => ({ ...prev, targetId }));
        setStage('simulation');
    };

    // --- SIMULATION LOOP ---
    useEffect(() => {
        if (stage === 'simulation') {
            let step = 0;
            const interval = setInterval(() => {
                step++;
                const logs = [
                    "Contacting source...",
                    "Greasing palms at the checkpoint...",
                    "Moving through the yard...",
                ];
                if (step <= 2) {
                    setQuestState(prev => ({ ...prev, log: [...prev.log, logs[step-1]] }));
                } else {
                    clearInterval(interval);
                    // Trigger Random Event
                    const eventRoll = Math.random();
                    if (eventRoll > 0.5) setStage('event_customs');
                    else setStage('event_rival');
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [stage]);

    // --- EVENT HANDLERS ---
    const handleEventDecision = (decision: string) => {
        const agent = gameState.crew.find(c => c.id === questState.agentId);
        if (!agent) return;
        const { intrigue, prowess } = getAgentStats(agent);

        let outcomeLog = "";
        let successMod = 0;
        let riskMod = 0;

        // CUSTOMS EVENT
        if (stage === 'event_customs') {
            if (decision === 'pay') {
                if (gameState.money >= 250) {
                    updateSave({ ...gameState, money: gameState.money - 250 });
                    outcomeLog = "Bribe accepted. The guard looks the other way.";
                    successMod = 10;
                } else {
                    outcomeLog = "You couldn't afford the bribe. You had to run.";
                    riskMod = 20;
                }
            } else if (decision === 'talk') {
                if (intrigue > 8) { // Check stat
                    outcomeLog = "Agent talked their way out. Gained intel.";
                    // TODO: Add XP
                } else {
                    outcomeLog = "The guard wasn't buying it. It got messy.";
                    riskMod = 30;
                    successMod = -20;
                }
            }
        }
        // RIVAL EVENT
        else if (stage === 'event_rival') {
            if (decision === 'fight') {
                if (prowess > 10) {
                    outcomeLog = "Rivals neutralized. Path clear.";
                    // TODO: Add Prowess XP
                } else {
                    outcomeLog = "Agent took a beating. The package might be damaged.";
                    successMod = -30;
                }
            } else if (decision === 'run') {
                outcomeLog = "Escaped, but had to scramble. Assembly might be rough.";
                // durability penalty logic
                successMod = -10;
            }
        }

        setQuestState(prev => ({
            ...prev,
            successChance: Math.min(100, prev.successChance + successMod),
            captureRisk: Math.max(0, prev.captureRisk + riskMod),
            log: [...prev.log, outcomeLog]
        }));
        
        finishQuest();
    };

    const finishQuest = () => {
        // Final Roll
        const roll = Math.random() * 100;
        const captureRoll = Math.random() * 100;
        
        let outcome: QuestState['finalOutcome'] = 'failure';
        let itemReward = null;

        if (captureRoll < questState.captureRisk) {
            outcome = 'failure';
            // Logic to capture agent would go here (remove from crew temporarily)
        } else if (roll < questState.successChance) {
            outcome = 'success';
            // Determine Item
            if (questState.targetId === 'port') itemReward = 'zip_gun';
            if (questState.targetId === 'warehouse') itemReward = 'tec9_kit';
            if (questState.targetId === 'rival') itemReward = 'spectre';
        } else {
            outcome = 'minor_success';
            // Tier down reward
            if (questState.targetId === 'port') itemReward = 'knife'; // Junk
            if (questState.targetId === 'warehouse') itemReward = 'zip_gun';
            if (questState.targetId === 'rival') itemReward = 'tec9_kit';
        }

        setQuestState(prev => ({ ...prev, finalOutcome: outcome, rewardItemId: itemReward }));
        setStage('resolution');

        // Award Item
        if (itemReward) {
            const newItem: InventoryItem = {
                id: Math.random().toString(),
                itemId: itemReward,
                quantity: 1
            };
            updateSave({
                ...gameState,
                inventory: [...gameState.inventory, newItem]
            });
            triggerConsigliere(outcome === 'success' ? "Acquisition Successful." : "Job done, but it wasn't pretty.");
        } else {
            triggerConsigliere("Mission Failed. The agent is in the wind.");
        }
    };

    return (
        <div className="absolute inset-0 bg-black/90 z-[70] flex items-center justify-center p-8 font-mono animate-fade-in">
            <div className="w-full max-w-4xl bg-[#1c1917] border-2 border-[#44403c] rounded-lg shadow-2xl overflow-hidden flex flex-col h-[600px] relative">
                
                {/* Header */}
                <div className="bg-[#292524] p-4 border-b border-[#44403c] flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📦</span>
                        <div>
                            <h2 className="text-xl font-bold text-[#e7e5e4] uppercase tracking-widest">Secure Untraceables</h2>
                            <div className="text-[10px] text-[#a8a29e] uppercase">Black Market Acquisitions • Quest Chain</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-[#78716c] hover:text-white uppercase font-bold text-xs">Abort</button>
                </div>

                {/* Content */}
                <div className="flex-grow p-8 overflow-y-auto">
                    
                    {/* STAGE 1: BRIEFING */}
                    {stage === 'briefing' && (
                        <div className="flex flex-col items-center text-center gap-6 h-full justify-center">
                            <div className="p-6 border-2 border-dashed border-[#44403c] rounded-xl max-w-lg bg-[#0c0a09]">
                                <div className="text-sm text-[#d6d3d1] mb-6 leading-relaxed font-serif italic">
                                    "You want hardware that doesn't exist on paper? We can get it. But you need to know how to put it together, and you need to pay the courier upfront."
                                </div>
                                
                                <div className="flex justify-center gap-8 text-xs font-bold uppercase mb-6">
                                    <div className={`flex flex-col items-center ${hasManual ? 'text-emerald-500' : 'text-red-500'}`}>
                                        <span className="text-xl mb-1">📘</span>
                                        <span>Parts Manual</span>
                                        <span>{hasManual ? 'ACQUIRED' : 'MISSING'}</span>
                                    </div>
                                    <div className={`flex flex-col items-center ${hasCash ? 'text-emerald-500' : 'text-red-500'}`}>
                                        <span className="text-xl mb-1">💵</span>
                                        <span>N$ 500 Fee</span>
                                        <span>{hasCash ? 'READY' : 'INSUFFICIENT'}</span>
                                    </div>
                                </div>

                                <button 
                                    disabled={!hasManual || !hasCash}
                                    onClick={() => setStage('select_agent')}
                                    className={`w-full py-3 rounded font-black uppercase tracking-widest ${!hasManual || !hasCash ? 'bg-[#292524] text-[#57534e] cursor-not-allowed' : 'bg-emerald-700 text-white hover:bg-emerald-600'}`}
                                >
                                    Begin Operation
                                </button>
                                {(!hasManual) && <div className="text-[10px] text-red-500 mt-2">Find a "Gunsmith Manual" in the Black Market first.</div>}
                            </div>
                        </div>
                    )}

                    {/* STAGE 2: SELECT AGENT */}
                    {stage === 'select_agent' && (
                        <div>
                            <h3 className="text-sm font-bold text-[#a8a29e] uppercase mb-4 text-center">Select Field Agent</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {gameState.crew.filter(c => !c.isLeader).map(crew => {
                                    const { intrigue, prowess } = getAgentStats(crew);
                                    const { chance, risk } = calculateOdds(crew);
                                    
                                    return (
                                        <button 
                                            key={crew.id}
                                            onClick={() => handleSelectAgent(crew.id)}
                                            className="bg-[#292524] p-4 rounded border border-[#44403c] hover:border-amber-600 hover:bg-[#44403c] transition-all text-left flex gap-4"
                                        >
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${crew.imageSeed}`} className="w-12 h-12 rounded bg-black" />
                                            <div className="flex-grow">
                                                <div className="text-sm font-bold text-white uppercase mb-1">{crew.name}</div>
                                                <div className="flex gap-4 text-[10px] uppercase font-mono text-[#a8a29e] mb-2">
                                                    <span>Intrigue: {intrigue}</span>
                                                    <span>Prowess: {prowess}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs font-bold border-t border-[#57534e] pt-2">
                                                    <span className="text-emerald-500">Success: {chance}%</span>
                                                    <span className="text-red-500">Risk: {risk}%</span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* STAGE 3: TARGETING */}
                    {stage === 'select_target' && (
                        <div className="flex flex-col items-center">
                            <h3 className="text-sm font-bold text-[#a8a29e] uppercase mb-6">Select Acquisition Target</h3>
                            <div className="grid grid-cols-3 gap-6 w-full">
                                <button onClick={() => handleSelectTarget('port')} className="bg-[#0c0a09] border-2 border-[#292524] p-6 rounded-xl hover:border-blue-500 hover:bg-[#1c1917] transition-all group text-left">
                                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">⚓</div>
                                    <div className="text-sm font-black text-white uppercase mb-1">Port Authority</div>
                                    <div className="text-[10px] text-[#a8a29e] mb-4">Low Risk • Low Reward</div>
                                    <div className="bg-[#292524] px-2 py-1 rounded text-[10px] font-mono text-blue-300">Cost: 2x Coke</div>
                                </button>

                                <button onClick={() => handleSelectTarget('warehouse')} className="bg-[#0c0a09] border-2 border-[#292524] p-6 rounded-xl hover:border-amber-500 hover:bg-[#1c1917] transition-all group text-left">
                                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏭</div>
                                    <div className="text-sm font-black text-white uppercase mb-1">Contraband Warehouse</div>
                                    <div className="text-[10px] text-[#a8a29e] mb-4">Med Risk • Med Reward</div>
                                    <div className="bg-[#292524] px-2 py-1 rounded text-[10px] font-mono text-amber-300">Cost: N$ 1500</div>
                                </button>

                                <button onClick={() => handleSelectTarget('rival')} className="bg-[#0c0a09] border-2 border-[#292524] p-6 rounded-xl hover:border-red-600 hover:bg-[#1c1917] transition-all group text-left">
                                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">☠️</div>
                                    <div className="text-sm font-black text-white uppercase mb-1">Rival Territory</div>
                                    <div className="text-[10px] text-[#a8a29e] mb-4">High Risk • Legendary Reward</div>
                                    <div className="bg-[#292524] px-2 py-1 rounded text-[10px] font-mono text-red-300">Trade: Tec-9 Kit</div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STAGE 4: SIMULATION & EVENTS */}
                    {(stage === 'simulation' || stage.startsWith('event_')) && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="w-full max-w-md bg-black border border-[#44403c] p-4 rounded font-mono text-xs h-64 overflow-y-auto mb-6 shadow-inner">
                                {questState.log.map((l, i) => (
                                    <div key={i} className="mb-1 text-green-500">{`> ${l}`}</div>
                                ))}
                                {stage.startsWith('event') && <div className="text-amber-500 animate-pulse">{`> ENCOUNTER DETECTED...`}</div>}
                            </div>

                            {stage === 'event_customs' && (
                                <div className="animate-slide-up w-full max-w-md bg-[#292524] p-6 rounded border border-amber-600 shadow-2xl">
                                    <h4 className="font-bold text-amber-500 uppercase mb-2">Event: The Customs Bribe</h4>
                                    <p className="text-sm text-[#d6d3d1] mb-6">A guard spots the exchange. He looks greedy.</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => handleEventDecision('pay')} className="bg-[#0c0a09] p-3 rounded border border-[#44403c] hover:bg-black text-left">
                                            <div className="font-bold text-white text-xs">Pay Him Off</div>
                                            <div className="text-[10px] text-[#a8a29e]">Cost: N$ 250</div>
                                        </button>
                                        <button onClick={() => handleEventDecision('talk')} className="bg-[#0c0a09] p-3 rounded border border-[#44403c] hover:bg-black text-left">
                                            <div className="font-bold text-white text-xs">Talk Him Down</div>
                                            <div className="text-[10px] text-[#a8a29e]">Uses Intrigue</div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {stage === 'event_rival' && (
                                <div className="animate-slide-up w-full max-w-md bg-[#292524] p-6 rounded border border-red-600 shadow-2xl">
                                    <h4 className="font-bold text-red-500 uppercase mb-2">Event: Rival Interference</h4>
                                    <p className="text-sm text-[#d6d3d1] mb-6">Rival gang members corner your agent in an alley.</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => handleEventDecision('fight')} className="bg-[#0c0a09] p-3 rounded border border-[#44403c] hover:bg-black text-left">
                                            <div className="font-bold text-white text-xs">Fight Back</div>
                                            <div className="text-[10px] text-[#a8a29e]">Uses Prowess</div>
                                        </button>
                                        <button onClick={() => handleEventDecision('run')} className="bg-[#0c0a09] p-3 rounded border border-[#44403c] hover:bg-black text-left">
                                            <div className="font-bold text-white text-xs">Run For It</div>
                                            <div className="text-[10px] text-[#a8a29e]">Penalty: Damaged Goods</div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STAGE 5: RESOLUTION */}
                    {stage === 'resolution' && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className={`text-6xl mb-4 ${questState.finalOutcome === 'success' ? 'animate-bounce' : ''}`}>
                                {questState.finalOutcome === 'success' ? '🎁' : questState.finalOutcome === 'minor_success' ? '📦' : '🚨'}
                            </div>
                            <h2 className={`text-3xl font-black uppercase mb-2 ${questState.finalOutcome === 'failure' ? 'text-red-600' : 'text-emerald-500'}`}>
                                {questState.finalOutcome === 'success' ? 'Mission Accomplished' : questState.finalOutcome === 'minor_success' ? 'Partial Success' : 'Mission Failed'}
                            </h2>
                            
                            {questState.rewardItemId && (
                                <div className="bg-[#0c0a09] p-4 rounded border border-[#44403c] mt-4 flex items-center gap-4">
                                    <div className="text-3xl">{ITEMS[questState.rewardItemId]?.icon}</div>
                                    <div className="text-left">
                                        <div className="text-[10px] text-[#a8a29e] uppercase">Acquired Asset</div>
                                        <div className="font-bold text-white">{ITEMS[questState.rewardItemId]?.name}</div>
                                    </div>
                                </div>
                            )}

                            <button onClick={onClose} className="mt-8 px-8 py-3 bg-[#44403c] text-white font-bold uppercase rounded hover:bg-[#57534e]">
                                Close Dossier
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default WeaponQuest;
