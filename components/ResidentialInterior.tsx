
import React, { useState } from 'react';

interface ResidentialInteriorProps {
    building: any;
    isOwned: boolean;
    isActiveSafehouse: boolean; // New prop
    onClose: () => void;
    onRob: () => void;
    onRest: () => void;
    onCollect: () => void;
    onSetSafehouse: (building: any) => void; // New Handler
}

const ResidentialInterior: React.FC<ResidentialInteriorProps> = ({ 
    building, isOwned, isActiveSafehouse, onClose, onRob, onRest, onCollect, onSetSafehouse 
}) => {
    const [message, setMessage] = useState("");

    const handleAction = (action: () => void, msg: string) => {
        action();
        setMessage(msg);
        setTimeout(() => setMessage(""), 3000);
    };

    return (
        <div className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center font-waze animate-fade-in p-6">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border-4 border-slate-800 overflow-hidden flex flex-col relative h-[600px]">
                
                {/* Header Image */}
                <div className="h-48 relative flex-shrink-0 bg-slate-900 border-b-4 border-slate-800 group">
                    <img 
                        src="https://images.unsplash.com/photo-1628624747186-a941c725611b?q=80&w=1000&auto=format&fit=crop"
                        className="w-full h-full object-cover opacity-50 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000"
                        alt="Residential Interior"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                    
                    <div className="absolute bottom-6 left-8 text-white">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-3xl shadow-lg bg-indigo-600">
                                🏠
                            </div>
                            <div>
                                <h1 className="text-4xl font-black font-news uppercase tracking-tighter leading-none">
                                    {building.name}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-slate-300 font-bold text-xs uppercase tracking-widest">Tenement Housing</span>
                                    {isOwned && <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">Owned</span>}
                                    {isActiveSafehouse && <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">Current Safehouse</span>}
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
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                            {message ? (
                                <div className="bg-white border-2 border-slate-900 p-6 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-pop-in relative z-20">
                                    <div className="text-2xl mb-2">💬</div>
                                    <div className="font-black uppercase text-slate-800 text-lg">{message}</div>
                                </div>
                            ) : (
                                <div className="text-slate-500 font-mono text-xs opacity-50">
                                    {isActiveSafehouse ? "Main Operations Base" : "Quiet hours. Watch your step."}
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
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-300 pb-2 mb-2">Options</div>
                        
                        {isOwned ? (
                            <>
                                {!isActiveSafehouse && (
                                    <button 
                                        onClick={() => handleAction(() => onSetSafehouse(building), "Safehouse established here.")}
                                        className="flex items-center gap-4 p-4 bg-slate-900 border-2 border-slate-800 rounded-xl hover:bg-slate-800 hover:border-amber-500 shadow-md transition-all group text-left text-white"
                                    >
                                        <div className="text-3xl text-amber-500">📍</div>
                                        <div>
                                            <div className="font-black uppercase">Set as Safehouse</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Move Main Base Here</div>
                                        </div>
                                    </button>
                                )}

                                <button 
                                    onClick={() => handleAction(onRest, "You slept like a baby. Energy Restored.")}
                                    className="flex items-center gap-4 p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group text-left"
                                >
                                    <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">🛏️</div>
                                    <div>
                                        <div className="font-black text-slate-800 uppercase">Rest & Recover</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Restore 15 Energy</div>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => handleAction(onCollect, "Tenants paid up. Easy money.")}
                                    className="flex items-center gap-4 p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all group text-left"
                                >
                                    <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">💵</div>
                                    <div>
                                        <div className="font-black text-slate-800 uppercase">Collect Rent</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Gather Stashed Cash</div>
                                    </div>
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={() => handleAction(() => {}, "Door locked. No answer.")}
                                    className="flex items-center gap-4 p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-md transition-all group text-left"
                                >
                                    <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">🚪</div>
                                    <div>
                                        <div className="font-black text-slate-800 uppercase">Knock on Door</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Seek Info</div>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => handleAction(onRob, "You kicked the door in! Grabbed what you could.")}
                                    className="flex items-center gap-4 p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-red-500 hover:shadow-md transition-all group text-left"
                                >
                                    <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">🔨</div>
                                    <div>
                                        <div className="font-black text-red-700 uppercase">Burglary</div>
                                        <div className="text-[10px] text-red-400 font-bold uppercase tracking-wide">High Risk • Gain Heat</div>
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

export default ResidentialInterior;
