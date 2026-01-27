
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CrewMember, ClassType } from '../../types';

interface ChurchProps {
    money: number;
    heat: number;
    onUpdateStats: (newMoney: number, newHeat: number) => void;
    onReduceStress?: (amount: number) => void;
    onClose: () => void;
    playerName: string;
    onBless?: () => void;
    playerCrew?: CrewMember[];
}

const SEAT_COUNT = 32; // 4 rows of 8
const CYCLE_DURATION = 120; // 2 Minutes Total Cycle
const SERVICE_DURATION = 30; // Service lasts 30 seconds

// Skin tones for consistency between face and hands
const SKIN_TONES = ['f8d9ce', 'f9c9b6', 'deab90', 'b58a6f', '7a523e', '4a3121'];

const BIBLE_VERSES = [
    { ref: "EZEKIEL 25:17", text: "The path of the righteous man is beset on all sides..." },
    { ref: "PSALM 23:4", text: "Though I walk through the valley of the shadow of death..." },
    { ref: "PROVERBS 28:1", text: "The wicked flee when no man pursueth..." },
    { ref: "MATTHEW 5:5", text: "Blessed are the meek: for they shall inherit the earth." },
    { ref: "REVELATION 6:8", text: "And I looked, and behold a pale horse..." },
    { ref: "TIMOTHY 6:10", text: "For the love of money is the root of all evil." }
];

const CONFESSION_QUOTES = [
    "The weight you carry is heavy, my child.",
    "We are no longer bound by the old law.",
    "Break the dominion of sin in your house.",
    "Vengeance is mine, says the Lord.",
    "Be transformed by the renewal of your mind.",
    "Boast only in your zeal for the Lord."
];

const GOSSIP_LINES = [
    "Did you hear about the killing on Madison?",
    "The city is falling apart these days.",
    "As soon as a building goes up, it's tagged.",
    "What do you think about the new mayor?",
    "Gangs are taking over our street too.",
    "I heard the Mafia is moving into Queens.",
    "Prices at the bodega just doubled again.",
    "My cousin joined a crew last week. Haven't seen him since.",
    "They say the rats are getting bigger.",
    "Keep your head down, that's my motto."
];

// --- SUB-COMPONENTS ---

// 1. BattleChess Style Character (Updated: No feet, Floating Hands, Larger Body)
const ChurchCharacter: React.FC<{ 
    seed: string, 
    colorClass: string, 
    isPriest?: boolean, 
    action?: string, 
    scale?: number, 
    facingLeft?: boolean,
    isWalking?: boolean
}> = ({ seed, colorClass, isPriest, action, scale = 1, facingLeft = false, isWalking = false }) => {
    
    // Determine clothing based on seed if not priest
    const clothingTypes = ['blazerShirt', 'blazerSweater', 'collarAndSweater', 'graphicShirt', 'hoodie', 'overall', 'shirtCrewNeck', 'shirtScoopNeck', 'shirtVNeck'];
    // Deterministic random index from seed string
    const seedVal = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const clothingChoice = clothingTypes[seedVal % clothingTypes.length];
    const skinColor = SKIN_TONES[seedVal % SKIN_TONES.length];

    // Priest gets specific friendly face traits, others get gray clothes
    const priestParams = `&clothing=collarAndSweater&clothingColor=262626&eyebrows=default&mouth=smile&eyes=default&skinColor=${skinColor}`;
    const congregantParams = `&clothing=${clothingChoice}&clothingColor=757575&skinColor=${skinColor}`;
    
    const clothingParam = isPriest 
        ? priestParams
        : congregantParams;

    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=transparent${clothingParam}`;

    return (
        <div 
            className={`relative flex flex-col items-center transition-transform duration-500 z-10 
                ${action === 'preaching' ? 'animate-bounce' : ''} 
                ${action === 'playing' ? 'animate-pulse' : ''}
                ${isWalking ? 'animate-jump' : ''}
            `}
            style={{ transform: `scale(${scale})` }}
        >
            {/* Shadow */}
            <div className="absolute bottom-1 w-10 h-2 bg-black/30 rounded-full blur-[2px]"></div>

            {/* Head - Raised Position & Fixed Cropping */}
            <div className={`
                w-12 h-12 rounded-xl shadow-sm overflow-hidden z-20 relative 
                transform transition-transform ${facingLeft ? '-scale-x-100' : ''} -mb-3
            `}>
                <img 
                    src={avatarUrl} 
                    className="w-full h-full object-cover scale-[1.4] translate-y-1"
                    alt="character"
                />
            </div>

            {/* Body (Pill) - Expanded Size */}
            <div className={`
                w-10 h-10 rounded-2xl shadow-inner border border-black/20 z-10 flex justify-center relative
                ${colorClass}
            `}>
                {isPriest && (
                    <div className="w-3 h-3 bg-white mt-4 rounded-sm shadow-sm relative z-20"></div> 
                )}
                
                {/* Floating Hands (Circles) */}
                <div 
                    className="absolute top-4 -left-2 w-3.5 h-3.5 rounded-full shadow-sm border border-black/10 z-30"
                    style={{ backgroundColor: `#${skinColor}` }}
                ></div>
                <div 
                    className="absolute top-4 -right-2 w-3.5 h-3.5 rounded-full shadow-sm border border-black/10 z-30"
                    style={{ backgroundColor: `#${skinColor}` }}
                ></div>
            </div>
        </div>
    );
};

