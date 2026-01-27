
import React from 'react';

interface BattleOutcomeProps {
    result: 'won' | 'lost' | 'draw';
    loot: string[];
    playerCasualties: string[];
    enemyCasualties: string[];
    opponentName: string;
    onClose: () => void;
}

const BattleOutcome: React.FC<BattleOutcomeProps> = ({ result, loot, playerCasualties, enemyCasualties, opponentName, onClose }) => {
    return (
        <div className="absolute inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-8 animate-fade-in font-waze">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden border-4 border-slate-800 relative animate-slide-up flex flex-col">
                
                {/* Header */}
                <div className={`p-8 text-center border-b-4 border-slate-800 ${result === 'won' ? 'bg-emerald-500' : result === 'draw' ? 'bg-amber-500' : 'bg-red-600'}`}>
                    <h2 className="text-7xl font-black font-news uppercase tracking-tighter mb-2 text-white drop-shadow-md">
                        {result === 'won' ? 'VICTORY' : result === 'lost' ? 'DEFEAT' : 'STALEMATE'}
                    </h2>
                    <p className="text-white/80 font-bold uppercase tracking-[0.3em] text-sm">
                        Dispute with {opponentName}
                    </p>
                </div>

                <div className="flex-grow p-8 grid grid-cols-2 gap-8 bg-slate-50">
                    
                    {/* Loot Column */}
                    <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm flex flex-col">
                        <h3 className="text-xl font-black uppercase text-slate-800 mb-4 flex items-center gap-2 border-b-2 border-slate-100 pb-2">
                            <span className="text-3xl">💰</span> Spoils of War
                        </h3>
                        <div className="flex-grow overflow-y-auto custom-scrollbar max-h-64">
                            {loot.length > 0 ? (
                                <ul className="space-y-2">
                                    {loot.map((item, idx) => (
                                        <li key={idx} className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-slate-700 font-bold text-sm">
                                            <span>{item}</span>
                                            <span className="text-emerald-500">✓</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 italic">
                                    <span>No valuable assets recovered.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Casualties Column - Split */}
                    <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm flex flex-col">
                        <h3 className="text-xl font-black uppercase text-slate-800 mb-4 flex items-center gap-2 border-b-2 border-slate-100 pb-2">
                            <span className="text-3xl">🩸</span> Casualties Report
                        </h3>
                        
                        <div className="flex-grow flex flex-col gap-4 overflow-y-auto custom-scrollbar max-h-64">
                            {/* Friendly Casualties */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Friendly Losses</h4>
                                {playerCasualties.length > 0 ? (
                                    <ul className="space-y-1">
                                        {playerCasualties.map((name, idx) => (
                                            <li key={`pc-${idx}`} className="flex items-center justify-between p-2 rounded bg-red-50 border border-red-100 text-slate-700 font-bold text-xs">
                                                <span>{name}</span>
                                                <span className="text-red-500 text-[10px]">KIA</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-2 bg-emerald-50 border border-emerald-100 rounded text-center text-emerald-600 text-xs font-bold uppercase">
                                        Zero Casualties
                                    </div>
                                )}
                            </div>

                            {/* Enemy Casualties */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Enemy Neutralized</h4>
                                {enemyCasualties.length > 0 ? (
                                    <ul className="space-y-1">
                                        {enemyCasualties.map((name, idx) => (
                                            <li key={`ec-${idx}`} className="flex items-center justify-between p-2 rounded bg-slate-100 border border-slate-200 text-slate-500 font-bold text-xs grayscale">
                                                <span>{name}</span>
                                                <span className="text-slate-400 text-[10px]">DEAD</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-2 bg-slate-50 border border-slate-100 rounded text-center text-slate-400 text-xs font-bold uppercase italic">
                                        Enemies Retreated
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-100 border-t-2 border-slate-200 flex justify-center">
                    <button 
                        onClick={onClose}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-[0.2em] py-4 px-16 rounded-xl shadow-xl transition-all transform hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 text-lg border-b-4 border-slate-950"
                    >
                        Return to Map
                    </button>
                </div>

            </div>
        </div>
    );
};

export default BattleOutcome;
