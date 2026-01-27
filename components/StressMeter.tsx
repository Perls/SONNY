
import React from 'react';

interface StressMeterProps {
    value: number; // 0-100
}

const StressMeter: React.FC<StressMeterProps> = ({ value }) => {
    // Determine level and color
    let level = 'Ice Cold';
    let color = 'bg-emerald-500';
    let description = "Thinking clearly. Ready for business.";

    if (value >= 75) {
        level = 'Breaking Point';
        color = 'bg-red-600';
        description = "Mistakes are inevitable. Leadership compromised.";
    } else if (value >= 50) {
        level = 'Paranoid';
        color = 'bg-orange-500';
        description = "Seeing enemies in the shadows.";
    } else if (value >= 25) {
        level = 'On Edge';
        color = 'bg-amber-400';
        description = "A bit jumpy. Needs a win.";
    }

    return (
        <div className="group relative">
            <div className="flex justify-between items-end mb-1 px-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stress</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${color.replace('bg-', 'text-')}`}>
                    {level} ({value}%)
                </span>
            </div>
            
            <div className="h-4 w-full bg-slate-200 rounded-sm overflow-hidden border border-slate-300 relative flex">
                {/* Background Stagger Markers */}
                <div className="absolute left-[25%] top-0 bottom-0 w-px bg-white/50 z-10"></div>
                <div className="absolute left-[50%] top-0 bottom-0 w-px bg-white/50 z-10"></div>
                <div className="absolute left-[75%] top-0 bottom-0 w-px bg-white/50 z-10"></div>

                {/* The Bar */}
                <div 
                    className={`h-full transition-all duration-500 ease-out ${color}`} 
                    style={{ width: `${value}%` }}
                >
                    {/* Gloss */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                </div>
            </div>

            {/* Tooltip */}
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 z-50">
                <div className="bg-slate-900 text-white text-[10px] p-2 rounded shadow-xl border border-slate-700 animate-fade-in">
                    <div className="font-bold uppercase text-amber-500 mb-1">{level}</div>
                    <div className="italic text-slate-300">"{description}"</div>
                    <div className="absolute bottom-[-4px] left-4 w-2 h-2 bg-slate-900 transform rotate-45 border-b border-r border-slate-700"></div>
                </div>
            </div>
        </div>
    );
};

export default StressMeter;