// 2. Floral Arrangement
const FlowerArrangement: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
    <div className="relative w-24 h-32 pointer-events-none drop-shadow-md" style={{ transform: `scale(${scale})` }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" overflow="visible">
            {/* Vase */}
            <defs>
                <linearGradient id="vaseGrad" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#b45309" />
                    <stop offset="50%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#78350f" />
                </linearGradient>
            </defs>
            <path d="M 40 100 L 60 100 L 65 70 L 35 70 Z" fill="url(#vaseGrad)" stroke="#78350f" strokeWidth="1" />
            
            {/* Stems */}
            <path d="M 50 70 Q 40 50 25 40" stroke="#166534" strokeWidth="2" fill="none" />
            <path d="M 50 70 Q 60 50 75 35" stroke="#166534" strokeWidth="2" fill="none" />
            <path d="M 50 70 L 50 30" stroke="#166534" strokeWidth="2" fill="none" />
            <path d="M 50 70 Q 35 60 15 50" stroke="#166534" strokeWidth="2" fill="none" />
            <path d="M 50 70 Q 65 60 85 50" stroke="#166534" strokeWidth="2" fill="none" />

            {/* Tulips (Custom Paths) */}
            <g transform="translate(25, 40) rotate(-15)">
                <path d="M -6 0 Q -6 -10 0 -12 Q 6 -10 6 0 L 0 4 Z" fill="#f43f5e" /> {/* Pink Tulip */}
                <path d="M -6 0 L -2 -8 L 0 -4 L 2 -8 L 6 0 Z" fill="#fb7185" />
            </g>
            
            <g transform="translate(75, 35) rotate(15)">
                <path d="M -6 0 Q -6 -10 0 -12 Q 6 -10 6 0 L 0 4 Z" fill="#f472b6" /> {/* Light Pink Tulip */}
                <path d="M -6 0 L -2 -8 L 0 -4 L 2 -8 L 6 0 Z" fill="#fbcfe8" />
            </g>

            {/* Center Sunflowerish */}
            <g transform="translate(50, 30)">
                <circle r="10" fill="#fff" stroke="#e2e8f0" strokeWidth="0.5"/>
                <circle r="4" fill="#fbbf24" />
            </g>

            {/* Side Buds */}
            <g transform="translate(15, 50)">
                <circle r="5" fill="#a78bfa" stroke="#7c3aed" strokeWidth="0.5"/>
            </g>
            <g transform="translate(85, 50)">
                <circle r="5" fill="#a78bfa" stroke="#7c3aed" strokeWidth="0.5"/>
            </g>
        </svg>
    </div>
);

