
import React, { useState } from 'react';

interface ReviewStepProps {
    characterName: string;
    setCharacterName: (s: string) => void;
    realName: string;
    setRealName: (s: string) => void;
    phoneNumber: string;
    onRegeneratePhone: () => void;
    selectedNeighborhood: string;
    onSelectNeighborhood: (id: string) => void;
}

const NEIGHBORHOODS = [
    { id: 'hudson_sq', name: 'Hudson Square', status: 'ONLINE', pop: 'Medium', ping: '24ms', desc: 'The starting block. Balanced economy.', active: true },
    { id: 'hells_kitchen', name: "Hell's Kitchen", status: 'OFFLINE', pop: 'High', ping: '--', desc: 'Locked: Requires Level 10.', active: false },
    { id: 'harlem', name: 'Harlem', status: 'MAINTENANCE', pop: 'Low', ping: '999ms', desc: 'Server under construction.', active: false },
    { id: 'fidi', name: 'Financial Dist.', status: 'LOCKED', pop: 'Full', ping: '--', desc: 'Invite Only.', active: false },
];

const ReviewStep: React.FC<ReviewStepProps> = ({ 
    characterName, 
    setCharacterName, 
    realName, 
    setRealName, 
    phoneNumber, 
    onRegeneratePhone,
    selectedNeighborhood,
    onSelectNeighborhood
}) => {
    return (
        <div className="flex-grow flex flex-col items-center justify-center p-4 animate-fade-in h-full">
            <div className="w-full max-w-6xl bg-white border-2 border-slate-200 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col h-full max-h-[80vh]">
                
                {/* Header */}
                <div className="bg-slate-900 p-6 border-b-4 border-amber-500 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-3xl font-black text-white font-news uppercase tracking-tight">Finalize Contract</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Identity & Network Selection</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse delay-75"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse delay-150"></div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row flex-grow overflow-hidden bg-slate-50">
                    
                    {/* LEFT: PERSONAL DOSSIER */}
                    <div className="w-full lg:w-5/12 p-8 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col overflow-y-auto custom-scrollbar">
                        <div className="mb-6 flex items-center gap-2 text-slate-400">
                            <span className="text-xl">📁</span>
                            <span className="text-xs font-black uppercase tracking-widest">Personal File</span>
                        </div>

                        {/* Code Name */}
                        <div className="mb-8">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Street Alias (Required)</label>
                            <input 
                                type="text" 
                                value={characterName} 
                                onChange={(e) => setCharacterName(e.target.value)} 
                                placeholder="e.g. Lucky Luciano" 
                                className="w-full bg-white border-2 border-slate-300 text-slate-900 text-2xl font-black font-news p-4 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-slate-300" 
                                autoFocus 
                            />
                        </div>

                        {/* Real Name */}
                        <div className="mb-8">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Legal Name (Optional)</label>
                            <input 
                                type="text" 
                                value={realName} 
                                onChange={(e) => setRealName(e.target.value)} 
                                placeholder="John Doe" 
                                className="w-full bg-white border-2 border-slate-300 text-slate-700 text-lg font-bold p-4 rounded-xl focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-300" 
                            />
                            <p className="text-[10px] text-slate-400 mt-2 italic leading-tight pl-1">
                                Save your real name for the feds. These are the streets, be careful who you trust with the truth.
                            </p>
                        </div>

                        {/* Phone Number */}
                        <div className="mt-auto bg-slate-100 p-4 rounded-xl border border-slate-200">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Assigned 917 Number & Extension</label>
                            <div className="flex gap-2">
                                <div className="flex-grow bg-white border-2 border-slate-300 rounded-lg p-3 font-mono text-xl font-bold text-slate-800 tracking-wider text-center select-all shadow-inner">
                                    {phoneNumber}
                                </div>
                                <button 
                                    onClick={onRegeneratePhone} 
                                    className="bg-slate-200 hover:bg-white hover:border-amber-400 border-2 border-slate-300 text-xl w-14 rounded-lg flex items-center justify-center transition-all shadow-sm active:translate-y-0.5"
                                    title="Generate New Number"
                                >
                                    🎲
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: SERVER SELECT */}
                    <div className="w-full lg:w-7/12 p-0 flex flex-col bg-slate-900 relative">
                        {/* CRT Grid Background */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" 
                             style={{ backgroundImage: 'linear-gradient(rgba(0, 255, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 0, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                        </div>

                        <div className="p-8 flex-grow flex flex-col relative z-10">
                            <div className="flex justify-between items-end mb-6">
                                <div className="flex items-center gap-3 text-emerald-500">
                                    <span className="text-xl animate-pulse">📡</span>
                                    <span className="text-xs font-black uppercase tracking-widest">NetLink Uplink</span>
                                </div>
                                <div className="text-[10px] font-mono text-emerald-700">Ping: 24ms</div>
                            </div>

                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700 mb-2">
                                <div className="col-span-1 text-center">Stat</div>
                                <div className="col-span-5">District Name</div>
                                <div className="col-span-3">Pop.</div>
                                <div className="col-span-3 text-right">Latency</div>
                            </div>

                            {/* Server List */}
                            <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2">
                                {NEIGHBORHOODS.map((hood) => {
                                    const isSelected = selectedNeighborhood === hood.id;
                                    const isDisabled = !hood.active;

                                    return (
                                        <button
                                            key={hood.id}
                                            onClick={() => !isDisabled && onSelectNeighborhood(hood.id)}
                                            disabled={isDisabled}
                                            className={`w-full grid grid-cols-12 gap-4 px-4 py-4 rounded-lg border items-center transition-all text-left relative overflow-hidden group
                                                ${isSelected 
                                                    ? 'bg-emerald-900/30 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                                                    : isDisabled
                                                        ? 'bg-slate-800/50 border-slate-800 opacity-50 cursor-not-allowed'
                                                        : 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600'
                                                }
                                            `}
                                        >
                                            {/* Status Dot */}
                                            <div className="col-span-1 flex justify-center">
                                                <div className={`w-2 h-2 rounded-full ${hood.status === 'ONLINE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500'}`}></div>
                                            </div>

                                            {/* Name & Desc */}
                                            <div className="col-span-5">
                                                <div className={`font-black font-news uppercase text-lg leading-none ${isSelected ? 'text-white' : isDisabled ? 'text-slate-500' : 'text-slate-300'}`}>
                                                    {hood.name}
                                                </div>
                                                <div className={`text-[9px] font-mono mt-1 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                    {hood.desc}
                                                </div>
                                            </div>

                                            {/* Population */}
                                            <div className="col-span-3 text-xs font-bold text-slate-400 uppercase">
                                                {hood.pop}
                                            </div>

                                            {/* Ping */}
                                            <div className="col-span-3 text-right">
                                                <div className={`font-mono text-xs ${hood.ping === '--' ? 'text-slate-600' : 'text-emerald-500'}`}>
                                                    {hood.ping}
                                                </div>
                                                <div className="text-[8px] font-bold text-slate-600 uppercase">{hood.status}</div>
                                            </div>
                                            
                                            {/* Selection Marker */}
                                            {isSelected && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Server Info Footer */}
                            <div className="mt-auto pt-6 border-t border-slate-800 text-center">
                                <p className="text-[10px] text-slate-500 font-mono">
                                    SERVER: NYC-PRIME [ALPHA] • REGION: US-EAST • VER: 0.9.4
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewStep;
