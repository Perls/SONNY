


import React, { useEffect, useState } from 'react';
import { CrewMember, ClassType } from '../../types';
import { CLASSES } from '../../constants';

interface BattleIntroProps {
    playerLeader: CrewMember;
    enemyName: string;
    enemyClass: ClassType;
    playerQuote: string;
    enemyQuote: string;
    onComplete: () => void;
}

const BattleIntro: React.FC<BattleIntroProps> = ({ playerLeader, enemyName, enemyClass, playerQuote, enemyQuote, onComplete }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Timeline:
        // 0: Start
        // 1: Characters Slide In (100ms)
        // 2: VS Screen (800ms)
        // 3: Nameplates & Enemy Quote (1500ms)
        // 4: End (10000ms) - Increased for reading time
        
        const timers = [
            setTimeout(() => setStep(1), 100),
            setTimeout(() => setStep(2), 800),
            setTimeout(() => setStep(3), 1500),
            setTimeout(() => onComplete(), 10000), 
        ];

        return () => timers.forEach(t => clearTimeout(t));
    }, []);

    const playerClassLabel = CLASSES[playerLeader.classType].label;
    const enemyClassLabel = CLASSES[enemyClass]?.label || enemyClass;

    return (
        <div className="absolute inset-0 z-[200] bg-white overflow-hidden font-waze cursor-pointer select-none" onClick={onComplete}>
            
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 pattern-deco pointer-events-none"></div>

            {/* BACKGROUND: SPLIT LIGHT THEME */}
            <div className="absolute inset-0 flex">
                {/* Player Side (Left) */}
                <div className={`
                    w-1/2 h-full bg-slate-50 relative overflow-hidden transition-all duration-700 ease-out border-r-2 border-amber-500
                    ${step >= 1 ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
                `}>
                    <div className="absolute top-0 left-0 w-full h-full opacity-5" style={{ backgroundImage: 'radial-gradient(#d4af37 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
                    
                    <div className="absolute bottom-0 left-0 w-full h-full flex items-end justify-start pl-10 pb-0">
                         <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${playerLeader.imageSeed}&backgroundColor=transparent`} 
                            className={`
                                h-[85%] w-auto object-cover transform transition-all duration-500 origin-bottom
                                ${step >= 2 ? 'scale-105 brightness-110' : 'scale-100 grayscale'}
                                filter drop-shadow-xl
                            `}
                        />
                    </div>
                </div>

                {/* Enemy Side (Right) */}
                <div className={`
                    w-1/2 h-full bg-slate-100 relative overflow-hidden transition-all duration-700 ease-out border-l-2 border-amber-500
                    ${step >= 1 ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
                `}>
                    <div className="absolute top-0 right-0 w-full h-full opacity-5" style={{ backgroundImage: 'radial-gradient(#94a3b8 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>

                    <div className="absolute bottom-0 right-0 w-full h-full flex items-end justify-end pr-10 pb-0">
                         <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${enemyName}&backgroundColor=transparent`} 
                            className={`
                                h-[85%] w-auto object-cover transform scale-x-[-1] transition-all duration-500 origin-bottom
                                ${step >= 2 ? 'scale-x-[-1.05] brightness-110' : ''}
                                filter drop-shadow-xl
                            `}
                        />
                    </div>
                </div>
            </div>

            {/* VS OVERLAY */}
            {step >= 2 && (
                <div className="absolute inset-0 flex items-center justify-center z-50 animate-pop-in pointer-events-none">
                    <div className="relative">
                        <div className="text-[150px] font-black font-news text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600 drop-shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
                            VS
                        </div>
                        <div className="absolute inset-0 border-4 border-amber-500 rounded-full opacity-20 animate-ping"></div>
                    </div>
                </div>
            )}

            {/* NAMEPLATES & QUOTES */}
            {step >= 3 && (
                <div className="absolute inset-0 z-50 pointer-events-none">
                    
                    {/* Player Nameplate (Left) - Quote removed per request */}
                    <div className="absolute top-1/4 left-12 animate-slide-in-left">
                        <div className="bg-white border-4 border-slate-900 shadow-[8px_8px_0px_rgba(217,119,6,0.2)] p-6">
                            <h2 className="text-4xl font-black font-news text-slate-900 uppercase leading-none mb-1">{playerLeader.name}</h2>
                            <div className="text-sm font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 inline-block border border-amber-200">
                                {playerClassLabel.replace('The ', '')}
                            </div>
                        </div>
                    </div>

                    {/* Enemy Nameplate (Right) & GIANT QUOTE */}
                    <div className="absolute top-1/4 right-12 flex flex-col items-end animate-slide-in-right">
                        <div className="bg-slate-900 border-4 border-white shadow-[8px_8px_0px_rgba(0,0,0,0.2)] p-6 text-right">
                            <h2 className="text-4xl font-black font-news text-white uppercase leading-none mb-1">{enemyName}</h2>
                            <div className="text-sm font-bold text-red-400 uppercase tracking-widest bg-red-900/30 px-2 py-1 inline-block border border-red-500/50">
                                {enemyClassLabel.replace('The ', '')}
                            </div>
                        </div>
                        {/* Quote Bubble - Enlarged for emphasis */}
                        <div className="mt-8 bg-white text-slate-900 p-8 rounded-xl rounded-tr-none border-4 border-slate-900 max-w-2xl shadow-2xl relative text-right">
                            <div className="absolute -top-4 right-0 w-8 h-8 bg-white transform rotate-45 border-t-4 border-l-4 border-slate-900"></div>
                            <p className="text-4xl font-black font-news leading-tight uppercase">"{enemyQuote}"</p>
                        </div>
                    </div>

                </div>
            )}

            {/* Skip Button */}
            <button 
                onClick={(e) => { e.stopPropagation(); onComplete(); }}
                className="absolute bottom-12 right-12 z-[70] bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest px-6 py-3 border-2 border-slate-200 shadow-sm transition-all rounded text-xs pointer-events-auto"
            >
                Start Fight ➜
            </button>

        </div>
    );
};

export default BattleIntro;