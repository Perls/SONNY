
import React, { useState } from 'react';

interface IndustrialInteriorProps {
    building: any;
    isOwned: boolean;
    onClose: () => void;
    onRob: () => void;
    onStartJob: () => void;
    onCollect: () => void;
}

const IndustrialInterior: React.FC<IndustrialInteriorProps> = ({ 
    building, isOwned, onClose, onRob, onStartJob, onCollect 
}) => {
    const [message, setMessage] = useState("");

    const handleAction = (action: () => void, msg: string) => {
        action();
        setMessage(msg);
        setTimeout(() => setMessage(""), 3000);
    };

    return (
        <div className="absolute inset-0 z-[60] bg-black/70 backdrop-blur-md flex items-center justify-center font-waze animate-fade-in p-6">
            <div className="bg-zinc-900 w-full max-w-4xl rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border-4 border-amber-500 overflow-hidden flex flex-col relative h-[600px]">
                
                {/* Hazard Stripes Top */}
                <div className="h-4 w-full bg-[repeating-linear-gradient(45deg,#f59e0b,#f59e0b_10px,#000_10px,#000_20px)] border-b-2 border-black"></div>

                {/* Header Image */}
                <div className="h-44 relative flex-shrink-0 bg-black group border-b-4 border-zinc-700">
                    <img 
                        src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=1000&auto=format&fit=crop"
                        className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:scale-105 transition-transform duration-1000"
                        alt="Factory Interior"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent"></div>
                    
                    <div className="absolute bottom-6 left-8 text-white">
                        <div className="flex items-center gap-4 mb-1">
                            <div className="w-14 h-14 rounded border-2 border-amber-500 bg-zinc-800 flex items-center justify-center text-3xl shadow-lg">
                                🏭
                            </div>
                            <div>
                                <h1 className="text-4xl font-black font-news uppercase tracking-tighter leading-none text-zinc-100">
                                    {building.name}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-amber-500 font-bold text-xs uppercase tracking-widest bg-black/50 px-2 py-0.5 rounded">Industrial Zone</span>
                                    {isOwned && <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase border border-emerald-400">Owned Asset</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 w-10 h-10 bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white rounded flex items-center justify-center font-bold transition-all border border-zinc-600"
                    >
                        ✕
                    </button>
                </div>

                {/* Content Body */}
                <div className="flex flex-grow bg-zinc-800">
                    
                    {/* Visual Scene (Left) */}
                    <div className="w-1/2 relative bg-black overflow-hidden border-r-4 border-zinc-700">
                        {/* Gritty Texture */}
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }}></div>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                            {message ? (
                                <div className="bg-amber-500 text-black border-4 border-black p-6 shadow-[10px_10px_0px_rgba(0,0,0,0.5)] animate-pop-in transform -rotate-1">
                                    <div className="text-3xl mb-2">⚠️</div>
                                    <div className="font-black uppercase text-xl tracking-tight">{message}</div>
                                </div>
                            ) : (
                                <div className="text-zinc-600 font-mono text-xs uppercase tracking-widest border border-zinc-700 px-4 py-2 rounded bg-black/50">
                                    Restricted Area • Auth Req
                                </div>
                            )}
                        </div>

                        {/* Animated Steam/Smoke */}
                        <div className="absolute bottom-0 left-10 w-20 h-40 bg-white opacity-10 blur-xl animate-float-up"></div>
                        <div className="absolute bottom-0 right-20 w-32 h-50 bg-white opacity-5 blur-2xl animate-float-up" style={{ animationDelay: '1s' }}></div>
                    </div>

                    {/* Actions Menu (Right) */}
                    <div className="w-1/2 p-8 flex flex-col gap-4 overflow-y-auto custom-scrollbar bg-zinc-900">
                        <div className="flex items-center justify-between border-b border-zinc-700 pb-2 mb-2">
                            <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Operations</span>
                            <span className="text-[10px] font-bold text-amber-600 uppercase">Shift Available</span>
                        </div>
                        
                        {/* JOB BUTTON - Main Action */}
                        <button 
                            onClick={() => handleAction(onStartJob, "Clocking in...")}
                            className="flex items-center gap-4 p-5 bg-zinc-800 border-2 border-amber-600/50 rounded-lg hover:bg-amber-900/20 hover:border-amber-500 transition-all group text-left relative overflow-hidden shadow-lg"
                        >
                            <div className="absolute top-0 right-0 p-1 bg-amber-500 text-black text-[9px] font-black uppercase px-2">Minigame</div>
                            <div className="w-12 h-12 bg-black rounded flex items-center justify-center text-3xl border border-zinc-700 group-hover:scale-110 transition-transform">
                                📹
                            </div>
                            <div>
                                <div className="font-black text-zinc-200 uppercase text-lg group-hover:text-amber-400">Industrial Yard Patrol</div>
                                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide">Monitor Feeds • N$ 50.00 Clean</div>
                            </div>
                        </button>

                        <div className="h-px bg-zinc-800 w-full my-2"></div>

                        {isOwned ? (
                            <button 
                                onClick={() => handleAction(onCollect, "Production quota met. Shipment sent.")}
                                className="flex items-center gap-4 p-4 bg-zinc-800 border border-zinc-700 rounded-lg hover:border-emerald-500 hover:bg-emerald-900/10 transition-all group text-left"
                            >
                                <div className="text-2xl grayscale group-hover:grayscale-0 transition-all opacity-70">🚚</div>
                                <div>
                                    <div className="font-bold text-zinc-300 uppercase">Collect Shipment</div>
                                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">Weekly Revenue</div>
                                </div>
                            </button>
                        ) : (
                            <button 
                                onClick={() => handleAction(onRob, "Alarms triggered! Grab the crates!")}
                                className="flex items-center gap-4 p-4 bg-zinc-800 border border-zinc-700 rounded-lg hover:border-red-500 hover:bg-red-900/10 transition-all group text-left"
                            >
                                <div className="text-2xl grayscale group-hover:grayscale-0 transition-all opacity-70">📦</div>
                                <div>
                                    <div className="font-bold text-zinc-300 uppercase group-hover:text-red-400">Raid Warehouse</div>
                                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">Steal Goods • High Heat</div>
                                </div>
                            </button>
                        )}

                        <div className="mt-auto bg-black/40 p-3 rounded border border-zinc-800">
                            <div className="text-[9px] text-zinc-500 font-mono uppercase">
                                NOTICE: Hard hats required on floor. Report all accidents to management immediately.
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Hazard Stripes Bottom */}
                <div className="h-4 w-full bg-[repeating-linear-gradient(45deg,#f59e0b,#f59e0b_10px,#000_10px,#000_20px)] border-t-2 border-black"></div>
            </div>
        </div>
    );
};

export default IndustrialInterior;
