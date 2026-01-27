
import React, { useState } from 'react';
import { useGameEngine } from '../contexts/GameEngineContext';
import { ITEMS } from '../constants';

interface ElectronicsStoreProps {
    onClose: () => void;
}

const STORE_STOCK = ['walkman', 'pager', 'gameboy', 'discman', 'boombox', 'camcorder', 'brick_phone'];

const COMMERCIALS: Record<string, string> = {
    'walkman': "🎶 Super Bass! Your life is now a movie soundtrack! Very cool style for walking!",
    'pager': "📟 BEEP BEEP! Who is it? It is success calling! Never miss the big deal!",
    'gameboy': "🎮 Pocket Power! Fighting monsters on the train! Please buy AA batteries!",
    'discman': "💿 Future Laser Audio! Crystal clear sound! Anti-skip technology (mostly)!",
    'boombox': "📻 STREET KING! Maximum Volume! The whole block will know your name!",
    'camcorder': "📹 MEMORY MAKER! Zoom x100! Catch the action live! Director Mode!",
    'brick_phone': "📱 BOSS MODE! Heavy duty signal! Calls from anywhere! Very professional!",
};

// Nonsense specs generator
const getTechSpecs = (itemId: string) => {
    // Deterministic pseudo-random based on string char codes
    const seed = itemId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const rand = (offset: number) => ((seed + offset) * 9301 + 49297) % 233280;
    
    const JP_LABELS = ["システム (SYS)", "オーディオ (AUD)", "出力 (PWR)", "接続 (CON)", "メモリ (MEM)", "画面 (DISP)", "速度 (SPD)"];
    const BUZZWORDS = ["HYPER-THREAD", "16-BIT DUAL", "SUPER BASS", "CRYSTAL CLR", "DIGITAL-X", "LASER READ", "AUTO-REV", "TURBO CHARGE", "MEGA-SHOCK", "ANTI-SKIP"];
    const UNITS = ["MHz", "KB", "dB", "RPM", "mAh", "V", "W"];

    return [0, 1, 2, 3].map(i => {
        const r = rand(i);
        const label = JP_LABELS[r % JP_LABELS.length];
        const buzz = BUZZWORDS[(r * 3) % BUZZWORDS.length];
        const num = (r % 900) + 100;
        const unit = UNITS[r % UNITS.length];
        return { label, value: `${buzz} ${num}${unit}` };
    });
};

