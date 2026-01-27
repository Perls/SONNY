
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Holding, Tag, TaggingOperation, CrewMember, MapTagData, ClassType } from '../types';
import PayphoneInterface from './PayphoneInterface';
import { useGameEngine } from '../contexts/GameEngineContext';
import { getBlockHeat } from '../utils/mapUtils';
import AvatarDisplay from './AvatarDisplay';
import { ConnectionProfile } from '../data/connectionData';

interface BlockMenuProps {
  x: number;
  y: number;
  playerGridPos: { x: number, y: number }; 
  ownedHoldings: Holding[]; 
  potentialBuildings: any[]; 
  money: number;
  onClose: () => void;
  onBuy: (holding: Holding) => void;
  onUpgrade: (holdingId: string, cost: number) => void;
  onVisit?: (landmarkId: string) => void;
  onTravel: (x: number, y: number) => void;
  
  // Controlled Position Props
  offset: { x: number, y: number };
  onOffsetChange: (offset: { x: number, y: number }) => void;
  
  // New Props
  onCancelTravel?: () => void;
  isTravelingToTarget?: boolean;
  playerTags: Tag[];
  activeOperations: TaggingOperation[];
  mapTags: MapTagData;
  crew: CrewMember[];
  onStartTagging: (x: number, y: number, slotIndex: number, tagId: string) => void;
  onStartErasing: (x: number, y: number, slotIndex: number) => void;
  onUsePayphone: (amount: number) => void;
  onEnterBuilding: (building: any, isOwned: boolean) => void;
  
  // Quest Props
  activeQuestConnection?: ConnectionProfile | null;
  onTriggerEvent?: (eventId: string) => void;
}

const ShineOverlay = () => (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-lg">
        <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] animate-sheen"></div>
    </div>
);

// Helper for deterministic randomness (Same as TenementInterior)
const hashCode = (str: string) => {
    if (!str) return 0;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
};

const getTenementSize = (seed: string) => {
    const hash = hashCode(seed);
    const roll = hash % 100;
    if (roll < 50) return 'Small';
    if (roll < 85) return 'Medium';
    return 'Large';
};

// --- STAT ICON COMPONENT ---
interface StatIconProps { 
    type: 'tax' | 'heat' | 'pop' | 'stab' | 'dmg';
    value: string; 
    rawValue: number;
    onHover: (e: React.MouseEvent, label: string, math: string) => void;
    onLeave: () => void;
}

const StatIcon = ({ type, value, rawValue, onHover, onLeave }: StatIconProps) => {
    let icon = '';
    let colorClass = '';
    let animClass = '';
    let label = '';
    let mathDescription = '';

    // Logic for Great (Green), Good (Gray), Bad (Red)
    if (type === 'tax') {
        label = "Estimated Revenue";
        mathDescription = "**Formula:** Sum of all active income streams.\n• **Commercial:** High Yield Tax\n• **Residential:** Rent Collection";
        if (rawValue > 1000) {
            icon = '💎'; colorClass = 'text-emerald-500'; animClass = 'animate-pulse';
        } else if (rawValue > 500) {
            icon = '💰'; colorClass = 'text-slate-500';
        } else {
            icon = '🪙'; colorClass = 'text-red-500';
        }
    } else if (type === 'heat') {
        label = "Police Heat";
        mathDescription = "**Formula:** Local Crime Rate + Player Actions.\n• **Recent Crimes:** Low\n• **Police Presence:** Minimal";
        // Lower is better for Heat
        if (rawValue < 20) {
            icon = '😎'; colorClass = 'text-emerald-500';
        } else if (rawValue < 60) {
            icon = '😰'; colorClass = 'text-slate-500';
        } else {
            icon = '🚓'; colorClass = 'text-red-500'; animClass = 'animate-bounce';
        }
    } else if (type === 'pop') {
        label = "Population Density";
        mathDescription = "**Formula:** Building Count x 150 (Base).\n• **Recruitment:** High Availability\n• **Foot Traffic:** Busy";
        if (rawValue > 1000) {
            icon = '🏙️'; colorClass = 'text-emerald-500';
        } else if (rawValue > 500) {
            icon = '🏠'; colorClass = 'text-slate-500';
        } else {
            icon = '⛺'; colorClass = 'text-red-500';
        }
    } else if (type === 'stab') {
        label = "Social Stability";
        mathDescription = "**Formula:** 100 - (Crime Rate / Services).\n• **Civil Order:** Stable\n• **Public Services:** Active";
        if (rawValue > 80) {
            icon = '🛡️'; colorClass = 'text-emerald-500';
        } else if (rawValue > 50) {
            icon = '🧱'; colorClass = 'text-slate-500';
        } else {
            icon = '🚧'; colorClass = 'text-red-500';
        }
    } else if (type === 'dmg') {
        label = "Infrastructure Damage";
        mathDescription = "**Formula:** Recent Combat Impact.\n• **Structural Integrity:** 100%\n• **Repairs Needed:** None";
        // Lower is better (0 is Great)
        if (rawValue === 0) {
            icon = '💖'; colorClass = 'text-emerald-500'; animClass = 'animate-pulse';
        } else if (rawValue < 50) {
            icon = '❤️'; colorClass = 'text-slate-500';
        } else {
            icon = '💔'; colorClass = 'text-red-500'; animClass = 'animate-shake';
        }
    }

    return (
        <div 
            className="flex flex-col items-center justify-center p-2 group cursor-help relative"
            onMouseEnter={(e) => onHover(e, label, mathDescription)}
            onMouseLeave={onLeave}
        >
             <div className={`text-4xl mb-1 filter drop-shadow-sm transition-transform group-hover:scale-110 ${animClass}`}>
                {icon}
             </div>
             <div className={`text-xs font-black uppercase ${colorClass}`}>
                {value}
             </div>
        </div>
    );
};

