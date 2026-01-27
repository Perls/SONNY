import React, { useState, useEffect, useMemo } from 'react';
import { CrewMember, ClassType } from '../types';

interface ChurchProps {
    money: number;
    heat: number;
    onUpdateStats: (newMoney: number, newHeat: number) => void;
    onClose: () => void;
    playerName: string;
    onBless?: () => void;
    playerCrew?: CrewMember[];
}

const SEAT_COUNT = 40;

const MASS_STAGES = [
    { label: 'Morning Mass', duration: 30, color: 'text-amber-500', bg: 'bg-amber-100', priestAction: 'Preaching' },
    { label: 'Open Chapel', duration: 20, color: 'text-slate-400', bg: 'bg-slate-100', priestAction: 'Wandering' },
    { label: 'Evening Mass', duration: 40, color: 'text-purple-500', bg: 'bg-purple-100', priestAction: 'Chanting' },
    { label: 'Quiet Hours', duration: 15, color: 'text-blue-900', bg: 'bg-blue-100', priestAction: 'Wandering' }
];

const BIBLE_VERSES = [
    { ref: "Ezekiel 25:17", text: "The path of the righteous man is beset on all sides..." },
    { ref: "Psalm 23:4", text: "Though I walk through the valley of the shadow of death..." },
    { ref: "Proverbs 28:1", text: "The wicked flee when no man pursueth..." },
    { ref: "Matthew 5:5", text: "Blessed are the meek: for they shall inherit the earth." },
    { ref: "Revelation 6:8", text: "And I looked, and behold a pale horse..." },
    { ref: "Timothy 6:10", text: "For the love of money is the root of all evil." }
];

