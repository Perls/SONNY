
import React, { useState, useEffect } from 'react';
import AvatarDisplay from '../AvatarDisplay';

interface CasinoProps {
  money: number;
  onUpdateMoney: (amount: number) => void;
  onClose: () => void;
}

type GameType = 'menu' | 'slots' | 'blackjack' | 'roulette' | 'poker';

interface Patron {
    id: string;
    name: string;
    seed: string;
    isVip: boolean;
}

const SEAT_COUNT = 30;

const Casino: React.FC<CasinoProps> = ({ money, onUpdateMoney, onClose }) => {
  const [activeGame, setActiveGame] = useState<GameType>('menu');
  const [gameMessage, setGameMessage] = useState<string>("");
  const [lastWin, setLastWin] = useState<number>(0);
  
  // --- PATRON STATE ---
  const [patrons, setPatrons] = useState<Patron[]>([]);

  // --- SLOTS STATE ---
  const [slots, setSlots] = useState(['🍒', '🍒', '🍒']);
  const [isSpinning, setIsSpinning] = useState(false);
  
  // --- BLACKJACK STATE ---
  const [dealerHand, setDealerHand] = useState<number>(0);
  const [playerHand, setPlayerHand] = useState<number>(0);
  const [bjGameState, setBjGameState] = useState<'bet' | 'playing' | 'end'>('bet');

  // --- ROULETTE STATE ---
  const [rouletteSpinning, setRouletteSpinning] = useState(false);
  const [rouletteResult, setRouletteResult] = useState<string | null>(null);

  // Initialize Patrons
  useEffect(() => {
      const newPatrons = Array.from({ length: SEAT_COUNT }).map((_, i) => {
          // 60% occupancy
          if (Math.random() > 0.6) return null;
          return {
              id: `patron-${i}`,
              name: 'Gambler',
              seed: `gambler-${i}-${Math.random()}`,
              isVip: Math.random() > 0.8
          };
      }).filter(p => p !== null) as Patron[];
      setPatrons(newPatrons);
  }, []);

  // --- COMMON HELPERS ---
  const deduct = (amount: number) => {
      if (money >= amount) {
          onUpdateMoney(money - amount);
          return true;
      }
      setGameMessage("Insufficient Funds!");
      return false;
  };

  const win = (amount: number) => {
      onUpdateMoney(money + amount);
      setLastWin(amount);
      setTimeout(() => setLastWin(0), 2000);
  };

  // --- SLOTS LOGIC ---
  const SLOTS_SYMBOLS = ['🍒', '🍋', '🍇', '💎', '7️⃣'];
  
  const spinSlots = () => {
      if (isSpinning) return;
      if (!deduct(10)) return;

      setIsSpinning(true);
      setGameMessage("");
      
      let spins = 0;
      const interval = setInterval(() => {
          setSlots([
              SLOTS_SYMBOLS[Math.floor(Math.random() * SLOTS_SYMBOLS.length)],
              SLOTS_SYMBOLS[Math.floor(Math.random() * SLOTS_SYMBOLS.length)],
              SLOTS_SYMBOLS[Math.floor(Math.random() * SLOTS_SYMBOLS.length)]
          ]);
          spins++;
          if (spins > 10) {
              clearInterval(interval);
              setIsSpinning(false);
              finalizeSlots();
          }
      }, 100);
  };

  const finalizeSlots = () => {
      const s1 = SLOTS_SYMBOLS[Math.floor(Math.random() * SLOTS_SYMBOLS.length)];
      const s2 = SLOTS_SYMBOLS[Math.floor(Math.random() * SLOTS_SYMBOLS.length)];
      const s3 = SLOTS_SYMBOLS[Math.floor(Math.random() * SLOTS_SYMBOLS.length)];
      setSlots([s1, s2, s3]);

      if (s1 === s2 && s2 === s3) {
          if (s1 === '7️⃣') { setGameMessage("JACKPOT! +$500"); win(500); }
          else if (s1 === '💎') { setGameMessage("BIG WIN! +$250"); win(250); }
          else { setGameMessage("WINNER! +$50"); win(50); }
      } else if (s1 === s2 || s2 === s3 || s1 === s3) {
          setGameMessage("Small Win! +$15"); win(15);
      } else {
          setGameMessage("Try Again");
      }
  };

  // --- BLACKJACK LOGIC ---
  const startBlackjack = () => {
      if (!deduct(50)) return;
      setPlayerHand(Math.floor(Math.random() * 10) + 12); // Mock initial hand 12-21
      setDealerHand(Math.floor(Math.random() * 10) + 2); // Dealer shows one card
      setBjGameState('playing');
      setGameMessage("");
  };

  const hitBlackjack = () => {
      const newCard = Math.floor(Math.random() * 10) + 1;
      const newTotal = playerHand + newCard;
      setPlayerHand(newTotal);
      if (newTotal > 21) {
          setGameMessage("Bust! Dealer Wins.");
          setBjGameState('end');
      }
  };

  const standBlackjack = () => {
      let dTotal = dealerHand;
      // Dealer logic mock
      while (dTotal < 17) {
          dTotal += Math.floor(Math.random() * 10) + 1;
      }
      setDealerHand(dTotal);
      
      if (dTotal > 21 || playerHand > dTotal) {
          setGameMessage("You Win! +$100");
          win(100);
      } else if (dTotal === playerHand) {
          setGameMessage("Push. +$50");
          win(50);
      } else {
          setGameMessage("Dealer Wins.");
      }
      setBjGameState('end');
  };

  // --- ROULETTE LOGIC ---
  const spinRoulette = (choice: 'red' | 'black') => {
      if (rouletteSpinning) return;
      if (!deduct(25)) return;

      setRouletteSpinning(true);
      setGameMessage("");
      
      setTimeout(() => {
          const isRed = Math.random() > 0.5;
          const result = isRed ? 'red' : 'black';
          setRouletteResult(result);
          setRouletteSpinning(false);
          
          if (choice === result) {
              setGameMessage("WIN! +$50");
              win(50);
          } else {
              setGameMessage("Lost.");
          }
      }, 1500);
  };

  return (
    <div className="absolute inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center font-waze animate-fade-in p-8">
        
        {/* Main Window - White/Slate Theme to match Nightclub */}
        <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden flex flex-col max-h-[90vh] relative">
            
            {/* Header / Banner */}
            <div className="relative w-full h-40 bg-emerald-900 flex-shrink-0 border-b-4 border-amber-500 overflow-hidden group">
                 {/* Decorative Background Image */}
                 <img 
                    src="https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=1000&auto=format&fit=crop" 
                    className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-1000 mix-blend-overlay"
                    alt="Casino Banner"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-transparent"></div>
                 
                 <div className="absolute inset-0 flex items-end justify-between p-6">
                     <div>
                         <h1 className="text-5xl font-black font-news text-white uppercase tracking-tighter mb-1 drop-shadow-lg flex items-center gap-3">
                             <span className="text-amber-400 text-6xl">🎰</span> THE HIGH ROLLER
                         </h1>
                         <div className="flex items-center gap-2">
                             <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-200 bg-emerald-900/80 px-2 py-1 rounded border border-emerald-700/50 backdrop-blur-sm">
                                 Casino & Lounge
                             </div>
                             <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300 bg-black/40 px-2 py-1 rounded border border-white/10 backdrop-blur-sm">
                                 Open 24/7
                             </div>
                         </div>
                     </div>

                     <div className="text-right">
                         <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mb-1">Chip Stack</div>
                         <div className="text-4xl font-mono font-black text-white drop-shadow-md">N$ {money.toLocaleString()}</div>
                         {lastWin > 0 && <div className="text-sm font-bold text-amber-300 animate-bounce mt-1">+${lastWin}</div>}
                     </div>
                 </div>

                 <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-white text-white hover:text-slate-900 rounded-full flex items-center justify-center font-bold transition-all backdrop-blur-sm">✕</button>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-grow flex flex-col p-6 bg-slate-50 overflow-y-auto custom-scrollbar gap-6">
                
                {/* MENU VIEW */}
                {activeGame === 'menu' && (
                    <div className="grid grid-cols-4 gap-4">
                        {/* Game Cards */}
                        <button onClick={() => setActiveGame('slots')} className="group relative bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-amber-500 hover:shadow-xl transition-all flex flex-col items-center justify-center gap-4 h-48">
                            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">🎰</div>
                            <div className="text-center">
                                <h3 className="text-lg font-black text-slate-800 uppercase font-news">Slots</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Min: $10</p>
                            </div>
                        </button>
                        
                        <button onClick={() => setActiveGame('blackjack')} className="group relative bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-blue-500 hover:shadow-xl transition-all flex flex-col items-center justify-center gap-4 h-48">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">🃏</div>
                            <div className="text-center">
                                <h3 className="text-lg font-black text-slate-800 uppercase font-news">Blackjack</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Min: $50</p>
                            </div>
                        </button>

                        <button onClick={() => setActiveGame('roulette')} className="group relative bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-red-500 hover:shadow-xl transition-all flex flex-col items-center justify-center gap-4 h-48">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">🎡</div>
                            <div className="text-center">
                                <h3 className="text-lg font-black text-slate-800 uppercase font-news">Roulette</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Min: $25</p>
                            </div>
                        </button>

                        <button onClick={() => setActiveGame('poker')} className="group relative bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-emerald-500 hover:shadow-xl transition-all flex flex-col items-center justify-center gap-4 h-48">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">♠️</div>
                            <div className="text-center">
                                <h3 className="text-lg font-black text-slate-800 uppercase font-news">Poker</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Table Full</p>
                            </div>
                        </button>
                    </div>
                )}

                {/* GAME VIEWS - Rendered on Felt Table Strip */}
                {activeGame !== 'menu' && (
                    <div className="flex flex-col flex-grow">
                        {/* Navigation Bar */}
                        <div className="flex justify-between items-center mb-4">
                            <button onClick={() => setActiveGame('menu')} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-widest transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                                <span>←</span> Back to Floor
                            </button>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Playing: <span className="text-slate-800">{activeGame}</span>
                            </div>
                        </div>

                        {/* FELT TABLE STRIP */}
                        <div className="flex-grow w-full bg-[#064e3b] rounded-2xl border-[12px] border-[#3f2e18] shadow-[inset_0_0_60px_rgba(0,0,0,0.6)] relative overflow-hidden flex items-center justify-center p-8 min-h-[300px]">
                            {/* Felt Texture Overlay */}
                            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/felt.png")' }}></div>
                            
                            {/* Game Content */}
                            <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">
                                
                                {activeGame === 'slots' && (
                                    /* Slots Layout */
                                    <div className="bg-gradient-to-b from-yellow-600 to-yellow-800 p-6 rounded-xl shadow-2xl border-b-8 border-yellow-900 w-full max-w-lg">
                                        <div className="flex gap-4 mb-6 bg-white p-6 rounded-lg border-4 border-slate-800 shadow-[inset_0_4px_10px_rgba(0,0,0,0.2)] justify-center">
                                            {slots.map((s, i) => (
                                                <div key={i} className="w-24 h-32 bg-slate-50 border-x-2 border-slate-200 flex items-center justify-center text-6xl shadow-inner relative overflow-hidden">
                                                    <div className={isSpinning ? 'animate-pulse blur-sm scale-110 transition-all' : 'scale-100 transition-all'}>{s}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between items-center bg-black/30 p-4 rounded-lg">
                                            <div className="text-xl font-bold text-yellow-300 animate-pulse">{gameMessage || "Pull to Spin!"}</div>
                                            <button 
                                                onClick={spinSlots} 
                                                disabled={isSpinning}
                                                className="bg-red-600 hover:bg-red-500 text-white font-black text-xl uppercase py-2 px-8 rounded shadow-lg border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSpinning ? "..." : "SPIN $10"}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeGame === 'blackjack' && (
                                    <div className="w-full flex flex-col items-center gap-8">
                                        {/* Dealer Area */}
                                        <div className="flex flex-col items-center">
                                            <div className="flex gap-2">
                                                <div className="bg-white text-black font-black text-3xl w-24 h-36 rounded-lg flex items-center justify-center border-2 border-slate-300 shadow-xl transform rotate-1">
                                                    {dealerHand > 0 ? dealerHand : '?'}
                                                </div>
                                                {/* Hidden Card Simulation */}
                                                <div className="bg-red-800 w-24 h-36 rounded-lg border-2 border-white/20 shadow-xl transform -rotate-2 relative">
                                                    <div className="absolute inset-2 border-2 border-white/20 rounded opacity-50"></div>
                                                </div>
                                            </div>
                                            <span className="mt-2 text-white/50 text-xs font-bold uppercase tracking-widest">Dealer</span>
                                        </div>

                                        <div className="text-2xl font-black text-amber-400 drop-shadow-md min-h-[2rem]">{gameMessage}</div>

                                        {/* Player Area */}
                                        <div className="flex flex-col items-center">
                                            <div className="flex gap-2">
                                                <div className="bg-white text-black font-black text-3xl w-24 h-36 rounded-lg flex items-center justify-center border-2 border-slate-300 shadow-xl transform -rotate-1">
                                                    {playerHand > 0 ? playerHand : '?'}
                                                </div>
                                                <div className="bg-white text-black font-black text-3xl w-24 h-36 rounded-lg flex items-center justify-center border-2 border-slate-300 shadow-xl transform rotate-2 relative -ml-12 top-2">
                                                    ?
                                                </div>
                                            </div>
                                            <span className="mt-2 text-white/50 text-xs font-bold uppercase tracking-widest">Player</span>
                                        </div>

                                        {/* Controls */}
                                        <div className="flex gap-4 mt-4">
                                            {bjGameState === 'bet' ? (
                                                <button onClick={startBlackjack} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase py-3 px-8 rounded-full shadow-lg border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1">
                                                    Deal ($50)
                                                </button>
                                            ) : bjGameState === 'playing' ? (
                                                <>
                                                    <button onClick={hitBlackjack} className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase py-3 px-8 rounded-full shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1">Hit</button>
                                                    <button onClick={standBlackjack} className="bg-amber-600 hover:bg-amber-500 text-white font-black uppercase py-3 px-8 rounded-full shadow-lg border-b-4 border-amber-800 active:border-b-0 active:translate-y-1">Stand</button>
                                                </>
                                            ) : (
                                                <button onClick={startBlackjack} className="bg-slate-700 hover:bg-slate-600 text-white font-black uppercase py-3 px-8 rounded-full shadow-lg border-b-4 border-slate-900 active:border-b-0 active:translate-y-1">
                                                    Re-Deal
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeGame === 'roulette' && (
                                    <div className="w-full flex flex-col items-center">
                                        <div className={`w-64 h-64 rounded-full border-[12px] border-amber-700 bg-black flex items-center justify-center mb-8 relative shadow-2xl ${rouletteSpinning ? 'animate-spin' : ''}`}>
                                            <div className="absolute inset-0 rounded-full border-4 border-dashed border-white/20"></div>
                                            {/* Wheel Inner */}
                                            <div className="absolute inset-2 rounded-full border-4 border-amber-900 bg-[conic-gradient(red_0deg_18deg,black_18deg_36deg,red_36deg_54deg,black_54deg_72deg,red_72deg_90deg,black_90deg_108deg,red_108deg_126deg,black_126deg_144deg,red_144deg_162deg,black_162deg_180deg,green_180deg_198deg,black_198deg_216deg,red_216deg_234deg,black_234deg_252deg,red_252deg_270deg,black_270deg_288deg,red_288deg_306deg,black_306deg_324deg,red_324deg_342deg,black_342deg_360deg)]"></div>
                                            
                                            {/* Center Hub */}
                                            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white bg-slate-900 border-4 border-amber-600 z-10 shadow-lg ${rouletteResult === 'red' ? 'bg-red-600' : rouletteResult === 'black' ? 'bg-black' : 'bg-slate-900'}`}>
                                                {rouletteSpinning ? '' : rouletteResult === 'red' ? '🔴' : rouletteResult === 'black' ? '⚫' : '🎡'}
                                            </div>
                                        </div>

                                        <div className="text-xl font-bold text-amber-300 mb-6 min-h-[2rem] text-center drop-shadow-md">{gameMessage || "Place your bets"}</div>

                                        <div className="flex gap-6">
                                            <button 
                                                onClick={() => spinRoulette('red')} 
                                                disabled={rouletteSpinning}
                                                className="bg-red-600 hover:bg-red-500 text-white font-black uppercase py-4 px-10 rounded shadow-lg border-b-4 border-red-800 active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all"
                                            >
                                                RED ($25)
                                            </button>
                                            <button 
                                                onClick={() => spinRoulette('black')} 
                                                disabled={rouletteSpinning}
                                                className="bg-black hover:bg-gray-800 text-white font-black uppercase py-4 px-10 rounded shadow-lg border-b-4 border-gray-900 active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all"
                                            >
                                                BLACK ($25)
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeGame === 'poker' && (
                                    <div className="w-full flex flex-col items-center gap-6">
                                        <div className="text-white/60 text-xs font-black uppercase tracking-widest mb-4">Texas Hold'em - No Limit</div>
                                        
                                        <div className="flex gap-4 items-center justify-center mb-8">
                                            {/* Community Cards */}
                                            {[1,2,3,4,5].map(i => (
                                                <div key={i} className="w-20 h-28 bg-red-800 rounded border-2 border-white/30 shadow-xl flex items-center justify-center">
                                                    <div className="w-16 h-24 border border-white/10 rounded"></div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-black/40 px-8 py-4 rounded-xl border border-white/10 backdrop-blur-sm text-center">
                                            <div className="text-amber-400 font-bold uppercase text-sm mb-2">High Stakes Table</div>
                                            <p className="text-white/80 text-xs max-w-md">
                                                "Sorry boss, the game is full right now. Big Tony bought in for 50k and refuses to fold."
                                            </p>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                )}

                {/* PATRONS LOUNGE SECTION */}
                <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex-shrink-0">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                        <h3 className="text-sm font-black font-news text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <span>🥂</span> High Limit Lounge
                        </h3>
                        <div className="text-[9px] font-bold uppercase text-slate-400 bg-slate-50 px-2 py-1 rounded">
                            Capacity: {patrons.length} / {SEAT_COUNT}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-6 gap-3">
                        {/* Display Patrons (30 Slots) */}
                        {Array.from({ length: SEAT_COUNT }).map((_, i) => {
                            const patron = patrons[i];
                            return (
                                <div key={i} className="flex flex-col items-center gap-1 p-2 bg-slate-50 rounded-lg border border-slate-100 relative group">
                                    {patron ? (
                                        <>
                                            <div className="relative">
                                                <AvatarDisplay 
                                                    seed={patron.seed}
                                                    role="patron"
                                                    className="w-14 h-14 rounded-full border border-slate-200 shadow-sm"
                                                    alt={patron.name}
                                                />
                                                {patron.isVip && (
                                                    <div className="absolute -top-1 -right-1 text-[8px] bg-amber-400 text-white rounded-full w-4 h-4 flex items-center justify-center shadow-sm border border-white font-bold">★</div>
                                                )}
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-600 truncate w-full text-center">
                                                {patron.name}
                                            </span>
                                        </>
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};

export default Casino;
