


import React, { useState } from 'react';
import { CrewMember, Card } from '../types';
import { CARDS, TALENT_TREES } from '../constants';

interface CardViewProps {
  card: Card;
  isLocked: boolean;
  lockReason?: string;
  isEquipped?: boolean;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onClick?: () => void;
}

const AbilityTile: React.FC<CardViewProps> = ({ card, isLocked, lockReason, isEquipped, onMouseEnter, onMouseLeave, onClick }) => {
    return (
        <button 
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={!isLocked ? onClick : undefined}
            disabled={isLocked}
            className={`
                relative w-full aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-4 transition-all duration-200 group text-left
                ${isLocked 
                    ? 'bg-slate-100 border-slate-200 opacity-60 grayscale cursor-not-allowed' 
                    : isEquipped
                        ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-200 cursor-pointer transform hover:-translate-y-1'
                        : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-lg hover:-translate-y-1 cursor-pointer'
                }
            `}
        >
            {/* Cost Badge - Top Right */}
            <div className={`
                absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border
                ${isLocked ? 'bg-slate-200 text-slate-400 border-slate-300' : 'bg-slate-200 text-slate-600 border-slate-300'}
            `}>
                {card.cost}
            </div>

            {/* Locked Overlay Icon */}
            {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="bg-slate-800/80 text-white rounded-full p-2">
                        🔒
                    </div>
                </div>
            )}

            {/* Equipped Indicator */}
            {isEquipped && !isLocked && (
                <div className="absolute top-2 left-2 bg-amber-500 text-white text-[8px] font-bold px-1.5 rounded uppercase shadow-sm">
                    Active
                </div>
            )}

            {/* Main Icon */}
            <div className="text-4xl mb-2 drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
                {card.icon}
            </div>

            {/* Name */}
            <div className="text-center w-full">
                <div className="text-xs font-black uppercase text-slate-800 leading-tight group-hover:text-amber-600 transition-colors line-clamp-1">
                    {card.name}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {card.effectType}
                </div>
            </div>
            
            {/* Lock Reason / Stats */}
            <div className="absolute bottom-2 w-full flex justify-center gap-2">
                 {isLocked && lockReason ? (
                     <span className="text-[8px] bg-slate-800 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">{lockReason}</span>
                 ) : (
                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {card.range < 99 && (
                            <span className="text-[8px] bg-slate-100 px-1.5 rounded border border-slate-200 text-slate-500 font-bold uppercase">Rng {card.range}</span>
                        )}
                        {card.aoeRadius > 0 && (
                            <span className="text-[8px] bg-red-50 px-1.5 rounded border border-red-100 text-red-500 font-bold uppercase">AOE</span>
                        )}
                     </div>
                 )}
            </div>
        </button>
    );
};

interface DeckDrawerProps {
  leader: CrewMember;
  onToggleAbility: (abilityId: string) => void;
}

