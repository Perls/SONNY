import React from 'react';

interface EnergyMeterProps {
    currentEnergy: number;
    maxEnergy?: number;
    transitionDuration?: number;
    transitionEasing?: string;
}

const EnergyMeter: React.FC<EnergyMeterProps> = ({ 
    currentEnergy, 
    maxEnergy = 50,
    transitionDuration = 1000, 
    transitionEasing = 'cubic-bezier(0.4, 0, 0.2, 1)'
}) => {
    const energyPercent = Math.min(100, Math.max(0, (currentEnergy / maxEnergy) * 100));

    return (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none">
            <div className="w-10 h-10 bg-white rounded-full border-4 border-slate-200 shadow-md flex items-center justify-center text-amber-500 text-xl z-10 relative">⚡</div>
            <div className="w-4 h-48 bg-slate-200/60 backdrop-blur-sm rounded-full border-2 border-white shadow-inner relative overflow-hidden flex flex-col justify-end p-0.5">
                    <div 
                    className={`w-full rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] relative ${currentEnergy === 0 ? 'bg-red-500' : 'bg-gradient-to-t from-amber-600 to-yellow-400'}`} 
                    style={{ 
                        height: `${energyPercent}%`,
                        transitionProperty: 'height',
                        transitionDuration: `${transitionDuration}ms`,
                        transitionTimingFunction: transitionEasing
                    }}
                    >
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/80"></div>
                    </div>
            </div>
            <div className="bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded-lg border border-slate-600 shadow-lg min-w-[40px] text-center">{Math.floor(currentEnergy)}</div>
        </div>
    );
};

export default EnergyMeter;