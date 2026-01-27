
import React from 'react';
import { TRAITS } from '../constants';

interface EffectsListProps {
    activeTraits: { id: string; rank: number }[];
    isOwner?: boolean; // If false, hidden traits/buffs are obscured
}

const EffectsList: React.FC<EffectsListProps> = ({ activeTraits, isOwner = true }) => {
    
    // 1. Hydrate Traits
    const fullTraits = activeTraits.map(t => {
        const def = TRAITS.find(d => d.id === t.id);
        return { ...def, rank: t.rank };
    }).filter(t => t.id);

    // 2. Categorize
    const conditions = fullTraits.filter(t => t.type === 'buff' || t.type === 'debuff');
    const traits = fullTraits.filter(t => t.type === 'trait');
    const reputations = fullTraits.filter(t => t.type === 'reputation');

    if (fullTraits.length === 0) {
        return (
            <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <div className="text-4xl opacity-20 mb-2">👤</div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">No Active Effects</span>
            </div>
        );
    }

    const renderStatMods = (mods: any) => {
        if (!mods) return null;
        return (
            <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(mods).map(([key, val]) => (
                    <span key={key} className={`text-[8px] font-mono px-1.5 rounded border ${Number(val) > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                        {Number(val) > 0 ? '+' : ''}{String(val)} {key.substring(0,3).toUpperCase()}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6 font-waze">
            
            {/* 1. PUBLIC REPUTATION (Always Visible) */}
            {reputations.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-200">
                        <span className="text-lg">📢</span>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Street Record (Public)</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {reputations.map((rep, idx) => (
                            <div key={idx} className="bg-[#fffbeb] border-l-4 border-amber-500 p-3 shadow-sm rounded-r-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 opacity-10 pointer-events-none p-2">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-amber-900">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                                    </svg>
                                </div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{rep.label}</span>
                                        <span className="text-[8px] font-bold bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300">KNOWN</span>
                                    </div>
                                    <p className="text-xs text-slate-600 font-serif italic mt-1 pr-4">"{rep.description}"</p>
                                    {renderStatMods(rep.statModifiers)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. TEMPORARY CONDITIONS (Private) */}
            {(conditions.length > 0) && (
                <div>
                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-200">
                        <span className="text-lg">⚕️</span>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between w-full">
                            <span>Condition</span>
                            {!isOwner && <span className="text-red-400 text-[9px] bg-red-50 px-1 rounded">HIDDEN</span>}
                        </h4>
                    </div>
                    {isOwner ? (
                        <div className="grid grid-cols-2 gap-2">
                            {conditions.map((cond, idx) => (
                                <div key={idx} className={`p-2 rounded-lg border-2 flex flex-col ${cond.type === 'buff' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${cond.type === 'buff' ? 'bg-emerald-100 border-emerald-300' : 'bg-red-100 border-red-300'}`}>
                                            {cond.type === 'buff' ? '▲' : '▼'}
                                        </div>
                                        <span className={`text-xs font-black uppercase ${cond.type === 'buff' ? 'text-emerald-800' : 'text-red-800'}`}>{cond.label}</span>
                                    </div>
                                    <div className="text-[9px] text-slate-500 leading-tight mb-1">{cond.description}</div>
                                    {cond.duration && <div className="text-[8px] font-mono text-slate-400 uppercase bg-white/50 px-1 rounded self-start border border-slate-100">{cond.duration}</div>}
                                    {renderStatMods(cond.statModifiers)}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-3 bg-slate-100 rounded border border-slate-200 text-center">
                            <span className="text-xs text-slate-400 italic">Status Unknown</span>
                        </div>
                    )}
                </div>
            )}

            {/* 3. PERSONALITY TRAITS (Private) */}
            {(traits.length > 0) && (
                <div>
                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-200">
                        <span className="text-lg">🧬</span>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between w-full">
                            <span>Personality</span>
                            {!isOwner && <span className="text-red-400 text-[9px] bg-red-50 px-1 rounded">HIDDEN</span>}
                        </h4>
                    </div>
                    {isOwner ? (
                        <div className="space-y-2">
                            {traits.map((trait, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 mt-0.5">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d={trait.iconPath} /></svg>
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-black text-slate-700 uppercase">{trait.label}</span>
                                            {trait.rank > 1 && <span className="text-[8px] font-bold bg-slate-100 text-slate-500 px-1.5 rounded border border-slate-200">RANK {trait.rank}</span>}
                                        </div>
                                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{trait.description}</p>
                                        {renderStatMods(trait.statModifiers)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-3 bg-slate-100 rounded border border-slate-200 text-center">
                            <span className="text-xs text-slate-400 italic">Traits Unknown</span>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};

export default EffectsList;
