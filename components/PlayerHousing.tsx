
import React, { useState } from 'react';
import { PlayerHousing as PlayerHousingType, ClassType, InventoryItem } from '../types';
import { useGameEngine } from '../contexts/GameEngineContext';
import PhoneInterface from './PhoneInterface';
import PlayerComputer from './PlayerComputer';
import { ITEMS } from '../constants';
import { useItemDragDrop, ContainerType } from '../hooks/useItemDragDrop';

interface PlayerHousingProps {
    housing: PlayerHousingType;
    onClose: () => void;
}

const UPGRADES_CONFIG: Record<string, any> = {
    'tenement': {
        next: 'studio',
        cost: 2000,
        label: 'Renovate',
        desc: 'Fix the walls, install a deadbolt, and fumigate.',
        benefit: '+Security, +Comfort'
    },
    'studio': {
        next: 'apartment',
        cost: 5000,
        label: 'Expand',
        desc: 'Knock down a wall. Reinforce the entry. Real furniture.',
        benefit: '+Space, +Defense'
    },
    'apartment': {
        next: 'penthouse',
        cost: 15000,
        label: 'Luxury Refit',
        desc: 'Marble floors, gold fixtures, bulletproof glass.',
        benefit: 'Max Prestige'
    },
    'penthouse': null
};

const CLASS_UPGRADES: Record<string, any> = {
    [ClassType.Thug]: { label: 'Armory Rack', desc: 'Weapon storage and quick access.', cost: 1000, icon: '🔫' },
    [ClassType.Smuggler]: { label: 'Hidden Compartments', desc: 'Stash loot under the floorboards.', cost: 1000, icon: '📦' },
    [ClassType.Dealer]: { label: 'Ventilation System', desc: 'Clear the air for chemical work.', cost: 1000, icon: '💨' },
    [ClassType.Entertainer]: { label: 'Soundproofing', desc: 'Keep the noise in and the cops out.', cost: 1000, icon: '🔇' },
    [ClassType.Hustler]: { label: 'Wall Safe', desc: 'Extra security for liquid assets.', cost: 1000, icon: '🔒' },
};

const FURNITURE_SLOTS = [
    { key: 'tv', label: 'Television', icon: '📺' },
    { key: 'computer', label: 'Computer', icon: '🖥️' },
    { key: 'bed', label: 'Bed', icon: '🛏️' },
    { key: 'music', label: 'Audio', icon: '📻' },
    { key: 'coffee', label: 'Coffee', icon: '☕' },
];