const BlockMenu: React.FC<BlockMenuProps> = ({ 
    x, y, playerGridPos, ownedHoldings, potentialBuildings, money, 
    onClose, onBuy, onUpgrade, onVisit, onTravel,
    offset, onOffsetChange, onCancelTravel, isTravelingToTarget,
    playerTags, activeOperations, mapTags, crew, onStartTagging, onStartErasing,
    onUsePayphone, onEnterBuilding,
    activeQuestConnection, onTriggerEvent
}) => {
  const { handleStartErasing, handleClaimCorner, handleEstablishProtection, gameState, setIsHousingOpen, handleSetSafehouse } = useGameEngine();
  
  const [menuOffset, setMenuOffset] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);
  const startOffsetRef = useRef({ x: 0, y: 0 });
  
  const [loadingTravel, setLoadingTravel] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedSlotForTagging, setSelectedSlotForTagging] = useState<number | null>(null);
  const [viewTagSlot, setViewTagSlot] = useState<number | null>(null); 
  const [activePayphone, setActivePayphone] = useState(false);
  const [now, setNow] = useState(Date.now()); 
  const [confirmingSlot, setConfirmingSlot] = useState<number | null>(null);
  
  // Tooltip State
  const [hoveredStat, setHoveredStat] = useState<{ label: string, math: string, rect: DOMRect } | null>(null);

  useEffect(() => {
      const timer = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(timer);
  }, []);

  const isAtLocation = Math.floor(playerGridPos.x) === x && Math.floor(playerGridPos.y) === y;
  const distBlocks = Math.abs(Math.floor(playerGridPos.x) - x) + Math.abs(Math.floor(playerGridPos.y) - y);

  // NO-GO CHECK
  const isAvoided = gameState?.avoidedAreas?.some(a => a.x === x && a.y === y);

  const buildingCount = potentialBuildings.length;
  const landmarkCount = potentialBuildings.filter(b => b.type === 'landmark').length;

  const housing = gameState?.playerHousing;
  const isPlayerHousingHere = housing && housing.location.x === x && housing.location.y === y;
  
  // Safehouse Display Logic
  let housingDisplayName = housing?.name || 'Safehouse';
  let housingSubtitle = 'Player Safehouse';

  // Attempt to find the corresponding holding to get unit details (if apartment)
  const safehouseHolding = ownedHoldings.find(h => 
      h.ownerFaction === 'player' &&
      h.type === 'residential' && 
      (h.unitId || h.name === housing?.name)
  );

  if (safehouseHolding?.unitId) {
      housingDisplayName = `Apartment ${safehouseHolding.unitId}`;
      housingSubtitle = 'Player Safehouse';
  } else if (housingDisplayName.includes(' - ')) {
      // Fallback for names like "Tenement 13-2 - Apt 3A"
      const parts = housingDisplayName.split(' - ');
      housingDisplayName = parts[1]; // "Apt 3A"
  }

  // --- STATS CALCULATION ---
  const totalIncome = potentialBuildings.reduce((acc, b) => acc + (b.income || 0), 0);
  
  // Deterministic "Random" Stats based on coords
  const seedVal = (x * 13 + y * 7);
  
  // USE NEW HEAT LOGIC
  const heatVal = getBlockHeat(x, y);

  const popVal = buildingCount * 150 + (seedVal % 500);
  const stabVal = 100 - (seedVal % 40);
  const dmgVal = (seedVal % 10) === 0 ? 60 : (seedVal % 3) === 0 ? 20 : 0; // Occasional damage

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (!isDraggingRef.current || !dragStartRef.current) return;
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        onOffsetChange({
            x: startOffsetRef.current.x + dx,
            y: startOffsetRef.current.y + dy
        });
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
        dragStartRef.current = null;
    };

    if (isDraggingRef.current) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }
    window.addEventListener('mouseup', handleMouseUp); 

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [onOffsetChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;
      
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      startOffsetRef.current = offset;
  };

  const handleTravelClick = () => {
      onTravel(x, y); 
      setLoadingTravel(true);
      timeoutRef.current = setTimeout(() => {
          setLoadingTravel(false);
      }, 2000);
  };

  const handleTagSlotClick = (slotIdx: number) => {
      setViewTagSlot(slotIdx);
  };

  const initiateTagging = () => {
      if (!isAtLocation) {
          alert("Must be at location to tag.");
          return;
      }
      const availableMinions = crew.filter(c => !c.isLeader);
      if (availableMinions.length === 0) {
          alert("You need crew members (soldiers) to tag blocks. Recruit someone first.");
          return;
      }
      
      if (viewTagSlot !== null) {
          const op = activeOperations.find(o => o.x === x && o.y === y && o.slotIndex === viewTagSlot);
          if (op) {
              alert("Operation already in progress.");
              return;
          }
          
          setSelectedSlotForTagging(viewTagSlot);
          setViewTagSlot(null); 
      }
  };

  const initiateErasing = () => {
      if (!isAtLocation) {
          alert("Must be at location to erase.");
          return;
      }
      const availableMinions = crew.filter(c => !c.isLeader);
      if (availableMinions.length === 0) {
          alert("You need crew members to clean up blocks.");
          return;
      }
      
      const op = activeOperations.find(o => o.x === x && o.y === y && o.slotIndex === viewTagSlot);
      if (op) {
          alert("Operation already in progress.");
          return;
      }

      if (viewTagSlot !== null) {
          onStartErasing(x, y, viewTagSlot);
          setViewTagSlot(null);
      }
  };

  const confirmTagging = (tagId: string) => {
      if (selectedSlotForTagging !== null) {
          onStartTagging(x, y, selectedSlotForTagging, tagId);
          setSelectedSlotForTagging(null);
      }
  };

  const handleClaim = () => {
      handleClaimCorner(x, y);
      setViewTagSlot(null);
  };

  const handleProtect = () => {
      handleEstablishProtection(x, y);
      setViewTagSlot(null);
  };

  const handleStatHover = (e: React.MouseEvent, label: string, math: string) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setHoveredStat({ label, math, rect });
  };

  const handleStatLeave = () => {
      setHoveredStat(null);
  };

  // Helper to render formatted text with bolding and bullets
  const renderFormattedText = (text: string) => {
      return text.split('\n').map((line, i) => (
          <div key={i} className={line.startsWith('•') ? "ml-2 mb-0.5" : "mb-1"}>
              {line.split('**').map((part, j) => 
                  j % 2 === 1 ? <span key={j} className="font-bold text-amber-400">{part}</span> : part
              )}
          </div>
      ));
  };

  const hasCrew = crew.some(c => !c.isLeader);
  const isDealer = crew.find(c => c.isLeader)?.classType === ClassType.Dealer;
  const isThug = crew.find(c => c.isLeader)?.classType === ClassType.Thug;
  const hasPlayerTags = [...Array(10)].some((_, i) => mapTags[`${x},${y},${i}`]?.id);
  const isCornerClaimed = ownedHoldings.some(h => h.type === 'corner');
  const isProtectionClaimed = ownedHoldings.some(h => h.type === 'protection_racket');

  return (
    <>
    <style>{`
        @keyframes sheen {
            0% { transform: translateX(0%); }
            100% { transform: translateX(350%); }
        }
        .animate-sheen {
            animation: sheen 1.5s ease-in-out forwards;
        }
    `}</style>
    {activePayphone && (
        <PayphoneInterface 
            onClose={() => setActivePayphone(false)} 
            money={money}
            onCharge={onUsePayphone}
        />
    )}
    <div 
        className={`absolute z-50 transition-shadow duration-300 origin-bottom-left`}
        style={{ 
            left: '24px', 
            bottom: '24px',
            transform: `translate(${offset.x}px, ${offset.y}px)`
        }} 
        onWheel={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
    >
        <div className={`bg-white rounded-2xl shadow-2xl border-2 border-slate-200 w-[540px] overflow-hidden relative flex flex-col max-h-[810px] animate-pop-in`}>
            {/* ... header and stats (same as before) ... */}
            <button 
                onClick={onClose} 
                className="absolute top-2 right-2 w-6 h-6 bg-slate-100 rounded-full text-slate-500 hover:bg-red-50 hover:text-white font-bold flex items-center justify-center transition-colors z-20"
            >
                ✕
            </button>

            <div 
                onMouseDown={handleMouseDown}
                className="p-4 pb-4 bg-slate-50 border-b border-slate-200 relative z-10 flex-shrink-0 cursor-move select-none flex justify-between items-start"
            >
                <div>
                    <h3 className="font-black font-news uppercase text-2xl leading-none relative z-10 text-slate-800">
                        Block {x}-{y}
                    </h3>
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1 relative z-10 text-amber-600 flex items-center gap-2">
                        <span>{buildingCount} Buildings</span>
                        <span className="text-slate-300">•</span>
                        <span>{landmarkCount > 0 ? `Landmark Present` : 'No Landmarks'}</span>
                    </div>
                </div>

                {!isAtLocation && (
                    (() => {
                        if (isAvoided) {
                            return (
                                <button
                                    disabled
                                    className="bg-red-900 text-red-500 border border-red-800 px-4 py-2 rounded-lg font-black uppercase tracking-widest text-[10px] cursor-not-allowed shadow-inner flex flex-col items-center leading-none gap-1 mr-6 min-w-[100px]"
                                >
                                    <span>⛔ NO-GO ZONE</span>
                                    <span className="opacity-50 font-mono">Restricted</span>
                                </button>
                            );
                        }

                        if (loadingTravel) {
                            return (
                                <button
                                    disabled
                                    className="bg-slate-300 text-slate-500 px-4 py-3 rounded-lg font-black uppercase tracking-widest text-[10px] cursor-wait shadow-inner flex items-center justify-center gap-2 mr-6 min-w-[100px]"
                                >
                                    <svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </button>
                            );
                        }
                        if (isTravelingToTarget && onCancelTravel) {
                            return (
                                <button
                                    onClick={onCancelTravel}
                                    className="bg-red-600 text-white px-4 py-3 rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all shadow-lg flex items-center justify-center gap-2 mr-6 min-w-[100px]"
                                >
                                    CANCEL
                                </button>
                            );
                        }
                        return (
                            <button
                                onClick={handleTravelClick}
                                className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-amber-500 hover:text-slate-900 transition-all shadow-lg flex flex-col items-center leading-none gap-1 mr-6 min-w-[100px]"
                            >
                                <span>Travel Here</span>
                                <span className="opacity-70 font-mono text-amber-400">{distBlocks} AP Cost</span>
                            </button>
                        );
                    })()
                )}
                {isAtLocation && (
                    <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded border border-emerald-200 font-bold text-[10px] uppercase tracking-widest mr-6 animate-pulse">
                        Current Location
                    </div>
                )}
            </div>

            {/* UPGRADED STATS GRID */}
            <div className="grid grid-cols-5 divide-x divide-slate-100 border-b border-slate-200 bg-white">
                <StatIcon type="tax" rawValue={totalIncome} value={`N$ ${(totalIncome/1000).toFixed(1)}k`} onHover={handleStatHover} onLeave={handleStatLeave} />
                <StatIcon type="heat" rawValue={heatVal} value={heatVal < 20 ? "Low" : heatVal < 60 ? "Med" : "High"} onHover={handleStatHover} onLeave={handleStatLeave} />
                <StatIcon type="pop" rawValue={popVal} value={`${(popVal/1000).toFixed(1)}k`} onHover={handleStatHover} onLeave={handleStatLeave} />
                <StatIcon type="stab" rawValue={stabVal} value={`${stabVal}%`} onHover={handleStatHover} onLeave={handleStatLeave} />
                <StatIcon type="dmg" rawValue={dmgVal} value={dmgVal === 0 ? "None" : dmgVal < 50 ? "Low" : "Crit"} onHover={handleStatHover} onLeave={handleStatLeave} />
            </div>

            {/* GRAFFITI TAG STRIP */}
            <div className="h-[220px] w-full bg-slate-100 border-b border-slate-200 grid grid-cols-5 grid-rows-2 relative overflow-hidden shadow-inner p-2 gap-2">
                <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/concrete-wall.png")' }}></div>
                
                {[...Array(10)].map((_, i) => {
                    const activeOp = activeOperations.find(o => o.x === x && o.y === y && o.slotIndex === i);
                    const tagData = mapTags[`${x},${y},${i}`];
                    const hasTag = !activeOp && !tagData && (x * 13 + y * 7 + i) % 4 === 0; 
                    const colors = ['text-red-600', 'text-blue-600', 'text-emerald-600', 'text-purple-600', 'text-amber-600', 'text-pink-600'];
                    const tagColor = colors[(x + y + i) % colors.length];
                    const rotation = ((x * i * 7) % 30) - 15;
                    const tagText = ['KING', 'BOSS', 'OWN', 'RUN', 'NYC', 'WAR'][((x+i)%6)];
                    
                    let timeLeft = 0;
                    if (activeOp) {
                        timeLeft = Math.max(0, Math.ceil((activeOp.duration - (now - activeOp.startTime)) / 1000));
                    }
                    
                    return (
                        <div 
                            key={i} 
                            onClick={() => handleTagSlotClick(i)}
                            className={`
                                flex items-center justify-center relative group w-full h-full bg-slate-200/50 rounded-lg border-4 border-dashed border-slate-300
                                ${isAtLocation ? 'cursor-pointer hover:bg-white hover:border-slate-400 hover:shadow-md' : ''}
                            `}
                            title={isAtLocation ? "Inspect Tag" : ""}
                        >
                            {activeOp ? (
                                <div className="text-amber-600 font-mono font-black text-xs animate-pulse bg-amber-100 px-2 py-1 rounded border border-amber-200">
                                    {timeLeft}s
                                </div>
                            ) : tagData ? (
                                <img src={tagData.dataUri} className="w-full h-full object-cover rendering-pixelated opacity-90 rounded-md" alt="Player Tag" />
                            ) : hasTag ? (
                                <span 
                                    className={`text-xl font-black font-news uppercase ${tagColor} opacity-90 drop-shadow-md transform scale-150`}
                                    style={{ transform: `rotate(${rotation}deg) scale(1.5)` }}
                                >
                                    {tagText}
                                </span>
                            ) : (
                                <span className="text-xs text-slate-400 opacity-50 group-hover:opacity-100 transition-opacity font-bold uppercase tracking-wide">
                                    Empty
                                </span>
                            )}
                            <div className="absolute top-1 right-1 text-[8px] text-slate-400 font-bold opacity-50">{i+1}</div>
                        </div>
                    );
                })}
                <div className="absolute bottom-1 right-2 text-[8px] font-black text-slate-400 uppercase tracking-widest pointer-events-none opacity-50">
                    Block Tags
                </div>
            </div>

            {/* List Body */}
            <div className="p-4 bg-slate-100 overflow-y-auto custom-scrollbar flex-grow space-y-3">
                
                {/* ACTIVE QUEST SECTION - NEW */}
                {activeQuestConnection && (
                    <div className="rounded-xl border-2 p-4 transition-all bg-amber-50 border-amber-500 shadow-md relative overflow-hidden group">
                         {/* Shine Effect */}
                         <div className="absolute inset-0 bg-white/40 pointer-events-none skew-x-[-20deg] w-[150%] left-[-150%] animate-sheen"></div>
                         
                         <div className="flex items-center gap-4 relative z-10">
                             <div className="w-16 h-16 rounded-full border-4 border-white bg-slate-200 shadow-md overflow-hidden shrink-0">
                                 <AvatarDisplay seed={activeQuestConnection.avatarSeed} className="w-full h-full" />
                             </div>
                             <div className="flex-grow min-w-0">
                                 <div className="flex items-center gap-2 mb-1">
                                     <span className="text-[9px] font-black text-white bg-amber-600 px-2 py-0.5 rounded uppercase shadow-sm">Event Available</span>
                                     <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wide">Meeting Ready</span>
                                 </div>
                                 <h4 className="font-black text-slate-900 uppercase text-lg leading-none mb-1">{activeQuestConnection.name}</h4>
                                 <div className="text-xs text-slate-600 font-medium italic truncate">"{activeQuestConnection.role}"</div>
                             </div>
                             
                             <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(onTriggerEvent && activeQuestConnection.eventId) {
                                        onTriggerEvent(activeQuestConnection.eventId);
                                    }
                                }}
                                disabled={!isAtLocation}
                                className={`px-6 py-3 rounded-lg font-black uppercase tracking-widest text-[10px] shadow-lg transition-all transform hover:-translate-y-1 active:translate-y-0 z-50
                                    ${isAtLocation 
                                        ? 'bg-amber-600 text-white hover:bg-amber-500 border-b-4 border-amber-800 active:border-b-0' 
                                        : 'bg-slate-300 text-slate-500 cursor-not-allowed border-b-4 border-slate-400'}
                                `}
                             >
                                {isAtLocation ? 'Meet Contact' : 'Travel First'}
                             </button>
                         </div>
                    </div>
                )}

                {isPlayerHousingHere && (
                    <div className="rounded-xl border-2 p-4 transition-all bg-white border-amber-500 shadow-md">
                        <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-3xl shadow-sm border-2 relative bg-amber-100 text-amber-600 border-amber-200">
                                🏠
                            </div>
                            <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-sm text-slate-800 truncate">{housingDisplayName}</h4>
                                    <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-1.5 rounded uppercase">Your Property</span>
                                </div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">{housingSubtitle}</div>
                            </div>
                        </div>
                        <div className="mt-3 border-t border-slate-100 pt-2">
                            <button
                                onClick={() => { onClose(); setIsHousingOpen(true); }}
                                disabled={!isAtLocation}
                                className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 border-b-2
                                    ${isAtLocation 
                                        ? `bg-slate-900 border-slate-950 text-amber-500 hover:bg-slate-700 hover:text-white hover:-translate-y-0.5 shadow-md active:translate-y-0 active:border-b-0`
                                        : 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                                    }
                                `}
                            >
                                <span>🔑 Enter {housingDisplayName}</span>
                            </button>
                        </div>
                    </div>
                )}

                {potentialBuildings.map((building, idx) => {
                    // Check for ANY holding in this slot (could be building OR apartment)
                    const slotHoldings = ownedHoldings.filter(h => h.slotIndex === building.slotIndex);
                    // Determine if the player owns the BUILDING (no unitId) or just a UNIT (unitId present)
                    const isBuildingOwner = slotHoldings.some(h => !h.unitId);
                    const isUnitOwner = slotHoldings.some(h => !!h.unitId);
                    
                    // Owned logic for UI: True if any holding exists here
                    const owned = slotHoldings.length > 0 ? slotHoldings[0] : undefined; 
                    
                    // Sum income from all holdings in this slot (e.g. multiple apartments)
                    const slotIncome = slotHoldings.reduce((acc, h) => acc + h.income, 0);

                    const isLandmark = building.type === 'landmark';
                    const isPayphone = building.type === 'payphone';
                    const isEnterableGeneric = building.type === 'residential' || building.type === 'commercial' || building.type === 'industrial' || building.type === 'office' || building.type === 'medical';
                    const upgradeCost = owned ? owned.cost * (owned.level + 1) : 0;
                    const isThisBuildingSafehouse = isPlayerHousingHere && gameState?.playerHousing?.name === building.name;
                    const isConfirming = confirmingSlot === building.slotIndex;
                    
                    // Determine Size if Residential
                    let sizeLabel = '';
                    if (building.type === 'residential') {
                        const buildingSeed = building.id || `${x}-${y}-${building.slotIndex}-${building.name}`;
                        sizeLabel = getTenementSize(buildingSeed);
                    }

                    return (
                        <div key={idx} className={`rounded-xl border-2 p-3 transition-all ${owned ? 'bg-white border-emerald-500 shadow-sm' : isLandmark ? 'bg-white border-amber-500 shadow-md border-dashed' : isPayphone ? 'bg-zinc-50 border-zinc-400 border-dashed' : 'bg-slate-50 border-slate-300 border-dashed'}`}>
                            <div className="flex items-start gap-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm border-2 relative
                                    ${owned ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : isLandmark ? 'bg-amber-100 text-amber-600 border-amber-200' : isPayphone ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-slate-400 border-slate-200'}
                                `}>
                                    {building.icon}
                                    {owned && (
                                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white">
                                            LVL {owned.level}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-sm text-slate-800 truncate">{building.name}</h4>
                                        {isBuildingOwner && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 rounded uppercase">Owned</span>}
                                        {isUnitOwner && !isBuildingOwner && <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 rounded uppercase">Resident</span>}
                                        {isLandmark && !owned && <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-1.5 rounded uppercase">Public</span>}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-bold tracking-wide">
                                        <span>{building.type}</span>
                                        {sizeLabel && (
                                            <>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-slate-600">{sizeLabel}</span>
                                            </>
                                        )}
                                    </div>
                                    
                                    {!isLandmark && !isPayphone && (
                                        <div className="flex items-center gap-3 mt-1 text-xs">
                                            <div className="font-mono font-bold text-emerald-600">
                                                +{owned ? slotIncome : building.income}/d
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-3 border-t border-slate-100 pt-2 flex gap-2">
                                {isPayphone ? (
                                    <button
                                        onClick={() => setActivePayphone(true)}
                                        disabled={!isAtLocation}
                                        className={`w-full py-3 rounded-lg shadow-sm text-xs font-black uppercase tracking-widest transition-all flex justify-center items-center gap-2 transform 
                                            ${isAtLocation 
                                                ? `bg-zinc-800 text-white hover:bg-zinc-700 hover:scale-[1.02]`
                                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                                        `}
                                    >
                                        <span>{isAtLocation ? `USE PAYPHONE` : 'Travel to Use'}</span>
                                    </button>
                                ) : isLandmark ? (
                                    <button
                                        onClick={() => onVisit && building.landmarkId && onVisit(building.landmarkId)}
                                        disabled={!isAtLocation}
                                        className={`w-full py-3 rounded-lg shadow-sm text-xs font-black uppercase tracking-widest transition-all flex justify-center items-center gap-2 transform relative overflow-hidden
                                            ${isAtLocation 
                                                ? `bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-[1.02]` 
                                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                                        `}
                                    >
                                        {isAtLocation && <ShineOverlay />}
                                        <span className="relative z-20">{isAtLocation ? `ENTER ${building.name.toUpperCase()}` : 'Travel to Enter'}</span>
                                        {isAtLocation && <span className="text-sm relative z-20">➜</span>}
                                    </button>
                                ) : (
                                    <>
                                        {/* ENTER BUTTON for Generic Buildings - FIXED to pass Grid Coords */}
                                        {isEnterableGeneric && (
                                            <button
                                                onClick={() => onEnterBuilding({ ...building, x, y, id: owned?.id }, !!owned)}
                                                disabled={!isAtLocation}
                                                className={`px-5 py-2 rounded-lg font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 border-b-2
                                                    ${isAtLocation 
                                                        ? `bg-slate-800 border-slate-950 text-amber-500 hover:bg-slate-700 hover:text-white hover:-translate-y-0.5 shadow-md active:translate-y-0 active:border-b-0`
                                                        : 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                                                    }
                                                `}
                                                title={isAtLocation ? "Enter Premises" : "Travel to Enter"}
                                            >
                                                <span className="text-sm">🚪</span>
                                                <span>Enter</span>
                                            </button>
                                        )}

                                        {owned && building.type === 'residential' && !isThisBuildingSafehouse && (
                                            <button
                                                onClick={() => handleSetSafehouse(owned)}
                                                className="px-3 py-2 rounded-lg font-black uppercase tracking-widest text-[9px] bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 transition-all shadow-sm flex items-center justify-center gap-1"
                                                title="Move Safehouse Here"
                                            >
                                                <span>🏠</span> Set Base
                                            </button>
                                        )}

                                        {isBuildingOwner ? (
                                            // Building Owner Actions
                                            owned.level < owned.maxLevel ? (
                                                <button
                                                    onClick={() => onUpgrade(owned.id, upgradeCost)}
                                                    disabled={money < upgradeCost}
                                                    className={`flex-grow py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex justify-between px-3 items-center
                                                        ${money >= upgradeCost 
                                                            ? `bg-amber-100 text-amber-800 hover:bg-amber-200`
                                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                                                    `}
                                                >
                                                    <span>Upgrade</span>
                                                    <span>N$ {upgradeCost}</span>
                                                </button>
                                            ) : (
                                                <div className="flex-grow text-center text-[10px] font-bold text-slate-400 uppercase py-1.5 bg-slate-100 rounded-lg">
                                                    Max Level
                                                </div>
                                            )
                                        ) : (
                                            // Buy Property (Available for all generic types including Residential)
                                            
                                            isConfirming ? (
                                                <button
                                                    onClick={() => {
                                                        onBuy({
                                                            id: '', 
                                                            x, y,
                                                            slotIndex: building.slotIndex,
                                                            name: building.name,
                                                            type: building.type,
                                                            level: 1,
                                                            maxLevel: 5,
                                                            income: building.income,
                                                            cost: building.cost,
                                                            icon: building.icon
                                                        });
                                                        setConfirmingSlot(null);
                                                    }}
                                                    className="flex-grow py-1 rounded-lg shadow-md text-[9px] font-black uppercase tracking-widest transition-all flex justify-center items-center bg-emerald-500 text-white hover:bg-emerald-600 animate-pop-in"
                                                >
                                                    <span>Confirm? N${building.cost}</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmingSlot(building.slotIndex)}
                                                    disabled={money < building.cost || !isAtLocation}
                                                    className={`flex-grow py-1 rounded-lg shadow-sm text-[9px] font-black uppercase tracking-widest transition-all flex justify-between px-3 items-center
                                                        ${money >= building.cost && isAtLocation
                                                            ? `bg-emerald-600 text-white hover:bg-emerald-500`
                                                            : 'bg-slate-300 text-slate-500 cursor-not-allowed'}
                                                    `}
                                                    title={!isAtLocation ? "Must be at location to purchase" : ""}
                                                >
                                                    <span>{isAtLocation ? 'Buy Property' : 'Travel to Buy'}</span>
                                                    <span>N$ {building.cost}</span>
                                                </button>
                                            )
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-slate-200 transform rotate-45 -bottom-2`}></div>
        
            {/* CHILD MENU: TAG INSPECTOR (Same as before) */}
            {viewTagSlot !== null && (
                <div className="absolute inset-0 z-40 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-slide-up origin-bottom">
                    <button 
                        onClick={() => setViewTagSlot(null)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white uppercase font-bold text-xs"
                    >
                        Cancel
                    </button>
                    {/* Simplified for brevity as logic didn't change */}
                    <div className="w-64 h-64 bg-slate-200 border-4 border-slate-700 shadow-xl rounded-2xl overflow-hidden mb-8 relative flex items-center justify-center">
                         {/* Tag Preview */}
                         <div className="text-slate-400 flex flex-col items-center">
                            <span className="text-6xl mb-1 opacity-50">+</span>
                            <span className="text-sm font-bold uppercase tracking-widest">Tag View</span>
                        </div>
                    </div>
                    {/* Actions */}
                    <div className="w-full flex flex-col gap-3">
                        <div className="flex gap-3">
                             <button 
                                onClick={initiateTagging}
                                disabled={!hasCrew}
                                className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg border-b-4
                                    ${hasCrew ? 'bg-emerald-600 text-white border-emerald-800' : 'bg-slate-700 text-slate-500 border-slate-800'}
                                `}
                            >
                                <span className="block text-xl mb-1">🎨</span>
                                Tag Over
                            </button>
                        </div>
                        {isDealer && !isCornerClaimed && hasPlayerTags && isAtLocation && (
                            <button
                                onClick={handleClaim}
                                className="w-full py-4 mt-2 bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 border-b-4 border-blue-800 active:border-b-0 active:translate-y-0.5 shadow-xl flex items-center justify-center gap-2"
                            >
                                <span>🏙️</span>
                                <span>Claim Corner</span>
                            </button>
                        )}
                        {isThug && !isProtectionClaimed && hasPlayerTags && isAtLocation && (
                            <button
                                onClick={handleProtect}
                                className="w-full py-4 mt-2 bg-red-700 text-white font-black uppercase tracking-widest rounded-xl hover:bg-red-600 border-b-4 border-red-900 active:border-b-0 active:translate-y-0.5 shadow-xl flex items-center justify-center gap-2"
                            >
                                <span>🛡️</span>
                                <span>Establish Protection</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* TAG SELECTION OVERLAY (Same as before) */}
            {selectedSlotForTagging !== null && (
                <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in">
                    <h3 className="text-white font-black uppercase text-xl mb-4 text-center">Select Your Tag</h3>
                    <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar w-full mb-4">
                        {playerTags.map(tag => (
                            <button
                                key={tag.id}
                                onClick={() => confirmTagging(tag.id)}
                                className="aspect-square bg-white rounded-lg p-1 hover:scale-105 transition-transform border-2 border-transparent hover:border-amber-500"
                            >
                                <img src={tag.dataUri} className="w-full h-full object-cover rendering-pixelated" />
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => setSelectedSlotForTagging(null)}
                        className="text-slate-400 hover:text-white uppercase font-bold text-xs"
                    >
                        Back
                    </button>
                </div>
            )}
        </div>
    </div>
    
    {/* CUSTOM TOOLTIP OVERLAY */}
    {hoveredStat && (
        <div 
            className="fixed z-[100] pointer-events-none w-64 animate-fade-in"
            style={{ 
                left: hoveredStat.rect.right + 16, 
                top: hoveredStat.rect.top + (hoveredStat.rect.height / 2),
                transform: 'translate(0, -50%)' 
            }}
        >
            <div className="bg-slate-900 border-2 border-amber-500 text-white p-4 rounded-xl shadow-2xl relative">
                {/* Arrow pointing Left */}
                <div className="absolute top-1/2 -left-2 w-4 h-4 bg-slate-900 border-b-2 border-l-2 border-amber-500 transform rotate-45 -translate-y-1/2"></div>
                
                <div className="font-black uppercase text-sm mb-2 text-amber-400 border-b border-slate-700 pb-1">
                    {hoveredStat.label}
                </div>
                <div className="text-xs text-slate-300 leading-relaxed">
                    {renderFormattedText(hoveredStat.math)}
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default BlockMenu;
