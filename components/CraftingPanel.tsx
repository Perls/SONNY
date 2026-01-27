
import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { ITEMS } from '../constants';
import { CRAFTING_RECIPES } from '../hooks/useItemSystem';

interface CraftingPanelProps {
    ingredients: string[]; // List of Inventory Item IDs
    onRemoveIngredient: (index: number) => void;
    onCraft: () => void;
    inventoryItems: InventoryItem[]; // Pass full inventory to resolve item data
}

const CraftingPanel: React.FC<CraftingPanelProps> = ({ ingredients, onRemoveIngredient, onCraft, inventoryItems }) => {
    const [isCrafting, setIsCrafting] = useState(false);

    // Resolve ingredients to item definitions for display
    const slots = [0, 1, 2].map(idx => {
        const invId = ingredients[idx];
        if (!invId) return null;
        const invItem = inventoryItems.find(i => i.id === invId);
        return invItem ? ITEMS[invItem.itemId] : null;
    });

    const handleCraftClick = () => {
        setIsCrafting(true);
        setTimeout(() => {
            onCraft();
            setIsCrafting(false);
        }, 800); // Animation delay
    };

    // Check potential result
    const currentItemIds = slots.map(s => s?.id).filter(id => id) as string[];
    const match = CRAFTING_RECIPES.find(r => {
        if (r.inputs.length !== currentItemIds.length) return false;
        const rSorted = [...r.inputs].sort();
        const iSorted = [...currentItemIds].sort();
        return rSorted.every((val, idx) => val === iSorted[idx]);
    });
    
    const resultItem = match ? ITEMS[match.result] : null;

    return (
        <div className="bg-slate-100 rounded-xl p-4 border-t-4 border-amber-400 shadow-inner relative overflow-hidden flex flex-col h-56">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-200 opacity-50"></div>
            
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-lg">🛠️</span> DIY Station
                </h4>
                <div className="text-[9px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Combine Items
                </div>
            </div>

            <div className="flex items-center justify-center gap-4 flex-grow">
                {/* Ingredients Slots */}
                <div className="flex items-center gap-2">
                    {[0, 1, 2].map(i => (
                        <React.Fragment key={i}>
                            <div 
                                onClick={() => onRemoveIngredient(i)}
                                className={`
                                    w-20 h-20 rounded-2xl border-4 border-dashed flex items-center justify-center relative cursor-pointer transition-all
                                    ${slots[i] 
                                        ? 'bg-white border-slate-300 shadow-md hover:border-red-400 hover:scale-105' 
                                        : 'bg-slate-200/50 border-slate-300'
                                    }
                                `}
                            >
                                {slots[i] ? (
                                    <div className="text-4xl animate-pop-in drop-shadow-sm">{slots[i]!.icon}</div>
                                ) : (
                                    <div className="text-slate-300 text-sm font-black">{i + 1}</div>
                                )}
                                {slots[i] && (
                                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold opacity-0 hover:opacity-100 transition-opacity shadow-sm">
                                        ✕
                                    </div>
                                )}
                            </div>
                            {/* Plus signs between slots */}
                            {i < 2 && (
                                <div className="text-slate-300 font-black text-2xl mx-1">+</div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div className="text-slate-300 font-black text-2xl mx-2">➜</div>

                {/* Result Slot */}
                <div className={`
                    w-24 h-24 rounded-2xl border-4 flex flex-col items-center justify-center relative transition-all
                    ${resultItem 
                        ? 'bg-amber-50 border-amber-400 shadow-lg scale-105 ring-4 ring-amber-100' 
                        : 'bg-slate-200 border-slate-300 border-dashed'
                    }
                `}>
                    {isCrafting ? (
                        <div className="text-4xl animate-spin">⚙️</div>
                    ) : resultItem ? (
                        <>
                            <div className="text-5xl animate-bounce-in drop-shadow-md">{resultItem.icon}</div>
                            <div className="absolute -bottom-8 text-[9px] font-black uppercase text-amber-700 bg-amber-100 px-3 py-1 rounded-full whitespace-nowrap shadow-sm border border-amber-200">
                                {match?.label}
                            </div>
                        </>
                    ) : (
                        <div className="text-3xl opacity-20">📦</div>
                    )}
                </div>
            </div>
            
            {/* Action Button - Floating over result if valid */}
            {resultItem && !isCrafting && (
                <div className="absolute bottom-4 right-4 animate-fade-in">
                    <button 
                        onClick={handleCraftClick}
                        className="px-6 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest shadow-lg transition-all transform hover:-translate-y-1 bg-amber-500 text-white hover:bg-amber-400 border-b-4 border-amber-700 active:border-b-0 active:translate-y-0"
                    >
                        Craft Now
                    </button>
                </div>
            )}
            
            {isCrafting && (
                 <div className="absolute bottom-4 right-4 animate-pulse text-amber-500 font-bold text-xs uppercase tracking-widest">
                     Mixing...
                 </div>
            )}
            
            {/* Mascot - Pigeon */}
            <div className="absolute bottom-2 left-2 opacity-30 pointer-events-none transform -rotate-12">
                <span className="text-4xl filter drop-shadow-sm grayscale opacity-50">🐦</span>
            </div>

        </div>
    );
};

export default CraftingPanel;
