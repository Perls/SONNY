
import React, { useState } from 'react';
import { useGameEngine } from '../../contexts/GameEngineContext';
import { ClassType } from '../../types';

interface RailInteriorProps {
    type: 'subway' | 'depot';
    onClose: () => void;
    onTravel: (x: number, y: number) => void;
}

const DESTINATIONS = [
    { label: 'Downtown (Tribeca)', x: 0, y: 9, cost: 2 },
    { label: 'Uptown (The Bronx)', x: 13, y: 1, cost: 2 },
    { label: 'Queens Bridge', x: 10, y: 5, cost: 2 },
    { label: 'Coney Island', x: 1, y: 9, cost: 2 },
    { label: 'City Hall', x: 5, y: 5, cost: 2 },
];

const CONTAINERS = [
    { id: 1, color: 'bg-red-800', label: 'MAERSK', loot: 'Electronics', risk: 'Low' },
    { id: 2, color: 'bg-blue-800', label: 'COSCO', loot: 'Weapons', risk: 'High' },
    { id: 3, color: 'bg-green-800', label: 'EVERGREEN', loot: 'Cash', risk: 'Med' },
    { id: 4, color: 'bg-yellow-700', label: 'DHL', loot: 'Drugs', risk: 'High' },
    { id: 5, color: 'bg-slate-600', label: 'US GOV', loot: 'Intel', risk: 'Ext' },
    { id: 6, color: 'bg-orange-800', label: 'HAPAG', loot: 'Scrap', risk: 'Low' },
];

