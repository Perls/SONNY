
import React, { useState } from 'react';
import { InventoryItem } from '../../types';
import { ITEMS } from '../../constants';
import SafeImage from '../SafeImage';

interface PawnShopProps {
    inventory: InventoryItem[];
    money: number;
    onClose: () => void;
    onSell: (item: InventoryItem, value: number) => void;
}

const QUOTES = [
    "It's gonna sit on my shelf for months.",
    "Best I can do is 20%. Take it or leave it.",
    "I got a buddy who knows about these. He says it's fake.",
    "Cash. No questions. No refunds.",
    "You selling or just blocking my light?",
    "I'm taking a huge risk here."
];

const PawnShop: React.FC<PawnShopProps> = ({ inventory, money, onClose, onSell }) => {
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [quote, setQuote] = useState(QUOTES[0]);
    const [isHaggling, setIsHaggling] = useState(false);

    const handleSelect = (item: InventoryItem) => {
        setSelectedItem(item);
        setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    };

    const handleSellClick = () => {
        if (!selectedItem) return;
        
        const def = ITEMS[selectedItem.itemId];
        const sellValue = Math.floor(def.cost / 5);

        setIsHaggling(true);
        setTimeout(() => {
            onSell(selectedItem, sellValue);
            setSelectedItem(null);
            setIsHaggling(false);
            setQuote("Pleasure doing business.");
        }, 500);
    };

    // Calculate value
    const itemDef = selectedItem ? ITEMS[selectedItem.itemId] : null;
    const sellPrice = itemDef ? Math.floor(itemDef.cost / 5) : 0;

    return (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center font-waze animate-fade-in p-6">
            <div className="bg-[#1c1917] w-full max-w-5xl rounded-xl shadow-2xl border-4 border-amber-700 overflow-hidden flex flex-col relative h-[650px]">
                
                {/* Header */}
                <div className="h-32 bg-[#292524] border-b-4 border-amber-900 flex justify-between items-center px-8 relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0, transparent 40px, #000 40px, #000 42px)' }}></div>
                    
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-16 h-16 rounded-full bg-amber-600 border-4 border-amber-800 flex items-center justify-center text-4xl shadow-lg text-amber-100">
                            ⚖️
                        </div>
                        <div>
                            <h1 className="text-4xl font-black font-news text-amber-500 uppercase tracking-tighter drop-shadow-md">Gold & Pawn</h1>
                            <div className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-black/40 px-2 py-1 inline-block rounded border border-amber-900/50">
                                24/7 Exchange
                            </div>
                        </div>
                    </div>

                    <div className="text-right z-10">
                        <div className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Your Cash</div>
                        <div className="text-3xl font-mono font-black text-emerald-500">N$ {money.toLocaleString()}</div>
                    </div>

                    <button onClick={onClose} className="absolute top-4 right-4 text-amber-800 hover:text-amber-500 font-bold text-xl z-20">✕</button>
                </div>

                {/* Main Content */}
                <div className="flex flex-grow overflow-hidden bg-[#0c0a09]">
                    
                    {/* Left: Inventory */}
                    <div className="w-1/2 border-r-4 border-amber-900/30 flex flex-col z-20 bg-[#1c1917]">
                        <div className="p-4 bg-[#1c1917] border-b border-[#292524]">
                            <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest">Your Backpack</h3>
                        </div>
                        <div className="p-4 grid grid-cols-4 gap-3 overflow-y-auto custom-scrollbar flex-grow">
                            {inventory.length === 0 && (
                                <div className="col-span-4 text-center text-slate-600 italic text-xs py-8">Nothing to sell.</div>
                            )}
                            {inventory.map(item => {
                                const def = ITEMS[item.itemId];
                                if (!def) return null;
                                const isSelected = selectedItem?.id === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleSelect(item)}
                                        className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-2 transition-all relative group
                                            ${isSelected 
                                                ? 'bg-amber-900/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                                                : 'bg-[#1c1917] border-[#292524] hover:border-amber-700 hover:bg-[#292524]'
                                            }
                                        `}
                                    >
                                        <div className="text-3xl mb-1 filter drop-shadow-md group-hover:scale-110 transition-transform">{def.icon}</div>
                                        <div className="text-[8px] font-bold text-slate-400 uppercase truncate w-full text-center">{def.name}</div>
                                        <div className="absolute top-1 right-1 text-[8px] bg-black/60 text-slate-300 px-1 rounded">x{item.quantity}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Counter */}
                    <div className="w-1/2 flex flex-col relative bg-[#1a110a] overflow-hidden">
                        
                        {/* Background Cage - Thicker Bars */}
                        <div className="absolute inset-0 pointer-events-none z-20" style={{ 
                            backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.8) 3px, transparent 1px), linear-gradient(rgba(0,0,0,0.8) 3px, transparent 1px)`,
                            backgroundSize: '50px 50px'
                        }}></div>

                        {/* Shopkeeper Area */}
                        <div className="flex-grow flex flex-col items-center justify-end p-8 text-center relative z-10 pb-0">
                            
                            {/* Dialogue Bubble - Anchored to Avatar */}
                            <div className="absolute top-16 left-8 z-30 max-w-[200px] animate-pop-in">
                                <div className="bg-white text-black p-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)] relative">
                                    <p className="text-xs font-bold uppercase font-mono leading-tight">{quote}</p>
                                    {/* Tail pointing right towards head */}
                                    <div className="absolute top-1/2 -right-3 w-4 h-4 bg-white border-t-4 border-r-4 border-black transform rotate-45"></div>
                                </div>
                            </div>

                            {/* Shopkeeper - Bigger, No Circle */}
                            <div className="w-[450px] h-[450px] relative translate-y-16 translate-x-12 z-10">
                                <SafeImage 
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=PawnBroker&clothing=blazerAndShirt&clothingColor=262626&eyes=squint&eyebrows=angry&skinColor=edb98a&backgroundType=transparent" 
                                    alt="Broker" 
                                    className="w-full h-full object-contain filter drop-shadow-2xl" 
                                    fallbackColorClass=""
                                />
                            </div>
                            
                            {/* The Deal UI - Overlay at Bottom */}
                            {selectedItem && itemDef && (
                                <div className="absolute bottom-8 left-8 right-8 z-40">
                                    <div className="w-full bg-black/90 backdrop-blur-md border-2 border-amber-600 rounded-xl p-4 flex flex-col gap-4 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-slide-up">
                                        <div className="flex items-center gap-4 border-b border-amber-900/50 pb-4">
                                            <div className="text-5xl filter drop-shadow-lg">{itemDef.icon}</div>
                                            <div className="text-left">
                                                <div className="text-amber-500 font-black uppercase text-lg">{itemDef.name}</div>
                                                <div className="text-slate-400 text-xs">{itemDef.description}</div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-between items-center bg-amber-950/30 p-3 rounded-lg border border-amber-900/30">
                                            <div className="text-left">
                                                <div className="text-[9px] text-slate-500 uppercase font-bold">Retail Value</div>
                                                <div className="text-xs text-slate-400 font-mono line-through decoration-red-500">N$ {itemDef.cost}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[9px] text-amber-500 uppercase font-black tracking-widest">Cash Offer</div>
                                                <div className="text-2xl text-emerald-400 font-mono font-bold">N$ {sellPrice}</div>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={handleSellClick}
                                            disabled={isHaggling}
                                            className="w-full py-4 bg-emerald-700 hover:bg-emerald-600 text-white font-black uppercase tracking-[0.2em] rounded-lg shadow-lg border-b-4 border-emerald-900 active:border-b-0 active:translate-y-1 transition-all"
                                        >
                                            {isHaggling ? "Counting..." : "ACCEPT DEAL"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!selectedItem && (
                                <div className="absolute bottom-8 z-30 bg-black/80 px-6 py-3 rounded-full text-amber-500 font-bold uppercase text-xs tracking-widest animate-pulse border border-amber-500/50 shadow-lg">
                                    Select an item to appraise
                                </div>
                            )}

                        </div>

                        {/* Counter Top */}
                        <div className="h-4 bg-[#2c1e12] border-t-4 border-[#1a110a] relative z-30 shadow-[0_-5px_10px_rgba(0,0,0,0.5)]"></div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PawnShop;
