
import React, { useState } from 'react';
import { useGameEngine } from '../../contexts/GameEngineContext';

const EntertainerOperations: React.FC = () => {
    const { gameState, handleSetupBrothel } = useGameEngine();
    const [activeTab, setActiveTab] = useState<'career' | 'pimping'>('career');

    if (!gameState) return null;

    const brothelCandidates = gameState.holdings.filter(h => 
        (h.type === 'commercial' && h.name.includes("Motel")) || h.brothelData
    );

    const activeBrothels = brothelCandidates.filter(h => h.brothelData);

    const hasOperations = activeBrothels.length > 0;

    return (
        <div className="flex flex-col gap-6 animate-fade-in h-full font-waze">
            
            {/* Header / Wisdom */}
            <div className="bg-slate-900 rounded-xl p-6 border-l-4 border-fuchsia-500 shadow-lg relative overflow-hidden shrink-0">
                <div className="absolute right-0 top-0 opacity-10 text-9xl pointer-events-none transform translate-x-1/4 -translate-y-1/4">💃</div>
                <div className="relative z-10">
                    <div className="text-fuchsia-400 text-xs font-black uppercase tracking-widest mb-2">Wisdom of "Slick" Rick</div>
                    <p className="text-slate-300 font-serif italic leading-relaxed text-sm mb-4 border-l-2 border-slate-600 pl-4">
                        "Fame is fleeting, kid. But vice? Vice is forever. You want the world to love you? Get on stage. You want the world to pay you? Control the night. A good entertainer knows when to sing, and when to collect."
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button 
                    onClick={() => setActiveTab('career')}
                    className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 
                        ${activeTab === 'career' ? 'border-fuchsia-500 text-fuchsia-700 bg-fuchsia-50' : 'border-transparent text-slate-400 hover:text-slate-600'}
                    `}
                >
                    Performing Career
                </button>
                <button 
                    onClick={() => setActiveTab('pimping')}
                    className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 
                        ${activeTab === 'pimping' ? 'border-fuchsia-500 text-fuchsia-700 bg-fuchsia-50' : 'border-transparent text-slate-400 hover:text-slate-600'}
                    `}
                >
                    Red Light District
                </button>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar">
                
                {/* CAREER TAB */}
                {activeTab === 'career' && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-6">
                            <div className="w-20 h-20 bg-fuchsia-100 rounded-full flex items-center justify-center text-4xl shadow-inner border-2 border-fuchsia-200">
                                🎤
                            </div>
                            <div className="flex-grow">
                                <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">Star Power</h4>
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-wide">Current Fame Level</div>
                                <div className="w-full h-4 bg-slate-200 rounded-full mt-2 overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-600 w-[25%] animate-pulse"></div>
                                </div>
                                <div className="text-[10px] text-fuchsia-600 font-mono mt-1 text-right">Upcoming Star</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all">
                                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Gig Availability</div>
                                <div className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                    <span className="text-2xl">🏟️</span> The Stadium
                                </div>
                                <div className="text-xs text-slate-500 mt-1">Locked (Need more Rep)</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all">
                                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Fan Base</div>
                                <div className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                    <span className="text-2xl">👯‍♀️</span> 1,204 Fans
                                </div>
                                <div className="text-xs text-green-500 mt-1">Growing (+12/day)</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* RED LIGHT TAB */}
                {activeTab === 'pimping' && (
                    <div className="space-y-6">
                        
                        {brothelCandidates.length === 0 ? (
                            <div className="bg-white border-2 border-slate-200 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 opacity-5 pattern-deco"></div>
                                
                                <h4 className="text-center text-slate-800 font-black uppercase tracking-widest mb-8 text-lg relative z-10">
                                    The Star System Protocol
                                </h4>
                                
                                <div className="flex justify-between items-start relative w-full max-w-lg z-10">
                                    <div className="absolute top-6 left-10 right-10 h-2 bg-slate-100 -z-10 rounded-full">
                                        <div className="h-full w-1/2 bg-fuchsia-100 rounded-full"></div>
                                    </div>

                                    {[
                                        { icon: '🗺️', label: '1. Scout', desc: 'Find Motels' },
                                        { icon: '💰', label: '2. Buy', desc: 'Purchase Property' },
                                        { icon: '💋', label: '3. Setup', desc: 'Establish House' },
                                        { icon: '💸', label: '4. Profit', desc: 'Manage Workers' }
                                    ].map((step, i) => (
                                        <div key={i} className="flex flex-col items-center text-center w-1/4 group">
                                            <div className="w-14 h-14 bg-white rounded-full border-4 border-slate-100 flex items-center justify-center text-2xl mb-3 shadow-sm group-hover:border-fuchsia-400 group-hover:scale-110 transition-all">
                                                {step.icon}
                                            </div>
                                            <div className="text-xs font-black text-slate-800 uppercase mb-1">{step.label}</div>
                                            <div className="text-[10px] text-slate-400 font-medium leading-tight px-1">{step.desc}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-12">
                                    <div className="bg-fuchsia-50 text-fuchsia-700 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-fuchsia-200 animate-pulse">
                                        Acquire a "No-Tell Motel" to Begin
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {brothelCandidates.map(h => {
                                    const isBrothel = !!h.brothelData;
                                    return (
                                        <div key={h.id} className={`p-4 rounded-xl border-2 shadow-sm transition-all relative overflow-hidden group ${isBrothel ? 'bg-fuchsia-50 border-fuchsia-300' : 'bg-white border-slate-200'}`}>
                                            <div className="flex justify-between items-start z-10 relative">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-3xl shadow-inner border-2 ${isBrothel ? 'bg-fuchsia-200 border-fuchsia-400' : 'bg-slate-100 border-slate-300'}`}>
                                                        {isBrothel ? '💋' : '🏩'}
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-black uppercase tracking-widest mb-0.5 text-slate-400">Block {h.x}-{h.y}</div>
                                                        <h3 className="font-bold text-lg text-slate-800 leading-none">{h.name}</h3>
                                                        <div className={`text-[10px] font-bold uppercase mt-1 px-2 py-0.5 rounded inline-block ${isBrothel ? 'bg-fuchsia-200 text-fuchsia-800' : 'bg-slate-200 text-slate-500'}`}>
                                                            {isBrothel ? 'Active Operation' : 'Dormant Property'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className="font-mono font-bold text-emerald-600 text-lg">+{h.income}/d</div>
                                                    {isBrothel && <div className="text-[10px] text-red-500 font-bold uppercase">High Heat</div>}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="mt-4 pt-3 border-t border-slate-200/50 flex justify-end">
                                                {!isBrothel ? (
                                                    <button 
                                                        onClick={() => handleSetupBrothel(h.id)}
                                                        className="bg-slate-900 text-fuchsia-400 hover:text-fuchsia-200 hover:bg-slate-800 px-4 py-2 rounded-lg font-black uppercase text-xs tracking-widest shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                                                    >
                                                        <span>Setup Brothel</span>
                                                        <span className="text-white opacity-50 font-mono">N$ 1000</span>
                                                    </button>
                                                ) : (
                                                    <div className="w-full flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex -space-x-2">
                                                                {[...Array(h.brothelData?.activeWorkers || 0)].map((_, i) => (
                                                                    <div key={i} className="w-6 h-6 rounded-full bg-fuchsia-300 border-2 border-white flex items-center justify-center text-[10px]">👯‍♀️</div>
                                                                ))}
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Workers Active</span>
                                                        </div>
                                                        <button className="text-[10px] font-black uppercase text-fuchsia-700 hover:text-fuchsia-900 underline">Manage</button>
                                                    </div>
                                                )}
                                            </div>
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

export default EntertainerOperations;
