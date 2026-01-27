import React, { useState, useEffect, useCallback, useRef } from 'react';

interface IndustrialJobMinigameProps {
    onClose: () => void;
    onComplete: (payout: number, message: string) => void;
}

// --- CONSTANTS ---
const SHIFT_DURATION_MS = 60000; // 60 seconds shift
const TICK_RATE = 50; // Update loop every 50ms
const SPAWN_RATE_BASE = 0.035; // Chance per tick
const MAX_ENTITIES_PER_CAM = 5;

// Skin Colors (Avataaars hex codes without hash)
const SKIN_COLORS = ['f5d0b1', 'ffdbb4', 'edb98a', 'd08b5b', 'ae5d29', '614335'];

// 90s NYC Item List
const NYC_ITEMS = [
    { icon: '📦', name: 'Shipping Box', scaleBase: 1.2 },
    { icon: '🥾', name: 'Timbs', scaleBase: 1.0 },
    { icon: '🍕', name: 'NY Slice', scaleBase: 0.9 },
    { icon: '📻', name: 'Boombox', scaleBase: 1.3 },
    { icon: '📼', name: 'VHS Tape', scaleBase: 0.8 },
    { icon: '🏀', name: 'Basketball', scaleBase: 1.1 },
    { icon: '🧢', name: 'Fitted Cap', scaleBase: 0.8 },
    { icon: '☕', name: 'Bodega Coffee', scaleBase: 0.7 },
    { icon: '📰', name: 'Daily Paper', scaleBase: 1.0 },
    { icon: '🥯', name: 'Bagel', scaleBase: 0.7 },
];

const SHELF_LEVELS = [35, 60, 85]; // Y positions (%)

// --- TYPES ---
type EntityType = 'worker' | 'thief' | 'janitor' | 'manager';
type EntityState = 'walking_in' | 'stealing' | 'cleaning' | 'inspecting' | 'leaving' | 'caught' | 'fleeing' 
                 | 'proposing' | 'reacting' | 'rejecting_run' | 'heartbroken';

interface Entity {
    id: string;
    type: EntityType;
    quadrant: number;
    x: number; // 0 to 100 (Percentage)
    y: number; // Specific shelf level
    direction: 1 | -1; // 1 = Right, -1 = Left
    state: EntityState;
    speed: number;
    actionTimer: number; // Counts down when stealing/cleaning
    seed: string; // For Face generation
    skinColor: string; // Hex code for skin
    lootItem: typeof NYC_ITEMS[0]; // The specific item object
    hasStolen: boolean; // Tracks if they actually grabbed the item
    penalized?: boolean; // Tracks if player was already penalized for this entity
    hasMusic?: boolean; // New prop for persistent music note
    romanceRole?: 'romeo' | 'juliet'; // Special role for the romance scene
    romanceTargetId?: string; // ID of the partner
}

interface Distraction {
    quadrant: number;
    duration: number;
}

