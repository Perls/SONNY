
import React, { useState } from 'react';
import { ITEMS } from '../constants';

interface CommercialInteriorProps {
    building: any;
    isOwned: boolean;
    onClose: () => void;
    onRob: () => void;
    onShop: (item: any) => void;
    onCollect: () => void;
}

const CommercialInterior: React.FC<CommercialInteriorProps> = ({ 
    building, isOwned, onClose, onRob, onShop, onCollect 
}) => {
    const [message, setMessage] = useState("");

    const handleAction = (action: () => void, msg: string) => {
        action();
        setMessage(msg);
        setTimeout(() => setMessage(""), 3000);
    };

    const SHOP_ITEMS = ['vodka_coke', 'medkit', 'burner', 'phone_book'];

    return (
        <div className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center font-waze animate-fade-in p-6">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border-4 border-slate-800 overflow-hidden flex flex-col relative h-[600px]">
                
                {/* Header Image */}
                <div className="h-48 relative flex-shrink-0 bg-slate-900 border-b-4 border-slate-800 group">
                    <img 
                        src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop"
                        className="w-full h-full object-cover opacity-50 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000"
                        alt="Commercial Interior"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                    
                    <div className="absolute bottom-6 left-8 text-white">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-3xl shadow-lg bg-emerald-600">
                                🏪
                            </div>
                            <div>
                                <h1 className="text-4xl font-black font-news uppercase tracking-tighter leading-none">
                                    {building.name}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-slate-300 font-bold text-xs uppercase tracking-widest">Local Business</span>
                                    {isOwned && <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">Owned</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 w-10 h-10 bg-white hover:bg-red-50 text-slate-900 hover:text-red-600 rounded-full flex items-center justify-center font-bold transition-all shadow-lg text-lg"
                    >
                        ✕
                    </button>
                </div>

                {/* Content Body */}
                <div className="flex flex-grow bg-slate-100">
                    
                    {/* Visual Scene (Left) */}
                    <div className="w-1/2 relative bg-slate-800 overflow-hidden border-r-4 border-slate-800">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/dark-brick-wall.png")' }}></div>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                            {message ? (
                                <div className="bg-white border-2 border-slate-900 p-6 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-pop-in relative z-20">
                                    <div className="text-2xl mb-2">💬</div>
                                    <div className="font-black uppercase text-slate-800 text-lg">{message}</div>
                                </div>
                            ) : (
                                <div className="text-slate-500 font-mono text-xs opacity-50">
                                    Store is open. Buy or get out.
                                </div>
                            )}
                        </div>

                        {/* Silhouette */}
                        <div className="absolute bottom-0 right-10 w-64 h-64 opacity-30 pointer-events-none">
                            <svg viewBox="0 0 100 100" fill="black">
                                <path d="M50 20 C50 10, 70 10, 70 20 L80 25 L80 35 L20 35 L20 25 L30 20 C30 10, 50 10, 50 20 Z" />
                                <circle cx="50" cy="45" r="15" />
                                <path d="M20 100 L20 60 C20 50, 80 50, 80 60 L80 100 Z" />
                            </svg>
                        </div>
                    </div>

                    {/* Actions Menu (Right) */}
                    <div className="w-1/2 p-8 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-300 pb-2 mb-2">Business</div>
                        
                        {isOwned ? (
                            <button 
                                onClick={() => handleAction(onCollect, "Protection money collected.")}
                                className="flex items-center gap-4 p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all group text-left"
                            >
                                <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">🛡️</div>
                                <div>
                                    <div className="font-black text-slate-800 uppercase">Collect Protection</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Weekly Earnings</div>
                                </div>
                            </button>
                        ) : (
                            <button 
                                onClick={() => handleAction(onRob, "Register smashed! Cops are on the way!")}
                                className="flex items-center gap-4 p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-red-500 hover:shadow-md transition-all group text-left"
                            >
                                <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">🔫</div>
                                <div>
                                    <div className="font-black text-red-700 uppercase">Rob Store</div>
                                    <div className="text-[10px] text-red-400 font-bold uppercase tracking-wide">Gain Cash • Max Heat</div>
                                </div>
                            </button>
                        )}

                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-300 pb-2 mt-4 mb-2">Quick Shop</div>
                        <div className="grid grid-cols-1 gap-2">
                            {SHOP_ITEMS.map(itemId => {
                                const item = ITEMS[itemId];
                                if (!item) return null;
                                return (
                                    <button 
                                        key={itemId}
                                        onClick={() => handleAction(() => onShop(item), `Bought ${item.name}`)}
                                        className="flex justify-between items-center p-2 rounded-lg bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50 transition-all"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{item.icon}</span>
                                            <span className="text-xs font-bold text-slate-700 uppercase">{item.name}</span>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-emerald-600">N$ {item.cost}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommercialInterior;