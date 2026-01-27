
import React, { useState } from 'react';
import { InventoryItem, Equipment, CrewMember, ReportData } from '../types';
import { ITEMS } from '../constants';
import ActiveBuffs from './ActiveBuffs';
import CraftingPanel from './CraftingPanel';
import { useGameEngine } from '../contexts/GameEngineContext';

interface InventoryScreenProps {
  inventory: InventoryItem[];
  equipment?: Equipment;
  boss: CrewMember;
  onEquip: (item: InventoryItem) => void; 
  onUnequip: (slot: keyof Equipment) => void;
  onUse: (itemId: string) => void;
  currentEnergy?: number;
}

const InventoryScreen: React.FC<InventoryScreenProps> = ({ inventory, equipment, boss, onEquip, onUnequip, onUse, currentEnergy }) => {
  const { handleCraft, gameState, updateSave, triggerFeedback } = useGameEngine();
  const [activeTab, setActiveTab] = useState<'all' | 'gear' | 'consumable' | 'intel'>('all');
  const [showCrafting, setShowCrafting] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<{ item: any, rect: DOMRect, mode: 'equip' | 'use' | 'info' | 'read' | 'add' | 'delete' } | null>(null);
  const [activeReport, setActiveReport] = useState<ReportData | null>(null);
  
  // Crafting State
  const [craftingIngredients, setCraftingIngredients] = useState<string[]>([]); // Stores Inventory Item IDs (Unique)
  
  // Delete Mode State
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  // Determine available tabs based on inventory content
  const availableTabs = ['all'];
  if (inventory.some(i => { const def = ITEMS[i.itemId]; return def && (def.type === 'gear' || def.type === 'weapon'); })) availableTabs.push('gear');
  if (inventory.some(i => { const def = ITEMS[i.itemId]; return def && def.type === 'consumable'; })) availableTabs.push('consumable');
  if (inventory.some(i => { const def = ITEMS[i.itemId]; return def && def.type === 'intel'; })) availableTabs.push('intel');

  const filteredInventory = inventory.filter(item => {
      // Hide items already in crafting
      if (craftingIngredients.includes(item.id)) return false;

      const def = ITEMS[item.itemId];
      if (!def) return false;
      if (activeTab === 'all') return true;
      if (activeTab === 'gear') return def.type === 'gear' || def.type === 'weapon';
      if (activeTab === 'consumable') return def.type === 'consumable';
      if (activeTab === 'intel') return def.type === 'intel';
      return true;
  });

  const handleMouseEnter = (e: React.MouseEvent, itemId: string) => {
      const itemDef = ITEMS[itemId];
      if (itemDef) {
          let mode: 'equip' | 'use' | 'info' | 'read' | 'add' | 'delete' = 'info';
          
          if (isDeleteMode) {
              mode = 'delete';
          } else if (showCrafting && craftingIngredients.length < 3) {
              mode = 'add'; // Prioritize crafting add if slot available
          } else {
              if (itemDef.equipSlot) mode = 'equip';
              if (itemDef.type === 'consumable') mode = 'use';
              if (itemDef.type === 'intel') mode = 'read';
          }

          setHoveredItem({
              item: itemDef,
              rect: e.currentTarget.getBoundingClientRect(),
              mode
          });
      }
  };

  const handleItemClick = (item: InventoryItem) => {
      // Delete Logic
      if (isDeleteMode) {
          if (gameState) {
             const newInventory = gameState.inventory.filter(i => i.id !== item.id);
             // Remove from crafting queue if present (though filtered out usually)
             if (craftingIngredients.includes(item.id)) {
                 setCraftingIngredients(prev => prev.filter(id => id !== item.id));
             }
             updateSave({ ...gameState, inventory: newInventory });
             triggerFeedback(`Trashed ${ITEMS[item.itemId]?.name || 'Item'}`, 'error');
          }
          return;
      }

      // Crafting Logic Interception
      if (showCrafting && craftingIngredients.length < 3) {
          setCraftingIngredients(prev => [...prev, item.id]);
          return;
      }

      const def = ITEMS[item.itemId];
      if (!def) return;
      if (def.equipSlot) {
          onEquip(item);
      } else if (def.type === 'consumable') {
          onUse(item.itemId);
      } else if (def.type === 'intel' && item.reportData) {
          setActiveReport(item.reportData);
      }
  };

  const handleMouseLeave = () => {
      setHoveredItem(null);
  };

  const executeCraft = () => {
      const success = handleCraft(craftingIngredients);
      if (success) {
          setCraftingIngredients([]);
      }
  };

  const removeIngredient = (index: number) => {
      setCraftingIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const renderEquipSlot = (slotId: keyof Equipment, label: string, icon: string) => {
      const equippedItemId = equipment ? equipment[slotId] : undefined;
      const itemDef = equippedItemId ? ITEMS[equippedItemId] : null;

      return (
          <div className="flex flex-col items-center group z-20">
              <div 
                  onClick={() => itemDef && onUnequip(slotId)}
                  onMouseEnter={(e) => equippedItemId && handleMouseEnter(e, equippedItemId)}
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

  // Logic to determine visual style of report based on quality
  // High = Intel (Smuggler), Low/Medium = Crumpled Note (Others)
  const isIntelReport = activeReport && activeReport.quality === 'High';
  const paperBackground = isIntelReport 
      ? 'url("https://www.transparenttextures.com/patterns/paper.png")' 
      : 'url("https://www.transparenttextures.com/patterns/crumpled-paper.png")';
  const containerClasses = isIntelReport 
      ? "bg-[#fef9c3] rotate-1 font-mono text-sm border-slate-200" 
      : "bg-[#fdfbf7] -rotate-2 font-hand text-2xl border-slate-300";

  return (
     <div className="flex h-full bg-slate-50 font-waze overflow-hidden relative">
        
        {/* REPORT VIEWER OVERLAY */}
        {activeReport && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 animate-fade-in" onClick={() => setActiveReport(null)}>
                <div 
                    className={`w-full max-w-lg shadow-2xl relative p-8 text-slate-900 border-4 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar ${containerClasses}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ backgroundImage: paperBackground }}
                >
                    <div className={`absolute top-[-20px] left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-black uppercase tracking-widest shadow-md transform border z-10 
                        ${isIntelReport ? 'bg-red-700 text-white -rotate-1 border-red-900' : 'bg-white text-slate-500 rotate-2 border-slate-300'}`}>
                        {activeReport.image ? (isIntelReport ? 'Intel + Sketch' : 'Scribble') : (isIntelReport ? 'Confidential' : 'Note')}
                    </div>
                    
                    <button onClick={() => setActiveReport(null)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 font-bold z-10">✕</button>

                    <div className="text-center mb-6 border-b-2 border-slate-800/20 pb-4 relative z-0">
                        {isIntelReport ? (
                            <h2 className="text-3xl font-black font-news uppercase tracking-tighter mb-1">Intel Report</h2>
                        ) : (
                            <div className="text-4xl opacity-20 mb-2">📝</div>
                        )}
                        <div className="text-xs font-mono uppercase text-slate-500">
                            {new Date(activeReport.timestamp).toLocaleDateString()} • {activeReport.location}
                        </div>
                    </div>

                    <div className="leading-relaxed whitespace-pre-wrap mb-8 relative z-0">
                        {activeReport.body}
                        
                        {/* Display sketch if available */}
                        {activeReport.image && (
                            <div className={`mt-4 border-2 p-2 bg-white/50 shadow-sm ${isIntelReport ? 'border-slate-400 border-dashed rotate-1' : 'border-slate-300 -rotate-1'}`}>
                                <img src={activeReport.image} alt="Sketch" className="w-full h-auto" />
                                <div className="text-center text-[10px] text-slate-400 font-bold mt-1 uppercase">
                                    {isIntelReport ? 'Attached Diagram' : 'Doodle'}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-end border-t-2 border-slate-800/20 pt-4 relative z-0">
                        <div>
                            <div className="text-[10px] font-bold uppercase text-slate-500">{isIntelReport ? 'Filed By' : 'Written By'}</div>
                            <div className={`${isIntelReport ? 'font-serif italic text-lg' : 'font-bold'}`}>{activeReport.crewNames[0]}</div>
                        </div>
                        {isIntelReport && (
                            <div className="text-right">
                                <div className="text-[10px] font-bold uppercase text-slate-500">Reviewed By</div>
                                <div className="font-black uppercase text-xs">{activeReport.bossName}</div>
                            </div>
                        )}
                    </div>
                    
                    {/* Stamp */}
                    {isIntelReport && (
                        <div className="absolute bottom-10 right-10 border-4 border-red-700/30 text-red-700/30 font-black text-4xl uppercase p-2 transform -rotate-12 pointer-events-none z-0">
                            {activeReport.quality}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* LEFT: PAPERDOLL (Equipment) */}
        <div className="w-[400px] bg-slate-200 border-r border-slate-300 relative flex-shrink-0 flex flex-col">
            <div className="p-3 bg-slate-300/50 border-b border-slate-300 text-center">
                <h4 className="text-xs font-black uppercase text-slate-600 tracking-widest">Loadout</h4>
            </div>
            
            <div className="flex-grow relative overflow-hidden flex items-center justify-center bg-slate-200">
                {/* Background Silhouette / Avatar - Full Body Muted */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                     {boss ? (
                         <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${boss.imageSeed}&clothing=shirtCrewNeck&clothingColor=262626&skinColor=edb98a`} 
                            className="h-[80%] w-auto object-contain opacity-50 grayscale contrast-125 translate-y-4"
                            alt="Character Silhouette"
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
                    <div className="absolute top-[35%] left-8 pointer-events-auto">
                        {renderEquipSlot('main_hand', 'Main Hand', '⚔️')}
                    </div>

                    {/* Off Hand (Armor) - Mid Right */}
                    <div className="absolute top-[35%] right-8 pointer-events-auto">
                        {renderEquipSlot('off_hand', 'Armor', '🛡️')}
                    </div>

                    {/* Accessory - Lower Left */}
                    <div className="absolute top-[60%] left-10 pointer-events-auto">
                        {renderEquipSlot('accessory', 'Accessory', '💍')}
                    </div>

                    {/* Gadget - Lower Right */}
                    <div className="absolute top-[60%] right-10 pointer-events-auto">
                        {renderEquipSlot('gadget', 'Gadget', '📟')}
                    </div>

                    {/* Body (Jacket) - Bottom Left Center */}
                    <div className="absolute bottom-6 left-[35%] -translate-x-1/2 pointer-events-auto">
                        {renderEquipSlot('body', 'Jacket', '🦺')}
                    </div>

                    {/* Feet - Bottom Right Center */}
                    <div className="absolute bottom-6 left-[65%] -translate-x-1/2 pointer-events-auto">
                        {renderEquipSlot('feet', 'Feet', '👞')}
                    </div>
                </div>
            </div>

            {/* Buffs Section */}
            <div className="h-1/4 border-t border-slate-300 bg-slate-100 p-4 overflow-y-auto">
                <ActiveBuffs traits={boss.traits} currentEnergy={currentEnergy} />
            </div>
        </div>

        {/* RIGHT: BACKPACK (Inventory Grid) & CRAFTING */}
        <div className="flex-grow flex flex-col bg-slate-100 min-w-0 relative">
            
            {/* Top Bar */}
            <div className="p-3 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10 flex-shrink-0">
                <div className="flex gap-2 items-center">
                    {availableTabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`
                                px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border
                                ${activeTab === tab 
                                    ? 'bg-slate-800 text-white border-slate-900 shadow-sm' 
                                    : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                                }
                            `}
                        >
                            {tab === 'consumable' ? 'Items' : tab === 'intel' ? 'Intel' : tab}
                        </button>
                    ))}
                </div>
                <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                    {inventory.length} / 20 Slots
                </div>
            </div>

            {/* Inventory Grid (Flex-grow to fill space) */}
            <div className="p-4 grid grid-cols-4 lg:grid-cols-5 gap-3 overflow-y-auto content-start custom-scrollbar flex-grow pb-4">
                {filteredInventory.map((slot) => {
                    const itemDef = ITEMS[slot.itemId];
                    if (!itemDef) return null;
                    
                    const isEquippable = !!itemDef.equipSlot;
                    const isConsumable = itemDef.type === 'consumable';
                    const isIntel = itemDef.type === 'intel';
                    const isInCrafting = craftingIngredients.includes(slot.id);

                    return (
                        <div 
                            key={slot.id} 
                            onClick={() => handleItemClick(slot)}
                            onMouseEnter={(e) => handleMouseEnter(e, slot.itemId)}
                            onMouseLeave={handleMouseLeave}
                            className={`
                                aspect-square bg-white border-2 rounded-xl flex flex-col items-center justify-center relative transition-all shadow-sm group
                                ${isInCrafting ? 'opacity-50 grayscale border-slate-200' :
                                  isDeleteMode ? 'border-red-300 hover:bg-red-50 cursor-pointer animate-shake' :
                                  isEquippable || isConsumable || isIntel || showCrafting
                                    ? 'cursor-pointer hover:border-amber-400 hover:-translate-y-1 hover:z-50' 
                                    : 'opacity-80 border-slate-200'
                                }
                            `}
                        >
                            <span className="text-5xl mb-2 drop-shadow-sm group-hover:scale-110 transition-transform">{itemDef.icon}</span>
                            <span className="absolute bottom-1 right-1 bg-slate-800 text-white text-[9px] font-mono px-1.5 rounded border border-slate-600 shadow">x{slot.quantity}</span>
                            
                            {/* Hover Hint */}
                            <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                <span className={`text-[8px] font-black text-white uppercase tracking-wider border border-white/50 px-2 py-1 rounded ${isDeleteMode ? 'bg-red-600' : 'bg-black/50'}`}>
                                    {isDeleteMode ? 'TRASH' : showCrafting && craftingIngredients.length < 3 ? 'ADD' : isEquippable ? 'EQUIP' : isConsumable ? 'USE' : isIntel ? 'READ' : 'INFO'}
                                </span>
                            </div>
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

            {/* CRAFTING PANEL OVERLAY (Absolute) */}
            <div 
                className={`absolute bottom-[72px] left-0 right-0 bg-white border-t border-slate-200 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] transition-all duration-300 ease-in-out overflow-hidden`}
                style={{ height: showCrafting ? '260px' : '0px' }}
            >
                <div className="p-4 h-full relative">
                    <CraftingPanel 
                        ingredients={craftingIngredients}
                        onRemoveIngredient={removeIngredient}
                        onCraft={executeCraft}
                        inventoryItems={inventory}
                    />
                </div>
            </div>

            {/* FOOTER BAR (Crafting Toggle & Delete) */}
            <div className="h-[72px] bg-white border-t border-slate-200 flex items-center justify-between px-6 z-30 shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                 
                 {/* Cute Delete Button */}
                 <button
                    onClick={() => setIsDeleteMode(!isDeleteMode)}
                    className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm transition-all border-2
                        ${isDeleteMode 
                            ? 'bg-red-100 text-red-600 border-red-300 shadow-inner scale-90 ring-2 ring-red-200' 
                            : 'bg-white text-slate-400 border-slate-200 hover:border-red-300 hover:text-red-400 hover:scale-105'
                        }
                    `}
                    title="Toggle Trash Mode"
                >
                    🗑️
                </button>
                 
                 <button
                    onClick={() => setShowCrafting(!showCrafting)}
                    className={`
                        px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border flex items-center gap-2
                        ${showCrafting
                            ? 'bg-slate-100 text-slate-600 border-slate-300 shadow-inner' 
                            : 'bg-slate-900 text-amber-500 border-slate-950 hover:bg-slate-800 hover:text-white shadow-lg transform hover:-translate-y-0.5'
                        }
                    `}
                >
                    <span className="text-lg">🛠️</span> {showCrafting ? 'Close Panel' : 'Open Crafting'}
                </button>
            </div>

        </div>

        {/* FIXED TOOLTIP OVERLAY */}
        {hoveredItem && (
             <div 
                className="fixed z-[9999] pointer-events-none w-56 animate-fade-in"
                style={{ 
                    left: hoveredItem.rect.left + (hoveredItem.rect.width / 2), 
                    top: hoveredItem.rect.bottom + 10,
                    transform: 'translate(-50%, 0)' 
                }}
            >
                <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-600 relative">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-t border-l border-slate-600 transform rotate-45"></div>
                    
                    <div className="font-bold text-amber-400 text-xs mb-1 border-b border-slate-700 pb-1 flex justify-between">
                        <span>{hoveredItem.item.name}</span>
                        <span className="text-slate-500 uppercase font-bold text-[9px]">{hoveredItem.item.type}</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed mb-2 italic text-[10px]">"{hoveredItem.item.description}"</div>
                    
                    {hoveredItem.item.equipSlot && (
                        <div className="flex justify-between items-center bg-slate-800 p-1.5 rounded mb-1">
                            <span className="text-slate-500 uppercase font-bold text-[9px]">Slot</span>
                            <span className="text-emerald-400 uppercase font-black text-[9px]">{hoveredItem.item.equipSlot.replace('_',' ')}</span>
                        </div>
                    )}
                    
                    <div className="text-center mt-2">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded
                            ${hoveredItem.mode === 'add' ? 'bg-fuchsia-900 text-fuchsia-300' : hoveredItem.mode === 'use' ? 'bg-emerald-900 text-emerald-300' : hoveredItem.mode === 'equip' ? 'bg-amber-900 text-amber-300' : hoveredItem.mode === 'read' ? 'bg-blue-900 text-blue-300' : hoveredItem.mode === 'delete' ? 'bg-red-900 text-red-300' : 'bg-slate-800 text-slate-500'}
                        `}>
                            {hoveredItem.mode === 'add' ? 'Add to Craft' : hoveredItem.mode === 'use' ? 'Click to Consume' : hoveredItem.mode === 'equip' ? 'Click to Equip' : hoveredItem.mode === 'read' ? 'Click to Read' : hoveredItem.mode === 'delete' ? 'Click to Trash' : 'Info'}
                        </span>
                    </div>
                </div>
            </div>
        )}

     </div>
  );
};

export default InventoryScreen;