const PlayerHousing: React.FC<PlayerHousingProps> = ({ housing, onClose }) => {
    const { handleRestoreEnergy, setActiveMenu, gameState, updateSave, triggerConsigliere, handleAddSpeedDial, triggerFeedback } = useGameEngine();
    const [activeTab, setActiveTab] = useState<'overview' | 'storage' | 'renovate' | 'comms'>('overview');
    
    // Drag & Drop Hook
    const { isDragging, handleDragStart, handleDragEnd, handleDragOver, handleDrop } = useItemDragDrop({ 
        gameState, 
        updateSave, 
        triggerFeedback 
    });

    // Safe State
    const [transferAmount, setTransferAmount] = useState(0);
    const [safeMode, setSafeMode] = useState<'deposit' | 'withdraw'>('deposit');
    
    // Computer State
    const [showComputer, setShowComputer] = useState(false);
    
    // Brewing Cooldown
    const [isBrewing, setIsBrewing] = useState(false);

    if (!gameState) return null;

    const leader = gameState.crew.find(c => c.isLeader) || gameState.crew[0];
    const housingType = housing.type || 'tenement';
    const upgradePath = UPGRADES_CONFIG[housingType];
    const classUpgrade = CLASS_UPGRADES[leader.classType];
    const hasClassUpgrade = housing.upgrades.includes(classUpgrade.label);
    
    const unreadCount = housing.messages ? housing.messages.filter(m => !m.isRead).length : 0;
    const hasUnread = unreadCount > 0;
    
    // Check installed furniture
    const furniture = housing.furniture || {};
    const hasComputer = !!furniture.computer;
    const hasCoffee = !!furniture.coffee;

    // --- HOUSING LOGIC ---

    const availableCrewForStation = gameState.crew.filter(c => !c.isLeader); 

    const handleSleep = () => {
        const bonus = furniture.bed ? 25 : 0; // Bed gives +25 bonus
        handleRestoreEnergy(25 + bonus);
        triggerConsigliere(`You feel refreshed. Energy Restored (${25+bonus}).`);
    };

    const handleStash = () => {
        onClose();
        setActiveMenu('inventory');
    };
    
    const handleBrewCoffee = () => {
        if (isBrewing) return;
        if (gameState.inventory.length >= 20) {
            triggerFeedback("Backpack full!", 'error');
            return;
        }

        setIsBrewing(true);
        setTimeout(() => setIsBrewing(false), 2000); // 2s cooldown

        const newInventory = [...gameState.inventory];
        const existing = newInventory.find(i => i.itemId === 'hot_coffee');
        if (existing) existing.quantity += 1;
        else newInventory.push({ id: Math.random().toString(), itemId: 'hot_coffee', quantity: 1 });

        updateSave({ ...gameState, inventory: newInventory });
        triggerFeedback("Coffee Brewed!", 'success');
    };

    const handleSafeTransaction = () => {
        const amount = transferAmount;
        if (amount <= 0) return;
        
        let newWallet = gameState.money;
        let newStored = housing.storedMoney || 0;

        if (safeMode === 'deposit') {
            if (amount > newWallet) return;
            newWallet -= amount;
            newStored += amount;
            triggerConsigliere(`Deposited N$ ${amount} into the safe.`);
        } else {
            if (amount > newStored) return;
            newWallet += amount;
            newStored -= amount;
            triggerConsigliere(`Withdrew N$ ${amount} from the safe.`);
        }

        const newHousing = { ...housing, storedMoney: newStored };
        updateSave({ ...gameState, money: newWallet, playerHousing: newHousing });
        setTransferAmount(0); 
    };

    const handleRetrieveItem = (item: InventoryItem, source: 'safe' | 'storage') => {
        if (gameState.inventory.length >= 20) {
            triggerFeedback("Backpack is full!", 'error');
            return;
        }

        let newPlayerInv = gameState.inventory.map(i => ({...i}));
        let newSafeInv = (housing.inventory || []).map(i => ({...i}));
        let newStorageInv = (housing.storage || []).map(i => ({...i}));

        const sourceArr = source === 'safe' ? newSafeInv : newStorageInv;
        const sIndex = sourceArr.findIndex(i => i.id === item.id);
        if (sIndex === -1) return;
        const itemToMove = sourceArr[sIndex];
        sourceArr.splice(sIndex, 1);

        const existing = newPlayerInv.find(i => i.itemId === itemToMove.itemId);
        if (existing) {
            existing.quantity += itemToMove.quantity;
        } else {
            newPlayerInv.push(itemToMove);
        }

        updateSave({
            ...gameState,
            inventory: newPlayerInv,
            playerHousing: { ...housing, inventory: newSafeInv, storage: newStorageInv }
        });
        triggerFeedback(`Retrieved ${ITEMS[item.itemId].name}`, 'success');
    };

    const handleFurnitureInstall = (item: InventoryItem, slotKey: string) => {
        // Move item from inventory to furniture slot
        let newPlayerInv = gameState.inventory.map(i => ({...i}));
        const idx = newPlayerInv.findIndex(i => i.id === item.id);
        if (idx === -1) return;

        // If something is already there, swap it back to inventory? Or prevent?
        if (furniture[slotKey]) {
            // Swap logic: Return old item to inventory
            const oldItemId = furniture[slotKey];
            if (oldItemId) {
                const existing = newPlayerInv.find(i => i.itemId === oldItemId);
                if (existing) existing.quantity += 1;
                else newPlayerInv.push({ id: Math.random().toString(), itemId: oldItemId, quantity: 1 });
            }
        }

        const itemToInstall = newPlayerInv[idx];
        if (itemToInstall.quantity > 1) {
            itemToInstall.quantity -= 1;
        } else {
            newPlayerInv.splice(idx, 1);
        }

        const newFurniture = { ...furniture, [slotKey]: itemToInstall.itemId };
        
        updateSave({
            ...gameState,
            inventory: newPlayerInv,
            playerHousing: { ...housing, furniture: newFurniture }
        });
        triggerFeedback(`Installed ${ITEMS[itemToInstall.itemId].name}`, 'success');
    };

    const handleFurnitureRemove = (slotKey: string) => {
        const itemId = furniture[slotKey];
        if (!itemId) return;

        if (gameState.inventory.length >= 20) {
            triggerFeedback("Backpack full!", 'error');
            return;
        }

        let newPlayerInv = gameState.inventory.map(i => ({...i}));
        const existing = newPlayerInv.find(i => i.itemId === itemId);
        if (existing) existing.quantity += 1;
        else newPlayerInv.push({ id: Math.random().toString(), itemId, quantity: 1 });

        const newFurniture = { ...furniture, [slotKey]: null };

        updateSave({
            ...gameState,
            inventory: newPlayerInv,
            playerHousing: { ...housing, furniture: newFurniture }
        });
        triggerFeedback("Furniture Removed", 'info');
    };

    const toggleStationCrew = (crewId: string) => {
        let newStationed = [...(housing.stationedCrewIds || [])];
        if (newStationed.includes(crewId)) {
            newStationed = newStationed.filter(id => id !== crewId);
        } else {
            newStationed.push(crewId);
        }
        
        const newHousing = { ...housing, stationedCrewIds: newStationed };
        updateSave({ ...gameState, playerHousing: newHousing });
    };

    const handleUpgradeHousing = () => {
        if (!upgradePath) return;
        if (gameState.money < upgradePath.cost) {
            alert("Insufficient funds for renovation.");
            return;
        }

        const newHousing = { 
            ...housing, 
            type: upgradePath.next as any 
        };
        
        updateSave({ 
            ...gameState, 
            money: gameState.money - upgradePath.cost, 
            playerHousing: newHousing 
        });
        triggerConsigliere(`Renovations complete. Welcome to your new ${upgradePath.next}.`);
    };

    const handleClassUpgrade = () => {
        if (gameState.money < classUpgrade.cost) {
            alert("Insufficient funds.");
            return;
        }
        
        const newUpgrades = [...housing.upgrades, classUpgrade.label];
        const newHousing = { ...housing, upgrades: newUpgrades };
        
        updateSave({ 
            ...gameState, 
            money: gameState.money - classUpgrade.cost, 
            playerHousing: newHousing 
        });
        triggerConsigliere(`${classUpgrade.label} installed.`);
    };
    
    // Handlers for Phone Interface
    const handleSaveSpeedDial = (index: number, name: string, number: string) => {
        const dials = [...(housing.speedDials || [
            { name: 'EMPTY', number: '' }, { name: 'EMPTY', number: '' }, 
            { name: 'EMPTY', number: '' }, { name: 'EMPTY', number: '' }
        ])];
        
        const cleanNumber = number.replace(/[^a-zA-Z0-9]/g, '');
        dials[index] = { name: name.toUpperCase().substring(0, 8), number: cleanNumber };
        
        const newHousing = { ...housing, speedDials: dials };
        updateSave({ ...gameState, playerHousing: newHousing });
    };

    const handleClearSpeedDial = (index: number) => {
        const dials = [...(housing.speedDials || [
            { name: 'EMPTY', number: '' }, { name: 'EMPTY', number: '' }, 
            { name: 'EMPTY', number: '' }, { name: 'EMPTY', number: '' }
        ])];
        dials[index] = { name: 'EMPTY', number: '' };
        const newHousing = { ...housing, speedDials: dials };
        updateSave({ ...gameState, playerHousing: newHousing });
    };

    const maxDeposit = gameState.money;
    const maxWithdraw = housing.storedMoney || 0;
    const maxVal = safeMode === 'deposit' ? maxDeposit : maxWithdraw;
    const amount = transferAmount; 

    // Helper for Inventory Grid (Upgraded with Drag and Drop)
    const renderInventoryGrid = (
        items: InventoryItem[], 
        containerId: ContainerType,
        onItemClick: (i: InventoryItem) => void, 
        emptyText: string, 
        max: number, 
        theme: 'light' | 'dark' | 'wood'
    ) => {
        let bgClass = 'bg-white border-slate-200';
        if (theme === 'dark') bgClass = 'bg-slate-900 border-slate-700';
        if (theme === 'wood') bgClass = 'bg-[#d4b483] border-[#8d6e63]';
        
        // Add drop handling
        const handleDropWrapper = (e: React.DragEvent) => {
            // Remove highlight
            e.currentTarget.classList.remove('ring-4', 'ring-emerald-400', 'bg-emerald-50/50');
            handleDrop(e, containerId);
        };
        
        const handleDragOverWrapper = (e: React.DragEvent) => {
            handleDragOver(e);
            // Visual feedback handled by CSS hover mostly, but could add active class here
            e.currentTarget.classList.add('ring-4', 'ring-emerald-400', 'bg-emerald-50/50');
        };

        const handleDragLeaveWrapper = (e: React.DragEvent) => {
             e.currentTarget.classList.remove('ring-4', 'ring-emerald-400', 'bg-emerald-50/50');
        };

        return (
            <div 
                className={`grid grid-cols-5 gap-2 p-2 h-full content-start overflow-y-auto custom-scrollbar ${bgClass} border-2 rounded-lg transition-all duration-200`}
                onDrop={handleDropWrapper}
                onDragOver={handleDragOverWrapper}
                onDragLeave={handleDragLeaveWrapper}
            >
                {items.map(item => {
                    const def = ITEMS[item.itemId];
                    if (!def) return null;
                    return (
                        <button
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item, containerId)}
                            onDragEnd={handleDragEnd}
                            onClick={() => onItemClick(item)}
                            className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center relative group transition-all cursor-grab active:cursor-grabbing
                                ${theme === 'dark' 
                                    ? 'bg-slate-800 border-slate-600 hover:border-amber-500 hover:bg-slate-700' 
                                    : theme === 'wood'
                                        ? 'bg-[#f5f5f5]/50 border-[#8d6e63]/30 hover:bg-white hover:border-[#8d6e63]'
                                        : 'bg-white border-slate-300 hover:border-amber-500 hover:shadow-md'
                                }
                            `}
                            title={def.name}
                        >
                            <span className="text-2xl drop-shadow-sm group-hover:scale-110 transition-transform pointer-events-none">{def.icon}</span>
                            <span className={`absolute bottom-0.5 right-0.5 text-[9px] font-mono px-1 rounded pointer-events-none ${theme === 'dark' ? 'bg-black text-white' : 'bg-slate-200 text-slate-800'}`}>x{item.quantity}</span>
                        </button>
                    );
                })}
                {[...Array(Math.max(0, max - items.length))].map((_, i) => (
                    <div key={`empty-${i}`} className={`aspect-square rounded-lg border-2 border-dashed flex items-center justify-center pointer-events-none ${theme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-300/50 bg-white/20'}`}></div>
                ))}
                {items.length === 0 && (
                    <div className="col-span-5 text-center py-4 text-[10px] font-bold uppercase opacity-50 pointer-events-none">
                        {emptyText}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="absolute inset-0 z-[60] bg-black/70 backdrop-blur-md flex items-center justify-center font-waze animate-fade-in p-6">
            <div className="bg-white w-full max-w-7xl rounded-2xl shadow-2xl border-4 border-slate-700 overflow-hidden flex flex-col relative h-[850px]">
                
                {/* Header */}
                <div className="h-24 bg-slate-900 border-b-4 border-slate-700 flex items-center justify-between px-8 relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-xl bg-amber-600 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-lg">
                            🏠
                        </div>
                        <div>
                            <h1 className="text-3xl font-black font-news uppercase tracking-tighter leading-none text-white">
                                {housing.name}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="bg-slate-700 text-slate-300 text-[9px] font-bold px-2 py-0.5 rounded uppercase border border-slate-600">
                                    {housingType}
                                </span>
                                <span className="bg-emerald-900 text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded uppercase border border-emerald-700 font-mono">
                                    Wallet: N$ {gameState.money.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 bg-white hover:bg-red-50 text-slate-900 hover:text-red-600 rounded-full flex items-center justify-center font-bold transition-all shadow-lg text-lg relative z-10 border-2 border-slate-200"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 bg-slate-50">
                    {[
                        { id: 'overview', label: 'Quarters', icon: '🛋️' },
                        { id: 'storage', label: 'Storage', icon: '📦' },
                        { id: 'comms', label: 'Comms', icon: '📞', alert: hasUnread },
                        { id: 'renovate', label: 'Renovations', icon: '🔨' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors border-b-4 relative
                                ${activeTab === tab.id 
                                    ? 'bg-white border-amber-500 text-slate-900' 
                                    : 'bg-slate-100 border-transparent text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                                }
                            `}
                        >
                            <span className="text-lg">{tab.icon}</span>
                            {tab.label}
                            {tab.alert && <div className="absolute top-3 right-10 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm"></div>}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-grow bg-slate-100 overflow-y-auto custom-scrollbar p-8">
                    
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="flex gap-8 h-full">
                            {/* Visual/Status */}
                            <div className="w-1/2 flex flex-col gap-6">
                                <div className="bg-slate-800 rounded-xl overflow-hidden border-4 border-slate-700 relative h-96 group shadow-lg">
                                    <div className="absolute inset-0 opacity-40 bg-black"></div>
                                    <img 
                                        src="https://images.unsplash.com/photo-1594904578869-c01178348a42?q=80&w=1000&auto=format&fit=crop"
                                        className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-1000"
                                    />
                                    
                                    {/* Furniture Slots Overlay */}
                                    <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm p-4 rounded-xl border border-white/10 grid grid-cols-5 gap-2">
                                        {FURNITURE_SLOTS.map(slot => {
                                            const itemId = furniture[slot.key];
                                            const itemDef = itemId ? ITEMS[itemId] : null;
                                            
                                            // Find suitable item in inventory to install
                                            const installable = gameState.inventory.find(i => ITEMS[i.itemId].furnitureSlot === slot.key);
                                            
                                            return (
                                                <div 
                                                    key={slot.key}
                                                    onClick={() => {
                                                        if (itemDef) handleFurnitureRemove(slot.key);
                                                        else if (installable) handleFurnitureInstall(installable, slot.key);
                                                    }}
                                                    className={`
                                                        aspect-square rounded-lg border-2 flex flex-col items-center justify-center relative cursor-pointer transition-all group/slot
                                                        ${itemDef 
                                                            ? 'bg-slate-700 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                                                            : installable 
                                                                ? 'bg-slate-800 border-dashed border-amber-500 hover:bg-slate-700 animate-pulse'
                                                                : 'bg-slate-900/50 border-slate-700 opacity-50'
                                                        }
                                                    `}
                                                    title={itemDef ? `Remove ${itemDef.name}` : installable ? `Install ${ITEMS[installable.itemId].name}` : `Empty ${slot.label} Slot`}
                                                >
                                                    <div className="text-2xl drop-shadow-sm">{itemDef ? itemDef.icon : slot.icon}</div>
                                                    <div className="text-[7px] uppercase font-bold text-white/50 mt-1">{slot.label}</div>
                                                    {itemDef && (
                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover/slot:opacity-100">✕</div>
                                                    )}
                                                    {!itemDef && installable && (
                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[8px]">+</div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={handleSleep}
                                        className="bg-white border-2 border-slate-200 p-4 rounded-xl shadow-sm hover:border-blue-400 hover:shadow-md transition-all group text-left flex items-center gap-3"
                                    >
                                        <div className="text-3xl group-hover:scale-110 transition-transform">🛏️</div>
                                        <div>
                                            <div className="font-black text-slate-800 uppercase text-sm">Sleep</div>
                                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                                                Restore Energy {furniture.bed ? '(+25 Bonus)' : ''}
                                            </div>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={handleStash}
                                        className="bg-white border-2 border-slate-200 p-4 rounded-xl shadow-sm hover:border-amber-400 hover:shadow-md transition-all group text-left flex items-center gap-3"
                                    >
                                        <div className="text-3xl group-hover:scale-110 transition-transform">📦</div>
                                        <div>
                                            <div className="font-black text-slate-800 uppercase text-sm">Stash</div>
                                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Open Inventory</div>
                                        </div>
                                    </button>
                                    
                                    {/* Computer Button - Only if installed */}
                                    {furniture.computer && (
                                        <button 
                                            onClick={() => setShowComputer(true)}
                                            className="bg-slate-200 border-2 border-slate-300 p-4 rounded-xl shadow-sm hover:bg-slate-100 hover:border-slate-400 hover:shadow-md transition-all group flex items-center gap-3"
                                        >
                                            <div className="text-3xl group-hover:scale-110 transition-transform grayscale group-hover:grayscale-0">💻</div>
                                            <div>
                                                <div className="font-black text-slate-800 uppercase text-sm">Computer</div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Access NetLink</div>
                                            </div>
                                        </button>
                                    )}
                                    
                                    {/* Coffee Button - Only if installed */}
                                    {hasCoffee && (
                                        <button 
                                            onClick={handleBrewCoffee}
                                            disabled={isBrewing}
                                            className={`bg-stone-100 border-2 border-stone-300 p-4 rounded-xl shadow-sm hover:bg-white hover:border-amber-500 hover:shadow-md transition-all group flex items-center gap-3 ${isBrewing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <div className={`text-3xl group-hover:scale-110 transition-transform ${isBrewing ? 'animate-pulse' : ''}`}>☕</div>
                                            <div>
                                                <div className="font-black text-slate-800 uppercase text-sm">{isBrewing ? 'Brewing...' : 'Brew Coffee'}</div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">+Energy +INT</div>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Crew Management */}
                            <div className="w-1/2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
                                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                                    <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Stationed Crew</h3>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{housing.stationedCrewIds.length} Guarding</span>
                                </div>
                                
                                <div className="flex-grow overflow-y-auto custom-scrollbar space-y-2">
                                    {availableCrewForStation.length === 0 && (
                                        <div className="text-center text-slate-400 text-xs italic py-12">
                                            Recruit soldiers to guard your safehouse.
                                        </div>
                                    )}
                                    {availableCrewForStation.map(crew => {
                                        const isStationed = housing.stationedCrewIds?.includes(crew.id);
                                        return (
                                            <button 
                                                key={crew.id}
                                                onClick={() => toggleStationCrew(crew.id)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left group
                                                    ${isStationed ? 'bg-amber-50 border-amber-400' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}
                                                `}
                                            >
                                                <div className="w-10 h-10 rounded bg-slate-200 overflow-hidden border border-slate-300 relative">
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${crew.imageSeed}`} />
                                                    {isStationed && <div className="absolute inset-0 bg-amber-500/20"></div>}
                                                </div>
                                                <div className="flex-grow">
                                                    <div className={`text-xs font-black uppercase ${isStationed ? 'text-amber-800' : 'text-slate-700'}`}>{crew.name}</div>
                                                    <div className="text-[9px] font-bold text-slate-400 uppercase">{crew.pawnType || 'Soldier'}</div>
                                                </div>
                                                {isStationed && <span className="text-amber-600 font-bold text-xs">🛡️</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STORAGE TAB - OVERHAULED WITH DRAG & DROP */}
                    {activeTab === 'storage' && (
                        <div className="flex flex-col gap-6 h-full">
                            
                            {/* 1. Money Section (Condensed) */}
                            <div className="bg-slate-800 rounded-xl p-6 border-4 border-slate-600 shadow-xl relative shrink-0">
                                <div className="absolute top-4 right-4 text-6xl opacity-10 rotate-12 pointer-events-none">🔒</div>
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <h4 className="text-white text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                            <span className="text-emerald-400">N$</span> Liquid Assets
                                        </h4>
                                        <div className="flex items-baseline gap-4 mt-2">
                                            <div>
                                                <span className="text-[10px] text-slate-400 uppercase font-bold mr-2">In Safe</span>
                                                <span className="text-3xl font-mono font-black text-white">{(housing.storedMoney || 0).toLocaleString()}</span>
                                            </div>
                                            <span className="text-slate-500">|</span>
                                            <div>
                                                <span className="text-[10px] text-slate-400 uppercase font-bold mr-2">In Wallet</span>
                                                <span className="text-xl font-mono font-bold text-emerald-400">{gameState.money.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-center bg-slate-900/50 p-2 rounded-lg border border-slate-700">
                                    <div className="flex bg-slate-700 rounded p-1">
                                        <button 
                                            onClick={() => { setSafeMode('deposit'); setTransferAmount(0); }}
                                            className={`px-4 py-1.5 text-[10px] font-black uppercase rounded transition-all ${safeMode === 'deposit' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                                        >Deposit</button>
                                        <button 
                                            onClick={() => { setSafeMode('withdraw'); setTransferAmount(0); }}
                                            className={`px-4 py-1.5 text-[10px] font-black uppercase rounded transition-all ${safeMode === 'withdraw' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                                        >Withdraw</button>
                                    </div>
                                    <input 
                                        type="range" min="0" max={maxVal} step="10" value={transferAmount} 
                                        onChange={(e) => setTransferAmount(parseInt(e.target.value))}
                                        className="flex-grow h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-white"
                                    />
                                    <div className="text-white font-mono font-bold w-20 text-right">{transferAmount.toLocaleString()}</div>
                                    <button 
                                        onClick={handleSafeTransaction}
                                        disabled={amount <= 0}
                                        className={`px-4 py-1.5 rounded text-[10px] font-black uppercase ${amount > 0 ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-600 text-slate-400 cursor-not-allowed'}`}
                                    >Confirm</button>
                                </div>
                            </div>

                            {/* 2. Storage Areas - Now with Drag & Drop */}
                            <div className="flex-grow flex gap-6 min-h-0 relative">
                                
                                {/* Drag Instruction Hint */}
                                {isDragging && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded-full font-black uppercase text-xs z-50 pointer-events-none animate-pulse">
                                        Drop to Move
                                    </div>
                                )}

                                {/* Left: Player Inventory */}
                                <div className="w-1/3 flex flex-col">
                                    <div className="flex justify-between items-center mb-2 px-1">
                                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">🎒 Backpack ({gameState.inventory.length}/20)</h4>
                                    </div>
                                    <div className="flex-grow">
                                        {renderInventoryGrid(
                                            gameState.inventory, 
                                            'player',
                                            (item) => handleRetrieveItem(item, 'safe'), // Legacy click handler (unused if dragging)
                                            "Backpack Empty", 
                                            20, 
                                            'light'
                                        )}
                                    </div>
                                    <div className="text-[9px] text-slate-400 mt-1 text-center font-bold">DRAG TO STORE</div>
                                </div>

                                {/* Divider */}
                                <div className="w-px bg-slate-300 my-4"></div>

                                {/* Right: Storages */}
                                <div className="w-2/3 flex flex-col gap-4">
                                    
                                    {/* The Safe (High Security) */}
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex justify-between items-center mb-2 px-1">
                                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                                <span>🔒</span> The Safe ({(housing.inventory?.length || 0)}/5)
                                            </h4>
                                            <span className="text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">High Security</span>
                                        </div>
                                        <div className="flex-grow">
                                            {renderInventoryGrid(
                                                housing.inventory || [], 
                                                'safe',
                                                (item) => handleRetrieveItem(item, 'safe'), 
                                                "Safe Empty", 
                                                5, 
                                                'dark'
                                            )}
                                        </div>
                                        <div className="flex justify-between mt-1 px-1">
                                             <div className="text-[9px] text-slate-400 font-medium italic">Items here are protected from raids.</div>
                                        </div>
                                    </div>

                                    {/* Apartment Storage (General) */}
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex justify-between items-center mb-2 px-1">
                                            <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest flex items-center gap-2">
                                                <span>📦</span> Closet ({(housing.storage?.length || 0)}/10)
                                            </h4>
                                            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Standard</span>
                                        </div>
                                        <div className="flex-grow">
                                            {renderInventoryGrid(
                                                housing.storage || [], 
                                                'storage',
                                                (item) => handleRetrieveItem(item, 'storage'), 
                                                "Closet Empty", 
                                                10, 
                                                'wood'
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    )}

                    {/* COMMS TAB */}
                    {activeTab === 'comms' && (
                        <PhoneInterface 
                            messages={housing.messages || []}
                            speedDials={housing.speedDials || []}
                            onSaveSpeedDial={handleSaveSpeedDial}
                            onClearSpeedDial={handleClearSpeedDial}
                        />
                    )}

                    {/* RENOVATE TAB */}
                    {activeTab === 'renovate' && (
                        <div className="grid grid-cols-2 gap-8 h-full">
                            {/* Upgrade Path */}
                            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                                <div className="mb-6 pb-2 border-b border-slate-100">
                                    <h4 className="font-black text-slate-800 uppercase tracking-widest text-sm">Property Expansion</h4>
                                </div>
                                
                                {upgradePath ? (
                                    <div className="flex-grow flex flex-col justify-between">
                                        <div>
                                            <div className="text-xs font-bold text-amber-600 uppercase mb-2">Next Tier: {upgradePath.next}</div>
                                            <h3 className="text-3xl font-black text-slate-900 uppercase leading-none mb-4">{upgradePath.label}</h3>
                                            <p className="text-sm text-slate-600 mb-6 leading-relaxed">{upgradePath.desc}</p>
                                            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-xs font-bold uppercase border border-emerald-200 inline-block mb-4">
                                                {upgradePath.benefit}
                                            </div>
                                        </div>
                                        
                                        <button 
                                            onClick={handleUpgradeHousing}
                                            disabled={gameState.money < upgradePath.cost}
                                            className={`w-full py-5 rounded-xl font-black uppercase tracking-widest shadow-lg transition-all flex justify-between px-8 border-b-4 active:border-b-0 active:translate-y-1
                                                ${gameState.money >= upgradePath.cost 
                                                    ? 'bg-slate-900 border-slate-950 text-amber-400 hover:bg-slate-800 hover:text-amber-300' 
                                                    : 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'}
                                            `}
                                        >
                                            <span>Upgrade</span>
                                            <span>N$ {upgradePath.cost.toLocaleString()}</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex-grow flex flex-col items-center justify-center text-slate-400 text-center p-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                        <div className="text-5xl mb-4">👑</div>
                                        <div className="font-bold uppercase tracking-widest text-lg">Maximum Luxury Achieved</div>
                                    </div>
                                )}
                            </div>

                            {/* Class Specific Mod */}
                            <div className="bg-slate-800 p-8 rounded-xl border-2 border-slate-700 shadow-lg flex flex-col relative overflow-hidden">
                                <div className="absolute top-0 right-0 opacity-10 text-[10rem] transform translate-x-1/4 -translate-y-1/4 pointer-events-none">🛠️</div>
                                
                                <div className="mb-6 pb-2 border-b border-slate-600 relative z-10">
                                    <h4 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-2">
                                        <span className="text-amber-500">{classUpgrade.icon}</span> Class Modification
                                    </h4>
                                </div>

                                <div className="flex-grow flex flex-col justify-between relative z-10">
                                    <div>
                                        <h3 className="text-3xl font-black text-white uppercase leading-none mb-3">{classUpgrade.label}</h3>
                                        <p className="text-sm text-slate-400 mb-8 leading-relaxed">{classUpgrade.desc}</p>
                                    </div>

                                    {hasClassUpgrade ? (
                                        <div className="w-full py-5 bg-emerald-900/50 border border-emerald-500 text-emerald-400 rounded-xl font-black uppercase tracking-widest text-center text-sm">
                                            INSTALLED
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={handleClassUpgrade}
                                            disabled={gameState.money < classUpgrade.cost}
                                            className={`w-full py-5 rounded-xl font-black uppercase tracking-widest shadow-lg transition-all flex justify-between px-8 border-b-4 active:border-b-0 active:translate-y-1
                                                ${gameState.money >= classUpgrade.cost 
                                                    ? 'bg-amber-600 border-amber-800 text-white hover:bg-amber-500' 
                                                    : 'bg-slate-700 border-slate-800 text-slate-500 cursor-not-allowed'}
                                            `}
                                        >
                                            <span>Install</span>
                                            <span>N$ {classUpgrade.cost.toLocaleString()}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {showComputer && (
                    <PlayerComputer onClose={() => setShowComputer(false)} hasComputer={hasComputer} />
                )}
            </div>
        </div>
    );
};

export default PlayerHousing;