const IndustrialJobMinigame: React.FC<IndustrialJobMinigameProps> = ({ onClose, onComplete }) => {
    // --- STATE ---
    const [timeLeft, setTimeLeft] = useState(SHIFT_DURATION_MS);
    
    const [strikesStolen, setStrikesStolen] = useState(0);
    const [strikesWrong, setStrikesWrong] = useState(0);

    const [caughtCount, setCaughtCount] = useState(0);
    const [entities, setEntities] = useState<Entity[]>([]);
    const [gameOver, setGameOver] = useState<'win' | 'lose' | null>(null);
    const [message, setMessage] = useState("SYSTEM ONLINE - WATCH FOR THEFT");
    const [flash, setFlash] = useState<'red' | 'green' | null>(null);
    const [distractions, setDistractions] = useState<Distraction[]>([]);

    // Refs for mutable state in the fast loop
    const entitiesRef = useRef<Entity[]>([]);
    const distractionsRef = useRef<Distraction[]>([]);
    const romanceTriggeredRef = useRef(false);

    // --- LOGIC ---

    const spawnEntity = () => {
        // Chance to spawn romance couple if not yet triggered
        if (!romanceTriggeredRef.current && Math.random() < 0.05) {
            spawnRomanceCouple();
            return;
        }

        const quadrant = Math.floor(Math.random() * 4);
        const countInQuad = entitiesRef.current.filter(e => e.quadrant === quadrant).length;
        if (countInQuad >= MAX_ENTITIES_PER_CAM) return;

        const roll = Math.random();
        let type: EntityType = 'worker';
        if (roll < 0.45) type = 'thief';
        else if (roll < 0.65) type = 'janitor';
        else if (roll < 0.8) type = 'manager';
        
        const direction = Math.random() > 0.5 ? 1 : -1;
        const shelfY = SHELF_LEVELS[Math.floor(Math.random() * SHELF_LEVELS.length)];
        
        // Pick random item
        const itemTemplate = NYC_ITEMS[Math.floor(Math.random() * NYC_ITEMS.length)];
        // Add variance to scale
        const actualScale = itemTemplate.scaleBase * (0.9 + Math.random() * 0.2); 

        // Pick skin color
        const skinColor = SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)];

        const newEntity: Entity = {
            id: Math.random().toString(36).substr(2, 9),
            type: type,
            quadrant,
            x: direction === 1 ? -15 : 115,
            y: shelfY,
            direction,
            state: 'walking_in',
            speed: type === 'manager' ? 0.8 : type === 'janitor' ? 0.25 : (0.4 + Math.random() * 0.3),
            actionTimer: type === 'thief' ? 30 : (20 + Math.random() * 40),
            seed: Math.random().toString(),
            skinColor,
            lootItem: { ...itemTemplate, scaleBase: actualScale },
            hasStolen: false,
            penalized: false,
            hasMusic: type === 'janitor' && Math.random() > 0.5 // 50% chance for music note
        };

        entitiesRef.current.push(newEntity);
    };

    const spawnRomanceCouple = () => {
        const quadrant = Math.floor(Math.random() * 4);
        const shelfY = SHELF_LEVELS[Math.floor(Math.random() * SHELF_LEVELS.length)];
        const romeoId = Math.random().toString(36).substr(2, 9);
        const julietId = Math.random().toString(36).substr(2, 9);

        // Romeo starts left, walks right
        const romeo: Entity = {
            id: romeoId,
            type: 'worker',
            quadrant,
            x: -15,
            y: shelfY,
            direction: 1,
            state: 'walking_in',
            speed: 0.5,
            actionTimer: 0,
            seed: 'romeo' + Math.random(),
            skinColor: SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)],
            lootItem: NYC_ITEMS[0],
            hasStolen: false,
            penalized: true, // Cannot be arrested
            romanceRole: 'romeo',
            romanceTargetId: julietId
        };

        // Juliet starts right, walks left
        const juliet: Entity = {
            id: julietId,
            type: 'worker',
            quadrant,
            x: 115,
            y: shelfY,
            direction: -1,
            state: 'walking_in',
            speed: 0.5,
            actionTimer: 0,
            seed: 'juliet' + Math.random(),
            skinColor: SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)],
            lootItem: NYC_ITEMS[0],
            hasStolen: false,
            penalized: true, // Cannot be arrested
            romanceRole: 'juliet',
            romanceTargetId: romeoId
        };

        entitiesRef.current.push(romeo, juliet);
        romanceTriggeredRef.current = true;
    };

    const triggerDistraction = () => {
        const quadrant = Math.floor(Math.random() * 4);
        if (!distractionsRef.current.some(d => d.quadrant === quadrant)) {
            distractionsRef.current.push({
                quadrant,
                duration: 40 + Math.floor(Math.random() * 40)
            });
            setMessage(`WARNING: SIGNAL LOSS ON CAM ${String.fromCharCode(65 + quadrant)}`);
        }
    };

    const handleEntityClick = (entityId: string) => {
        if (gameOver) return;

        const entityIndex = entitiesRef.current.findIndex(e => e.id === entityId);
        if (entityIndex === -1) return;

        const entity = entitiesRef.current[entityIndex];

        if (distractionsRef.current.some(d => d.quadrant === entity.quadrant)) return;
        if (entity.state === 'caught') return;
        if (entity.state === 'fleeing' && entity.type !== 'thief') return;
        
        // Ignore clicking on romance characters
        if (entity.romanceRole) return;

        if (entity.type === 'thief') {
            if (entity.state === 'walking_in') {
                if (!entity.penalized) {
                    setStrikesWrong(prev => prev + 1);
                    entitiesRef.current[entityIndex].penalized = true;
                    const failMessages = ["DON'T MESS WITH CUSTOMERS!", "WAIT FOR THE CRIME!", "TOO SOON!"];
                    setMessage(failMessages[Math.floor(Math.random() * failMessages.length)]);
                    setFlash('red');
                    setTimeout(() => setFlash(null), 200);
                }
                entitiesRef.current[entityIndex].state = 'fleeing';
                entitiesRef.current[entityIndex].speed *= 2; 
            } else {
                entitiesRef.current[entityIndex].state = 'caught';
                setCaughtCount(prev => prev + 1);
                setMessage(entity.hasStolen ? `RECOVERED: ${entity.lootItem.name}` : `THIEF CAUGHT`);
                setFlash('green');
                setTimeout(() => setFlash(null), 200);
                setTimeout(() => {
                    entitiesRef.current = entitiesRef.current.filter(e => e.id !== entityId);
                }, 1000);
            }
        } else {
            if (!entity.penalized) {
                setStrikesWrong(prev => prev + 1);
                entitiesRef.current[entityIndex].penalized = true;
                setMessage(`BAD ARREST: LAWSUIT FILED`);
                setFlash('red');
                setTimeout(() => setFlash(null), 200);
                entitiesRef.current[entityIndex].state = 'fleeing';
                entitiesRef.current[entityIndex].speed *= 2.5; 
            }
        }
    };

    // --- GAME LOOP ---
    useEffect(() => {
        if (gameOver) return;

        const loop = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    setGameOver('win'); 
                    return 0;
                }
                return prev - TICK_RATE;
            });

            if (Math.random() < SPAWN_RATE_BASE) {
                spawnEntity();
            }

            if (Math.random() < 0.005) {
                triggerDistraction();
            }

            distractionsRef.current = distractionsRef.current.map(d => ({...d, duration: d.duration - 1})).filter(d => d.duration > 0);
            setDistractions([...distractionsRef.current]);

            entitiesRef.current.forEach(e => {
                if (e.state === 'caught') return; 

                // --- ROMANCE LOGIC ---
                if (e.romanceRole) {
                    // Phase 1: Walking towards meeting point
                    if (e.state === 'walking_in') {
                        e.x += e.speed * e.direction;
                        // Check proximity to partner
                        if (e.romanceTargetId) {
                            const partner = entitiesRef.current.find(p => p.id === e.romanceTargetId);
                            if (partner && Math.abs(e.x - partner.x) < 15) {
                                // MET!
                                if (e.romanceRole === 'romeo') {
                                    e.state = 'proposing';
                                    e.actionTimer = 40; // 2 seconds of proposing
                                } else {
                                    e.state = 'reacting';
                                    e.actionTimer = 40;
                                }
                            }
                        }
                    }
                    // Phase 2: The Action
                    else if (e.state === 'proposing' || e.state === 'reacting') {
                        e.actionTimer--;
                        if (e.actionTimer <= 0) {
                            // Phase 3: The Aftermath
                            if (e.romanceRole === 'romeo') {
                                e.state = 'heartbroken';
                                e.direction *= -1; // Turn around (optional, or just walk back)
                                e.speed = 0.2; // Slow sad walk
                            } else {
                                e.state = 'rejecting_run';
                                e.direction *= -1; // Turn around
                                e.speed = 1.5; // Run away
                            }
                        }
                    }
                    // Phase 4: Exit
                    else if (e.state === 'heartbroken' || e.state === 'rejecting_run') {
                        e.x += e.speed * e.direction;
                        if (e.x > 120 || e.x < -20) e.state = 'leaving';
                    }
                    return; // Skip standard logic for romance characters
                }

                // --- STANDARD LOGIC ---
                if (e.state === 'walking_in') {
                    e.x += e.speed * e.direction;
                    if (e.type !== 'worker') {
                        if (e.type === 'manager' && Math.random() > 0.3) return;
                        const targetX = 30 + (parseInt(e.seed.slice(-2)) % 40); 
                        const dist = Math.abs(e.x - targetX);
                        if (dist < 2) {
                            if (e.type === 'thief') e.state = 'stealing';
                            else if (e.type === 'janitor') e.state = 'cleaning';
                            else if (e.type === 'manager') e.state = 'inspecting';
                        }
                    }
                    if (e.x > 120 || e.x < -20) e.state = 'leaving';
                }
                else if (e.state === 'stealing' || e.state === 'cleaning' || e.state === 'inspecting') {
                    e.actionTimer--;
                    if (e.actionTimer <= 0) {
                        if (e.state === 'stealing') {
                            e.state = 'fleeing';
                            e.speed *= 1.8; 
                            e.hasStolen = true; 
                            setMessage(`THEFT IN PROGRESS: ${e.lootItem.name}!`);
                        } else {
                            e.state = 'walking_in';
                        }
                    }
                }
                else if (e.state === 'fleeing') {
                    e.x += e.speed * e.direction;
                    if (e.x > 120 || e.x < -20) {
                        if (e.type === 'thief' && e.hasStolen) {
                            setStrikesStolen(prev => prev + 1);
                            setMessage(`ITEM LOST: ${e.lootItem.name}!`);
                            setFlash('red');
                            setTimeout(() => setFlash(null), 200);
                        }
                        e.state = 'leaving';
                    }
                }
            });

            entitiesRef.current = entitiesRef.current.filter(e => e.state !== 'leaving');

            if (strikesStolen >= 3 || strikesWrong >= 2) {
                setGameOver('lose');
            }

            setEntities([...entitiesRef.current]);

        }, TICK_RATE);

        return () => clearInterval(loop);
    }, [gameOver, strikesStolen, strikesWrong]);

    // --- FINISH EFFECT ---
    useEffect(() => {
        if (gameOver) {
            let payout = 0;
            let dialogue = "";

            if (gameOver === 'win') {
                const bonus = Math.max(0, 200 - (strikesStolen * 50));
                payout = 50 + (caughtCount * 15) + bonus;
                dialogue = `"Shift over. You bagged ${caughtCount} perps. We lost ${strikesStolen} items. Here's your cut of N$${payout}."`;
            } else {
                payout = 0;
                if (strikesWrong >= 2) {
                    dialogue = `"You're arresting paying customers! I'm fining you for the lawsuits. Get out!"`;
                    payout = -50;
                } else {
                    dialogue = `"They robbed us blind! Three strikes, you're out. You're fired."`;
                }
            }

            setTimeout(() => {
                onComplete(payout, dialogue);
            }, 2500);
        }
    }, [gameOver, caughtCount, strikesStolen, strikesWrong, onComplete]);

    const formatTime = (ms: number) => {
        const s = Math.ceil(ms / 1000);
        return `00:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center select-none font-mono">
            {/* CRT Overlay */}
            <div className="absolute inset-0 pointer-events-none z-50 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
            <div className="absolute inset-0 pointer-events-none z-40 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]"></div>
            
            {flash && (
                <div className={`absolute inset-0 z-[60] pointer-events-none opacity-20 ${flash === 'red' ? 'bg-red-600' : 'bg-green-500'}`}></div>
            )}

            <div className="w-full max-w-5xl h-[90vh] bg-[#1a1a1a] border-4 border-[#333] rounded-lg flex flex-col relative shadow-2xl overflow-hidden">
                
                {/* Security Header */}
                <div className="flex justify-between items-center px-4 py-2 bg-black border-b border-slate-700 h-16 shrink-0">
                    <div className="flex items-center gap-2 text-emerald-500">
                        <span className="text-xl">📹</span>
                        <div>
                            <div className="font-black text-xs tracking-widest">SECUR-OS</div>
                            <div className="text-[9px] text-slate-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                                LIVE
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-center">
                        <div className={`text-2xl font-black font-mono leading-none ${timeLeft < 10000 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                </div>

                {/* Monitors Grid */}
                <div className="grid grid-cols-2 grid-rows-2 gap-1 flex-grow bg-[#0a0a0a] p-1">
                    {[0, 1, 2, 3].map(quad => {
                        const isDistracted = distractions.some(d => d.quadrant === quad);
                        
                        return (
                            <div key={quad} className="bg-[#050505] border border-slate-800 relative overflow-hidden group shadow-[inset_0_0_20px_black]">
                                
                                {/* Camera Label */}
                                <div className="absolute top-2 left-2 z-20 opacity-50">
                                    <span className="text-[8px] text-emerald-500 font-bold bg-black/50 px-1 border border-emerald-900/50">CAM {quad + 1}</span>
                                </div>

                                {/* Background Environment */}
                                <div className="absolute inset-0 pointer-events-none opacity-60">
                                    {SHELF_LEVELS.map((y, i) => (
                                        <div 
                                            key={`shelf-${quad}-${i}`}
                                            className="absolute w-full h-1 bg-slate-700 border-t border-slate-600 shadow-sm"
                                            style={{ top: `${y + 12}%` }}
                                        >
                                            <div className="absolute top-1 left-8 w-1 h-full bg-slate-800"></div>
                                            <div className="absolute top-1 right-8 w-1 h-full bg-slate-800"></div>
                                            
                                            {/* Random Products - Deterministic Scale */}
                                            {[...Array(5)].map((_, p) => {
                                                const itemIdx = (quad * 3 + i * 2 + p) % NYC_ITEMS.length;
                                                const item = NYC_ITEMS[itemIdx];
                                                // Deterministic random logic for stable rendering
                                                const pseudoRandom = (quad * 100 + i * 10 + p) * 123.45;
                                                const deterministicRandom = pseudoRandom - Math.floor(pseudoRandom);
                                                const scale = 0.7 + deterministicRandom * 0.6; // 0.7 to 1.3 range

                                                return (
                                                    <div 
                                                        key={`prod-${p}`}
                                                        className="absolute bottom-1 text-lg filter grayscale opacity-40 origin-bottom"
                                                        style={{ 
                                                            left: `${15 + p * 18}%`,
                                                            transform: `scale(${scale})`
                                                        }}
                                                    >
                                                        {item.icon}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>

                                {/* ENTITIES */}
                                {!isDistracted && entities.filter(e => e.quadrant === quad).map(entity => (
                                    <CharacterEntity 
                                        key={entity.id} 
                                        entity={entity} 
                                        onClick={() => handleEntityClick(entity.id)} 
                                    />
                                ))}

                                {isDistracted && (
                                    <div className="absolute inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center opacity-90">
                                        <div className="text-red-600 font-black text-2xl animate-pulse">NO SIGNAL</div>
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>
                            </div>
                        );
                    })}
                </div>

                {/* Compact Footer */}
                <div className="h-16 bg-[#111] border-t border-slate-800 flex items-center justify-between px-4 shrink-0 gap-4">
                    
                    {/* Status Message */}
                    <div className="flex-grow bg-black border border-slate-800 h-10 rounded flex items-center px-3 overflow-hidden">
                        <span className="text-amber-500 font-mono text-xs font-bold animate-pulse truncate">
                            {message}
                        </span>
                    </div>

                    {/* Strikes */}
                    <div className="flex gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Thefts</span>
                            <div className="flex gap-1">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className={`w-4 h-4 border border-slate-700 flex items-center justify-center text-[10px] ${i < strikesStolen ? 'bg-red-900 text-red-500 border-red-800' : 'bg-black text-slate-800'}`}>
                                        {i < strikesStolen ? 'X' : ''}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Mistakes</span>
                            <div className="flex gap-1">
                                {[0, 1].map(i => (
                                    <div key={i} className={`w-4 h-4 border border-slate-700 flex items-center justify-center text-[10px] ${i < strikesWrong ? 'bg-red-900 text-red-500 border-red-800' : 'bg-black text-slate-800'}`}>
                                        {i < strikesWrong ? 'X' : ''}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Caught Counter & Button */}
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                        <div className="text-center">
                            <div className="text-2xl font-black text-white leading-none">{caughtCount}</div>
                            <div className="text-[7px] text-slate-500 uppercase">Caught</div>
                        </div>
                        <button onClick={onClose} className="bg-red-900/30 hover:bg-red-900 text-red-400 hover:text-white border border-red-900 px-3 py-1 rounded text-[9px] font-bold uppercase transition-colors">
                            Abort
                        </button>
                    </div>
                </div>

                {/* Game Over Overlay */}
                {gameOver && (
                    <div className="absolute inset-0 z-[70] bg-black/90 flex flex-col items-center justify-center animate-fade-in backdrop-blur-sm">
                        <div className={`border-4 p-8 rounded-xl text-center shadow-[0_0_50px_currentColor] ${gameOver === 'win' ? 'border-emerald-500 text-emerald-500' : 'border-red-600 text-red-600'}`}>
                            <h2 className="text-5xl font-black font-news uppercase tracking-widest mb-2">
                                {gameOver === 'win' ? 'SHIFT DONE' : 'TERMINATED'}
                            </h2>
                            <div className="text-white font-mono text-lg opacity-80">
                                {gameOver === 'win' ? `Performance: ${caughtCount} Caught` : 'Excessive Violations'}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

// --- SUB COMPONENT: CHARACTER ENTITY ---
const CharacterEntity: React.FC<{ entity: Entity, onClick: () => void }> = ({ entity, onClick }) => {
    const isThief = entity.type === 'thief';
    const isJanitor = entity.type === 'janitor';
    const isManager = entity.type === 'manager';
    
    // Romance States
    const isProposing = entity.state === 'proposing';
    const isHeartbroken = entity.state === 'heartbroken';
    const isRejecting = entity.state === 'rejecting_run';

    const isCaught = entity.state === 'caught';
    const isActing = entity.state === 'stealing' || entity.state === 'cleaning' || entity.state === 'inspecting';
    const isFleeing = entity.state === 'fleeing';
    
    const facing = entity.direction === 1 ? 'right' : 'left';
    
    // Dicebear Avatar URL with skinColor support
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${entity.seed}&backgroundColor=transparent&skinColor=${entity.skinColor}`;

    return (
        <div 
            onClick={onClick}
            className={`absolute transition-transform duration-75 z-20 cursor-pointer group`}
            style={{ 
                left: `${entity.x}%`, 
                top: `${entity.y + 10}%`, 
                transform: `translate(-50%, -100%)`, 
                transition: 'left 0.05s linear'
            }}
        >
            {isJanitor && entity.hasMusic && (
                <div className="absolute -top-14 left-4 bg-white rounded px-1 py-0.5 border border-black z-50">
                    <span className="text-xs animate-bounce block">🎵</span>
                </div>
            )}

            {isProposing && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex gap-1 z-50">
                    <span className="text-lg animate-[float-up_1.5s_infinite]">❤️</span>
                    <span className="text-lg animate-[float-up_1.5s_infinite_0.5s]">❤️</span>
                </div>
            )}

            {entity.state === 'reacting' && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-50">
                    <span className="text-xl animate-bounce">💔</span>
                </div>
            )}

            <div className={`relative ${facing === 'left' ? 'scale-x-[-1]' : ''} ${isFleeing || isRejecting ? 'skew-x-12' : ''}`}>
                
                {/* 1. BODY (Blob) */}
                <div 
                    className={`
                        w-10 h-14 rounded-[45%] mx-auto shadow-sm border border-black/30 relative z-10
                        ${isThief ? 'bg-slate-700' : 
                          isJanitor ? 'bg-teal-600' :
                          isManager ? 'bg-indigo-800' :
                          'bg-orange-500'} 
                        ${isCaught ? 'animate-shake' : isActing || isProposing ? '' : 'animate-bounce-slow'}
                    `}
                >
                    {isManager && <div className="w-1 h-6 bg-red-600 mx-auto mt-2"></div>}
                    
                    {/* ARMS & HANDS (Anchored to Body) */}
                    {entity.state === 'stealing' ? (
                        <div className="absolute top-4 right-[-10px] w-8 h-2.5 bg-slate-700 border border-black origin-left animate-[reach_0.5s_ease-in-out_infinite_alternate] z-20 rounded-full">
                            <div className="absolute right-[-4px] top-[-1px] w-3 h-4 rounded-full border border-black/20" style={{ backgroundColor: `#${entity.skinColor}` }}></div>
                        </div>
                    ) : isProposing ? (
                        <div className="absolute top-4 -right-2 w-6 h-2.5 bg-orange-500 border border-black origin-left rotate-[-45deg] z-20 rounded-full">
                             <div className="absolute right-[-3px] top-[-1px] w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: `#${entity.skinColor}` }}></div>
                        </div>
                    ) : (
                        <>
                            <div className="absolute top-6 left-[-4px] w-3 h-3 rounded-full shadow-sm z-20 border border-black/10" style={{ backgroundColor: `#${entity.skinColor}` }}></div>
                            <div className="absolute top-6 right-[-4px] w-3 h-3 rounded-full shadow-sm z-20 border border-black/10" style={{ backgroundColor: `#${entity.skinColor}` }}></div>
                        </>
                    )}
                </div>

                {/* 2. HEAD (Avataaars or Emoji) - No Border */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full overflow-hidden shadow-sm z-20">
                    {isHeartbroken ? (
                        <div className="w-full h-full bg-yellow-400 flex items-center justify-center text-3xl">😭</div>
                    ) : (
                        <img src={avatarUrl} className="w-full h-full object-cover scale-125 translate-y-1" alt="face" />
                    )}
                </div>

                {isJanitor && (
                    <div className={`absolute bottom-0 right-[-25px] text-5xl transform origin-bottom z-40 ${entity.state === 'cleaning' ? 'animate-[sweep_1s_ease-in-out_infinite]' : 'rotate-12'}`}>
                        🧹
                    </div>
                )}

                {isManager && (
                    <div className={`absolute top-6 right-[-8px] w-6 h-8 bg-amber-200 border border-amber-600 transform z-20 ${entity.state === 'inspecting' ? 'rotate-[-20deg] translate-y-[-2px]' : 'rotate-0'}`}></div>
                )}

                {/* 4. LOOT (If Stolen) */}
                {isFleeing && isThief && entity.hasStolen && (
                    <div 
                        className="absolute top-4 right-[-15px] transform rotate-12 z-30 filter drop-shadow-md origin-center animate-bounce"
                        style={{ fontSize: `${1.5 * entity.lootItem.scaleBase}rem` }}
                    >
                        {entity.lootItem.icon}
                    </div>
                )}

                {/* 5. HANDCUFFS */}
                {isCaught && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-3xl z-50 animate-pop-in">
                        🔗
                    </div>
                )}

            </div>
            
            <style>{`
                @keyframes reach {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(-15deg) scaleX(1.1); }
                }
                @keyframes sweep {
                    0% { transform: rotate(10deg); }
                    50% { transform: rotate(-30deg); }
                    100% { transform: rotate(10deg); }
                }
                .animate-bounce-slow {
                    animation: bounce 0.5s infinite alternate ease-in-out;
                }
                @keyframes bounce {
                    from { transform: translateY(0); }
                    to { transform: translateY(-2px); }
                }
                @keyframes float-up {
                    0% { transform: translateY(0) scale(1); opacity: 1; }
                    100% { transform: translateY(-20px) scale(1.2); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default IndustrialJobMinigame;