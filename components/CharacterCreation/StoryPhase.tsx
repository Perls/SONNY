
import React from 'react';
import { BACKSTORY_STEPS, TRAITS, CONNECTION_OPTIONS, TRAIT_POINT_BUDGET } from '../../constants';
import { Stats, Trait } from '../../types';

// Constants moved from main file
const FACTION_META: Record<string, any> = {
    'commission': { leaderName: "Don Vinnie", leaderRole: "The Chairman", leaderSeed: "Vinnie", control: 42, trend: 'down', income: 'Very High', manpower: 'Elite', graphColor: 'text-red-500', barColor: 'bg-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    'cartel': { leaderName: "El Santo", leaderRole: "The Supplier", leaderSeed: "Santo", control: 35, trend: 'up', income: 'High', manpower: 'High', graphColor: 'text-emerald-500', barColor: 'bg-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
    'gangs': { leaderName: "King T", leaderRole: "Street King", leaderSeed: "KingT", control: 23, trend: 'up', income: 'Low', manpower: 'Massive', graphColor: 'text-purple-500', barColor: 'bg-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' }
};

const CONNECTION_META: Record<string, any> = {
    'conn_bobby': { name: "Vinny (In-Law)", role: "Sister's Husband", seed: "Bobby", bg: 'bg-blue-50', border: 'border-blue-200' },
    'conn_esposito': { name: "Ms. Esposito", role: "Retired Neighbor", seed: "Granny", bg: 'bg-amber-50', border: 'border-amber-200' },
    'conn_priest': { name: "Sal the Barman", role: "Favorite Bartender", seed: "Father", bg: 'bg-purple-50', border: 'border-purple-200' },
    'conn_danny': { name: "Danny 'Boxer'", role: "Childhood Friend", seed: "Danny", bg: 'bg-emerald-50', border: 'border-emerald-200' },
    'conn_doc': { name: "Cousin Joey", role: "Older Cousin", seed: "Doctor", bg: 'bg-red-50', border: 'border-red-200' },
    'conn_cop': { name: "Sgt. Miller", role: "The Dirty Cop", seed: "Cop", bg: 'bg-slate-200', border: 'border-slate-300' }
};

const FACTION_CONNECTIONS: Record<string, string[]> = {
    'commission': ['conn_bobby', 'conn_esposito'],
    'cartel': ['conn_danny', 'conn_cop'],
    'gangs': ['conn_priest', 'conn_doc']
};

const getFactionForConnection = (connId: string) => {
    for (const [faction, conns] of Object.entries(FACTION_CONNECTIONS)) {
        if (conns.includes(connId)) return faction;
    }
    return null;
}

interface StoryPhaseProps {
    step: number;
    backstoryChoices: string[];
    onSelectBackstory: (id: string) => void;
    traitSelections: Record<string, number>;
    onToggleTrait: (t: Trait) => void;
    pointsSpent: number;
    onNextStep: () => void;
}

const StoryPhase: React.FC<StoryPhaseProps> = ({ step, backstoryChoices, onSelectBackstory, traitSelections, onToggleTrait, pointsSpent, onNextStep }) => {
    const traitStepIndex = BACKSTORY_STEPS.length + 2;
    const connectionStepIndex = traitStepIndex + 1;

    let currentStepData = null;
    let stepTitle = "";
    let stepDesc = "";

    if (step > 1 && step <= traitStepIndex) {
        currentStepData = BACKSTORY_STEPS[step - 2];
        if (currentStepData) {
            stepTitle = currentStepData.title;
            stepDesc = currentStepData.description;
        }
    }

    if (step === traitStepIndex) {
        stepTitle = "Personality";
        stepDesc = "Select Traits & Flaws. (Max 3 Total)";
    } else if (step === connectionStepIndex) {
        currentStepData = {
            id: 'connection',
            title: "Your Connection",
            description: "Select your first officer and advisor.",
            options: CONNECTION_OPTIONS
        };
        stepTitle = currentStepData.title;
        stepDesc = currentStepData.description;
    }

    const isAllegianceStep = currentStepData?.id === 'allegiance';
    const isConnectionStep = currentStepData?.id === 'connection';
    const isTraitStep = step === traitStepIndex;

    const remainingPoints = TRAIT_POINT_BUDGET - pointsSpent;
    const traitsCount = Object.keys(traitSelections).length;

    // --- ALLEGIANCE RENDER ---
    if (isAllegianceStep) {
        return (
            <div className="animate-fade-in">
                <div className="mb-6"><h4 className="text-2xl font-black text-slate-800 mb-2 font-news">{stepTitle}</h4><p className="text-slate-500 text-sm font-medium">{stepDesc}</p></div>
                <div className="space-y-4">
                    {currentStepData?.options.map((opt) => {
                        const meta = FACTION_META[opt.id];
                        if (!meta) return null;
                        
                        return (
                            <button 
                                key={opt.id} 
                                onClick={() => onSelectBackstory(opt.id)} 
                                className={`w-full text-left rounded-xl border-4 transition-all group relative overflow-hidden bg-white flex flex-col md:flex-row hover:shadow-xl hover:scale-[1.01] ${meta.border} hover:border-amber-400`}
                            >
                                <div className={`p-8 md:w-1/3 border-r ${meta.border} flex flex-col items-center justify-center ${meta.bg}`}>
                                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden mb-4 bg-white relative">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${meta.leaderSeed}`} className="w-full h-full object-cover transform scale-110 translate-y-2" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs font-black uppercase text-slate-500 tracking-widest mb-1">{meta.leaderRole}</div>
                                        <div className="text-xl font-black font-news text-slate-900 leading-none">{meta.leaderName}</div>
                                    </div>
                                </div>
                                <div className="p-6 flex-grow flex flex-col justify-between">
                                    <div className="mb-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className={`font-black font-news uppercase text-2xl tracking-tight ${opt.textColor || 'text-slate-800'}`}>{opt.label}</h3>
                                            <div className={`flex items-center gap-1 text-xs font-bold uppercase ${meta.graphColor} bg-slate-50 px-2 py-1 rounded border border-slate-100`}>
                                                <span className="text-lg leading-none">{meta.trend === 'up' ? '↗' : meta.trend === 'down' ? '↘' : '→'}</span>
                                                {meta.trend === 'up' ? 'Rising' : meta.trend === 'down' ? 'Falling' : 'Stable'}
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium text-slate-500 leading-relaxed italic border-l-2 border-slate-200 pl-3">"{opt.description}"</div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-6 border-t border-slate-100 pt-4 mt-auto">
                                        <div><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">City Control</div><div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden"><div className={`h-full ${meta.barColor}`} style={{ width: `${meta.control}%` }}></div></div><div className="text-xs font-mono font-bold text-slate-700 mt-1">{meta.control}%</div></div>
                                        <div><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Revenue</div><div className="text-sm font-bold text-slate-800">{meta.income}</div></div>
                                        <div><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Muscle</div><div className="text-sm font-bold text-slate-800">{meta.manpower}</div></div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // --- CONNECTION RENDER ---
    if (isConnectionStep) {
        return (
            <div className="animate-fade-in">
                <div className="mb-6">
                    <h4 className="text-2xl font-black text-slate-800 mb-2 font-news">{stepTitle}</h4>
                    <p className="text-slate-500 text-sm font-medium">{stepDesc}</p>
                    <p className="text-red-500 font-news font-bold text-sm mt-1 uppercase tracking-widest">This will control your first mission</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentStepData?.options.map((opt) => {
                        if (opt.id === 'conn_mentor') return null;
                        const selectedFactionId = backstoryChoices.find(id => ['commission', 'cartel', 'gangs'].includes(id));
                        const optionFactionId = getFactionForConnection(opt.id);
                        const isLocked = optionFactionId && selectedFactionId && optionFactionId !== selectedFactionId;
                        const meta = CONNECTION_META[opt.id];
                        if (!meta) return null;

                        let facStyle = { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800', label: 'Neutral', badgeBg: 'bg-slate-200', badgeText: 'text-slate-600' };
                        if (optionFactionId === 'commission') facStyle = { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', label: 'The Commission', badgeBg: 'bg-red-100', badgeText: 'text-red-800' };
                        else if (optionFactionId === 'cartel') facStyle = { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', label: 'The Cartel', badgeBg: 'bg-amber-100', badgeText: 'text-amber-800' };
                        else if (optionFactionId === 'gangs') facStyle = { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', label: 'Street Gangs', badgeBg: 'bg-purple-100', badgeText: 'text-purple-800' };

                        return (
                            <button 
                                key={opt.id} 
                                onClick={() => !isLocked && onSelectBackstory(opt.id)} 
                                disabled={isLocked}
                                className={`relative w-full text-left rounded-xl border-4 transition-all overflow-hidden flex flex-col md:flex-row ${facStyle.bg} ${facStyle.border} ${isLocked ? 'opacity-60 grayscale cursor-not-allowed scale-[0.98]' : 'hover:shadow-xl hover:scale-[1.01] hover:border-white shadow-sm cursor-pointer'}`}
                            >
                                <div className={`absolute top-0 right-0 px-3 py-1 text-[9px] font-black uppercase rounded-bl-xl border-b-2 border-l-2 z-20 ${facStyle.badgeBg} ${facStyle.badgeText} ${facStyle.border}`}>{facStyle.label}</div>
                                {isLocked && (<div className="absolute inset-0 bg-slate-900/10 z-30 flex items-center justify-center"><div className="bg-slate-900 text-white px-4 py-2 rounded-lg border-2 border-slate-600 shadow-xl transform -rotate-2"><div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Requires</div><div className="text-sm font-bold uppercase">{facStyle.label}</div></div></div>)}
                                <div className={`p-4 md:w-1/3 border-r ${facStyle.border} flex flex-col items-center justify-center bg-white/50`}>
                                    <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden mb-2 bg-white relative"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${meta.seed}`} className="w-full h-full object-cover transform scale-110 translate-y-1" /></div>
                                    <div className="text-center"><div className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{meta.role}</div><div className="text-xs font-black font-news text-slate-900 leading-tight mt-1">{meta.name}</div></div>
                                </div>
                                <div className="p-4 flex-grow flex flex-col justify-center relative">
                                    <div className={`font-black font-news uppercase text-lg tracking-tight mb-2 ${facStyle.text}`}>{opt.label}</div>
                                    <div className="text-xs font-medium text-slate-600 leading-relaxed italic border-l-2 border-slate-300 pl-2 mb-3">"{opt.description}"</div>
                                    <div className="flex gap-1 flex-wrap mt-auto">{Object.keys(opt.statModifiers).map(stat => (<span key={stat} className="text-[9px] px-2 py-0.5 rounded uppercase font-black tracking-wider border bg-white border-slate-200 text-slate-600 shadow-sm">+{opt.statModifiers[stat as keyof Stats]} {stat}</span>))}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // --- TRAITS RENDER ---
    if (isTraitStep) {
        return (
            <div className="animate-fade-in">
                <div className="mb-6 flex items-end justify-between border-b border-slate-200 pb-4">
                    <div><h4 className="text-2xl font-black text-slate-800 mb-1 font-news">{stepTitle}</h4><p className="text-slate-500 text-sm font-medium">{stepDesc}</p></div>
                    <div className="flex gap-4 items-center">
                        <div className="flex flex-col items-end"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trait Slots</span><span className={`text-2xl font-black font-mono text-slate-800`}>{traitsCount}/3</span></div>
                        <div className="flex flex-col items-end"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Point Budget</span><div className="flex items-center gap-2"><span className={`text-2xl font-black font-mono ${remainingPoints < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{remainingPoints}</span><span className="text-slate-300 text-lg">/</span><span className="text-slate-400 text-lg">{TRAIT_POINT_BUDGET}</span></div></div>
                        <button onClick={() => remainingPoints >= 0 ? onNextStep() : null} disabled={remainingPoints < 0} className={`ml-4 px-6 py-3 rounded-xl font-black uppercase tracking-widest shadow-lg transition-all font-news ${remainingPoints < 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}>{remainingPoints < 0 ? "Over Budget" : "Confirm Traits"}</button>
                    </div>
                </div>
                <div className="space-y-8">
                    <div>
                        <div className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-3 border-b border-emerald-100 pb-1">Strengths (Cost 1)</div>
                        <div className="grid grid-cols-2 gap-4">
                            {TRAITS.filter(t => t.cost > 0 && t.type === 'trait').map(trait => {
                                const isSelected = !!traitSelections[trait.id];
                                const disabled = !isSelected && traitsCount >= 3;
                                return (
                                    <button key={trait.id} onClick={() => onToggleTrait(trait)} disabled={disabled} className={`relative p-4 rounded-xl border-2 transition-all text-left flex gap-4 items-start group hover:z-50 ${isSelected ? 'bg-emerald-50 border-emerald-400' : disabled ? 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed' : 'bg-white border-slate-100 hover:border-emerald-300'}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border-2 ${isSelected ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-300 group-hover:text-emerald-500'}`}><svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d={trait.iconPath} /></svg></div>
                                        <div className="flex-grow"><div className="flex justify-between items-center mb-1"><span className={`font-black font-news text-base ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{trait.label}</span></div><p className="text-xs text-slate-500 font-medium leading-tight">{trait.description}</p></div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-black uppercase tracking-widest text-red-600 mb-3 border-b border-red-100 pb-1">Reputation & Flaws (Refunds 1 Point)</div>
                        <div className="grid grid-cols-2 gap-4">
                            {TRAITS.filter(t => t.cost < 0 && t.type === 'reputation').map(trait => {
                                const isSelected = !!traitSelections[trait.id];
                                const disabled = !isSelected && traitsCount >= 3;
                                return (
                                    <button key={trait.id} onClick={() => onToggleTrait(trait)} disabled={disabled} className={`relative p-4 rounded-xl border-2 transition-all text-left flex gap-4 items-start group hover:z-50 ${isSelected ? 'bg-red-50 border-red-400' : disabled ? 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed' : 'bg-white border-slate-100 hover:border-red-300'}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border-2 ${isSelected ? 'bg-red-100 border-red-300 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-300 group-hover:text-red-500'}`}><svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d={trait.iconPath} /></svg></div>
                                        <div className="flex-grow"><div className="flex justify-between items-center mb-1"><span className={`font-black font-news text-base ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{trait.label}</span></div><p className="text-xs text-slate-500 font-medium leading-tight">{trait.description}</p></div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- STANDARD STEP RENDER ---
    return (
        <div className="animate-fade-in">
            <div className="mb-6"><h4 className="text-2xl font-black text-slate-800 mb-2 font-news">{stepTitle}</h4><p className="text-slate-500 text-sm font-medium">{stepDesc}</p></div>
            <div className={`space-y-3`}>
                {currentStepData?.options.map((opt) => (
                    <button key={opt.id} onClick={() => onSelectBackstory(opt.id)} className={`w-full text-left rounded-xl border-2 transition-all group relative overflow-hidden p-5 border-slate-100 bg-white hover:border-amber-400 hover:bg-amber-50/30 hover:shadow-lg`}>
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-1"><span className={`font-black font-news uppercase text-xl tracking-tight text-slate-800`}>{opt.label}</span></div>
                            <div className={`text-xs font-bold uppercase tracking-wide mb-3 text-slate-400 group-hover:text-slate-600`}>{opt.description}</div>
                            <div className="flex gap-2 flex-wrap">{Object.keys(opt.statModifiers).map(stat => (<span key={stat} className={`text-[10px] px-2 py-1 rounded uppercase font-black tracking-wider border bg-slate-100 text-slate-600 border-slate-200`}>+{opt.statModifiers[stat as keyof Stats]} {stat}</span>))}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default StoryPhase;