const Church: React.FC<ChurchProps> = ({ money, heat, onUpdateStats, onClose, playerName, onBless, playerCrew = [] }) => {
    // --- STATE ---
    const [cycleIndex, setCycleIndex] = useState(0);
    const [cycleTimer, setCycleTimer] = useState(MASS_STAGES[0].duration);
    const [faithMeter, setFaithMeter] = useState(0);
    
    // Select Verse for this session
    const verse = useMemo(() => BIBLE_VERSES[Math.floor(Math.random() * BIBLE_VERSES.length)], []);

    // Seating
    const [audience, setAudience] = useState<{id: string, seed: string, isPlayer: boolean}[]>([]);
    
    // Performers
    const [pianistId, setPianistId] = useState<string | null>(null);
    const [priestSeed] = useState(`FatherJohn`);
    
    // Priest Movement
    const [priestPos, setPriestPos] = useState(50); // X Percentage
    const [priestDir, setPriestDir] = useState(1);

    // Visuals
    const [activeAnim, setActiveAnim] = useState<string | null>(null);
    const [isCoolingDown, setIsCoolingDown] = useState(false);

    const playerLeader = playerCrew.find(c => c.isLeader);
    const currentStage = MASS_STAGES[cycleIndex];
    const isMass = currentStage.label.includes('Mass');

    // --- INITIALIZATION ---
    useEffect(() => {
        // Init Pews with clean seeds
        const seats = Array.from({ length: SEAT_COUNT }).map((_, i) => {
            if (Math.random() > 0.6) {
                return {
                    id: `npc-${i}`,
                    seed: `parishioner-${i}`, // Clean string seed
                    isPlayer: false
                };
            }
            return { id: `empty-${i}`, seed: '', isPlayer: false };
        });
        
        if (playerLeader) {
            const emptyIdx = seats.findIndex(s => s.seed === '');
            if (emptyIdx !== -1) {
                seats[emptyIdx] = {
                    id: playerLeader.id,
                    seed: playerLeader.imageSeed.toString(),
                    isPlayer: true
                };
            }
        }
        setAudience(seats);
    }, []);

    // --- PRIEST WANDER LOGIC ---
    useEffect(() => {
        if (!isMass) {
            const wanderInterval = setInterval(() => {
                setPriestPos(prev => {
                    const moveAmt = 0.5 * priestDir;
                    const next = prev + moveAmt;
                    if (next > 65) setPriestDir(-1);
                    if (next < 35) setPriestDir(1);
                    return next;
                });
            }, 100);
            return () => clearInterval(wanderInterval);
        } else {
            setPriestPos(50);
        }
    }, [isMass, priestDir]);

    // --- GAME LOOP ---
    useEffect(() => {
        const interval = setInterval(() => {
            // Cycle
            setCycleTimer(prev => {
                if (prev <= 0) {
                    const nextIdx = (cycleIndex + 1) % MASS_STAGES.length;
                    setCycleIndex(nextIdx);
                    if (MASS_STAGES[nextIdx].label.includes('Mass')) setFaithMeter(0);
                    return MASS_STAGES[nextIdx].duration;
                }
                return prev - 1;
            });

            // Faith
            if (isMass) {
                setFaithMeter(prev => {
                    let gain = (100 / currentStage.duration) * 1.1; 
                    if (pianistId) gain *= 1.5;
                    const next = prev + gain;
                    if (next >= 100 && prev < 100) {
                        if (onBless) onBless();
                        setActiveAnim('blessing');
                        setTimeout(() => setActiveAnim(null), 3000);
                        return 100;
                    }
                    return Math.min(100, next);
                });
            } else {
                setFaithMeter(0);
            }

            // Pianist Tips
            if (pianistId && Math.random() > 0.8) {
                onUpdateStats(money + 5, heat);
            }

        }, 1000);

        return () => clearInterval(interval);
    }, [cycleIndex, isMass, pianistId, money, heat, onBless]);

    // --- HANDLERS ---
    const handleSeatClick = (idx: number) => {
        if (!playerLeader) return;
        const newAudience = [...audience];
        const currentSeatIdx = newAudience.findIndex(s => s.id === playerLeader.id);
        if (currentSeatIdx !== -1) {
            newAudience[currentSeatIdx] = { id: `empty-${currentSeatIdx}`, seed: '', isPlayer: false };
        }
        if (newAudience[idx].seed === '') {
            newAudience[idx] = {
                id: playerLeader.id,
                seed: playerLeader.imageSeed.toString(),
                isPlayer: true
            };
        }
        setAudience(newAudience);
    };

    const handlePianoClick = () => {
        if (pianistId === playerLeader?.id) {
            setPianistId(null);
            return;
        }
        const entertainers = playerCrew.filter(c => c.classType === ClassType.Entertainer);
        if (entertainers.length === 0) {
            alert("Only an Entertainer class can play the church organ.");
            return;
        }
        const performer = entertainers.find(c => c.isLeader) || entertainers[0];
        setPianistId(performer.id);
        setAudience(prev => prev.map(s => s.id === performer.id ? { ...s, seed: '', isPlayer: false } : s));
    };

    const handleDonate = () => {
        if (money < 100 || isCoolingDown) return;
        setIsCoolingDown(true);
        setTimeout(() => setIsCoolingDown(false), 2000);
        onUpdateStats(money - 100, Math.max(0, heat - 5));
        setActiveAnim('donate');
        setTimeout(() => setActiveAnim(null), 2000);
    };

    const getPianist = () => playerCrew.find(c => c.id === pianistId);

    return (
        <div className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center font-waze animate-fade-in p-8">
            <div className="bg-[#fcfbf9] w-full max-w-5xl rounded-2xl shadow-2xl border-4 border-[#2c241b] overflow-hidden flex flex-col h-[750px] relative">
                
                {/* 🎨 ADDITION 1: WALL RIBBING/FRESCO EFFECT (Outer Container) */}
                <div 
                    className="absolute inset-0 pointer-events-none opacity-5"
                    style={{
                        backgroundImage: `repeating-linear-gradient(45deg, #4a3b2a 0px, #4a3b2a 1px, transparent 1px 15px)`,
                        backgroundSize: '100px 100px',
                        backgroundPosition: '50% 50%',
                    }}
                ></div>

                {/* --- ANIMATION OVERLAYS --- */}
                {activeAnim === 'blessing' && (
                    <div className="absolute inset-0 z-[100] pointer-events-none flex items-center justify-center">
                        <div className="text-6xl animate-float-up filter drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]">
                            ✨ BLESSING RECEIVED ✨
                        </div>
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                )}
                {activeAnim === 'donate' && (
                    <div className="absolute inset-0 z-[100] pointer-events-none flex items-center justify-center">
                        <div className="text-4xl font-black text-emerald-600 animate-bounce bg-white/90 px-6 py-2 rounded-xl shadow-xl border-2 border-emerald-500">
                            -N$ 100 / -HEAT
                        </div>
                    </div>
                )}

                {/* --- HEADER IMAGE (Stained Glass) --- */}
                <div className="relative w-full h-[320px] flex-shrink-0 overflow-hidden border-b-8 border-[#4a3b2a] shadow-xl group">
                    {/* Stained Glass Pattern */}
                    <div className="absolute inset-0 bg-[#1a1510] z-0">
                        {/* Faded Fresco Texture (Behind Glass) */}
                        <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: `
                                repeating-linear-gradient(45deg, #b91c1c 0px, #b91c1c 20px, #1e293b 20px, #1e293b 22px),
                                repeating-linear-gradient(-45deg, #1d4ed8 0px, #1d4ed8 20px, #1e293b 20px, #1e293b 22px)
                            `,
                            backgroundBlendMode: 'multiply'
                        }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2c241b] via-transparent to-transparent z-10"></div>
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #fbbf24 0%, transparent 60%)' }}></div>
                    </div>
                    
                    {/* 🎨 ADDITION 2: WARDING SYMBOLS (Top Corners) */}
                    <div className="absolute top-4 left-6 z-20 text-4xl text-amber-700/50 opacity-50 rotate-[-15deg] filter drop-shadow">
                        ✝
                    </div>
                    <div className="absolute top-4 right-6 z-20 text-4xl text-amber-700/50 opacity-50 rotate-[15deg] filter drop-shadow">
                        ★
                    </div>

                    {/* God Rays */}
                    <div className="absolute top-[-50%] left-[20%] w-[20%] h-[200%] bg-gradient-to-b from-white/10 to-transparent rotate-[25deg] blur-xl animate-pulse z-10"></div>
                    <div className="absolute top-[-50%] right-[20%] w-[20%] h-[200%] bg-gradient-to-b from-blue-100/10 to-transparent rotate-[-25deg] blur-xl animate-pulse z-10" style={{ animationDelay: '1s' }}></div>

                    {/* Content Layer */}
                    <div className="absolute inset-0 z-20 flex justify-between items-end pb-0 px-12">
                        
                        {/* LEFT: THE PIANO */}
                        <div 
                            onClick={handlePianoClick}
                            className={`relative group cursor-pointer transition-transform duration-300 mb-8 ${pianistId ? 'scale-105' : 'hover:scale-105'}`}
                        >
                            <div className="w-32 h-24 bg-[#3f2e18] rounded-lg border-2 border-[#1a1510] relative shadow-lg flex items-end justify-center">
                                <div className="w-[90%] h-6 bg-white border-t border-black flex mb-1">
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className="flex-1 border-r border-black/20 relative">
                                            {i % 7 !== 2 && i % 7 !== 6 && <div className="absolute top-0 left-[60%] w-[60%] h-[60%] bg-black z-10"></div>}
                                        </div>
                                    ))}
                                </div>
                                <div className="absolute top-[-20px] right-0 w-[80%] h-4 bg-[#3f2e18] origin-bottom-right rotate-[-20deg]"></div>
                            </div>

                            {pianistId ? (
                                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
                                    <BattleChessCharacter 
                                        seed={getPianist()?.imageSeed.toString() || 'pianist'} 
                                        color="bg-purple-700"
                                        action="playing"
                                    />
                                    <div className="absolute -top-10 left-0 text-xl animate-bounce">🎵</div>
                                    <div className="absolute -top-16 right-0 text-xl animate-bounce" style={{ animationDelay: '0.3s' }}>🎶</div>
                                </div>
                            ) : (
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-2 py-1 rounded border border-white/20 text-[8px] font-black uppercase text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    Play Organ
                                </div>
                            )}
                        </div>

                        {/* CENTER: THE ALTAR & PRIEST */}
                        <div className="relative flex flex-col items-center flex-grow h-full justify-end">
                            
                            {/* Verse on Wall */}
                            <div className="absolute top-16 text-center opacity-60 pointer-events-none select-none">
                                <h1 className="text-white/20 font-black font-serif text-5xl uppercase tracking-[0.5em]">{verse.ref}</h1>
                            </div>

                            {/* Priest */}
                            <div 
                                className="mb-[-5px] z-30 absolute transition-all duration-1000 ease-in-out"
                                style={{ 
                                    left: `${priestPos}%`, 
                                    transform: 'translateX(-50%)',
                                    bottom: '80px'
                                }}
                            >
                                <BattleChessCharacter 
                                    seed={priestSeed} 
                                    color="bg-black" 
                                    isPriest 
                                    action={isMass ? 'preaching' : 'idle'}
                                    scale={1.2}
                                />
                                {isMass && (
                                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[9px] font-bold px-3 py-2 rounded-xl shadow-lg whitespace-nowrap border-2 border-slate-900 animate-pop-in z-50 text-center max-w-[200px] leading-tight">
                                        <div className="uppercase text-amber-600 mb-0.5">{verse.ref}</div>
                                        "{verse.text}"
                                    </div>
                                )}
                            </div>

                            {/* Altar Table */}
                            <div className="w-72 h-28 bg-[#e5e5e5] rounded-t-sm border-x-4 border-t-4 border-[#d4d4d4] shadow-2xl relative flex justify-between px-6 items-top z-20 overflow-visible">
                                {/* Left Flowers */}
                                <div className="absolute -left-12 bottom-0 w-16 h-20 opacity-90">
                                    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                                        <path d="M50 100 Q40 50 20 20 M50 100 Q60 50 80 20 M50 100 L50 10" stroke="#166534" strokeWidth="3" />
                                        <circle cx="20" cy="20" r="10" fill="#fca5a5" />
                                        <circle cx="80" cy="20" r="10" fill="#fca5a5" />
                                        <circle cx="50" cy="10" r="12" fill="#f87171" />
                                    </svg>
                                </div>

                                <div className="text-3xl text-yellow-500 animate-pulse mt-[-15px] z-10">🕯️</div>
                                
                                {/* Center Cross */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 flex flex-col items-center">
                                    <div className="w-6 h-32 bg-amber-500 shadow-lg border-2 border-amber-700 relative flex justify-center">
                                        <div className="absolute top-8 w-20 h-6 bg-amber-500 border-2 border-amber-700"></div>
                                    </div>
                                </div>

                                <div className="text-3xl text-yellow-500 animate-pulse mt-[-15px] z-10">🕯️</div>
                                
                                {/* Right Flowers */}
                                <div className="absolute -right-12 bottom-0 w-16 h-20 opacity-90 transform scale-x-[-1]">
                                    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                                        <path d="M50 100 Q40 50 20 20 M50 100 Q60 50 80 20 M50 100 L50 10" stroke="#166534" strokeWidth="3" />
                                        <circle cx="20" cy="20" r="10" fill="#fca5a5" />
                                        <circle cx="80" cy="20" r="10" fill="#fca5a5" />
                                        <circle cx="50" cy="10" r="12" fill="#f87171" />
                                    </svg>
                                </div>

                                {/* Cloth */}
                                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-40 h-full ${isMass ? 'bg-emerald-700' : 'bg-red-800'} border-x border-black/10 flex justify-center pt-4`}>
                                    <div className="text-amber-400 text-4xl opacity-50">✝</div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: EMPTY (Statue Removed) */}
                        <div className="w-32"></div>

                    </div>

                    <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-red-400 font-bold z-50 bg-black/20 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
                </div>

                {/* --- MAIN BODY (PEWS) --- */}
                <div className="flex-grow flex flex-col bg-[#f7f5f0] p-6 relative">
                    
                    {/* 🎨 ADDITION 3: CONFESSIONAL GRILLE (LEFT) */}
                    <div className="absolute top-0 left-0 h-full w-20 bg-[#2c241b]/90 border-r-4 border-[#4a3b2a] shadow-xl flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-[80%] border-4 border-[#4a3b2a] bg-[#1a1510] relative overflow-hidden">
                            <div className="absolute inset-0" style={{ 
                                backgroundImage: `repeating-linear-gradient(90deg, transparent 0 2px, #3f2e18 2px 3px), repeating-linear-gradient(0deg, transparent 0 2px, #3f2e18 2px 3px)`,
                                backgroundSize: '12px 12px'
                            }}></div>
                        </div>
                    </div>

                    {/* 🎨 ADDITION 4: CONFESSIONAL GRILLE (RIGHT) */}
                    <div className="absolute top-0 right-0 h-full w-20 bg-[#2c241b]/90 border-l-4 border-[#4a3b2a] shadow-xl flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-[80%] border-4 border-[#4a3b2a] bg-[#1a1510] relative overflow-hidden">
                            <div className="absolute inset-0" style={{ 
                                backgroundImage: `repeating-linear-gradient(90deg, transparent 0 2px, #3f2e18 2px 3px), repeating-linear-gradient(0deg, transparent 0 2px, #3f2e18 2px 3px)`,
                                backgroundSize: '12px 12px'
                            }}></div>
                        </div>
                    </div>

                    {/* Status Bar */}
                    <div className="flex justify-between items-center mb-6 px-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm z-10">
                        <div className="flex gap-4 items-center">
                            <div className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded border ${currentStage.bg} ${currentStage.color.replace('text-', 'border-').replace('500','200')}`}>
                                {currentStage.label}
                            </div>
                            <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                                Next Service In: <span className="text-slate-900 text-sm">{cycleTimer}s</span>
                            </div>
                        </div>
                        
                        {/* Faith/Blessing Meter */}
                        <div className="flex items-center gap-2 w-1/3">
                            <span className="text-[9px] font-black uppercase text-amber-600">Faith</span>
                            <div className="flex-grow h-3 bg-slate-200 rounded-full border border-slate-300 overflow-hidden relative">
                                <div 
                                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-1000 ease-linear"
                                    style={{ width: `${faithMeter}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pew Grid */}
                    <div className="flex-grow overflow-y-auto custom-scrollbar px-12 pb-4">
                        <div className="grid grid-cols-2 gap-16 mx-auto max-w-4xl">
                            {/* Left Pews */}
                            <div className="grid grid-cols-4 gap-y-4 gap-x-2 bg-[#78350f] p-4 rounded border-b-8 border-[#451a03] shadow-md">
                                {audience.slice(0, SEAT_COUNT/2).map((seat, i) => (
                                    <PewSeat key={i} seat={seat} onClick={() => handleSeatClick(i)} />
                                ))}
                            </div>
                            {/* Right Pews */}
                            <div className="grid grid-cols-4 gap-y-4 gap-x-2 bg-[#78350f] p-4 rounded border-b-8 border-[#451a03] shadow-md">
                                {audience.slice(SEAT_COUNT/2).map((seat, i) => (
                                    <PewSeat key={i + SEAT_COUNT/2} seat={seat} onClick={() => handleSeatClick(i + SEAT_COUNT/2)} />
                                ))}
                            </div>
                        </div>
                        {/* Carpet */}
                        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-16 bg-red-800 border-x-2 border-red-900 opacity-90 pointer-events-none"></div>
                    </div>

                </div>

                {/* --- FOOTER CONTROLS --- */}
                <div className="h-20 bg-[#2c241b] border-t-4 border-[#4a3b2a] flex items-center justify-between px-8 text-white shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.5)] z-30">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Offering Box</span>
                        <span className="text-xl font-mono font-bold">N$ {money.toLocaleString()}</span>
                    </div>

                    <div className="flex gap-4">
                        <button 
                            onClick={handleDonate}
                            disabled={isCoolingDown || money < 100}
                            className={`flex items-center gap-3 px-6 py-2 rounded-lg border-2 transition-all active:translate-y-0.5
                                ${money >= 100 && !isCoolingDown ? 'bg-[#4a3b2a] border-amber-600 hover:bg-[#5c4a35] text-amber-100 hover:text-white hover:border-amber-400 shadow-lg' : 'bg-stone-800 border-stone-700 text-stone-500 cursor-not-allowed'}
                            `}
                        >
                            <span className="text-xl">🤲</span>
                            <div className="text-left">
                                <div className="text-xs font-black uppercase">Donate</div>
                                <div className="text-[9px] font-mono text-amber-500/80">N$ 100</div>
                            </div>
                        </button>

                        <button 
                            className="flex items-center gap-3 px-6 py-2 rounded-lg border-2 border-purple-800 bg-[#3b0764] hover:bg-[#581c87] text-purple-100 hover:text-white hover:border-purple-500 transition-all active:translate-y-0.5 shadow-lg"
                        >
                            <span className="text-xl">🛐</span>
                            <div className="text-left">
                                <div className="text-xs font-black uppercase">Confess</div>
                                <div className="text-[9px] text-purple-300">Free</div>
                            </div>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

