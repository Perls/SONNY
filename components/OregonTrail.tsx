
import React, { useState, useEffect, useRef } from 'react';

interface OregonTrailProps {
    onClose: () => void;
}

type Screen = 'menu' | 'select_class' | 'naming' | 'shop' | 'travel' | 'landmark' | 'hunt' | 'game_over' | 'victory';

interface GameState {
    profession: 'banker' | 'carpenter' | 'farmer';
    money: number;
    party: { name: string, health: number, status: string }[];
    date: Date;
    weather: string;
    pace: 'steady' | 'strenuous' | 'grueling';
    rations: 'filling' | 'meager' | 'bare bones';
    milesTraveled: number;
    nextLandmarkDist: number;
    supplies: {
        oxen: number;
        food: number;
        clothing: number;
        ammo: number;
        parts: number;
    };
    messages: string[];
}

const PROFESSIONS = {
    banker: { label: 'Banker from Boston', money: 1600, scoreMult: 1 },
    carpenter: { label: 'Carpenter from Ohio', money: 800, scoreMult: 2 },
    farmer: { label: 'Farmer from Illinois', money: 400, scoreMult: 3 }
};

const LANDMARKS = [
    { name: 'Kansas River', dist: 102 },
    { name: 'Big Blue River', dist: 185 },
    { name: 'Fort Kearney', dist: 304 },
    { name: 'Chimney Rock', dist: 554 },
    { name: 'Fort Laramie', dist: 640 },
    { name: 'Independence Rock', dist: 830 },
    { name: 'South Pass', dist: 932 },
    { name: 'Fort Hall', dist: 1395 },
    { name: 'Oregon City', dist: 2000 }
];

