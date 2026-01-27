
import React, { useState } from 'react';

interface OfficeInteriorProps {
    building: any;
    isOwned: boolean;
    onClose: () => void;
    onRob: () => void;
    onStartJob: () => void;
    onCollect: () => void;
}

const OfficeInterior: React.FC<OfficeInteriorProps> = ({ 
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
            <div className="bg-slate-50 w-full max-w-4xl rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border-4 border-blue-900 overflow-hidden flex flex-col relative h-[600px]">
                
                {/* Corporate Header */}
                <div className="h-44 relative flex-shrink-0 bg-blue-950 group border-b-4 border-blue-800">
                    <img 
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop"
                        className="w-full h-full object-cover opacity-60 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000"
                        alt="Office Interior"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-900/50 to-transparent"></div>
                    
                    <div className="absolute bottom-6 left-8 text-white">
                        <div className="flex items-center gap-4 mb-1">
                            <div className="w-14 h-14 rounded border-2 border-blue-400 bg-blue-900 flex items-center justify-center text-3xl shadow-lg">
                                💼
                            </div>
                            <div>
                                <h1 className="text-4xl font-black font-news uppercase tracking-tighter leading-none text-blue-100">
                                    {building.name}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-blue-300 font-bold text-xs uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded">Corporate Sector</span>
                                    {isOwned && <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase border border-emerald-400">Owned Asset</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 w-10 h-10 bg-blue-900 hover:bg-red-600 text-blue-300 hover:text-white rounded flex items-center justify-center font-bold transition-all border border-blue-700"
                    >
                        ✕
                    </button>
                </div>

                {/* Content Body */}
                <div className="flex flex-grow bg-slate-100">
                    
                    {/* Visual Scene (Left) */}
                    <div className="w-1/2 relative bg-white overflow-hidden border-r-4 border-slate-200">
                        {/* Office Texture */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                            {message ? (
                                <div className="bg-blue-600 text-white border-4 border-blue-900 p-6 shadow-xl animate-pop-in rounded-lg">
                                    <div className="text-3xl mb-2">📋</div>
                                    <div className="font-black uppercase text-xl tracking-tight">{message}</div>
                                </div>
                            ) : (
                                <div className="text-slate-400 font-mono text-xs uppercase tracking-widest border border-slate-300 px-4 py-2 rounded bg-slate-50">
                                    Cubicles Empty • After Hours
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions Menu (Right) */}
                    <div className="w-1/2 p-8 flex flex-col gap-4 overflow-y-auto custom-scrollbar bg-slate-50">
                        <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Opportunities</span>
                            <span className="text-[10px] font-bold text-blue-600 uppercase">Night Shift</span>
                        </div>
                        
                        {/* JOB BOARD BUTTON */}
                        <button 
                            onClick={() => handleAction(onStartJob, "Accessing Job Board...")}
                            className="flex items-center gap-4 p-5 bg-white border-2 border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-all group text-left relative overflow-hidden shadow-sm hover:shadow-md"
                        >
                            <div className="absolute top-0 right-0 p-1 bg-blue-500 text-white text-[9px] font-black uppercase px-2">Job Board</div>
                            <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center text-3xl border border-blue-200 group-hover:scale-110 transition-transform">
                                📋
                            </div>
                            <div>
                                <div className="font-black text-slate-700 uppercase text-lg group-hover:text-blue-700">Find Work</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Select Assignments • Earn Cash</div>
                            </div>
                        </button>

                        <div className="h-px bg-slate-200 w-full my-2"></div>

                        {isOwned ? (
                            <button 
                                onClick={() => handleAction(onCollect, "Dividends collected.")}
                                className="flex items-center gap-4 p-4 bg-white border border-slate-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all group text-left"
                            >
                                <div className="text-2xl grayscale group-hover:grayscale-0 transition-all opacity-70">📈</div>
                                <div>
                                    <div className="font-bold text-slate-700 uppercase">Withdraw Dividends</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Weekly Revenue</div>
                                </div>
                            </button>
                        ) : (
                            <button 
                                onClick={() => handleAction(onRob, "Safe cracked! Security alerted!")}
                                className="flex items-center gap-4 p-4 bg-white border border-slate-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all group text-left"
                            >
                                <div className="text-2xl grayscale group-hover:grayscale-0 transition-all opacity-70">🔨</div>
                                <div>
                                    <div className="font-bold text-slate-700 uppercase group-hover:text-red-600">Embezzle Funds</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Steal Cash • High Heat</div>
                                </div>
                            </button>
                        )}

                        <div className="mt-auto bg-blue-50 p-3 rounded border border-blue-200">
                            <div className="text-[9px] text-blue-800 font-mono uppercase">
                                MEMO: All wet floor signs must be visible. Liability is strictly enforced.
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default OfficeInterior;