// 3. Church Bell
const ChurchBell: React.FC<{ isRinging: boolean, onClick: () => void }> = ({ isRinging, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className="absolute top-[-20px] left-12 w-24 h-64 flex flex-col items-center z-40 cursor-pointer group"
        >
            {/* Beam */}
            <div className="w-full h-4 bg-slate-800 rounded shadow-md z-20"></div>

            {/* Rope */}
            <div className={`w-1 bg-[#b45309] relative transition-all duration-300 origin-top shadow-sm ${isRinging ? 'h-40' : 'h-32'}`}>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-4 bg-[#78350f] rounded-sm"></div>
            </div>
            
            {/* Bell */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 origin-top transition-transform duration-1000 ${isRinging ? 'animate-[bellSwing_2s_ease-in-out_infinite]' : 'group-hover:rotate-3'}`}>
                <svg width="80" height="100" viewBox="0 0 80 100" className="drop-shadow-2xl">
                    <defs>
                        <linearGradient id="bellGrad" x1="0" x2="1" y1="0" y2="0">
                            <stop offset="0%" stopColor="#b45309" />
                            <stop offset="50%" stopColor="#d97706" />
                            <stop offset="100%" stopColor="#78350f" />
                        </linearGradient>
                    </defs>
                    <rect x="35" y="80" width="10" height="15" rx="5" fill="#1e293b" className={`${isRinging ? 'animate-[clapperSwing_2s_ease-in-out_infinite]' : ''}`} style={{ transformOrigin: '40px 10px' }} />
                    <path d="M 40 0 C 40 0 10 10 10 80 L 0 90 L 80 90 L 70 80 C 70 10 40 0 40 0 Z" fill="url(#bellGrad)" stroke="#78350f" strokeWidth="2" />
                    <path d="M 40 5 Q 30 15 30 80 L 25 85" stroke="rgba(255,255,255,0.3)" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
            </div>

            <style>{`
                @keyframes bellSwing {
                    0% { transform: translateX(-50%) rotate(0deg); }
                    25% { transform: translateX(-50%) rotate(15deg); }
                    50% { transform: translateX(-50%) rotate(0deg); }
                    75% { transform: translateX(-50%) rotate(-15deg); }
                    100% { transform: translateX(-50%) rotate(0deg); }
                }
                @keyframes clapperSwing {
                    0% { transform: rotate(0deg); }
                    25% { transform: rotate(-30deg); }
                    50% { transform: rotate(0deg); }
                    75% { transform: rotate(30deg); }
                    100% { transform: rotate(0deg); }
                }
            `}</style>
        </div>
    );
};

// 4. Pew Component
interface PewProps {
    seat: { seed: string, isPlayer: boolean };
    onClick: (rect: DOMRect) => void;
    id: number;
    speech?: string;
}

const PewSeat: React.FC<PewProps> = ({ seat, onClick, id, speech }) => {
    const ref = useRef<HTMLDivElement>(null);

    const handleClick = () => {
        if (ref.current) {
            onClick(ref.current.getBoundingClientRect());
        }
    };

    return (
        <div 
            ref={ref}
            onClick={handleClick}
            className={`
                h-16 w-full bg-[#5c401e] rounded border-b-4 border-[#3f2e18] relative flex items-end justify-center cursor-pointer hover:bg-[#78542a] transition-colors shadow-inner pb-1 group
                ${seat.isPlayer ? 'ring-2 ring-amber-400' : ''}
            `}
        >
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>

            {/* SPEECH BUBBLE */}
            {speech && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-50 animate-pop-in pointer-events-none w-40 text-center">
                    <div className="bg-white border-2 border-black rounded-xl p-2 shadow-lg relative">
                        <p className="text-[9px] font-bold text-slate-800 uppercase leading-tight">{speech}</p>
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-black transform rotate-45"></div>
                    </div>
                </div>
            )}

            {seat.seed ? (
                <div className="mb-1 z-10">
                    <ChurchCharacter 
                        seed={seat.seed} 
                        colorClass={seat.isPlayer ? 'bg-amber-600' : 'bg-slate-600'} 
                        scale={0.9} 
                    />
                </div>
            ) : (
                <div className="text-[8px] text-[#3f2e18] group-hover:text-[#281d10] font-black uppercase opacity-30 group-hover:opacity-100 mb-2 transition-all">
                    Sit
                </div>
            )}
            
            <div className="absolute top-[-4px] left-0 right-0 h-1 bg-[#4a3318] rounded-t-sm"></div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const Church: React.FC<ChurchProps> = ({ money, heat, onUpdateStats, onReduceStress, onClose, playerName, onBless, playerCrew = [] }) => {
    const [cycleTimer, setCycleTimer] = useState(CYCLE_DURATION); // 120s loop
    const [faithMeter, setFaithMeter] = useState(0);
    const verse = useMemo(() => BIBLE_VERSES[Math.floor(Math.random() * BIBLE_VERSES.length)], []);

    const [audience, setAudience] = useState<{id: string, seed: string, isPlayer: boolean}[]>([]);
    const [pianistId, setPianistId] = useState<string | null>(null);
    const [priestSeed] = useState(`FatherGabriel`);
    
    // Priest Movement State
    const [priestPos, setPriestPos] = useState({ x: 50, y: 15 }); // Percentages relative to container
    const [priestFacingLeft, setPriestFacingLeft] = useState(false);
    const [priestTarget, setPriestTarget] = useState<{x: number, y: number} | null>(null);
    const [priestWaitTime, setPriestWaitTime] = useState(0);

    const [priestMessage, setPriestMessage] = useState<string | null>(null);
    const [isBellRinging, setIsBellRinging] = useState(false);
    const [activeAnim, setActiveAnim] = useState<string | null>(null);
    const [isCoolingDown, setIsCoolingDown] = useState(false);

    // Gossip State
    const [activeGossip, setActiveGossip] = useState<{ idx: number, text: string } | null>(null);

    // Walking State for Player
    const [walkingPlayer, setWalkingPlayer] = useState<{
        active: boolean,
        startX: number,
        startY: number,
        targetX: number,
        targetY: number,
        targetIdx: number
    } | null>(null);

    const playerLeader = playerCrew.find(c => c.isLeader);
    // Cycle: 120s total. 0-30s is Service (active). 30s-120s is Downtime.
    const isService = cycleTimer <= SERVICE_DURATION;
    const timeUntilService = cycleTimer - SERVICE_DURATION;

    // --- INITIALIZATION ---
    useEffect(() => {
        const seats = Array.from({ length: SEAT_COUNT }).map((_, i) => {
            if (Math.random() > 0.6) {
                return { id: `npc-${i}`, seed: `parishioner-${i}`, isPlayer: false };
            }
            return { id: `empty-${i}`, seed: '', isPlayer: false };
        });
        
        // REMOVED: Auto-seat logic. Player must click to sit.
        setAudience(seats);
    }, []);

    // --- GAME LOOP & PRIEST AI ---
    useEffect(() => {
        const interval = setInterval(() => {
            // Cycle Timer
            setCycleTimer(prev => {
                if (prev <= 0) return CYCLE_DURATION;
                if (prev === SERVICE_DURATION + 1) {
                    // Service STARTING
                    setFaithMeter(0);
                    setIsBellRinging(true);
                    setTimeout(() => setIsBellRinging(false), 4000);
                    setPriestMessage("The service begins.");
                    setActiveGossip(null); // Clear gossip
                    setTimeout(() => setPriestMessage(null), 3000);
                }
                return prev - 1;
            });

            // Service Logic
            if (isService) {
                // Move Priest to Altar if not there
                const altarPos = { x: 50, y: 18 };
                const dist = Math.abs(priestPos.x - altarPos.x) + Math.abs(priestPos.y - altarPos.y);
                
                if (dist > 1) {
                    // Walk to Altar
                    const dx = altarPos.x - priestPos.x;
                    const dy = altarPos.y - priestPos.y;
                    const step = 2; // Fast walk to start mass
                    const angle = Math.atan2(dy, dx);
                    
                    setPriestPos(prev => ({
                        x: prev.x + Math.cos(angle) * step,
                        y: prev.y + Math.sin(angle) * step
                    }));
                    setPriestFacingLeft(dx < 0);
                } else {
                    // Preaching
                    setPriestPos(altarPos);
                    // Faith Gain
                    setFaithMeter(prev => {
                        let gain = (100 / SERVICE_DURATION); 
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
                }
            } else {
                // Downtime: Priest Wanders
                setFaithMeter(0);

                // --- GOSSIP LOGIC ---
                if (!activeGossip && Math.random() < 0.05) { // 5% chance per second
                    const occupiedIndices = audience
                        .map((s, i) => (s.seed && !s.isPlayer) ? i : -1)
                        .filter(i => i !== -1);
                    
                    if (occupiedIndices.length > 0) {
                        const idx = occupiedIndices[Math.floor(Math.random() * occupiedIndices.length)];
                        const text = GOSSIP_LINES[Math.floor(Math.random() * GOSSIP_LINES.length)];
                        setActiveGossip({ idx, text });
                        setTimeout(() => setActiveGossip(null), 4000);
                    }
                }

                if (priestWaitTime > 0) {
                    setPriestWaitTime(prev => prev - 1);
                } else {
                    // Has Target?
                    if (!priestTarget) {
                        // Pick random POI
                        const pois = [
                            { x: 50, y: 18 }, // Altar
                            { x: 20, y: 35 }, // Left Organ Area
                            { x: 80, y: 35 }, // Right Stained Glass
                            { x: 30, y: 60 }, // Mid Pews Left
                            { x: 70, y: 60 }, // Mid Pews Right
                            { x: 20, y: 85 }, // Flowers Left
                            { x: 80, y: 85 }, // Flowers Right
                        ];
                        const randomPoi = pois[Math.floor(Math.random() * pois.length)];
                        setPriestTarget(randomPoi);
                    } else {
                        // Move to Target
                        const dx = priestTarget.x - priestPos.x;
                        const dy = priestTarget.y - priestPos.y;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        
                        if (dist < 1) {
                            // Arrived
                            setPriestTarget(null);
                            setPriestWaitTime(3 + Math.floor(Math.random() * 5)); // Wait 3-8s
                        } else {
                            const speed = 0.5; // Slow wander
                            const moveX = (dx / dist) * speed;
                            const moveY = (dy / dist) * speed;
                            
                            setPriestPos(prev => ({
                                x: prev.x + moveX,
                                y: prev.y + moveY
                            }));
                            setPriestFacingLeft(dx < 0);
                        }
                    }
                }
            }
        }, 1000); // Running at 1s tick for logic simplicity
        return () => clearInterval(interval);
    }, [isService, pianistId, money, heat, onBless, priestPos, priestTarget, priestWaitTime, cycleTimer, activeGossip, audience]);

    // --- SEAT CLICK LOGIC ---
    const pewContainerRef = useRef<HTMLDivElement>(null);

    const handleSeatInteraction = (idx: number, rect: DOMRect) => {
        if (!playerLeader || walkingPlayer?.active) return;
        if (audience[idx].id === playerLeader.id) return; // Already here
        if (audience[idx].seed !== '') return; // Occupied

        if (!pewContainerRef.current) return;
        const containerRect = pewContainerRef.current.getBoundingClientRect();

        const targetX = rect.left - containerRect.left + (rect.width / 2);
        const targetY = rect.top - containerRect.top + (rect.height / 2);

        const currentSeatIdx = audience.findIndex(s => s.id === playerLeader.id);
        let startX = containerRect.width / 2;
        let startY = containerRect.height + 50; 

        const tempAudience = [...audience];
        if (currentSeatIdx !== -1) {
            tempAudience[currentSeatIdx] = { id: `empty-${currentSeatIdx}`, seed: '', isPlayer: false };
        }
        
        setAudience(tempAudience);

        setWalkingPlayer({
            active: true,
            startX: startX,
            startY: startY,
            targetX,
            targetY,
            targetIdx: idx
        });

        setTimeout(() => {
            setWalkingPlayer(null);
            const finalAudience = [...tempAudience];
            finalAudience[idx] = {
                id: playerLeader.id,
                seed: playerLeader.imageSeed.toString(),
                isPlayer: true
            };
            setAudience(finalAudience);
            
            if (pianistId === playerLeader.id) setPianistId(null);

        }, 1500); 
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
        
        setAudience(prev => prev.map(s => s.id === performer.id ? { ...s, seed: '', isPlayer: false } : s));
        setPianistId(performer.id);
    };

    const handleBellClick = () => {
        if (isBellRinging) return;
        setIsBellRinging(true);
        if (heat > 0 && Math.random() > 0.5) {
            onUpdateStats(money, Math.max(0, heat - 1));
        }
        setTimeout(() => setIsBellRinging(false), 2000);
    };

    const handleDonate = () => {
        if (money < 100 || isCoolingDown) return;
        setIsCoolingDown(true);
        setTimeout(() => setIsCoolingDown(false), 2000);
        onUpdateStats(money - 100, Math.max(0, heat - 5));
        if (onReduceStress) onReduceStress(1);
        setActiveAnim('donate');
        setPriestMessage("The church thanks you.");
        setTimeout(() => { setActiveAnim(null); setPriestMessage(null); }, 3000);
    };

    const handleStartService = () => {
        if (!isService) {
            setCycleTimer(SERVICE_DURATION + 1); // Skip to 1s before service logic triggers
        }
    };

    const handleConfess = () => {
        if (isService) return;
        if (isCoolingDown) return;
        setIsCoolingDown(true);
        setTimeout(() => setIsCoolingDown(false), 4000);
        if (onReduceStress) onReduceStress(5);
        const quote = CONFESSION_QUOTES[Math.floor(Math.random() * CONFESSION_QUOTES.length)];
        setPriestMessage(quote);
        setTimeout(() => setPriestMessage(null), 5000);
    };

    const getPianist = () => playerCrew.find(c => c.id === pianistId);
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center font-waze animate-fade-in p-8">
            <div className="bg-[#f3f4f6] w-full max-w-7xl h-[90vh] rounded-3xl shadow-2xl border-4 border-slate-300 overflow-hidden flex flex-col relative">
                
                <div className="absolute inset-0 pointer-events-none opacity-5 bg-[repeating-linear-gradient(45deg,#4a3b2a_0px,#4a3b2a_1px,transparent_1px_15px)] bg-[length:100px_100px]"></div>

                {activeAnim === 'blessing' && (
                    <div className="absolute inset-0 z-[100] pointer-events-none flex items-center justify-center">
                        <div className="text-6xl animate-float-up text-amber-500 font-black filter drop-shadow-[0_0_30px_rgba(251,191,36,0.8)]">
                            ✨ DIVINE FAVOR ✨
                        </div>
                        <div className="absolute inset-0 bg-white/40 animate-pulse mix-blend-overlay"></div>
                    </div>
                )}
                {activeAnim === 'donate' && (
                    <div className="absolute inset-0 z-[100] pointer-events-none flex items-center justify-center">
                        <div className="text-4xl font-black text-emerald-600 animate-bounce bg-white/90 px-8 py-4 rounded-xl shadow-xl border-2 border-emerald-500 backdrop-blur-md">
                            -N$ 100 / -HEAT
                        </div>
                    </div>
                )}

                {/* --- TOP LAYER: CEILING/ROOF/BELL (Visual Only) --- */}
                <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-30">
                     <div className="absolute top-[-20px] left-12 pointer-events-auto">
                        <ChurchBell isRinging={isBellRinging} onClick={handleBellClick} />
                     </div>
                     <div className="absolute top-4 right-6 text-4xl text-slate-400 opacity-30 rotate-[15deg]">★</div>
                </div>

                {/* --- PRIEST LAYER (Absolute to Container to roam freely) --- */}
                <div 
                    className="absolute z-40 transition-all duration-1000 ease-linear pointer-events-none"
                    style={{ 
                        left: `${priestPos.x}%`, 
                        top: `${priestPos.y}%`,
                        transform: 'translate(-50%, -100%)' // Anchor at feet
                    }}
                >
                    <ChurchCharacter 
                        seed={priestSeed} 
                        colorClass="bg-black" 
                        isPriest 
                        action={isService ? 'preaching' : 'walking'}
                        scale={1.4}
                        facingLeft={priestFacingLeft}
                    />
                    {priestMessage && (
                        <div className="absolute -top-24 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[11px] font-bold px-4 py-3 rounded-2xl shadow-xl border-2 border-slate-900 animate-pop-in z-50 text-center max-w-xs leading-tight whitespace-nowrap">
                            "{priestMessage}"
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-slate-900 transform rotate-45"></div>
                        </div>
                    )}
                </div>

                {/* --- SCROLLABLE CONTAINER --- */}
                <div className="flex-grow flex flex-col overflow-y-auto custom-scrollbar relative">
                    
                    {/* --- HEADER: ALTAR & STAINED GLASS --- */}
                    <div className="relative w-full h-[350px] flex-shrink-0 bg-[#e5e7eb] overflow-hidden">
                        
                        {/* Stained Glass */}
                        <div className="absolute inset-x-0 top-0 h-[300px] flex justify-center z-0 pointer-events-none">
                            <div className="w-[600px] h-full bg-[#1a1510] rounded-b-full border-b-8 border-r-8 border-l-8 border-[#3f2e18] overflow-hidden relative shadow-inner">
                                <div className="absolute inset-0 opacity-70" style={{ 
                                    backgroundImage: `
                                        linear-gradient(45deg, #1e3a8a 25%, transparent 25%, transparent 75%, #1e3a8a 75%, #1e3a8a),
                                        linear-gradient(45deg, #1e3a8a 25%, transparent 25%, transparent 75%, #1e3a8a 75%, #1e3a8a),
                                        radial-gradient(circle at 50% 30%, #fcd34d 0%, #d97706 20%, #7f1d1d 50%, transparent 80%)
                                    `,
                                    backgroundSize: '60px 60px, 60px 60px, 100% 100%',
                                    backgroundPosition: '0 0, 30px 30px, 0 0'
                                }}></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            </div>
                        </div>

                        {/* --- STAGE CONTENT --- */}
                        <div className="absolute inset-0 z-20 flex justify-between items-end pb-4 px-12">
                            
                            {/* LEFT: THE ORGAN (Redesigned) */}
                            <div 
                                onClick={handlePianoClick}
                                className={`relative group cursor-pointer transition-transform duration-300 mb-8 ${pianistId ? 'scale-105' : 'hover:scale-105'}`}
                            >
                                <div className="w-56 h-40 relative flex flex-col justify-end items-center">
                                    {/* Small Decorative Pipes on Top */}
                                    <div className="flex gap-1 mb-[-2px] z-0">
                                        {[...Array(8)].map((_, i) => (
                                            <div key={i} className="w-3 bg-gradient-to-t from-yellow-600 to-yellow-300 rounded-t-sm border border-yellow-800" style={{ height: `${20 + Math.random() * 20}px` }}></div>
                                        ))}
                                    </div>
                                    
                                    {/* Massive Wood Console Body */}
                                    <div className="w-full h-32 bg-[#3f2e18] rounded-t-xl border-4 border-[#281d10] shadow-2xl relative flex flex-col items-center justify-start pt-4 z-10">
                                        {/* Sheet Music Holder */}
                                        <div className="w-20 h-12 bg-[#281d10] mb-2 border border-[#5c401e] transform -skew-x-12"></div>
                                        
                                        {/* Keys */}
                                        <div className="w-[90%] h-8 bg-white border-2 border-black flex relative shadow-inner rounded-sm overflow-hidden">
                                            {[...Array(20)].map((_, i) => (
                                                <div key={i} className="flex-1 border-r border-black/30 relative bg-white">
                                                    {i % 7 !== 2 && i % 7 !== 6 && <div className="absolute top-0 left-[60%] w-[60%] h-[60%] bg-black z-10 rounded-b-sm"></div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {pianistId ? (
                                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
                                        <ChurchCharacter 
                                            seed={getPianist()?.imageSeed.toString() || 'pianist'} 
                                            colorClass="bg-purple-900"
                                            action="playing"
                                            scale={1.2}
                                        />
                                        <div className="absolute -top-16 -left-8 text-3xl animate-[float-up_3s_ease-in-out_infinite] text-amber-600 opacity-0">♪</div>
                                        <div className="absolute -top-24 right-0 text-2xl animate-[float-up_4s_ease-in-out_infinite] text-amber-600 opacity-0" style={{ animationDelay: '1.5s' }}>♫</div>
                                    </div>
                                ) : (
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded border border-slate-300 text-[9px] font-black uppercase text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm">
                                        Play Organ
                                    </div>
                                )}
                            </div>

                            {/* CENTER: THE ALTAR */}
                            <div className="relative flex flex-col items-center flex-grow h-full justify-end mx-12">
                                {/* Verse */}
                                <div className="absolute top-24 text-center opacity-40 pointer-events-none select-none w-full">
                                    <h1 className="text-slate-400 font-black font-serif text-3xl uppercase tracking-[0.2em] drop-shadow-sm">{verse.ref}</h1>
                                </div>

                                {/* Altar Table */}
                                <div className="w-[450px] h-32 relative flex justify-center items-end z-20">
                                    <div className="absolute bottom-0 -left-12 z-30">
                                        <FlowerArrangement scale={1.2} />
                                    </div>
                                    <div className="absolute bottom-0 -right-12 z-30">
                                        <FlowerArrangement scale={1.2} />
                                    </div>

                                    <div className="w-full h-full bg-[#f3f4f6] rounded-t-lg border-x-8 border-t-8 border-[#e5e7eb] shadow-2xl relative flex justify-between px-12 items-top overflow-visible bg-[url('https://www.transparenttextures.com/patterns/white-marble.png')]">
                                        <div className="absolute top-4 left-4 right-4 h-1 bg-amber-400 shadow-sm"></div>
                                        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-full ${isService ? 'bg-emerald-700' : 'bg-red-800'} border-x-2 border-black/10 flex justify-center pt-8 shadow-md transition-colors duration-1000`}>
                                            <div className="text-amber-200 text-6xl opacity-80 drop-shadow-md">✝</div>
                                        </div>
                                        <div className="text-4xl text-amber-400 animate-pulse mt-[-20px] z-10 filter drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]">🕯️</div>
                                        <div className="text-4xl text-amber-400 animate-pulse mt-[-20px] z-10 filter drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]">🕯️</div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: Side Window */}
                            <div className="relative w-48 h-64 mb-8 flex flex-col items-center z-10 opacity-90">
                                <div className="w-32 h-56 bg-[#1a1510] border-8 border-[#3f2e18] rounded-t-full overflow-hidden relative shadow-lg">
                                    <div className="absolute inset-0 flex flex-wrap content-start">
                                        {Array.from({ length: 60 }).map((_, i) => {
                                            const colors = ['bg-red-700', 'bg-blue-700', 'bg-yellow-500', 'bg-emerald-700', 'bg-purple-700'];
                                            const color = colors[(i * 7 + 3) % colors.length];
                                            return (
                                                <div key={i} className={`w-[20%] h-[10%] ${color} border-[0.5px] border-black/30 opacity-80`}></div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* --- MAIN BODY (PEWS) --- */}
                    <div className="flex-grow flex flex-col bg-[#e5e7eb] relative shadow-inner bg-[url('https://www.transparenttextures.com/patterns/stone-wall.png')] overflow-hidden pb-12">
                        
                        {/* WADDLING PLAYER OVERLAY */}
                        {walkingPlayer && walkingPlayer.active && playerLeader && (
                            <div 
                                className="absolute z-50 transition-all duration-[1500ms] ease-in-out pointer-events-none"
                                style={{
                                    left: walkingPlayer.active ? walkingPlayer.targetX : walkingPlayer.startX,
                                    top: walkingPlayer.active ? walkingPlayer.targetY : walkingPlayer.startY,
                                    transform: 'translate(-50%, -100%)' // Anchor at bottom center of feet
                                }}
                            >
                                <ChurchCharacter 
                                    seed={playerLeader.imageSeed.toString()} 
                                    colorClass="bg-amber-600"
                                    isWalking
                                    scale={1.2}
                                />
                                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white border-2 border-black rounded-xl px-3 py-1 text-[10px] font-bold uppercase whitespace-nowrap shadow-md animate-pop-in">
                                    Excuse me...
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b-2 border-r-2 border-black transform rotate-45"></div>
                                </div>
                            </div>
                        )}

                        {/* Carpet */}
                        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-40 bg-[#991b1b] border-x-4 border-[#7f1d1d] opacity-90 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.3)]"></div>

                        {/* Status Bar */}
                        <div className="flex justify-between items-center mb-6 px-8 py-4 bg-white/90 border-b border-slate-200 shadow-sm z-10 relative backdrop-blur-sm mx-20 mt-4 rounded-xl">
                            <div className="flex gap-6 items-center">
                                <div className={`text-sm font-black uppercase tracking-widest px-4 py-1.5 rounded border-2 
                                    ${isService ? 'bg-amber-100 text-amber-600 border-amber-300 animate-pulse' : 'bg-slate-100 text-slate-500 border-slate-300'}`}>
                                    {isService ? 'Service In Progress' : 'Chapel Open'}
                                </div>
                                <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                                    {isService ? 'Service Ends In:' : 'Service Begins In:'} <span className="text-slate-800 text-lg ml-2">{isService ? cycleTimer : formatTime(timeUntilService)}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 w-1/3">
                                <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Faith</span>
                                <div className="flex-grow h-4 bg-slate-200 rounded-full border border-slate-300 overflow-hidden relative">
                                    <div 
                                        className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 transition-all duration-1000 ease-linear"
                                        style={{ width: `${faithMeter}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pew Grid */}
                        <div ref={pewContainerRef} className="flex-grow overflow-y-auto custom-scrollbar px-24 flex flex-col items-center relative z-10">
                            <div className="grid grid-cols-2 gap-x-48 gap-y-8 w-full max-w-6xl relative z-10">
                                <div className="grid grid-cols-4 gap-4 bg-slate-300/30 p-6 rounded-lg border border-slate-400/30">
                                    {audience.slice(0, SEAT_COUNT/2).map((seat, i) => (
                                        <PewSeat 
                                            key={i} 
                                            id={i} 
                                            seat={seat} 
                                            speech={activeGossip && activeGossip.idx === i ? activeGossip.text : undefined}
                                            onClick={(rect) => handleSeatInteraction(i, rect)} 
                                        />
                                    ))}
                                </div>
                                <div className="grid grid-cols-4 gap-4 bg-slate-300/30 p-6 rounded-lg border border-slate-400/30">
                                    {audience.slice(SEAT_COUNT/2).map((seat, i) => {
                                        const actualIdx = i + SEAT_COUNT/2;
                                        return (
                                            <PewSeat 
                                                key={actualIdx} 
                                                id={actualIdx} 
                                                seat={seat} 
                                                speech={activeGossip && activeGossip.idx === actualIdx ? activeGossip.text : undefined}
                                                onClick={(rect) => handleSeatInteraction(actualIdx, rect)} 
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ENTRANCE FLOWERS - ADDED MORE */}
                            <div className="absolute bottom-4 w-full max-w-6xl flex justify-between px-20 pointer-events-none z-20">
                                {/* Left Group */}
                                <div className="relative">
                                    <div className="transform scale-150 origin-bottom-left z-20"><FlowerArrangement /></div>
                                    <div className="absolute bottom-[-10px] left-12 transform scale-125 origin-bottom-left z-10"><FlowerArrangement /></div>
                                </div>
                                {/* Right Group */}
                                <div className="relative">
                                    <div className="transform scale-150 origin-bottom-right z-20"><FlowerArrangement /></div>
                                    <div className="absolute bottom-[-10px] right-12 transform scale-125 origin-bottom-right z-10"><FlowerArrangement /></div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 font-bold z-50 bg-white/80 w-10 h-10 rounded-full flex items-center justify-center border border-slate-300 transition-colors shadow-sm">✕</button>

                {/* --- FOOTER CONTROLS --- */}
                <div className="h-24 bg-white border-t-4 border-slate-200 flex items-center justify-between px-10 text-slate-800 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-30 relative">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.2em] mb-1">Offering Box</span>
                        <span className="text-3xl font-mono font-black text-emerald-600 drop-shadow-sm">N$ {money.toLocaleString()}</span>
                    </div>

                    <div className="flex gap-6">
                        {!isService && (
                            <button 
                                onClick={handleStartService}
                                className="flex items-center gap-4 px-8 py-4 rounded-xl border-2 border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 font-black uppercase tracking-widest text-xs transition-all shadow-sm"
                            >
                                Start Service
                            </button>
                        )}

                        <button 
                            onClick={handleDonate}
                            disabled={isCoolingDown || money < 100}
                            className={`flex items-center gap-4 px-8 py-4 rounded-xl border-2 transition-all active:translate-y-0.5 group shadow-sm
                                ${money >= 100 && !isCoolingDown 
                                    ? 'bg-slate-50 border-amber-400 hover:bg-amber-50 hover:border-amber-500 hover:shadow-md' 
                                    : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'}
                            `}
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">🤲</span>
                            <div className="text-left">
                                <div className={`text-sm font-black uppercase tracking-widest ${money >= 100 ? 'text-amber-800' : 'text-slate-400'}`}>Tithe</div>
                                <div className="text-[10px] font-mono text-emerald-600 font-bold">N$ 100</div>
                            </div>
                        </button>

                        <button 
                            onClick={handleConfess}
                            disabled={isService || isCoolingDown}
                            className={`flex items-center gap-4 px-8 py-4 rounded-xl border-2 transition-all active:translate-y-0.5 shadow-sm group
                                ${isService 
                                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-70' 
                                    : 'bg-purple-50 border-purple-300 hover:bg-purple-100 hover:border-purple-500 hover:shadow-md'}
                            `}
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">🛐</span>
                            <div className="text-left">
                                <div className={`text-sm font-black uppercase tracking-widest ${isService ? 'text-slate-400' : 'text-purple-800'}`}>Confess</div>
                                <div className="text-[10px] text-purple-600 font-bold">{isService ? 'Priest Busy' : 'Available'}</div>
                            </div>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Church;