// 1. BattleChess Style Character (Pill Body + Head)
const BattleChessCharacter: React.FC<{ seed: string, color: string, isPriest?: boolean, action?: string, scale?: number }> = ({ seed, color, isPriest, action, scale = 1 }) => {
    // Ensure seed is a clean string to avoid API errors
    const cleanSeed = String(seed).replace(/[^a-zA-Z0-9-]/g, ''); 
    
    return (
        <div 
            className={`relative flex flex-col items-center ${action === 'preaching' ? 'animate-[sway_3s_infinite_ease-in-out]' : ''} ${action === 'playing' ? 'animate-bounce' : ''}`}
            style={{ transform: `scale(${scale})` }}
        >
            {/* Head */}
            <div className="w-10 h-10 rounded-lg bg-white shadow-sm overflow-hidden z-20 relative border-2 border-white/20">
                <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanSeed}&backgroundType=transparent${isPriest ? '&clothing=collarAndSweater&clothingColor=262626' : ''}`} 
                    className="w-full h-full object-cover scale-125 translate-y-1"
                    alt="character"
                />
            </div>
            {/* Body */}
            <div className={`w-6 h-8 ${color} rounded-xl -mt-3 shadow-inner border border-black/20 z-10 flex justify-center relative`}>
                {isPriest && (
                    <div className="w-2 h-2 bg-white mt-4 rounded-sm shadow-sm relative z-20"></div> // Collar
                )}
                {/* Arm Stubs */}
                <div className="absolute top-2 -left-1 w-2 h-4 rounded-full bg-inherit brightness-90"></div>
                <div className="absolute top-2 -right-1 w-2 h-4 rounded-full bg-inherit brightness-90"></div>
            </div>
        </div>
    );
};

// 2. Pew Seat (Grid Item)
const PewSeat: React.FC<{ seat: {seed: string, isPlayer: boolean}, onClick: () => void }> = ({ seat, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className={`
                h-16 w-full bg-[#5c401e] rounded border-b-4 border-[#3f2e18] relative flex items-end justify-center cursor-pointer hover:bg-[#78542a] transition-colors shadow-inner pb-1
                ${seat.isPlayer ? 'ring-2 ring-amber-400' : ''}
            `}
        >
            {seat.seed ? (
                <div className="mb-1">
                    <BattleChessCharacter 
                        seed={seat.seed} 
                        color={seat.isPlayer ? 'bg-amber-600' : 'bg-slate-600'} 
                        scale={0.9} 
                    />
                </div>
            ) : (
                <div className="text-[9px] text-[#8b6b45] font-bold uppercase opacity-50 mb-2">Sit</div>
            )}
        </div>
    );
};

export default Church;