const OregonTrail: React.FC<OregonTrailProps> = ({ onClose }) => {
    const [screen, setScreen] = useState<Screen>('menu');
    const [gameState, setGameState] = useState<GameState>({
        profession: 'banker',
        money: 0,
        party: [],
        date: new Date(1848, 2, 1), // March 1, 1848
        weather: 'cool',
        pace: 'steady',
        rations: 'filling',
        milesTraveled: 0,
        nextLandmarkDist: 102,
        supplies: { oxen: 0, food: 0, clothing: 0, ammo: 0, parts: 0 },
        messages: ["Welcome to the trail."]
    });

    const [tempNames, setTempNames] = useState(['', '', '', '', '']);
    const [huntTimer, setHuntTimer] = useState(0);
    const [animals, setAnimals] = useState<{id: number, x: number, y: number, type: string, speed: number}[]>([]);
    
    // --- INIT ---
    const selectProfession = (p: 'banker' | 'carpenter' | 'farmer') => {
        setGameState(prev => ({ ...prev, profession: p, money: PROFESSIONS[p].money }));
        setScreen('naming');
    };

    const handleNameChange = (idx: number, val: string) => {
        const newNames = [...tempNames];
        newNames[idx] = val;
        setTempNames(newNames);
    };

    const confirmNames = () => {
        const party = tempNames.filter(n => n.trim() !== '').map(n => ({ name: n, health: 100, status: 'Good' }));
        if (party.length === 0) return;
        setGameState(prev => ({ ...prev, party }));
        setScreen('shop');
    };

    // --- SHOP ---
    const buyItem = (type: keyof GameState['supplies'], cost: number, amount: number) => {
        if (gameState.money >= cost) {
            setGameState(prev => ({
                ...prev,
                money: prev.money - cost,
                supplies: { ...prev.supplies, [type]: prev.supplies[type] + amount }
            }));
        }
    };

    // --- TRAVEL LOOP ---
    const [isMoving, setIsMoving] = useState(false);
    
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isMoving && screen === 'travel') {
            interval = setInterval(tickTurn, 1000); // 1 day per second
        }
        return () => clearInterval(interval);
    }, [isMoving, screen, gameState]);

    const tickTurn = () => {
        setGameState(prev => {
            // 1. Movement
            let speed = prev.supplies.oxen * 2.5; 
            if (prev.pace === 'strenuous') speed *= 1.5;
            if (prev.pace === 'grueling') speed *= 2;
            const move = Math.floor(speed + (Math.random() * 5));
            const newMiles = prev.milesTraveled + move;

            // 2. Resources
            const foodCons = prev.party.length * (prev.rations === 'filling' ? 3 : prev.rations === 'meager' ? 2 : 1);
            const newFood = Math.max(0, prev.supplies.food - foodCons);

            // 3. Health & Events
            const newParty = prev.party.map(p => {
                let hp = p.health;
                if (newFood === 0) hp -= 5;
                if (prev.pace === 'grueling') hp -= 2;
                if (Math.random() < 0.05) hp -= 10; // Random sickness
                return { ...p, health: Math.max(0, hp), status: hp > 70 ? 'Good' : hp > 30 ? 'Fair' : 'Poor' };
            });

            // Check Death
            const aliveParty = newParty.filter(p => p.health > 0);
            let msgs = [...prev.messages];
            if (aliveParty.length < prev.party.length) {
                msgs.push("A party member has died.");
                setIsMoving(false);
            }

            if (aliveParty.length === 0) {
                setIsMoving(false);
                setScreen('game_over');
                return prev;
            }
            
            // Check Landmark
            const nextMark = LANDMARKS.find(l => l.dist > prev.milesTraveled);
            if (nextMark && newMiles >= nextMark.dist) {
                setIsMoving(false);
                msgs.push(`Reached ${nextMark.name}`);
                // Stop exactly at landmark
                return {
                    ...prev,
                    milesTraveled: nextMark.dist,
                    party: newParty,
                    supplies: { ...prev.supplies, food: newFood },
                    date: new Date(prev.date.getTime() + 86400000),
                    messages: msgs
                };
            }

            return {
                ...prev,
                milesTraveled: newMiles,
                party: newParty,
                supplies: { ...prev.supplies, food: newFood },
                date: new Date(prev.date.getTime() + 86400000),
                messages: msgs.slice(-5)
            };
        });
    };

    // --- HUNTING ---
    const startHunt = () => {
        setScreen('hunt');
        setAnimals([]);
        setHuntTimer(15);
    };

    useEffect(() => {
        if (screen !== 'hunt') return;
        
        // Timer
        const timer = setInterval(() => {
            setHuntTimer(t => {
                if (t <= 1) {
                    setScreen('travel');
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        // Spawner
        const spawner = setInterval(() => {
            if (Math.random() > 0.7) {
                setAnimals(prev => [...prev, {
                    id: Math.random(),
                    x: Math.random() > 0.5 ? 0 : 90,
                    y: Math.random() * 80 + 10,
                    type: Math.random() > 0.8 ? '🐻' : Math.random() > 0.5 ? '🦌' : '🐇',
                    speed: (Math.random() + 0.5) * (Math.random() > 0.5 ? 1 : -1)
                }]);
            }
        }, 500);

        // Mover
        const mover = setInterval(() => {
            setAnimals(prev => prev.map(a => ({ ...a, x: a.x + a.speed })).filter(a => a.x > -10 && a.x < 110));
        }, 50);

        return () => { clearInterval(timer); clearInterval(spawner); clearInterval(mover); };
    }, [screen]);

    const shootAnimal = (id: number, type: string) => {
        if (gameState.supplies.ammo > 0) {
            let meat = 0;
            if (type === '🐻') meat = 200;
            if (type === '🦌') meat = 100;
            if (type === '🐇') meat = 5;
            
            setGameState(prev => ({
                ...prev,
                supplies: { ...prev.supplies, ammo: prev.supplies.ammo - 1, food: prev.supplies.food + meat },
                messages: [...prev.messages, `Shot ${type}! +${meat} lbs meat.`]
            }));
            setAnimals(prev => prev.filter(a => a.id !== id));
        }
    };

    return (
        <div className="w-full h-full bg-black text-[#00ff00] font-mono p-8 border-[16px] border-gray-600 relative rounded-lg overflow-hidden flex flex-col shadow-inner">
            {/* SCANLINES */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 opacity-20"></div>

            {/* --- MENU --- */}
            {screen === 'menu' && (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <h1 className="text-4xl mb-8 font-bold text-white tracking-widest text-shadow">THE OREGON TRAIL</h1>
                    <button onClick={() => setScreen('select_class')} className="text-xl hover:bg-[#00ff00] hover:text-black px-4 py-1 w-64 text-left">1. Travel the Trail</button>
                    <button className="text-xl hover:bg-[#00ff00] hover:text-black px-4 py-1 w-64 text-left">2. Learn About It</button>
                    <button onClick={onClose} className="text-xl hover:bg-[#00ff00] hover:text-black px-4 py-1 w-64 text-left">3. Exit to Windows</button>
                    <div className="mt-8 text-xs text-white">Press Number keys or Click</div>
                </div>
            )}

            {/* --- CLASS SELECT --- */}
            {screen === 'select_class' && (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <h2 className="text-2xl mb-6 text-white">Choose Profession</h2>
                    <button onClick={() => selectProfession('banker')} className="text-lg hover:bg-[#00ff00] hover:text-black px-4 py-1 w-96 text-left">1. Banker ($1600)</button>
                    <button onClick={() => selectProfession('carpenter')} className="text-lg hover:bg-[#00ff00] hover:text-black px-4 py-1 w-96 text-left">2. Carpenter ($800)</button>
                    <button onClick={() => selectProfession('farmer')} className="text-lg hover:bg-[#00ff00] hover:text-black px-4 py-1 w-96 text-left">3. Farmer ($400)</button>
                </div>
            )}

            {/* --- NAMING --- */}
            {screen === 'naming' && (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <h2 className="text-2xl mb-4 text-white">Party Names</h2>
                    {tempNames.map((n, i) => (
                        <div key={i} className="flex gap-2">
                            <span>{i + 1}.</span>
                            <input 
                                value={n} 
                                onChange={(e) => handleNameChange(i, e.target.value)} 
                                className="bg-transparent border-b border-[#00ff00] text-[#00ff00] outline-none w-48 font-mono"
                                placeholder={i === 0 ? "Leader Name" : "Member Name"}
                                autoFocus={i === 0}
                            />
                        </div>
                    ))}
                    <button onClick={confirmNames} className="mt-4 border-2 border-[#00ff00] px-4 py-2 hover:bg-[#00ff00] hover:text-black">Next</button>
                </div>
            )}

            {/* --- SHOP --- */}
            {screen === 'shop' && (
                <div className="flex flex-col h-full">
                    <h2 className="text-2xl border-b-2 border-[#00ff00] pb-2 mb-4 text-white">Matt's General Store</h2>
                    <div className="flex-grow grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <div className="text-white mb-2">Total Funds: ${gameState.money}</div>
                            <button onClick={() => buyItem('oxen', 40, 2)} className="block hover:bg-[#00ff00] hover:text-black px-2 w-full text-left">Oxen (2) - $40</button>
                            <button onClick={() => buyItem('food', 20, 100)} className="block hover:bg-[#00ff00] hover:text-black px-2 w-full text-left">Food (100 lbs) - $20</button>
                            <button onClick={() => buyItem('clothing', 10, 1)} className="block hover:bg-[#00ff00] hover:text-black px-2 w-full text-left">Clothing (1 set) - $10</button>
                            <button onClick={() => buyItem('ammo', 2, 20)} className="block hover:bg-[#00ff00] hover:text-black px-2 w-full text-left">Bullets (20) - $2</button>
                            <button onClick={() => buyItem('parts', 10, 1)} className="block hover:bg-[#00ff00] hover:text-black px-2 w-full text-left">Wagon Parts - $10</button>
                        </div>
                        <div className="border border-[#00ff00] p-4 text-white">
                            <div className="underline mb-2">Inventory</div>
                            <div>Oxen: {gameState.supplies.oxen}</div>
                            <div>Food: {gameState.supplies.food} lbs</div>
                            <div>Clothes: {gameState.supplies.clothing}</div>
                            <div>Ammo: {gameState.supplies.ammo}</div>
                            <div>Parts: {gameState.supplies.parts}</div>
                        </div>
                    </div>
                    <button onClick={() => setScreen('travel')} className="mt-4 border-2 border-[#00ff00] px-4 py-2 hover:bg-[#00ff00] hover:text-black self-center">Hit the Trail</button>
                </div>
            )}

            {/* --- TRAVEL --- */}
            {screen === 'travel' && (
                <div className="flex flex-col h-full">
                    {/* Scene */}
                    <div className="h-48 border-b-2 border-[#00ff00] relative bg-[#001100] mb-4 overflow-hidden">
                        <div className="absolute bottom-10 left-0 w-full h-1 bg-[#00ff00]"></div>
                        {/* Mountains */}
                        <div className="absolute bottom-10 left-10 text-6xl text-[#00ff00] opacity-50">^</div>
                        <div className="absolute bottom-10 right-20 text-8xl text-[#00ff00] opacity-50">^</div>
                        {/* Wagon */}
                        <div className={`absolute bottom-6 left-1/2 text-4xl text-white transform -translate-x-1/2 ${isMoving ? 'animate-bounce' : ''}`}>
                            🛒🐄
                        </div>
                    </div>

                    <div className="flex gap-8">
                        <div className="w-1/2 space-y-1 text-white">
                            <div>Date: {gameState.date.toDateString()}</div>
                            <div>Weather: {gameState.weather}</div>
                            <div>Health: {gameState.party.length > 0 ? gameState.party[0].status : 'Dead'}</div>
                            <div>Food: {gameState.supplies.food} lbs</div>
                            <div>Next Landmark: {gameState.nextLandmarkDist - gameState.milesTraveled} mi</div>
                            <div>Traveled: {gameState.milesTraveled} mi</div>
                        </div>
                        <div className="w-1/2 border border-[#00ff00] p-2 h-32 overflow-y-auto text-xs">
                            {gameState.messages.map((m, i) => <div key={i}>{m}</div>)}
                        </div>
                    </div>
                    
                    <div className="mt-auto flex justify-center gap-4">
                        <button onClick={() => setIsMoving(!isMoving)} className="border-2 border-[#00ff00] px-4 py-2 hover:bg-[#00ff00] hover:text-black">
                            {isMoving ? "Stop" : "Continue"}
                        </button>
                        <button onClick={startHunt} className="border-2 border-[#00ff00] px-4 py-2 hover:bg-[#00ff00] hover:text-black">
                            Hunt
                        </button>
                        <button onClick={() => buyItem('food', 0, 0)} className="border-2 border-[#00ff00] px-4 py-2 hover:bg-[#00ff00] hover:text-black">
                            Check Supplies
                        </button>
                    </div>
                </div>
            )}

            {/* --- HUNT --- */}
            {screen === 'hunt' && (
                <div className="relative flex-grow bg-[#001100] cursor-crosshair overflow-hidden">
                    <div className="absolute top-2 left-2 bg-black text-white px-2">Ammo: {gameState.supplies.ammo} | Time: {huntTimer}</div>
                    {animals.map(a => (
                        <div 
                            key={a.id} 
                            className="absolute text-4xl cursor-pointer select-none"
                            style={{ left: `${a.x}%`, top: `${a.y}%`, transition: 'left 0.5s linear' }}
                            onMouseDown={() => shootAnimal(a.id, a.type)}
                        >
                            {a.type}
                        </div>
                    ))}
                </div>
            )}

            {/* --- GAME OVER --- */}
            {screen === 'game_over' && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="border-4 border-red-500 p-8 text-red-500 mb-4">
                        <h1 className="text-4xl font-bold mb-2">YOU HAVE DIED</h1>
                        <p>Your journey ends here.</p>
                    </div>
                    <button onClick={onClose} className="border-2 border-[#00ff00] px-6 py-2 hover:bg-[#00ff00] hover:text-black">
                        Return to Windows
                    </button>
                </div>
            )}

        </div>
    );
};

export default OregonTrail;