const DeckDrawer: React.FC<DeckDrawerProps> = ({ leader, onToggleAbility }) => {
  const [hoveredCard, setHoveredCard] = useState<{ card: Card, rect: DOMRect } | null>(null);

  const allCards = Object.values(CARDS);
  const activeAbilityIds = leader.activeAbilities || [];
  
  // 1. Identify Unlocked vs Locked Cards
  const acquiredCards: Card[] = [];
  const futureCards: { card: Card, reason: string }[] = [];

  // Identify cards that are exclusively unlocked via talents to exclude them from general level-up logic
  const talentTree = TALENT_TREES[leader.classType] || [];
  const talentAbilityIds = new Set<string>();
  talentTree.forEach(t => {
      if (t.grantsAbilityId) talentAbilityIds.add(t.grantsAbilityId);
  });

  allCards.forEach(card => {
      // Skip if this card is managed by the Talent Tree logic
      if (talentAbilityIds.has(card.id)) return;

      // Logic for Class Abilities
      if (card.classReq === leader.classType) {
          if ((card.reqLevel || 1) <= leader.level) {
              acquiredCards.push(card);
          } else {
              futureCards.push({ card, reason: `Lvl ${card.reqLevel}` });
          }
      } 
      // Logic for Neutral Abilities
      else if (!card.classReq) {
          if ((card.reqLevel || 1) <= leader.level) {
              acquiredCards.push(card);
          } else {
              futureCards.push({ card, reason: `Lvl ${card.reqLevel}` });
          }
      }
  });

  // Logic for Talent-Granted Abilities
  talentTree.forEach(talent => {
      if (talent.grantsAbilityId) {
          const grantedCard = CARDS[talent.grantsAbilityId];
          if (grantedCard) {
              // Check if already in acquired list to avoid duplicates (though Set prevents it mostly)
              if (!acquiredCards.find(c => c.id === grantedCard.id) && !futureCards.find(c => c.card.id === grantedCard.id)) {
                  const currentRank = leader.talents[talent.id] || 0;
                  if (currentRank > 0) {
                      acquiredCards.push(grantedCard);
                  } else {
                      futureCards.push({ card: grantedCard, reason: `Talent: ${talent.name}` });
                  }
              }
          }
      }
  });

  // Sort: Acquired by cost, Future by cost
  acquiredCards.sort((a,b) => a.cost - b.cost);
  futureCards.sort((a,b) => a.card.cost - b.card.cost);

  const handleMouseEnter = (e: React.MouseEvent, card: Card) => {
      setHoveredCard({
          card,
          rect: e.currentTarget.getBoundingClientRect()
      });
  };

  const handleMouseLeave = () => {
      setHoveredCard(null);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 font-waze overflow-hidden relative">
        
        {/* Header */}
        <div className="p-8 pb-4 border-b border-slate-200 bg-white shadow-sm z-10">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-3xl font-black font-news text-slate-800 uppercase tracking-tight leading-none">Abilities Codex</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage Combat Skills</p>
                </div>
            </div>

            {/* Active Loadout Bar */}
            <div className="bg-slate-100 rounded-xl p-4 border-2 border-slate-200">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Loadout</span>
                    <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded ${activeAbilityIds.length === 5 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                        {activeAbilityIds.length} / 5 Slots
                    </span>
                </div>
                
                <div className="grid grid-cols-5 gap-4">
                    {[0, 1, 2, 3, 4].map(idx => {
                        const abilityId = activeAbilityIds[idx];
                        const card = abilityId ? CARDS[abilityId] : null;
                        
                        return (
                            <button 
                                key={idx}
                                onClick={() => card && onToggleAbility(card.id)}
                                onMouseEnter={(e) => card && handleMouseEnter(e, card)}
                                onMouseLeave={handleMouseLeave}
                                className={`
                                    h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all relative group
                                    ${card 
                                        ? 'bg-white border-amber-400 shadow-sm border-solid hover:bg-red-50 hover:border-red-400' 
                                        : 'bg-slate-200/50 border-slate-300'
                                    }
                                `}
                            >
                                {card ? (
                                    <>
                                        <div className="text-2xl mb-1">{card.icon}</div>
                                        <div className="text-[10px] font-black uppercase text-slate-800 text-center leading-none px-1 line-clamp-2">
                                            {card.name}
                                        </div>
                                        <div className="absolute top-1 right-1 bg-slate-200 text-slate-600 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold border border-slate-300">
                                            {card.cost}
                                        </div>
                                        {/* Remove Hint Overlay */}
                                        <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-md transition-opacity">
                                            <span className="text-red-600 font-bold text-xl">✕</span>
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-slate-300 font-bold text-xs uppercase">Empty</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-8">
            
            {/* Section 1: Acquired */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg border border-emerald-200">
                        ⚡
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-slate-800 uppercase tracking-wide font-news">Available Abilities</h4>
                        <div className="text-xs text-slate-500 font-medium">Click to Add/Remove from Loadout</div>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {acquiredCards.map(card => {
                        const isEquipped = activeAbilityIds.includes(card.id);
                        return (
                            <AbilityTile 
                                key={card.id}
                                card={card}
                                isLocked={false}
                                isEquipped={isEquipped}
                                onClick={() => onToggleAbility(card.id)}
                                onMouseEnter={(e) => handleMouseEnter(e, card)}
                                onMouseLeave={handleMouseLeave}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Section 2: Future / Locked */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded bg-slate-200 text-slate-500 flex items-center justify-center text-lg border border-slate-300">
                        🔒
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-slate-500 uppercase tracking-wide font-news">Future Potential</h4>
                        <div className="text-xs text-slate-400 font-medium">Unlock via Leveling Up or Talents</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {futureCards.map(({card, reason}) => (
                        <AbilityTile 
                            key={card.id}
                            card={card}
                            isLocked={true}
                            lockReason={reason}
                            onMouseEnter={(e) => handleMouseEnter(e, card)}
                            onMouseLeave={handleMouseLeave}
                        />
                    ))}
                    {futureCards.length === 0 && (
                        <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                            <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">All known abilities unlocked</span>
                        </div>
                    )}
                </div>
            </div>

        </div>

        {/* FIXED TOOLTIP OVERLAY */}
        {hoveredCard && (
            <div 
                className="fixed z-[9999] pointer-events-none w-64 animate-fade-in"
                style={{ 
                    left: hoveredCard.rect.left + (hoveredCard.rect.width / 2), 
                    top: hoveredCard.rect.bottom + 10,
                    transform: 'translate(-50%, 0)' 
                }}
            >
                <div className="bg-slate-900 border-2 border-amber-500 text-white p-4 rounded-xl shadow-2xl relative">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-t border-l border-amber-500 transform rotate-45"></div>
                    
                    <div className="flex justify-between items-start mb-2">
                        <div className="font-black uppercase text-amber-400 text-sm leading-none">{hoveredCard.card.name}</div>
                        <div className="w-6 h-6 bg-blue-600 rounded-full border border-white flex items-center justify-center font-bold text-xs">{hoveredCard.card.cost}</div>
                    </div>
                    
                    <div className="text-[10px] bg-slate-800 px-2 py-1 rounded inline-block mb-2 text-slate-300 uppercase font-bold tracking-wider">
                        {hoveredCard.card.type} - {hoveredCard.card.effectType}
                    </div>

                    <div className="text-xs text-slate-200 leading-relaxed italic mb-3">
                        "{hoveredCard.card.description}"
                    </div>
                    
                    <div className="flex gap-4 border-t border-slate-700 pt-2 text-[10px] uppercase font-bold text-slate-400">
                         <span>Rng {hoveredCard.card.range === 99 ? 'Global' : hoveredCard.card.range}</span>
                         <span>{hoveredCard.card.aoeRadius > 0 ? `AOE ${hoveredCard.card.aoeRadius}` : 'Single Target'}</span>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
};

export default DeckDrawer;
