
import React, { useState } from 'react';
import { ITEMS } from '../../constants';

interface ParkInteriorProps {
    onClose: () => void;
    onRest: () => void;
    onReduceStress?: (amount: number) => void;
    onShop: (item: any) => void;
    name?: string; // New prop for dynamic name
}

const ParkInterior: React.FC<ParkInteriorProps> = ({ onClose, onRest, onReduceStress, onShop, name = "Central Park" }) => {
    const [message, setMessage] = useState("");
    const [isRelaxing, setIsRelaxing] = useState(false);

    const handleAction = (action: () => void, msg: string) => {
        action();
        setMessage(msg);
        setTimeout(() => setMessage(""), 3000);
    };

    const handleRelax = () => {
        if (isRelaxing) return;
        setIsRelaxing(true);
        handleAction(() => {
            onRest();
            if (onReduceStress) onReduceStress(15); // Reduce 15 stress
        }, "The city noise fades away. You feel lighter.");
        setTimeout(() => setIsRelaxing(false), 3000);
    };

    const handleBuyWeed = () => {
        const item = ITEMS['weed'];
        if (item) {
            handleAction(() => onShop(item), "Bought Bag of Weed.");
        }
    };

    return (
        <div className="absolute inset-0 z-[60] bg-black/70 backdrop-blur-md flex items-center justify-center font-waze animate-fade-in p-6">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border-4 border-emerald-800 overflow-hidden flex flex-col relative h-[600px]">
                
                {/* Header */}
                <div className="h-48 relative flex-shrink-0 bg-emerald-900 border-b-4 border-emerald-700 group">
                    <img 
                        src="https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?q=80&w=1000&auto=format&fit=crop"
                        className="w-full h-full object-cover opacity-70 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000"
                        alt="Park View"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900 via-transparent to-transparent"></div>
                    
                    <div className="absolute bottom-6 left-8 text-white">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-14 h-14 rounded-lg flex items-center justify-center text-3xl shadow-lg bg-emerald-700 border-2 border-emerald-500">
                                🌳
                            </div>
                            <div>
                                <h1 className="text-4xl font-black font-news uppercase tracking-tighter leading-none text-emerald-50 drop-shadow-md">
                                    {name}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-emerald-300 font-bold text-xs uppercase tracking-widest bg-emerald-900/50 px-2 py-0.5 rounded border border-emerald-700">Neutral Ground</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all shadow-lg text-lg bg-emerald-100 text-emerald-800 hover:bg-white hover:text-emerald-900"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-grow bg-slate-50">
                    
                    {/* Visual Scene (Left) */}
                    <div className="w-1/2 relative overflow-hidden border-r-4 border-emerald-100 bg-[#f0fdf4]">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/grass.png")' }}></div>
                        
                        {/* Park Elements */}
                        <div className="absolute bottom-10 left-10 text-6xl opacity-80 filter drop-shadow-sm">🛋️</div>
                        <div className="absolute bottom-20 right-20 text-5xl opacity-80 filter drop-shadow-sm">🌲</div>
                        <div className="absolute top-20 left-20 text-4xl opacity-60 filter drop-shadow-sm">🐦</div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                            {message ? (
                                <div className="bg-white border-2 border-emerald-500 p-6 rounded-xl shadow-xl animate-pop-in relative z-20">
                                    <div className="text-2xl mb-2">🌿</div>
                                    <div className="font-black uppercase text-emerald-900 text-lg">{message}</div>
                                </div>
                            ) : (
                                <div className="font-mono text-xs uppercase tracking-widest px-4 py-2 rounded text-emerald-700 bg-emerald-100/50 border border-emerald-200">
                                    A rare quiet spot in the concrete jungle.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions Menu (Right) */}
                    <div className="w-1/2 p-8 flex flex-col gap-4 overflow-y-auto custom-scrollbar text-slate-800 bg-white">
                        
                        <div className="text-xs font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-2 text-slate-400">Leisure</div>
                        
                        <button 
                            onClick={handleRelax}
                            disabled={isRelaxing}
                            className={`flex items-center gap-4 p-4 border-2 rounded-xl transition-all group text-left shadow-sm
                                ${isRelaxing ? 'bg-emerald-50 border-emerald-200 cursor-wait' : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-md'}
                            `}
                        >
                            <div className="text-3xl group-hover:scale-110 transition-transform">🧘</div>
                            <div>
                                <div className="font-black text-slate-800 uppercase">Take a Breather</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Restore Energy • -15 Stress</div>
                            </div>
                        </button>

                        <div className="h-px bg-slate-100 my-2"></div>

                        <div className="text-xs font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-2 text-slate-400">Market</div>

                        <button 
                            onClick={handleBuyWeed}
                            className="flex items-center gap-4 p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-amber-400 hover:shadow-md transition-all group text-left"
                        >
                            <div className="text-3xl grayscale group-hover:grayscale-0 transition-all opacity-80">🏂</div>
                            <div className="flex-grow">
                                <div className="font-black text-slate-800 uppercase">Find "The Skater"</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Buy Weed</div>
                                <div className="text-xs font-mono font-bold text-emerald-600 mt-1">N$ {ITEMS['weed'].cost}</div>
                            </div>
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParkInterior;
