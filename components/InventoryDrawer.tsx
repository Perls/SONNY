import React, { useState } from 'react';
import { InventoryItem, Equipment, CrewMember } from '../types';
import { ITEMS } from '../constants';

interface InventoryDrawerProps {
  inventory: InventoryItem[];
  equipment?: Equipment;
  boss?: CrewMember; // Pass boss for avatar silhouette
  onEquip: (item: InventoryItem) => void; 
  onUnequip: (slot: keyof Equipment) => void;
}

const InventoryDrawer: React.FC<InventoryDrawerProps> = ({ inventory, equipment, boss, onEquip, onUnequip }) => {
  const [hoveredItem, setHoveredItem] = useState<{ item: any, rect: DOMRect, isEquippable: boolean } | null>(null);

  const handleMouseEnter = (e: React.MouseEvent, itemId: string, isEquippable: boolean = false) => {
      const itemDef = ITEMS[itemId];
      if (itemDef) {
          setHoveredItem({
              item: itemDef,
              rect: e.currentTarget.getBoundingClientRect(),
              isEquippable
          });
      }
  };

  const handleMouseLeave = () => {
      setHoveredItem(null);
  };

  const renderEquipSlot = (slotId: keyof Equipment, label: string, icon: string) => {
      const equippedItemId = equipment ? equipment[slotId] : undefined;
      const itemDef = equippedItemId ? ITEMS[equippedItemId] : null;

      return (
          <div className="flex flex-col items-center group z-20">
              <div 
                  onClick={() => itemDef && onUnequip(slotId)}
                  onMouseEnter={(e) => equippedItemId && handleMouseEnter(e, equippedItemId, false)}
                  onMouseLeave={handleMouseLeave}
                  className={`
                      w-16 h-16 rounded-xl border-2 flex items-center justify-center text-3xl relative shadow-md transition-all cursor-pointer
                      ${itemDef 
                          ? 'bg-slate-800 border-amber-500 text-white hover:border-red-500 hover:shadow-red-500/30' 
                          : 'bg-slate-200/80 border-dashed border-slate-400 text-slate-400 hover:bg-slate-100'
                      }
                  `}
              >
                  {itemDef ? (
                      <div className="relative z-10">{itemDef.icon}</div>
                  ) : (
                      <div className="opacity-50">{icon}</div>
                  )}
              </div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 bg-white/80 px-1 rounded shadow-sm backdrop-blur-sm">{label}</span>
          </div>
      );
  };

  return (
     <div className="flex h-full bg-slate-50 font-waze overflow-hidden relative">
        
        {/* LEFT: PAPERDOLL (Equipment) */}
        <div className="w-[320px] bg-slate-200 border-r border-slate-300 relative flex-shrink-0 flex flex-col">
            <div className="p-3 bg-slate-300/50 border-b border-slate-300 text-center">
                <h4 className="text-xs font-black uppercase text-slate-600 tracking-widest">Loadout</h4>
            </div>
            
            <div className="flex-grow relative overflow-hidden flex items-center justify-center">
                {/* Background Silhouette / Avatar */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                     {boss ? (
                         <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${boss.imageSeed}&clothing=shirtCrewNeck&clothingColor=262626`} 
                            className="h-[80%] w-auto object-contain opacity-40 grayscale contrast-125 translate-y-4"
                         />
                     ) : (
                         <div className="text-9xl opacity-20">👤</div>
                     )}
                </div>

                {/* Slots Positioning using absolute positioning relative to container */}
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* Head - Top Center */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-auto">
                        {renderEquipSlot('head', 'Head', '🧢')}
                    </div>

                    {/* Main Hand - Mid Left */}
                    <div className="absolute top-[35%] left-4 pointer-events-auto">
                        {renderEquipSlot('main_hand', 'Main Hand', '⚔️')}
                    </div>

                    {/* Off Hand (Armor) - Mid Right */}
                    <div className="absolute top-[35%] right-4 pointer-events-auto">
                        {renderEquipSlot('off_hand', 'Armor', '🛡️')}
                    </div>

                    {/* Body (Jacket) - Aligned with Accessory/Gadget */}
                    <div className="absolute top-[60%] left-1/2 -translate-x-1/2 pointer-events-auto">
                        {renderEquipSlot('body', 'Jacket', '🦺')}
                    </div>

                    {/* Accessory - Lower Left */}
                    <div className="absolute top-[60%] left-6 pointer-events-auto">
                        {renderEquipSlot('accessory', 'Accessory', '💍')}
                    </div>

                    {/* Gadget - Lower Right */}
                    <div className="absolute top-[60%] right-6 pointer-events-auto">
                        {renderEquipSlot('gadget', 'Gadget', '📟')}
                    </div>

                    {/* Feet - Bottom Center */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
                        {renderEquipSlot('feet', 'Feet', '👞')}
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT: BACKPACK (Inventory Grid) */}
        <div className="flex-grow flex flex-col bg-slate-100 min-w-0">
            <div className="p-3 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                <h4 className="text-xs font-black uppercase text-slate-600 tracking-widest">Backpack</h4>
                <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                    {inventory.length} / 20 Slots
                </div>
            </div>

            <div className="p-4 grid grid-cols-4 gap-3 overflow-y-auto content-start custom-scrollbar flex-grow">
                {inventory.map((slot) => {
                    const itemDef = ITEMS[slot.itemId];
                    if (!itemDef) return null;
                    
                    const isEquippable = !!itemDef.equipSlot;

                    return (
                        <div 
                            key={slot.id} 
                            onClick={() => isEquippable && onEquip(slot)}
                            onMouseEnter={(e) => handleMouseEnter(e, slot.itemId, isEquippable)}
                            onMouseLeave={handleMouseLeave}
                            className={`
                                aspect-square bg-white border-2 border-slate-200 rounded-xl flex flex-col items-center justify-center relative transition-all shadow-sm group
                                ${isEquippable 
                                    ? 'cursor-pointer hover:border-amber-400 hover:-translate-y-1 hover:z-50' 
                                    : 'opacity-80 cursor-default'
                                }
                            `}
                        >
                            <span className="text-3xl mb-1 drop-shadow-sm">{itemDef.icon}</span>
                            <span className="absolute bottom-1 right-1 bg-slate-800 text-white text-[9px] font-mono px-1.5 rounded border border-slate-600 shadow">x{slot.quantity}</span>
                        </div>
                    );
                })}
                
                {/* Empty Slots Filler */}
                {[...Array(Math.max(0, 20 - inventory.length))].map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square bg-slate-200/40 border-2 border-dashed border-slate-300/60 rounded-xl flex items-center justify-center hover:bg-slate-200/60 transition-colors">
                        <div className="w-2 h-2 bg-slate-300 rounded-full opacity-50"></div>
                    </div>
                ))}
            </div>
        </div>

        {/* FIXED TOOLTIP OVERLAY */}
        {hoveredItem && (
             <div 
                className="fixed z-[9999] pointer-events-none w-48 animate-fade-in"
                style={{ 
                    left: hoveredItem.rect.left + (hoveredItem.rect.width / 2), 
                    top: hoveredItem.rect.bottom + 10,
                    transform: 'translate(-50%, 0)' 
                }}
            >
                <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-600 relative">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-t border-l border-slate-600 transform rotate-45"></div>
                    
                    <div className="font-bold text-amber-400 text-xs mb-1 border-b border-slate-700 pb-1">{hoveredItem.item.name}</div>
                    <div className="text-slate-300 leading-relaxed mb-2 italic text-[10px]">"{hoveredItem.item.description}"</div>
                    
                    {hoveredItem.item.equipSlot && (
                        <div className="flex justify-between items-center bg-slate-800 p-1.5 rounded mb-1">
                            <span className="text-slate-500 uppercase font-bold text-[9px]">Slot</span>
                            <span className="text-emerald-400 uppercase font-black text-[9px]">{hoveredItem.item.equipSlot.replace('_',' ')}</span>
                        </div>
                    )}
                    
                    {hoveredItem.isEquippable && (
                        <div className="text-center text-amber-500 font-bold uppercase text-[9px] mt-1 animate-pulse">
                            Click to Equip
                        </div>
                    )}
                </div>
            </div>
        )}

     </div>
  );
};

export default InventoryDrawer;