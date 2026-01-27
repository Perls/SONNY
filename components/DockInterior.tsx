
import React, { useState } from 'react';
import { ITEMS } from '../constants';
import WeaponQuest from '../quests/WeaponQuest';

interface DockInteriorProps {
    building: any;
    onClose: () => void;
    onShop: (item: any) => void;
}

const DockInterior: React.FC<DockInteriorProps> = ({ building, onClose, onShop }) => {
    const [showWeaponQuest, setShowWeaponQuest] = useState(false);
    const [message, setMessage] = useState("");

    // Simple items for dock shop
    const DOCK_STOCK = ['manual_parts', 'crowbar', 'vodka_coke']; 

    const handleBuy = (itemId: string) => {
        const item = ITEMS[itemId];
        if (item) {
            onShop(item);
            setMessage(`Purchased ${item.name}`);
            setTimeout(() => setMessage(""), 2000);
        }
    };

    return (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center font-waze animate-fade-in p-6">
            
            {showWeaponQuest ? (
                <WeaponQuest onClose={() => setShowWeaponQuest(false)} />
            ) : (
                <div className="bg-slate-900 w-full max-w-5xl rounded-xl shadow-2xl border-4 border-slate-700 overflow-hidden flex flex-col relative h-[650px]">
                    
                    {/* Header */}
                    <div className="h-40 relative shrink-0 bg-slate-950 border-b-4 border-slate-800">
                        <img 
                            src="https://images.unsplash.com/photo-1542397284385-6010376c5337?q=80&w=1000&auto=format&fit=crop" 
                            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                        <div className="absolute bottom-6 left-8">
                            <h1 className="text-4xl font-black font-news text-white uppercase tracking-tighter drop-shadow-lg">
                                {building.name}
                            </h1>
                            <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mt-1 bg-black/50 px-2 py-1 inline-block rounded">
                                Import / Export Zone
                            </div>
                        </div>
                        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-red-600 transition-colors">✕</button>
                    </div>

                    {/* Content */}
                    <div className="flex-grow flex bg-[#0f172a]">
                        
                        {/* Left: Actions */}
                        <div className="w-1/2 p-8 flex flex-col gap-4 border-r border-slate-800">
                            <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Operations</div>
                            
                            <button 
                                onClick={() => setShowWeaponQuest(true)}
                                className="p-6 bg-amber-900/20 border-2 border-amber-700/50 rounded-xl text-left hover:bg-amber-900/40 hover:border-amber-500 hover:shadow-lg transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-10 text-6xl group-hover:scale-110 transition-transform duration-500">🔫</div>
                                <div className="relative z-10">
                                    <div className="text-lg font-black text-amber-500 uppercase mb-1">Secure Untraceables</div>
                                    <div className="text-xs text-amber-200/70 font-medium">
                                        Commission a specific weapon artifact. High risk, high reward.
                                    </div>
                                    <div className="mt-3 text-[10px] font-mono text-amber-600 bg-black/30 inline-block px-2 py-1 rounded">
                                        Req: N$ 500 + Manual
                                    </div>
                                </div>
                            </button>

                            <button className="p-4 bg-slate-800 border border-slate-700 rounded-xl text-left opacity-50 cursor-not-allowed">
                                <div className="font-bold text-slate-300 uppercase text-sm">Smuggler's Run</div>
                                <div className="text-[10px] text-slate-500">Locked (Level 5 Required)</div>
                            </button>
                            
                            <button className="p-4 bg-slate-800 border border-slate-700 rounded-xl text-left opacity-50 cursor-not-allowed">
                                <div className="font-bold text-slate-300 uppercase text-sm">Union Meeting</div>
                                <div className="text-[10px] text-slate-500">Locked (Daytime Only)</div>
                            </button>
                        </div>

                        {/* Right: Shop */}
                        <div className="w-1/2 p-8 bg-[#1e293b]">
                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex justify-between items-center">
                                <span>Black Market</span>
                                {message && <span className="text-emerald-500 animate-pulse">{message}</span>}
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                                {DOCK_STOCK.map(itemId => {
                                    const item = ITEMS[itemId];
                                    if (!item) return null;
                                    return (
                                        <button 
                                            key={itemId} 
                                            onClick={() => handleBuy(itemId)}
                                            className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-500 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</div>
                                                <div className="text-left">
                                                    <div className="text-xs font-bold text-slate-200 uppercase">{item.name}</div>
                                                    <div className="text-[9px] text-slate-500">{item.description}</div>
                                                </div>
                                            </div>
                                            <div className="text-xs font-mono font-bold text-emerald-500">N$ {item.cost}</div>
                                        </button>
                                    )
                                })}
                            </div>
                            
                            <div className="mt-8 p-4 bg-black/20 rounded border border-white/5 text-[10px] text-slate-500 font-mono">
                                TIP: You need the "Gunsmith Manual" to start the weapon quest. Buy it here if you don't have it.
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default DockInterior;
