
import React, { useState } from 'react';
import { ITEMS } from '../constants';

interface MedicalInteriorProps {
    building: any;
    onClose: () => void;
    onHeal: (cost: number) => void;
    onShop: (item: any) => void;
    onReduceStress?: (amount: number) => void;
}

const MedicalInterior: React.FC<MedicalInteriorProps> = ({ building, onClose, onHeal, onShop, onReduceStress }) => {
    const [message, setMessage] = useState("");
    const variant = building.variant || 'doctor'; // doctor, vet, pharmacy, morgue

    const handleAction = (action: () => void, msg: string) => {
        action();
        setMessage(msg);
        setTimeout(() => setMessage(""), 3000);
    };

    // Config based on variant
    let headerImage = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop"; // Doctor default
    let headerColor = "bg-sky-600";
    let accentColor = "text-sky-500";
    let icon = "🩺";
    let subTitle = "Medical Practice";
    
    // Shop Items for Pharmacy
    const PHARMACY_STOCK = ['medkit', 'stimpack', 'painkillers', 'bandages'];

    if (variant === 'vet') {
        headerImage = "https://images.unsplash.com/photo-1623366302587-b38b1ddaefd9?q=80&w=1000&auto=format&fit=crop";
        headerColor = "bg-emerald-700";
        accentColor = "text-emerald-600";
        icon = "🐾";
        subTitle = "Veterinary Clinic";
    } else if (variant === 'pharmacy') {
        headerImage = "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=1000&auto=format&fit=crop";
        headerColor = "bg-red-600";
        accentColor = "text-red-500";
        icon = "💊";
        subTitle = "Pharmacy & Supplies";
    } else if (variant === 'morgue') {
        headerImage = "https://images.unsplash.com/photo-1516574187841-693018f547bd?q=80&w=1000&auto=format&fit=crop";
        headerColor = "bg-slate-800";
        accentColor = "text-slate-400";
        icon = "⚰️";
        subTitle = "City Morgue";
    }

    return (
        <div className="absolute inset-0 z-[60] bg-black/70 backdrop-blur-md flex items-center justify-center font-waze animate-fade-in p-6">
            <div className={`bg-white w-full max-w-4xl rounded-2xl shadow-2xl border-4 ${variant === 'morgue' ? 'border-slate-700' : 'border-slate-200'} overflow-hidden flex flex-col relative h-[600px]`}>
                
                {/* Header */}
                <div className={`h-48 relative flex-shrink-0 ${variant === 'morgue' ? 'bg-slate-900' : 'bg-white'} border-b-4 border-slate-200 group`}>
                    <img 
                        src={headerImage}
                        className={`w-full h-full object-cover ${variant === 'morgue' ? 'opacity-40 grayscale mix-blend-luminosity' : 'opacity-80 mix-blend-multiply'} group-hover:scale-105 transition-transform duration-1000`}
                        alt={variant}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${variant === 'morgue' ? 'from-slate-900' : 'from-white'} via-transparent to-transparent`}></div>
                    
                    <div className={`absolute bottom-6 left-8 ${variant === 'morgue' ? 'text-white' : 'text-slate-900'}`}>
                        <div className="flex items-center gap-3 mb-1">
                            <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-3xl shadow-lg ${headerColor} text-white`}>
                                {icon}
                            </div>
                            <div>
                                <h1 className="text-4xl font-black font-news uppercase tracking-tighter leading-none shadow-black drop-shadow-sm">
                                    {building.name}
                                </h1>
                                <div className={`flex items-center gap-2 mt-1 font-bold text-xs uppercase tracking-widest ${variant === 'morgue' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <span>{subTitle}</span>
                                    {variant === 'vet' && <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 text-[9px]">Discrete</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={onClose} 
                        className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all shadow-lg text-lg ${variant === 'morgue' ? 'bg-slate-800 text-white hover:bg-red-900' : 'bg-white text-slate-500 hover:text-red-500 hover:bg-slate-50'}`}
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className={`flex flex-grow ${variant === 'morgue' ? 'bg-slate-900' : 'bg-slate-50'}`}>
                    
                    {/* Visual Scene (Left) */}
                    <div className={`w-1/2 relative overflow-hidden border-r-4 ${variant === 'morgue' ? 'bg-black border-slate-800' : 'bg-white border-slate-200'}`}>
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                            {message ? (
                                <div className={`p-6 rounded-xl shadow-xl animate-pop-in relative z-20 border-2 ${variant === 'morgue' ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                                    <div className="text-2xl mb-2">💬</div>
                                    <div className="font-black uppercase text-lg">{message}</div>
                                </div>
                            ) : (
                                <div className={`font-mono text-xs uppercase tracking-widest px-4 py-2 rounded ${variant === 'morgue' ? 'text-slate-600 bg-slate-900 border border-slate-800' : 'text-slate-400 bg-slate-50 border border-slate-200'}`}>
                                    {variant === 'doctor' && "The Doctor is In."}
                                    {variant === 'vet' && "No questions asked."}
                                    {variant === 'pharmacy' && "Prescription or Cash."}
                                    {variant === 'morgue' && "Silence is Golden."}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions Menu (Right) */}
                    <div className={`w-1/2 p-8 flex flex-col gap-4 overflow-y-auto custom-scrollbar ${variant === 'morgue' ? 'text-slate-300' : 'text-slate-800'}`}>
                        
                        {/* DOCTOR ACTIONS */}
                        {variant === 'doctor' && (
                            <>
                                <div className="text-xs font-black uppercase tracking-widest border-b border-slate-300 pb-2 mb-2 text-slate-400">Medical Services</div>
                                <button 
                                    onClick={() => handleAction(() => onHeal(500), "Full treatment complete. You feel brand new.")}
                                    className="flex items-center gap-4 p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-sky-500 hover:shadow-md transition-all group text-left"
                                >
                                    <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">🩺</div>
                                    <div>
                                        <div className="font-black text-slate-800 uppercase">Full Checkup</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Heal All • Reduce Stress</div>
                                        <div className="text-xs font-mono font-bold text-sky-600 mt-1">N$ 500</div>
                                    </div>
                                </button>
                                <button 
                                    onClick={() => handleAction(() => onReduceStress && onReduceStress(20), "Therapy session complete. Nerves settled.")}
                                    className="flex items-center gap-4 p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group text-left"
                                >
                                    <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">🛋️</div>
                                    <div>
                                        <div className="font-black text-slate-800 uppercase">Therapy</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">-20 Stress</div>
                                        <div className="text-xs font-mono font-bold text-indigo-600 mt-1">N$ 200</div>
                                    </div>
                                </button>
                            </>
                        )}

                        {/* VET ACTIONS */}
                        {variant === 'vet' && (
                            <>
                                <div className="text-xs font-black uppercase tracking-widest border-b border-slate-300 pb-2 mb-2 text-slate-400">Backalley Services</div>
                                <button 
                                    onClick={() => handleAction(() => onHeal(100), "Stitched up. Not pretty, but it works.")}
                                    className="flex items-center gap-4 p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all group text-left"
                                >
                                    <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">🧵</div>
                                    <div>
                                        <div className="font-black text-slate-800 uppercase">Stitch Up</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Heal Crew (Moderate)</div>
                                        <div className="text-xs font-mono font-bold text-emerald-600 mt-1">N$ 100</div>
                                    </div>
                                </button>
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-800 italic">
                                    "I usually work on dogs, but anatomy is anatomy, right?"
                                </div>
                            </>
                        )}

                        {/* PHARMACY ACTIONS */}
                        {variant === 'pharmacy' && (
                            <>
                                <div className="text-xs font-black uppercase tracking-widest border-b border-slate-300 pb-2 mb-2 text-slate-400">Supplies</div>
                                <div className="grid grid-cols-1 gap-2">
                                    {PHARMACY_STOCK.map(itemId => {
                                        const item = ITEMS[itemId];
                                        if (!item) return null;
                                        return (
                                            <button 
                                                key={itemId}
                                                onClick={() => handleAction(() => onShop(item), `Purchased ${item.name}`)}
                                                className="flex justify-between items-center p-3 rounded-lg bg-white border border-slate-200 hover:border-red-400 hover:shadow-sm transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{item.icon}</span>
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-800 uppercase">{item.name}</div>
                                                        <div className="text-[9px] text-slate-400">Restores HP/Status</div>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-mono font-bold text-red-600">N$ {item.cost}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* MORGUE ACTIONS */}
                        {variant === 'morgue' && (
                            <>
                                <div className="text-xs font-black uppercase tracking-widest border-b border-slate-700 pb-2 mb-2 text-slate-500">Restricted</div>
                                <button 
                                    onClick={() => handleAction(() => {
                                        // Loot logic: Gain ~150 cash, +10 Stress
                                        if (onReduceStress) onReduceStress(-10); // Negative reduce = Increase stress
                                        onShop({ id: 'gold_tooth', name: 'Gold Tooth', cost: -150 }); // Negative cost = gain money hack for now
                                    }, "You found some valuables. You feel sick.")}
                                    className="flex items-center gap-4 p-4 bg-slate-800 border-2 border-slate-700 rounded-xl hover:border-slate-500 hover:bg-slate-700 transition-all group text-left"
                                >
                                    <div className="text-3xl opacity-50 group-hover:opacity-100 transition-opacity">🔦</div>
                                    <div>
                                        <div className="font-black text-slate-300 uppercase">Loot Lockers</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Find Valuables • High Stress</div>
                                    </div>
                                </button>
                                <button 
                                    className="flex items-center gap-4 p-4 bg-slate-800 border-2 border-slate-700 rounded-xl opacity-50 cursor-not-allowed"
                                >
                                    <div className="text-3xl grayscale">📋</div>
                                    <div>
                                        <div className="font-black text-slate-400 uppercase">Identify Body</div>
                                        <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wide">Recover Lost Crew (Locked)</div>
                                    </div>
                                </button>
                            </>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicalInterior;