const ElectronicsStore: React.FC<ElectronicsStoreProps> = ({ onClose }) => {
    const { gameState, handleBuyItem } = useGameEngine();
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    if (!gameState) return null;

    const selectedItem = selectedItemId ? ITEMS[selectedItemId] : null;
    const canAfford = selectedItem ? gameState.money >= selectedItem.cost : false;

    return (
        <div 
            className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center font-waze animate-fade-in p-6"
            onWheel={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onMouseMove={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        >
            <style>{`
                @keyframes product-showcase {
                    0% { transform: perspective(500px) rotateY(-15deg) rotateX(5deg) scale(1); }
                    50% { transform: perspective(500px) rotateY(15deg) rotateX(-5deg) scale(1.1); }
                    100% { transform: perspective(500px) rotateY(-15deg) rotateX(5deg) scale(1); }
                }
                @keyframes sheen-pass {
                    0% { transform: translateX(-150%) skewX(-25deg); opacity: 0; }
                    20% { opacity: 0.6; }
                    80% { opacity: 0.6; }
                    100% { transform: translateX(150%) skewX(-25deg); opacity: 0; }
                }
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-product {
                    animation: product-showcase 6s ease-in-out infinite;
                }
                .animate-sheen-shine {
                    animation: sheen-pass 2.5s ease-in-out infinite;
                }
                .animate-marquee {
                    animation: marquee 25s linear infinite;
                }
            `}</style>

            <div className="bg-[#d1d5db] w-full max-w-7xl h-[875px] rounded-sm shadow-2xl border-4 border-slate-500 overflow-hidden flex flex-col relative">
                
                {/* 1. Retail Header */}
                <div className="h-24 bg-[#dc2626] flex items-center justify-between px-8 border-b-4 border-[#991b1b] relative shadow-md">
                    {/* Diagonal Stripes Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 20px)' }}></div>
                    
                    <div className="flex flex-col z-10">
                        <div className="bg-white px-4 py-1 -skew-x-12 inline-block border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.3)]">
                            <h1 className="text-4xl font-black font-news text-[#dc2626] italic tracking-tighter uppercase transform skew-x-12">
                                KB <span className="text-black">Electronics</span>
                            </h1>
                        </div>
                        <div className="text-[10px] font-bold text-white uppercase tracking-widest mt-1 ml-2 drop-shadow-md">
                            Authorized Dealer • 6th Ave
                        </div>
                    </div>

                    <div className="flex items-center gap-6 z-10">
                        <div className="bg-[#b91c1c] p-2 rounded border-2 border-[#fca5a5] shadow-inner flex flex-col items-end min-w-[120px]">
                            <div className="text-[9px] font-bold text-[#fca5a5] uppercase tracking-widest mb-0.5">Your Credit</div>
                            <div className="text-2xl font-mono font-black text-[#86efac] tracking-tight">N$ {gameState.money.toLocaleString()}</div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="bg-white text-[#dc2626] w-10 h-10 flex items-center justify-center font-black text-xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all active:translate-y-[4px] active:shadow-none active:border-t-4"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* 2. Main Store Layout */}
                <div className="flex flex-grow bg-[#e5e7eb] p-6 gap-6 overflow-hidden">
                    
                    {/* LEFT COLUMN: SHELVES (Stock) */}
                    <div className="w-7/12 flex flex-col bg-white border-2 border-slate-300 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] rounded-lg overflow-hidden">
                        <div className="bg-slate-100 p-3 border-b-2 border-slate-300 flex justify-between items-center">
                            <h3 className="font-black text-slate-700 uppercase tracking-widest text-sm">Product Catalog</h3>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Select an item</span>
                        </div>
                        
                        <div className="p-4 grid grid-cols-3 gap-4 overflow-y-auto custom-scrollbar">
                            {STORE_STOCK.map(itemId => {
                                const item = ITEMS[itemId];
                                const isSelected = selectedItemId === itemId;
                                
                                return (
                                    <button 
                                        key={itemId}
                                        onClick={() => setSelectedItemId(itemId)}
                                        className={`
                                            relative flex flex-col items-center p-4 border-2 transition-all group rounded-sm
                                            ${isSelected 
                                                ? 'bg-blue-50 border-blue-500 shadow-[0_0_0_2px_#3b82f6]' 
                                                : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-md'
                                            }
                                        `}
                                    >
                                        <div className="text-4xl mb-3 filter drop-shadow-sm transition-transform group-hover:scale-110 duration-300">{item.icon}</div>
                                        
                                        <div className="w-full text-center">
                                            <div className="font-bold text-xs text-slate-800 uppercase leading-tight line-clamp-1 mb-1">{item.name}</div>
                                            <div className="inline-block bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                                <div className="font-mono text-[10px] font-black text-slate-600">N${item.cost}</div>
                                            </div>
                                        </div>

                                        {/* "Tag" visual at top */}
                                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: INSPECTION COUNTER (Details & Buy) */}
                    <div className="w-5/12 flex flex-col">
                        <div className="bg-[#f3f4f6] flex-grow border-4 border-[#d1d5db] shadow-xl rounded-xl relative overflow-hidden flex flex-col">
                            {/* Counter Top Texture */}
                            <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-white/50 to-transparent z-20"></div>
                            
                            {selectedItem ? (
                                <div className="flex flex-col h-full animate-slide-in-right">
                                    {/* Product Visual Stage - COMMERCIAL MODE */}
                                    <div className="h-1/2 relative flex items-center justify-center border-b-4 border-slate-300 shadow-inner overflow-hidden">
                                        {/* Studio Backdrop */}
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ffffff_0%,_#cbd5e1_100%)]"></div>
                                        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_transparent_0%,_rgba(0,0,0,0.1)_100%)]"></div>
                                        
                                        {/* Floating Item with Camera Angles */}
                                        <div className="relative z-10 animate-product filter drop-shadow-2xl text-9xl">
                                            {selectedItem.icon}
                                        </div>

                                        {/* Gleam Animation (Light Sheen) */}
                                        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                                             <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/60 to-transparent w-32 animate-sheen-shine blur-md"></div>
                                        </div>

                                        {/* Sparkles */}
                                        <div className="absolute top-10 right-20 text-yellow-400 text-2xl animate-pulse z-20">✨</div>
                                        <div className="absolute bottom-10 left-20 text-yellow-400 text-xl animate-bounce z-20" style={{ animationDuration: '2s' }}>✨</div>

                                        {/* Badge */}
                                        <div className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-md transform rotate-3 z-30 border border-white/50">
                                            {selectedItem.equipSlot || 'Gadget'}
                                        </div>

                                        {/* Marquee Banner */}
                                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-blue-900 overflow-hidden flex items-center z-30 border-t border-blue-500">
                                            <div className="whitespace-nowrap animate-marquee text-white font-mono text-xs font-bold tracking-wider">
                                                ★ SUPER SALE: {selectedItem.name} ★ PRICE: N${selectedItem.cost} ★ {selectedItem.description.toUpperCase()} ★ LIMITED TIME ONLY ★ IMPORT QUALITY ★ JAPANESE PRECISION ★
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info Panel */}
                                    <div className="h-1/2 bg-white p-6 flex flex-col relative z-30">
                                        <h2 className="text-2xl font-black font-news text-slate-800 uppercase leading-none mb-1">
                                            {selectedItem.name}
                                        </h2>
                                        
                                        {/* Cozy Commercial Bubble */}
                                        <div className="flex gap-3 mb-3 bg-yellow-50 p-2 rounded-lg border border-yellow-200 items-start shadow-sm">
                                            <div className="text-2xl animate-bounce">😸</div>
                                            <p className="text-[10px] text-amber-700 font-bold italic leading-tight pt-1">
                                                "{COMMERCIALS[selectedItem.id] || "Very nice item! Guaranteed to impress friends!"}"
                                            </p>
                                        </div>
                                        
                                        {/* Nonsense Technical Specs */}
                                        <div className="flex-grow border-t border-slate-100 pt-2 mb-4 overflow-hidden">
                                            <div className="flex flex-col gap-1.5">
                                                {getTechSpecs(selectedItem.id).map((spec, i) => (
                                                    <div key={i} className="flex justify-between items-center border-b border-slate-100 border-dotted pb-0.5">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{spec.label}</span>
                                                        <span className="text-[10px] font-mono font-bold text-slate-600">{spec.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Price LCD */}
                                        <div className="bg-black p-3 rounded mb-4 flex justify-between items-center border-b-2 border-slate-700 shadow-inner">
                                            <span className="text-slate-500 font-mono text-xs uppercase">PRICE</span>
                                            <span className={`font-mono text-2xl font-black tracking-widest ${canAfford ? 'text-[#86efac]' : 'text-red-500'}`}>
                                                ${selectedItem.cost}
                                            </span>
                                        </div>

                                        {/* Buy Button */}
                                        <button
                                            onClick={() => canAfford && handleBuyItem(selectedItem)}
                                            disabled={!canAfford}
                                            className={`
                                                w-full py-4 text-sm font-black uppercase tracking-[0.2em] rounded shadow-lg transition-all border-b-4 active:border-b-0 active:translate-y-1
                                                ${canAfford 
                                                    ? 'bg-red-600 text-white border-red-800 hover:bg-red-500' 
                                                    : 'bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed'}
                                            `}
                                        >
                                            {canAfford ? 'PURCHASE NOW' : 'INSUFFICIENT FUNDS'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Idle State
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center bg-slate-100">
                                    <div className="text-6xl mb-4 grayscale opacity-30">🛍️</div>
                                    <h3 className="font-black text-xl uppercase text-slate-300">Welcome to KB</h3>
                                    <p className="text-xs font-bold uppercase tracking-widest mt-2">
                                        Select an item from the shelf to inspect features and pricing.
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        {/* Shadow under counter */}
                        <div className="h-4 bg-black/20 blur-md mx-4 rounded-[100%] mt-[-2px]"></div>
                    </div>

                </div>

                {/* 3. Footer Strip */}
                <div className="h-8 bg-[#1f2937] flex items-center justify-between px-6 border-t-4 border-slate-600">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-4">
                        <span>OPEN 9AM - 9PM</span>
                        <span>•</span>
                        <span>FINANCING AVAILABLE</span>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse delay-75"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse delay-150"></div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ElectronicsStore;