const RailInterior: React.FC<RailInteriorProps> = ({ type, onClose, onTravel }) => {
    const { gameState, updateSave, triggerConsigliere } = useGameEngine();
    const [message, setMessage] = useState("");
    const [cooldown, setCooldown] = useState(false);

    if (!gameState) return null;

    const leader = gameState.crew.find(c => c.isLeader) || gameState.crew[0];
    const isSmuggler = leader.classType === ClassType.Smuggler;
    const isHustler = leader.classType === ClassType.Hustler;

    const handleAction = (msg: string) => {
        setMessage(msg);
        setTimeout(() => setMessage(""), 3000);
    };

    const handleRide = (dest: typeof DESTINATIONS[0]) => {
        if (gameState.money < dest.cost) {
            handleAction("Insufficient fare (N$ 2). Jump the turnstile?");
            return;
        }
        
        updateSave({ ...gameState, money: gameState.money - dest.cost });
        onClose(); // Close menu
        onTravel(dest.x, dest.y); // Trigger movement
        triggerConsigliere(`Taking the train to ${dest.label}.`);
    };

    const handleLootContainer = (container: typeof CONTAINERS[0]) => {
        if (cooldown) return;
        setCooldown(true);
        setTimeout(() => setCooldown(false), 2000);

        // Success check
        const roll = Math.random();
        const successChance = isSmuggler ? 0.8 : isHustler ? 0.6 : 0.4;
        
        if (roll < successChance) {
            let payout = 0;
            let lootMsg = "";
            
            if (container.loot === 'Scrap') payout = 50;
            else if (container.loot === 'Cash') payout = 200;
            else if (container.loot === 'Electronics') payout = 150;
            else if (container.loot === 'Weapons') payout = 300;
            else if (container.loot === 'Drugs') payout = 250;
            else payout = 500; // Intel

            // Bonus
            if (isSmuggler) payout = Math.floor(payout * 1.5);
            
            updateSave({ 
                ...gameState, 
                money: gameState.money + payout,
                heat: gameState.heat + (isSmuggler ? 2 : 5) 
            });
            handleAction(`Success! Found ${container.loot}. Gained N$ ${payout}.`);
        } else {
            updateSave({ ...gameState, heat: gameState.heat + 10 });
            handleAction("Alarm triggered! Rail guards are coming!");
        }
    };

    return (
        <div className="absolute inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center font-waze animate-fade-in p-6">
            
            {/* SUBWAY STATION UI */}
            {type === 'subway' && (
                <div className="bg-[#1a1a1a] w-full max-w-4xl h-[600px] rounded-xl shadow-2xl border-4 border-slate-700 overflow-hidden flex flex-col relative">
                    
                    {/* Header */}
                    <div className="h-32 bg-slate-800 border-b-4 border-slate-950 p-6 flex justify-between items-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/subway-lines.png')]"></div>
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-yellow-500 border-4 border-black flex items-center justify-center text-4xl font-black text-black">
                                MTA
                            </div>
                            <div>
                                <h2 className="text-4xl font-black text-white uppercase font-news tracking-tighter">Franklin St.</h2>
                                <div className="text-xs font-bold text-yellow-500 uppercase tracking-widest bg-black/50 px-2 py-1 rounded inline-block">
                                    24 Hour Service • No Spitting
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="bg-slate-700 text-slate-400 hover:text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl transition-colors z-20 border-2 border-slate-600">✕</button>
                    </div>

                    {/* Content */}
                    <div className="flex-grow bg-[#111] p-8 flex gap-8">
                        {/* Map Visual */}
                        <div className="w-1/2 bg-slate-900 border-4 border-slate-700 rounded-lg relative overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-0 opacity-20" style={{ 
                                backgroundImage: `repeating-linear-gradient(45deg, #333 0px, #333 2px, transparent 2px, transparent 10px), linear-gradient(to bottom, #1e293b, #0f172a)` 
                            }}></div>
                            <div className="text-center opacity-50">
                                <div className="text-6xl mb-2">🚇</div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">System Map</div>
                            </div>
                            {/* Animated Train Line */}
                            <div className="absolute top-1/2 left-0 w-full h-2 bg-slate-800 overflow-hidden">
                                <div className="w-20 h-full bg-yellow-500 animate-[slide-right_2s_linear_infinite]"></div>
                            </div>
                        </div>
                        <style>{`@keyframes slide-right { 0% { transform: translateX(-100%); } 100% { transform: translateX(500%); } }`}</style>

                        {/* Controls */}
                        <div className="w-1/2 flex flex-col gap-4">
                            <div className="bg-black border border-slate-700 p-3 rounded text-center mb-2">
                                <div className="text-[9px] font-bold text-yellow-500 uppercase tracking-widest mb-1">Service Alert</div>
                                <div className="text-xs font-mono text-white scroll-smooth animate-pulse">
                                    DELAYS ON LINE 1 DUE TO POLICE ACTIVITY
                                </div>
                            </div>

                            <div className="space-y-2 overflow-y-auto custom-scrollbar flex-grow">
                                {DESTINATIONS.map((dest, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => handleRide(dest)}
                                        className="w-full flex justify-between items-center p-4 bg-slate-800 border-l-4 border-yellow-500 hover:bg-slate-700 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-black text-sm border border-slate-600">
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-sm font-black text-white uppercase group-hover:text-yellow-400">{dest.label}</div>
                                                <div className="text-[9px] font-bold text-slate-500 uppercase">Express</div>
                                            </div>
                                        </div>
                                        <div className="text-xs font-mono font-bold text-emerald-500">N$ {dest.cost}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TRAIN DEPOT UI */}
            {type === 'depot' && (
                <div className="bg-[#1f1f1f] w-full max-w-5xl h-[700px] rounded-xl shadow-[0_0_100px_rgba(0,0,0,1)] border-4 border-amber-900/50 overflow-hidden flex flex-col relative">
                    
                    {/* Header */}
                    <div className="h-24 bg-black border-b-4 border-amber-900 flex justify-between items-center px-8 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="text-5xl filter drop-shadow-md grayscale opacity-80">🛤️</div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-200 uppercase font-news tracking-tighter">Grand Rail Depot</h2>
                                <div className="text-xs font-bold text-amber-700 uppercase tracking-widest flex gap-2">
                                    <span>Restricted Area</span>
                                    <span>•</span>
                                    <span className={isSmuggler ? 'text-emerald-500' : isHustler ? 'text-blue-500' : 'text-slate-500'}>
                                        {isSmuggler ? 'Smuggler Access' : isHustler ? 'Hustler Access' : 'Trespassing'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-slate-500 hover:text-red-500 font-bold text-xl">✕</button>
                    </div>

                    {/* Yard */}
                    <div className="flex-grow bg-[#111] relative overflow-y-auto custom-scrollbar p-8">
                        {/* Background Tracks */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0, transparent 40px, #333 40px, #333 44px)' }}></div>
                        
                        <div className="grid grid-cols-3 gap-6 relative z-10">
                            {CONTAINERS.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => handleLootContainer(c)}
                                    disabled={cooldown}
                                    className={`
                                        h-40 rounded-sm border-4 border-black/50 shadow-2xl relative flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95 group
                                        ${c.color}
                                    `}
                                >
                                    {/* Ribbed Texture */}
                                    <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.2)_0,rgba(0,0,0,0.2)_10px,transparent_10px,transparent_20px)] pointer-events-none"></div>
                                    
                                    <div className="bg-white/10 px-4 py-1 backdrop-blur-sm border border-white/20 mb-2 relative z-10">
                                        <span className="font-black text-white/90 text-2xl tracking-widest">{c.label}</span>
                                    </div>
                                    
                                    <div className="text-[10px] font-bold text-white/60 bg-black/50 px-2 py-0.5 rounded uppercase relative z-10">
                                        Contents: {isSmuggler || isHustler ? c.loot : 'Unknown'}
                                    </div>

                                    {/* Lock Icon */}
                                    <div className="absolute top-2 right-2 text-2xl opacity-50 group-hover:opacity-100 transition-opacity">🔒</div>
                                    
                                    {/* Risk Badge */}
                                    <div className="absolute bottom-2 left-2 text-[9px] font-black uppercase text-black bg-white/80 px-1 rounded">
                                        Risk: {c.risk}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {message && (
                            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black border-2 border-red-500 text-red-500 px-8 py-4 rounded-xl shadow-[0_0_50px_rgba(220,38,38,0.5)] font-black text-xl uppercase tracking-widest animate-bounce z-50">
                                {message}
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};

export default RailInterior;
