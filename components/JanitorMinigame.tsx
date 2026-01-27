
import React, { useState, useEffect, useCallback, useRef } from 'react';

interface JanitorMinigameProps {
    onClose: () => void;
    onComplete: (payout: number, message: string) => void;
}

// --- CONSTANTS ---
const TICK_RATE = 50;
const SPAWN_CHANCE = 0.05;
const MOVEMENT_SPEED = 1.0; // % per tick
const HIT_ZONE_START = 80;
const WIN_SCORE = 100;
const MAX_MISSES = 10;

// --- TYPES ---
type ToolType = 'broom' | 'mop';
type FilthType = 'dry' | 'wet';

interface FilthItem {
    id: string;
    type: FilthType;
    lane: 0 | 1; // 0 = Left, 1 = Right
    distance: number; // 0 to 100
    icon: string;
}

const DRY_ICONS = ['📦', '📰', '🚬', '🍂', '🥡'];
const WET_ICONS = ['☕', '🍕', '💦', '🤮', '🥤'];

const JanitorMinigame: React.FC<JanitorMinigameProps> = ({ onClose, onComplete }) => {
    // --- STATE ---
    const [timeLeft, setTimeLeft] = useState(120000); // 2 mins
    const [activeTool, setActiveTool] = useState<ToolType>('broom');
    const [missedCount, setMissedCount] = useState(0);
    const [cleanScore, setCleanScore] = useState(0);
    const [incomingFilth, setIncomingFilth] = useState<FilthItem[]>([]);
    
    // UI Feedback State
    const [message, setMessage] = useState("READY... Q=BROOM | E=MOP | SPACE=CLEAN");
    const [isStunned, setIsStunned] = useState(false);
    const [flash, setFlash] = useState<'green' | 'red' | null>(null);
    const [gameOver, setGameOver] = useState(false);

    // Refs for Loop logic to access latest state without re-binding
    const stateRef = useRef({
        incomingFilth,
        missedCount,
        cleanScore,
        activeTool,
        isStunned,
        gameOver
    });

    useEffect(() => {
        stateRef.current = { incomingFilth, missedCount, cleanScore, activeTool, isStunned, gameOver };
    }, [incomingFilth, missedCount, cleanScore, activeTool, isStunned, gameOver]);

    // --- GAME LOOP ---
    useEffect(() => {
        if (gameOver) return;

        const interval = setInterval(() => {
            const current = stateRef.current;
            
            // 1. Time & Win Check
            if (timeLeft <= 0 || current.cleanScore >= WIN_SCORE) {
                handleGameOver(current.cleanScore >= WIN_SCORE ? 'win' : 'time');
                return;
            }
            setTimeLeft(prev => prev - TICK_RATE);

            // 2. Spawn Logic
            const newFilth = [...current.incomingFilth];
            if (Math.random() < SPAWN_CHANCE) {
                const type: FilthType = Math.random() > 0.5 ? 'dry' : 'wet';
                const icons = type === 'dry' ? DRY_ICONS : WET_ICONS;
                newFilth.push({
                    id: Math.random().toString(36).substr(2, 9),
                    type,
                    lane: Math.random() > 0.5 ? 0 : 1,
                    distance: 0,
                    icon: icons[Math.floor(Math.random() * icons.length)]
                });
            }

            // 3. Movement & Miss Check
            let newMisses = current.missedCount;
            const remainingFilth: FilthItem[] = [];

            newFilth.forEach(item => {
                item.distance += MOVEMENT_SPEED;
                if (item.distance > 100) {
                    newMisses++;
                    triggerFeedback("MISSED!", 'red');
                } else {
                    remainingFilth.push(item);
                }
            });

            // Update State
            setIncomingFilth(remainingFilth);
            if (newMisses > current.missedCount) {
                setMissedCount(newMisses);
                // Check Loss Condition
                if (newMisses >= MAX_MISSES) {
                    handleGameOver('fail');
                }
            }

        }, TICK_RATE);

        return () => clearInterval(interval);
    }, [gameOver, timeLeft]); // Re-bind only on critical status changes

    // --- INPUT HANDLER ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (stateRef.current.gameOver || stateRef.current.isStunned) return;

            // Tool Switch
            if (e.key.toLowerCase() === 'q' || e.key === 'ArrowLeft') {
                setActiveTool('broom');
            } else if (e.key.toLowerCase() === 'e' || e.key === 'ArrowRight') {
                setActiveTool('mop');
            }
            
            // Action
            else if (e.key === ' ' || e.key === 'Enter') {
                performCleanAction();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // --- ACTION LOGIC ---
    const performCleanAction = () => {
        const { incomingFilth, activeTool } = stateRef.current;

        // Find nearest item in range
        const actionParams = incomingFilth
            .filter(i => i.distance > HIT_ZONE_START)
            .sort((a, b) => b.distance - a.distance); // Closest to bottom first

        const target = actionParams[0];

        if (!target) {
            triggerFeedback("SWIPING AIR", null);
            return;
        }

        // Check Tool Match
        const isMatch = (target.type === 'dry' && activeTool === 'broom') ||
                        (target.type === 'wet' && activeTool === 'mop');

        if (isMatch) {
            // SUCCESS
            setIncomingFilth(prev => prev.filter(i => i.id !== target.id));
            setCleanScore(prev => prev + 1);
            triggerFeedback("CLEANED!", 'green');
        } else {
            // MISTAKE
            triggerFeedback("WRONG TOOL! STUNNED.", 'red');
            setIsStunned(true);
            setTimeout(() => setIsStunned(false), 1000);
        }
    };

    const triggerFeedback = (msg: string, color: 'green' | 'red' | null) => {
        setMessage(msg);
        if (color) {
            setFlash(color);
            setTimeout(() => setFlash(null), 150);
        }
    };

    // --- GAME OVER LOGIC ---
    const handleGameOver = (reason: 'win' | 'fail' | 'time') => {
        setGameOver(true);
        const { cleanScore, missedCount } = stateRef.current;
        
        let payout = 0;
        let dialogue = "";

        // Logic Table
        if (cleanScore >= WIN_SCORE && missedCount < 3) {
            // Perfect Win
            payout = 75;
            dialogue = "You hit that flow state, Boss! You cleaned that aisle like you were born with a mop in your hand. Take the cash, and remember what real work feels like.";
        } else if (cleanScore >= WIN_SCORE && missedCount < MAX_MISSES) {
            // Basic Win
            payout = 50;
            dialogue = "This is your life now, Boss? Picking up garbage? Well, you got the job done. But I've seen better aiming from a blind man with a water pistol. Take the cash, and remember what real work feels like.";
        } else if (missedCount >= 15) { // Assuming continued play or rapid failure
            // Critical Fail
            payout = -50;
            dialogue = "The insurance company is suing! You caused an accident with all that filth. You are now officially the worst janitor in New York. You owe them fifty bucks.";
        } else {
            // Standard Fail (Time out or Missed > 10)
            payout = 0;
            dialogue = "You let the place turn into a pigsty! You're fired. Get back here and earn money the way you're supposed to.";
        }

        setTimeout(() => {
            onComplete(payout, dialogue);
        }, 2000);
    };

    const formatTime = (ms: number) => {
        const totalSec = Math.ceil(ms / 1000);
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // --- RENDER ---
    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center font-mono select-none">
            
            {/* Flash Overlay */}
            {flash && (
                <div className={`absolute inset-0 pointer-events-none opacity-20 z-50 ${flash === 'green' ? 'bg-green-500' : 'bg-red-600'}`}></div>
            )}

            <div className="relative w-[600px] h-[800px] bg-slate-900 border-8 border-slate-700 rounded-xl flex flex-col overflow-hidden shadow-2xl">
                
                {/* 1. Header */}
                <div className="bg-slate-800 p-4 border-b-4 border-slate-950 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-amber-500 italic uppercase tracking-tighter leading-none">THE AISLE SCRUBBER</h2>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Industrial Cleaning Unit 04</div>
                    </div>
                    <div className="text-right">
                        <div className={`text-3xl font-mono font-black ${timeLeft < 10000 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                </div>

                {/* 2. Stats Bar */}
                <div className="bg-black p-2 flex justify-between text-xs font-bold border-b border-slate-700">
                    <div className="flex gap-4">
                        <span className="text-emerald-400">CLEAN SCORE: {cleanScore} / {WIN_SCORE}</span>
                        <span className={`${missedCount > 7 ? 'text-red-500 animate-pulse' : 'text-red-300'}`}>MISSED: {missedCount} / {MAX_MISSES}</span>
                    </div>
                </div>

                {/* 3. Main Stage (Conveyor) */}
                <div className="flex-grow relative bg-[#1a1a1a] overflow-hidden">
                    {/* Background Grid/Belt Effect */}
                    <div className="absolute inset-0 opacity-10" 
                         style={{ 
                             backgroundImage: 'linear-gradient(#333 1px, transparent 1px)', 
                             backgroundSize: '100% 50px',
                             animation: 'scroll-down 2s linear infinite'
                         }}>
                    </div>
                    <style>{`@keyframes scroll-down { from { background-position: 0 0; } to { background-position: 0 50px; } }`}</style>

                    {/* Lane Dividers */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-slate-700/50 -translate-x-1/2"></div>

                    {/* Hit Zone Indicator */}
                    <div 
                        className="absolute left-0 right-0 border-t-4 border-dashed border-amber-500/30 bg-amber-500/5"
                        style={{ top: `${HIT_ZONE_START}%`, bottom: 0 }}
                    >
                        <div className="absolute top-2 right-2 text-[10px] font-black text-amber-600 uppercase tracking-widest">Action Zone</div>
                    </div>

                    {/* Entities */}
                    {incomingFilth.map(item => (
                        <div 
                            key={item.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-none"
                            style={{ 
                                left: item.lane === 0 ? '25%' : '75%', 
                                top: `${item.distance}%`,
                                fontSize: '2.5rem'
                            }}
                        >
                            {item.icon}
                        </div>
                    ))}

                    {/* Stun Overlay */}
                    {isStunned && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-900/50 backdrop-blur-sm z-40">
                            <div className="text-4xl font-black text-white border-4 border-white p-4 uppercase tracking-widest animate-shake">
                                MALFUNCTION
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. Player / Tool Indicator */}
                <div className="h-32 bg-slate-800 border-t-4 border-slate-950 flex relative">
                    
                    {/* Left Tool (Broom) */}
                    <div className={`flex-1 flex flex-col items-center justify-center border-r border-slate-700 transition-colors ${activeTool === 'broom' ? 'bg-red-900/40' : 'opacity-40'}`}>
                        <div className="text-5xl mb-2">🧹</div>
                        <div className={`text-sm font-black uppercase ${activeTool === 'broom' ? 'text-red-400' : 'text-slate-500'}`}>
                            BROOM (Q)
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">For Dry Items</div>
                        <div className="flex gap-1 mt-1 text-sm opacity-70">{DRY_ICONS.slice(0,3).map(i => <span key={i}>{i}</span>)}</div>
                    </div>

                    {/* Right Tool (Mop) */}
                    <div className={`flex-1 flex flex-col items-center justify-center transition-colors ${activeTool === 'mop' ? 'bg-blue-900/40' : 'opacity-40'}`}>
                        <div className="text-5xl mb-2">🧼</div>
                        <div className={`text-sm font-black uppercase ${activeTool === 'mop' ? 'text-blue-400' : 'text-slate-500'}`}>
                            MOP (E)
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">For Wet Items</div>
                        <div className="flex gap-1 mt-1 text-sm opacity-70">{WET_ICONS.slice(0,3).map(i => <span key={i}>{i}</span>)}</div>
                    </div>

                    {/* Message Overlay */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black border-2 border-amber-500 px-6 py-2 rounded-full shadow-lg whitespace-nowrap z-50">
                        <span className="text-xs font-bold text-amber-400 font-mono animate-pulse">{message}</span>
                    </div>
                </div>

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 bg-red-900/80 text-white text-xs font-bold px-3 py-1 rounded border border-red-500 hover:bg-red-700 z-50">
                    QUIT JOB
                </button>

            </div>
        </div>
    );
};

export default JanitorMinigame;
