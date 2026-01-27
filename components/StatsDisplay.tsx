
import React from 'react';
import { Stats } from '../types';
import StatBar from './StatBar';

interface StatsDisplayProps {
    stats: Stats;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats }) => {
    const getStatColor = (stat: string) => {
        switch(stat) {
          case 'STR': return 'bg-red-700';
          case 'AGI': return 'bg-amber-500';
          case 'INT': return 'bg-teal-600';
          case 'LCK': return 'bg-emerald-600';
          case 'CHA': return 'bg-purple-700';
          case 'WIL': return 'bg-indigo-600';
          default: return 'bg-slate-400';
        }
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-4">
                <div className="h-px bg-slate-300 flex-grow"></div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Attributes</span>
                <div className="h-px bg-slate-300 flex-grow"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <StatBar label="STR" value={stats.strength} colorClass={getStatColor('STR')} />
                <StatBar label="AGI" value={stats.agility} colorClass={getStatColor('AGI')} />
                <StatBar label="INT" value={stats.intelligence} colorClass={getStatColor('INT')} />
                <StatBar label="LCK" value={stats.luck} colorClass={getStatColor('LCK')} />
                <StatBar label="CHA" value={stats.charisma} colorClass={getStatColor('CHA')} />
                <StatBar label="WIL" value={stats.willpower || 0} colorClass={getStatColor('WIL')} />
            </div>
        </div>
    );
};

export default StatsDisplay;
