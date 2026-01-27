
import React from 'react';
import { TRAITS } from '../constants';

interface ActiveBuffsProps {
    traits: { id: string; rank: number }[];
    currentEnergy?: number;
}

const ActiveBuffs: React.FC<ActiveBuffsProps> = ({ traits, currentEnergy = 50 }) => {
    // Filter only buffs and debuffs from the trait list
    let activeEffects = traits.map(t => {
        const def = TRAITS.find(def => def.id === t.id);
        return { ...def, rank: t.rank };
    }).filter(t => t.id && (t.type === 'buff' || t.type === 'debuff'));

    // Inject Low Energy Debuff if applicable
    if (currentEnergy < 15) {
        activeEffects.push({
            id: 'low_energy',
            label: 'Low Energy',
            description: 'Exhausted. Movement speed reduced by 50%.',
            cost: -1,
            maxRank: 1,
            statModifiers: {},
            iconPath: '', // Not used here
            type: 'debuff',
            rank: 1,
            duration: 'Until Rest'
        });
    }

    if (activeEffects.length === 0) {
        return (
            <div className="text-center p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No Active Effects</span>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1 mb-2">
                Active Effects
            </h5>
            <div className="grid grid-cols-2 gap-2">
                {activeEffects.map((effect, idx) => (
                    <div 
                        key={`${effect.id || 'unknown'}-${idx}`}
                        className={`
                            flex items-center gap-2 p-2 rounded-lg border shadow-sm transition-all
                            ${effect.type === 'buff' 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                : 'bg-red-50 border-red-200 text-red-800'
                            }
                        `}
                    >
                        <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center text-[10px] border flex-shrink-0
                            ${effect.type === 'buff' ? 'bg-emerald-100 border-emerald-300' : 'bg-red-100 border-red-300'}
                        `}>
                            {effect.type === 'buff' ? '▲' : '▼'}
                        </div>
                        <div className="flex-grow min-w-0">
                            <div className="text-[10px] font-black uppercase leading-tight truncate">{effect.label}</div>
                            {effect.duration && <div className="text-[8px] opacity-70 leading-tight">{effect.duration}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActiveBuffs;
