
import React, { useState, useEffect, useRef } from 'react';
import { CrewMember, ClassType } from '../../types';
import AvatarDisplay from '../AvatarDisplay';
import SafeImage from '../SafeImage';

interface NightclubProps {
  playerCrew: CrewMember[];
  money: number;
  onClose: () => void;
  onAssignMember: (memberId: string, slot: string) => void;
  onRestoreEnergy: (amount: number) => void;
  onAction?: (action: string, cost: number) => void;
}

interface Performer {
    id: string;
    name: string;
    seed: string;
    isPlayer: boolean;
}

const SEAT_COUNT = 40;
const VIP_SEAT_INDICES = [2, 3, 4, 5, 6, 7]; // 6 Seats centered in row 1

const NPC_DANCERS: Performer[] = [
    { id: 'npc-d1', name: 'Roxy', seed: 'RoxyDance', isPlayer: false },
    { id: 'npc-d2', name: 'Lux', seed: 'LuxDance', isPlayer: false },
    { id: 'npc-d3', name: 'Vibe', seed: 'VibeDance', isPlayer: false },
    { id: 'npc-d4', name: 'Echo', seed: 'EchoDance', isPlayer: false },
];

const Nightclub: React.FC<NightclubProps> = ({ playerCrew, money, onClose, onAssignMember, onRestoreEnergy, onAction }) => {
  // State for the "Show"
  const [buffProgress, setBuffProgress] = useState(0);
  const [isPerforming, setIsPerforming] = useState(true); // Auto-start thanks to NPCs
  const [bannerImage, setBannerImage] = useState("https://images.unsplash.com/photo-1565058696803-12469eb70335?q=80&w=1000&auto=format&fit=crop");

  // Session Stats
  const [sessionAp, setSessionAp] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // Slots State
  const [leadEntertainer, setLeadEntertainer] = useState<string | null>(null);
  const [backupDancers, setBackupDancers] = useState<(Performer | null)[]>(NPC_DANCERS);
  
  // Audience State (Mix of player crew and NPCs)
  const [audience, setAudience] = useState<{id: string, name: string, seed: string, isPlayer: boolean, isVip?: boolean}[]>([]);
  
  // Performance Message
  const [performanceMessage, setPerformanceMessage] = useState("");
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Active Visual Effect & Cooldowns
  const [activeAnim, setActiveAnim] = useState<string | null>(null);
  const [isCoolingDown, setIsCoolingDown] = useState(false);

  const playerLeader = playerCrew.find(c => c.isLeader);

  // Initialize Audience with NPCs and Auto-Seat Player
  useEffect(() => {
      const initialCrowd = Array.from({ length: SEAT_COUNT }).map((_, i) => {
          // VIP slots are kept empty for high rollers or player initially
          if (VIP_SEAT_INDICES.includes(i)) return null; 
          
          // 40% chance of empty seat in regular, 60% NPC
          if (Math.random() > 0.4) {
              return {
                  id: `npc-${i}`,
                  name: 'Club Goer',
                  seed: `npc-club-${i}-${Math.random()}`,
                  isPlayer: false
              };
          }
          return null;
      });

      // Auto-seat Player if not already seated
      if (playerLeader) {
          // Find first empty non-VIP seat
          const seatIdx = initialCrowd.findIndex((s, i) => s === null && !VIP_SEAT_INDICES.includes(i));
          if (seatIdx !== -1) {
              initialCrowd[seatIdx] = {
                  id: playerLeader.id,
                  name: playerLeader.name,
                  seed: playerLeader.imageSeed.toString(),
                  isPlayer: true
              };
          }
      }

      setAudience(initialCrowd.map((c, i) => c || { id: `empty-${i}`, name: 'Empty', seed: '', isPlayer: false }));
  }, []); // Run once on mount

  // Focus input when editing starts
  useEffect(() => {
      if (isEditingMessage && messageInputRef.current) {
          messageInputRef.current.focus();
      }
  }, [isEditingMessage]);

  // Performance Timer & Logic
  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (isPerforming) {
          interval = setInterval(() => {
              
              let tickRate = 2; 
              let energyRate = 0.2; 

              if (leadEntertainer) {
                  const leader = playerCrew.find(c => c.id === leadEntertainer);
                  if (leader) {
                      const charisma = leader.stats.charisma || 1; 
                      const level = leader.level || 1;
                      tickRate += (charisma * 0.2) + (level * 0.1);
                      energyRate += (charisma * 0.05);
                  }
              }
              
              // Check if player is in VIP seat
              const playerSeatIdx = audience.findIndex(s => s.id === playerLeader?.id);
              const isVip = playerSeatIdx !== -1 && VIP_SEAT_INDICES.includes(playerSeatIdx);

              if (isVip) {
                  energyRate *= 2; // VIP Doubles gain
              }

              setBuffProgress(prev => {
                  const next = prev + tickRate;
                  if (next >= 100) return 0;
                  setSecondsRemaining(Math.ceil((100 - next) / tickRate));
                  return next;
              });

              onRestoreEnergy(energyRate);
              setSessionAp(prev => prev + energyRate);

          }, 1000);
      }
      return () => clearInterval(interval);
  }, [isPerforming, leadEntertainer, playerCrew, onRestoreEnergy, audience, playerLeader]);

  const handleSeatClick = (index: number) => {
      // Basic seat switching logic could go here
      // For now, seats are auto-assigned or VIP-purchased
  };

  const handleStageClick = (isLead: boolean) => {
      if (isLead) {
          if (leadEntertainer === playerLeader?.id) {
              // If already lead, toggle message edit
              setIsEditingMessage(true);
          } else if (playerLeader?.classType === ClassType.Entertainer) {
              // Take stage
              setLeadEntertainer(playerLeader.id);
              // Remove from audience if seated
              setAudience(prev => prev.map(s => s.id === playerLeader.id ? { ...s, id: `empty-${Math.random()}`, name: 'Empty', seed: '', isPlayer: false } : s));
          } else {
              alert("Only Entertainers can take the lead stage! You can watch from the lounge.");
          }
      }
  };

  const handleBackstageClick = () => {
      alert("SECURITY: Backstage access is restricted. Staff only.");
  };
  
  const handleVipClick = () => {
      if (!onAction || !playerLeader || isCoolingDown) return;
      
      // Check if already in VIP
      const currentSeatIdx = audience.findIndex(s => s.id === playerLeader.id);
      if (currentSeatIdx !== -1 && VIP_SEAT_INDICES.includes(currentSeatIdx)) {
          alert("You are already in the VIP section.");
          return;
      }

      // Check Funds
      if (money < 500) {
          alert("Insufficient funds for VIP Access (N$ 500)");
          return;
      }

      // Find empty VIP seat
      const vipSeatIdx = VIP_SEAT_INDICES.find(idx => !audience[idx].seed);
      
      if (vipSeatIdx === undefined) {
          alert("VIP Section is full!");
          return;
      }

      // Trigger Cooldown
      setIsCoolingDown(true);
      setTimeout(() => setIsCoolingDown(false), 3000);

      // Trigger Animation
      setActiveAnim('buy_vip');
      setTimeout(() => setActiveAnim(null), 4000); // 4s cinematic

      // Logic
      onAction('buy_vip', 500);
      
      // Move player
      const newAudience = [...audience];
      // Clear old seat
      if (currentSeatIdx !== -1) {
          newAudience[currentSeatIdx] = { id: `empty-${currentSeatIdx}`, name: 'Empty', seed: '', isPlayer: false };
      }
      // Occupy VIP
      newAudience[vipSeatIdx] = {
          id: playerLeader.id,
          name: playerLeader.name,
          seed: playerLeader.imageSeed.toString(),
          isPlayer: true,
          isVip: true
      };
      setAudience(newAudience);
  };

  const handleVisualAction = (action: string, cost: number) => {
      if (!onAction || isCoolingDown) return;
      if (money < cost) {
          alert("Insufficient funds to purchase item!");
          return;
      }
      
      // Trigger Cooldown
      setIsCoolingDown(true);
      setTimeout(() => setIsCoolingDown(false), 3000);

      setActiveAnim(action);
      
      // Duration varies by complexity
      const duration = action === 'buy_round' ? 3000 : 2000;
      setTimeout(() => setActiveAnim(null), duration);

      onAction(action, cost);
  };

  const getMember = (id: string | null) => playerCrew.find(c => c.id === id);
  const playerInVip = audience.some(s => s.id === playerLeader?.id && VIP_SEAT_INDICES.includes(audience.indexOf(s)));

  return (
    <div className="absolute inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center font-waze animate-fade-in p-8">
        
        {/* Main Window */}
        <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden flex flex-col max-h-full relative">
            
            {/* --- VIP OVERLAY (HOLLYWOOD STYLE) - NOW INSIDE --- */}
            {activeAnim === 'buy_vip' && (
                <div className="absolute inset-0 z-[100] bg-black pointer-events-none overflow-hidden flex flex-col items-center justify-end animate-fade-in rounded-2xl">
                    {/* Searchlights Background */}
                    <div className="absolute bottom-0 left-0 w-full h-full opacity-60">
                        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[150%] bg-gradient-to-t from-white/30 to-transparent origin-bottom animate-[sway_4s_infinite_ease-in-out] blur-xl" style={{ transform: 'rotate(15deg)' }}></div>
                        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[150%] bg-gradient-to-t from-yellow-100/30 to-transparent origin-bottom animate-[sway_5s_infinite_ease-in-out_reverse] blur-xl" style={{ transform: 'rotate(-15deg)' }}></div>
                    </div>
                    
                    {/* Red Carpet */}
                    <div className="absolute bottom-0 w-1/3 h-1/2 bg-red-700 transform perspective-500 rotate-x-60 origin-bottom shadow-[0_-20px_50px_rgba(255,0,0,0.5)] animate-slide-up"></div>
                    
                    {/* Text */}
                    <div className="absolute top-1/3 text-center animate-pop-in">
                        <h2 className="text-6xl font-black font-news text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-amber-600 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] mb-4">
                            VIP ACCESS
                        </h2>
                        <div className="text-xl font-bold text-white uppercase tracking-[0.5em] animate-pulse">Granted</div>
                    </div>
                </div>
            )}

            {/* --- CONFETTI OVERLAY (BUY ROUND) - NOW INSIDE --- */}
            {activeAnim === 'buy_round' && (
                <div className="absolute inset-0 z-[90] pointer-events-none overflow-hidden rounded-2xl">
                    {Array.from({ length: 60 }).map((_, i) => (
                        <div 
                            key={i}
                            className="absolute w-2 h-2 rounded-sm animate-rain-fall"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-${Math.random() * 20}%`,
                                backgroundColor: ['#f0abfc', '#fbbf24', '#34d399', '#60a5fa'][Math.floor(Math.random() * 4)],
                                animationDuration: `${1 + Math.random() * 2}s`,
                                animationDelay: `${Math.random() * 0.5}s`
                            }}
                        ></div>
                    ))}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 bg-white/90 px-8 py-4 rounded-full shadow-2xl border-4 border-amber-400 animate-bounce">
                        <div className="text-2xl font-black text-amber-600 uppercase tracking-widest text-center">
                            Drinks on the House!
                        </div>
                    </div>
                </div>
            )}

            {/* --- DRINK / COKE FLOAT ANIMATION - NOW INSIDE --- */}
            {(activeAnim === 'buy_drink' || activeAnim === 'buy_coke') && (
                <div className="absolute inset-0 z-[90] pointer-events-none flex items-center justify-center rounded-2xl">
                    <div className="text-8xl animate-float-up opacity-0 filter drop-shadow-2xl">
                        {activeAnim === 'buy_drink' ? '🥃' : '🧂'}
                    </div>
                </div>
            )}

            {/* TOP BANNER AREA */}
            <div className="relative w-full h-[180px] bg-slate-100 flex-shrink-0 group overflow-hidden border-b-4 border-fuchsia-500">
                <SafeImage 
                    src={bannerImage}
                    alt="Stage Banner"
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                    fallbackColorClass="bg-fuchsia-900"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-fuchsia-500/10 to-transparent"></div>

                <div className="absolute bottom-4 left-8">
                    <h1 className="text-4xl font-black font-news text-slate-900 uppercase tracking-tighter mb-1 drop-shadow-sm">
                        THE NEON STAGE
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-700 bg-fuchsia-50 px-2 py-1 rounded border border-fuchsia-200">
                            Entertainment Hub
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white/80 px-2 py-1 rounded border border-slate-200">
                            Capacity: {SEAT_COUNT}
                        </span>
                    </div>
                </div>

                {/* Session Stats */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-4">
                    <div className="bg-slate-900/90 text-white px-4 py-2 rounded-lg border border-slate-700 shadow-lg text-center backdrop-blur-md">
                        <div className="text-[9px] font-black uppercase text-amber-500 tracking-widest">Next Hype</div>
                        <div className="text-xl font-mono font-bold leading-none">{isPerforming ? `${secondsRemaining}s` : '--'}</div>
                    </div>
                    <div className="bg-emerald-900/90 text-white px-4 py-2 rounded-lg border border-emerald-700 shadow-lg text-center backdrop-blur-md">
                        <div className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">AP Restored</div>
                        <div className="text-xl font-mono font-bold leading-none">+{sessionAp.toFixed(1)}</div>
                    </div>
                </div>

                <button 
                    onClick={handleBackstageClick}
                    className="absolute top-4 right-16 bg-white/90 hover:bg-red-50 text-slate-800 hover:text-red-600 border border-slate-300 hover:border-red-300 rounded px-4 py-2 text-xs font-black uppercase tracking-widest shadow-sm transition-all flex items-center gap-2 backdrop-blur-sm z-20"
                >
                    <span>🚫 Backstage</span>
                </button>

                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 bg-white text-slate-500 rounded-full flex items-center justify-center font-bold border border-slate-300 hover:bg-slate-100 transition-all z-20 shadow-sm"
                >
                    ✕
                </button>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-grow w-full flex flex-col p-6 gap-6 overflow-y-auto custom-scrollbar bg-slate-50">
                
                {/* STAGE CONTAINER */}
                <div className="flex justify-center w-full max-w-5xl mx-auto">
                    <div className="relative bg-white border-2 border-fuchsia-200 rounded-3xl px-12 py-8 shadow-sm flex items-end gap-8 w-full justify-center max-w-3xl">
                        <div className="absolute inset-0 pattern-deco opacity-20 pointer-events-none rounded-3xl"></div>

                        {/* Backup Dancers Left */}
                        <div className="flex gap-4 mb-2">
                            {[0, 1].map(i => {
                                const dancer = backupDancers[i];
                                return (
                                    <div key={`backup-l-${i}`} className={`w-14 h-14 rounded-full border-2 border-dashed ${dancer ? 'border-fuchsia-400 bg-fuchsia-50' : 'border-slate-300 bg-slate-50'} flex items-center justify-center relative group shadow-inner overflow-hidden`}>
                                        {dancer && (
                                            <div className="w-full h-full relative">
                                                <AvatarDisplay 
                                                    seed={dancer.seed}
                                                    role="dancer"
                                                    className="w-full h-full opacity-80"
                                                />
                                                {isPerforming && <div className="absolute inset-0 flex items-center justify-center text-xl animate-bounce">💃</div>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* LEAD ENTERTAINER */}
                        <div onClick={() => handleStageClick(true)} className="relative -mt-8 mx-4 group cursor-pointer">
                            {/* Message Bubble */}
                            {performanceMessage && !isEditingMessage && (
                                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white border-2 border-slate-900 px-4 py-2 rounded-xl shadow-lg z-30 whitespace-nowrap animate-pop-in">
                                    <div className="text-xs font-black uppercase text-slate-900 max-w-[150px] truncate">"{performanceMessage}"</div>
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-slate-900 transform rotate-45"></div>
                                </div>
                            )}

                            {/* Message Input */}
                            {isEditingMessage && (
                                <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-30">
                                    <input 
                                        ref={messageInputRef}
                                        type="text" 
                                        maxLength={20}
                                        value={performanceMessage}
                                        onChange={(e) => setPerformanceMessage(e.target.value)}
                                        onBlur={() => setIsEditingMessage(false)}
                                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingMessage(false)}
                                        className="bg-white border-2 border-amber-500 rounded px-2 py-1 text-xs font-bold text-center shadow-lg w-32 outline-none"
                                        placeholder="Shout something!"
                                    />
                                </div>
                            )}

                            <div className={`w-28 h-28 rounded-full border-4 shadow-lg flex items-center justify-center relative z-10 transition-all bg-white overflow-hidden ${leadEntertainer ? 'border-fuchsia-500' : 'border-fuchsia-200 border-dashed hover:border-fuchsia-400'}`}>
                                {leadEntertainer ? (
                                    <AvatarDisplay 
                                        seed={getMember(leadEntertainer)?.imageSeed.toString() || ''}
                                        role={getMember(leadEntertainer)?.classType}
                                        className="w-full h-full"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center text-fuchsia-300">
                                        <span className="text-3xl">🎤</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest mt-1">Lead</span>
                                    </div>
                                )}
                            </div>
                            
                            {leadEntertainer ? (
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-lg border border-slate-700 whitespace-nowrap z-20">
                                    {getMember(leadEntertainer)?.name}
                                </div>
                            ) : (
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-slate-400 text-[8px] font-bold uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                    Entertainers Only
                                </div>
                            )}
                        </div>

                        {/* Backup Dancers Right */}
                        <div className="flex gap-4 mb-2">
                            {[2, 3].map(i => {
                                const dancer = backupDancers[i];
                                return (
                                    <div key={`backup-r-${i}`} className={`w-14 h-14 rounded-full border-2 border-dashed ${dancer ? 'border-fuchsia-400 bg-fuchsia-50' : 'border-slate-300 bg-slate-50'} flex items-center justify-center relative group shadow-inner overflow-hidden`}>
                                        {dancer && (
                                            <div className="w-full h-full relative">
                                                <AvatarDisplay 
                                                    seed={dancer.seed}
                                                    role="dancer"
                                                    className="w-full h-full opacity-80 transform -scale-x-100"
                                                />
                                                {isPerforming && <div className="absolute inset-0 flex items-center justify-center text-xl animate-bounce" style={{ animationDelay: '0.2s' }}>💃</div>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* CONTROLS & BUFF BAR */}
                <div className="flex flex-col items-center gap-4 relative z-20">
                    <div className="w-full max-w-lg bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                            <span>Crowd Hype</span>
                            <span className={buffProgress >= 90 ? "text-emerald-600" : "text-slate-700"}>{Math.floor(buffProgress)}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
                            <div className="h-full bg-gradient-to-r from-fuchsia-400 to-purple-500 transition-all duration-1000 ease-linear" style={{ width: `${buffProgress}%` }}>
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AUDIENCE FLOOR */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <div className="text-center mb-4 flex justify-between items-center border-b border-slate-100 pb-2">
                        <h3 className="text-sm font-black font-news text-slate-800 uppercase tracking-widest">Lounge & VIP</h3>
                        <div className="text-[9px] text-slate-400 font-bold uppercase">Occupancy: {Math.floor((audience.filter(a => a.seed !== '').length / SEAT_COUNT) * 100)}%</div>
                    </div>

                    <div className="grid grid-cols-10 gap-2">
                        {audience.map((seat, idx) => {
                            const isVipSeat = VIP_SEAT_INDICES.includes(idx);
                            
                            return (
                                <div 
                                    key={`seat-${idx}`}
                                    onClick={() => handleSeatClick(idx)}
                                    className={`
                                        aspect-square rounded-lg border flex flex-col items-center justify-center relative transition-all cursor-pointer hover:shadow-md
                                        ${seat.seed 
                                            ? (seat.isPlayer ? 'bg-amber-50 border-amber-300' : isVipSeat ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200') 
                                            : isVipSeat ? 'bg-amber-50/30 border-dashed border-amber-200 hover:border-amber-300' : 'bg-slate-50/50 border-dashed border-slate-200 hover:border-slate-300'
                                        }
                                        ${isVipSeat && !seat.seed ? 'hover:bg-amber-100' : ''}
                                    `}
                                >
                                    {isVipSeat && (
                                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[6px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm z-10">VIP</div>
                                    )}

                                    {seat.seed ? (
                                        <>
                                            <div className={`w-8 h-8 rounded-full overflow-hidden ${seat.isPlayer ? 'ring-2 ring-emerald-400' : isVipSeat ? 'ring-2 ring-amber-200' : 'grayscale opacity-80'}`}>
                                                <AvatarDisplay 
                                                    seed={seat.seed}
                                                    role="patron"
                                                    className="w-full h-full"
                                                />
                                            </div>
                                            {isPerforming && (
                                                <div className="absolute -top-1 -right-1 text-[10px] animate-bounce" style={{ animationDelay: `${Math.random()}s` }}>
                                                    🎶
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className={`text-[8px] font-bold opacity-0 group-hover:opacity-100 ${isVipSeat ? 'text-amber-400' : 'text-slate-300'}`}>Sit</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* ACTION FOOTER */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center gap-4">
                
                {/* Money Display */}
                <div className="flex flex-col bg-slate-200 px-4 py-2 rounded-lg border border-slate-300 shadow-inner">
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Wallet</span>
                    <span className="text-lg font-mono font-black text-emerald-600">N$ {money.toLocaleString()}</span>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={() => handleVisualAction('buy_drink', 20)}
                        disabled={isCoolingDown}
                        className={`flex flex-col items-center justify-center px-4 py-2 bg-white border-2 border-slate-300 rounded-lg transition-all active:translate-y-0.5 ${isCoolingDown ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'hover:border-fuchsia-400 hover:shadow-md'}`}
                    >
                        <span className="text-xl">🥃</span>
                        <span className="text-[9px] font-black uppercase text-slate-700">Buy Drink</span>
                        <span className="text-[9px] font-mono text-emerald-600 font-bold">N$ 20</span>
                    </button>

                    <button 
                        onClick={() => handleVisualAction('buy_coke', 100)}
                        disabled={isCoolingDown}
                        className={`flex flex-col items-center justify-center px-4 py-2 bg-white border-2 border-slate-300 rounded-lg transition-all active:translate-y-0.5 ${isCoolingDown ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'hover:border-fuchsia-400 hover:shadow-md'}`}
                    >
                        <span className="text-xl">🧂</span>
                        <span className="text-[9px] font-black uppercase text-slate-700">Party Favor</span>
                        <span className="text-[9px] font-mono text-emerald-600 font-bold">N$ 100</span>
                    </button>

                    <button 
                        onClick={handleVipClick}
                        disabled={playerInVip || isCoolingDown}
                        className={`flex flex-col items-center justify-center px-4 py-2 border-2 rounded-lg transition-all active:translate-y-0.5
                            ${playerInVip 
                                ? 'bg-amber-100 border-amber-300 cursor-default' 
                                : isCoolingDown 
                                    ? 'bg-slate-200 border-slate-300 opacity-60 cursor-not-allowed'
                                    : 'bg-gradient-to-b from-amber-50 to-amber-100 border-amber-400 hover:shadow-lg cursor-pointer'
                            }
                        `}
                    >
                        <span className="text-xl">👑</span>
                        <span className="text-[9px] font-black uppercase text-amber-800">{playerInVip ? 'VIP Access' : 'Buy VIP'}</span>
                        <span className="text-[9px] font-mono text-amber-900 font-bold">N$ 500</span>
                    </button>

                    <button 
                        onClick={() => handleVisualAction('buy_round', 1000)}
                        disabled={isCoolingDown}
                        className={`flex flex-col items-center justify-center px-4 py-2 bg-slate-800 border-2 border-slate-900 rounded-lg transition-all active:translate-y-0.5 ${isCoolingDown ? 'opacity-60 cursor-not-allowed' : 'hover:bg-slate-700 hover:shadow-lg'}`}
                    >
                        <span className="text-xl">🥂</span>
                        <span className="text-[9px] font-black uppercase text-white">Buy Round</span>
                        <span className="text-[9px] font-mono text-emerald-400 font-bold">N$ 1000</span>
                    </button>
                </div>
            </div>

        </div>
    </div>
  );
};

export default Nightclub;
