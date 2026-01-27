
import React, { useState } from 'react';
import { CrewMember, ClassType, Talent, PawnRole, Card, CombatPreferences, TacticDef } from '../types';
import { TACTIC_OPTIONS, TALENT_TREES, PAWN_JOBS, CARDS, CLASSES } from '../constants';
import PawnLevelingTree from './PawnLevelingTree';

interface TacticsScreenProps {
  playerCrew: CrewMember[];
  offensiveTactic: string; 
  defensiveTactic: string;
  onUpdateTactics: (type: 'offensive' | 'defensive', tacticId: string) => void;
  onUpdateTalents: (memberId: string, talentId: string, operation?: 'add' | 'remove' | 'reset') => void;
  savedFormation: Record<string, {x: number, y: number}>;
  onUpdateFormation: (formation: Record<string, {x: number, y: number}>) => void;
  onPromotePawn?: (memberId: string, newRole: PawnRole) => void;
  retreatThreshold: number;
  onUpdateRetreatThreshold: (val: number) => void;
  onToggleAbility: (abilityId: string) => void;
  onUpdateLoadout?: (memberId: string, abilities: string[]) => void;
  combatPreferences?: CombatPreferences;
  onUpdateCombatPreferences?: (prefs: CombatPreferences) => void;
}

interface AbilityTileProps {
  card: Card;
  isLocked: boolean;
  lockReason?: string;
  isActive?: boolean; // Is in the loadout
  isSelected?: boolean; // Is currently selected for swapping
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onClick?: () => void;
  size?: 'normal' | 'small';
}

const AbilityTile: React.FC<AbilityTileProps> = ({ card, isLocked, lockReason, isActive, isSelected, onMouseEnter, onMouseLeave, onClick, size = 'normal' }) => {
    const sizeClasses = size === 'normal' ? 'w-20 h-20' : 'w-16 h-16';
    const iconSize = size === 'normal' ? 'text-3xl' : 'text-2xl';

    return (
        <button 
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={!isLocked ? onClick : undefined}
            disabled={isLocked}
            className={`
                relative ${sizeClasses} rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-200 group text-left
                ${isLocked 
                    ? 'bg-slate-100 border-slate-200 opacity-60 grayscale cursor-not-allowed' 
                    : isSelected 
                        ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-300 shadow-lg transform -translate-y-1'
                        : isActive
                            ? 'bg-emerald-50 border-emerald-400 shadow-sm opacity-50 cursor-pointer'
                            : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                }
            `}
        >
            <div className={`
                absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black border
                ${isLocked ? 'bg-slate-200 text-slate-400 border-slate-300' : 'bg-slate-100 text-slate-600 border-slate-300'}
            `}>
                {card.cost}
            </div>

            {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="text-slate-400 text-xl">🔒</div>
                </div>
            )}

            {isActive && !isLocked && !isSelected && (
                <div className="absolute top-1 left-1 bg-emerald-500 text-white text-[6px] font-bold px-1 rounded uppercase shadow-sm">
                    In Use
                </div>
            )}

            <div className={`${iconSize} drop-shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                {card.icon}
            </div>
            
            {/* Range Indicator */}
            {!isLocked && (
                <div className="absolute bottom-1 w-full text-center">
                     <span className="text-[7px] text-slate-400 font-bold uppercase">
                        {card.range === 99 ? 'Global' : card.range > 1 ? `Rng ${card.range}` : 'Melee'}
                     </span>
                </div>
            )}
        </button>
    );
};

// --- CHESS PIECE MAPPING ---
const getChessMeta = (tacticId: string) => {
    switch (tacticId) {
        case 'aggressive': return { piece: '♕', label: 'The Queen', desc: 'Total Offense' };
        case 'flank': return { piece: '♘', label: 'The Knight', desc: 'Lateral Strike' };
        case 'focus': return { piece: '♗', label: 'The Bishop', desc: 'Precision' };
        case 'guerrilla': return { piece: '♟', label: 'The Pawn', desc: 'Attrition' };
        case 'scorched_earth': return { piece: '♔', label: 'The King', desc: 'Absolute Power' };
        case 'bunker': return { piece: '♖', label: 'The Rook', desc: 'Fortification' };
        case 'kite': return { piece: '♘', label: 'The Knight', desc: 'Mobility' };
        case 'hold_center': return { piece: '♔', label: 'The King', desc: 'Command' };
        default: return { piece: '♟', label: 'Unit', desc: 'Standard' };
    }
};

const TacticsScreen: React.FC<TacticsScreenProps> = ({ 
    playerCrew, 
    offensiveTactic,
    defensiveTactic, 
    onUpdateTactics, 
    onUpdateTalents,
    savedFormation,
    onUpdateFormation,
    onPromotePawn,
    retreatThreshold,
    onUpdateRetreatThreshold,
    onToggleAbility,
    onUpdateLoadout,
    combatPreferences,
    onUpdateCombatPreferences
}) => {
  const [activeTab, setActiveTab] = useState<'plan' | 'setup' | 'talents' | 'abilities'>('talents');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(playerCrew.find(c => c.isLeader)?.id || playerCrew[0].id);
  const [activePlacementId, setActivePlacementId] = useState<string | null>(null);
  
  // Abilities Management State
  const [hoveredCard, setHoveredCard] = useState<{ card: Card, rect: DOMRect } | null>(null);
  const [selectedPoolAbilityId, setSelectedPoolAbilityId] = useState<string | null>(null);
  const [selectedLoadoutIndex, setSelectedLoadoutIndex] = useState<number | null>(null);

  const selectedMember = playerCrew.find(c => c.id === selectedMemberId);
  const leader = playerCrew.find(c => c.isLeader) || playerCrew[0];
  const leaderLevel = leader.level;

  // Talent Point Calculation (Only relevant for Bosses)
  const totalSpent = selectedMember && !selectedMember.isPawn ? Object.values(selectedMember.talents || {}).reduce<number>((sum, rank) => sum + (rank as number), 0) : 0;
  const totalAvailable = selectedMember ? Math.max(0, selectedMember.level - 1) : 0;
  const remainingPoints = totalAvailable - totalSpent;

  // Retreat Slider Invert Logic
  const riskFactor = 95 - retreatThreshold;

  // --- ABILITIES LOGIC ---
  const activeAbilityIds = leader.activeAbilities || [];
  const currentLoadout = [...activeAbilityIds];
  // Pad with nulls to ensure 5 slots
  while (currentLoadout.length < 5) currentLoadout.push('');

  const allCards = Object.values(CARDS);
  
  const acquiredCards: Card[] = [];
  const futureCards: { card: Card, reason: string }[] = [];

  const talentTree = TALENT_TREES[leader.classType] || [];
  const talentAbilityIds = new Set<string>();
  talentTree.forEach(t => {
      if (t.grantsAbilityId) talentAbilityIds.add(t.grantsAbilityId);
  });

  allCards.forEach(card => {
      if (talentAbilityIds.has(card.id)) return;
      if (card.classReq === leader.classType) {
          if ((card.reqLevel || 1) <= leader.level) {
              acquiredCards.push(card);
          } else {
              futureCards.push({ card, reason: `Lvl ${card.reqLevel}` });
          }
      } else if (card.type === 'spell' && !card.classReq) { 
          if ((card.reqLevel || 1) <= leader.level) {
              acquiredCards.push(card);
          } else {
              futureCards.push({ card, reason: `Lvl ${card.reqLevel}` });
          }
      }
  });

  talentTree.forEach(talent => {
      if (talent.grantsAbilityId) {
          const grantedCard = CARDS[talent.grantsAbilityId];
          if (grantedCard) {
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

  acquiredCards.sort((a,b) => a.cost - b.cost);
  futureCards.sort((a,b) => a.card.cost - b.card.cost);

  const handleCardMouseEnter = (e: React.MouseEvent, card: Card) => {
      setHoveredCard({
          card,
          rect: e.currentTarget.getBoundingClientRect()
      });
  };

  const handleCardMouseLeave = () => {
      setHoveredCard(null);
  };

  // --- REARRANGE HANDLERS ---

  const handleLoadoutSlotClick = (index: number) => {
      // Case 1: Placing an ability from the pool
      if (selectedPoolAbilityId) {
          const newLoadout = [...currentLoadout];
          
          // Check if already in loadout, remove from old spot if so
          const existingIdx = newLoadout.indexOf(selectedPoolAbilityId);
          if (existingIdx !== -1) newLoadout[existingIdx] = '';
          
          newLoadout[index] = selectedPoolAbilityId;
          
          // Filter empty strings for storage
          if (onUpdateLoadout) onUpdateLoadout(leader.id, newLoadout.filter(id => id !== ''));
          
          setSelectedPoolAbilityId(null);
          return;
      }

      // Case 2: Swapping active slots
      if (selectedLoadoutIndex !== null) {
          if (selectedLoadoutIndex === index) {
              // Deselect
              setSelectedLoadoutIndex(null);
          } else {
              // Swap
              const newLoadout = [...currentLoadout];
              const temp = newLoadout[index];
              newLoadout[index] = newLoadout[selectedLoadoutIndex];
              newLoadout[selectedLoadoutIndex] = temp;
              
              if (onUpdateLoadout) onUpdateLoadout(leader.id, newLoadout.filter(id => id !== ''));
              setSelectedLoadoutIndex(null);
          }
          return;
      }

      // Case 3: Selecting a slot to move
      if (currentLoadout[index]) {
          setSelectedLoadoutIndex(index);
      }
  };

  const handlePoolAbilityClick = (abilityId: string) => {
      if (selectedPoolAbilityId === abilityId) {
          setSelectedPoolAbilityId(null);
      } else {
          setSelectedPoolAbilityId(abilityId);
          setSelectedLoadoutIndex(null); // Clear slot selection
      }
  };

  const handleClearSlot = (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      const newLoadout = [...currentLoadout];
      newLoadout[index] = '';
      if (onUpdateLoadout) onUpdateLoadout(leader.id, newLoadout.filter(id => id !== ''));
      setSelectedLoadoutIndex(null);
  };

  const handleGridClick = (x: number, y: number) => {
      if (activePlacementId) {
          const newFormation = { ...savedFormation };
          const existingOccupantId = Object.keys(newFormation).find(id => newFormation[id].x === x && newFormation[id].y === y);
          if (existingOccupantId) delete newFormation[existingOccupantId];
          newFormation[activePlacementId] = { x, y };
          onUpdateFormation(newFormation);
          setActivePlacementId(null);
      } else {
          const occupantId = Object.keys(savedFormation).find(id => savedFormation[id].x === x && savedFormation[id].y === y);
          if (occupantId) {
              const newFormation = { ...savedFormation };
              delete newFormation[occupantId];
              onUpdateFormation(newFormation);
              setActivePlacementId(occupantId);
          }
      }
  };

  const getRetreatStrategy = (val: number) => {
      if (val >= 80) return { label: "Skittish", desc: "Retreat at the first sign of trouble. Preserves health, but risks losing ground.", color: "text-emerald-400", icon: "🐇" };
      if (val >= 50) return { label: "Cautious", desc: "Play it safe. Pull back once the armor cracks.", color: "text-emerald-200", icon: "🛡️" };
      if (val >= 30) return { label: "Balanced", desc: "Standard protocol. Fight hard, but live to fight another day.", color: "text-amber-400", icon: "⚖️" };
      if (val >= 10) return { label: "Brave", desc: "Hold the line! Only retreat if death is imminent.", color: "text-orange-500", icon: "⚔️" };
      return { label: "Death Wish", desc: "Never surrender. Fight to the bitter end.", color: "text-red-600", icon: "💀" };
  };

  const renderTalentPath = (pathCode: 'A' | 'B' | 'C', details: { name: string, desc: string }, member: CrewMember) => {
        // Sort talents by Tier to render visually top-to-bottom
        const talents = TALENT_TREES[member.classType]
            .filter(t => t.path === pathCode)
            .sort((a, b) => (a.tier || 0) - (b.tier || 0));

        const themeColor = pathCode === 'A' ? 'red' : pathCode === 'B' ? 'blue' : 'emerald';
        const borderColor = pathCode === 'A' ? 'border-red-200' : pathCode === 'B' ? 'border-blue-200' : 'border-emerald-200';
        const bgColor = pathCode === 'A' ? 'bg-red-50' : pathCode === 'B' ? 'bg-blue-50' : 'bg-emerald-50';
        const headerColor = pathCode === 'A' ? 'text-red-800' : pathCode === 'B' ? 'text-blue-800' : 'text-emerald-800';
        
        // Colors for active connector lines
        const connectorActiveColor = pathCode === 'A' ? 'bg-red-400' : pathCode === 'B' ? 'bg-blue-400' : 'bg-emerald-400';

        return (
            <div className={`relative flex flex-col h-full rounded-2xl border-4 ${borderColor} ${bgColor} overflow-hidden shadow-sm`}>
                <div className={`text-center py-6 border-b-4 ${borderColor} bg-white/50 backdrop-blur-sm sticky top-0 z-20`}>
                    <h4 className={`text-2xl font-black uppercase tracking-[0.2em] font-news ${headerColor}`}>{details.name}</h4>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{details.desc}</div>
                </div>
                
                <div className="flex-grow p-6 flex flex-col items-center gap-2 overflow-y-auto custom-scrollbar relative">
                    {/* Vertical Background Line */}
                    <div className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-2 ${pathCode === 'A' ? 'bg-red-200' : pathCode === 'B' ? 'bg-blue-200' : 'bg-emerald-200'} -z-10`}></div>
                    
                    {talents.map((talent, idx) => {
                        const currentRank = member.talents?.[talent.id] || 0;
                        const isMaxed = currentRank >= talent.maxRank;
                        
                        // Check Requirements
                        const reqTalent = talent.reqTalentId 
                            ? TALENT_TREES[member.classType].find(t => t.id === talent.reqTalentId) 
                            : null;
                        const reqTalentRank = reqTalent ? (member.talents?.[reqTalent.id] || 0) : 0;
                        const reqMet = !reqTalent || reqTalentRank >= reqTalent.maxRank;
                        const isUnlocked = member.level >= talent.reqLevel;
                        
                        const canUpgrade = isUnlocked && !isMaxed && reqMet && remainingPoints > 0;
                        const isLocked = !reqMet || !isUnlocked;
                        
                        const isUltimate = talent.tier === 5;

                        // Check previous node for visual connection
                        let isConnectorActive = false;
                        if (idx > 0) {
                             const prevTalent = talents[idx - 1];
                             const prevRank = member.talents?.[prevTalent.id] || 0;
                             if (currentRank > 0 && prevRank > 0) {
                                 isConnectorActive = true;
                             }
                        }

                        return (
                            <div key={talent.id} className="relative z-10 w-full flex flex-col items-center">
                                {/* Connector Line (Visual) */}
                                {idx > 0 && (
                                    <div className={`w-2 h-8 ${isConnectorActive ? connectorActiveColor : 'bg-transparent'} z-0 transition-colors duration-300`}></div>
                                )}

                                <button
                                    onClick={() => {
                                        if (canUpgrade) {
                                            onUpdateTalents(member.id, talent.id, 'add');
                                        } else if (isMaxed) {
                                            onUpdateTalents(member.id, talent.id, 'reset');
                                        }
                                    }}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        onUpdateTalents(member.id, talent.id, 'remove');
                                    }}
                                    disabled={(!canUpgrade && !isMaxed) && currentRank === 0}
                                    className={`
                                        w-full bg-white rounded-xl border-4 p-4 text-left transition-all duration-300 relative group flex gap-4
                                        ${isUltimate 
                                            ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] ring-4 ring-amber-100' 
                                            : borderColor.replace('200', '300')
                                        }
                                        ${canUpgrade ? 'hover:scale-105 hover:shadow-lg cursor-pointer ring-4 ring-white/50' : ''}
                                        ${isLocked ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer'}
                                        ${currentRank > 0 && !isUltimate ? `shadow-md` : ''}
                                    `}
                                >
                                    {/* Icon Box */}
                                    <div className={`
                                        w-16 h-16 rounded-xl flex items-center justify-center text-3xl border-2 shadow-sm transition-colors flex-shrink-0 relative
                                        ${currentRank > 0 
                                            ? (isUltimate ? 'bg-amber-100 text-amber-600 border-amber-300' : `bg-${themeColor}-100 text-${themeColor}-600 border-${themeColor}-200`) 
                                            : 'bg-slate-100 text-slate-400 border-slate-200'
                                        }
                                    `}>
                                        {talent.icon}
                                        
                                        {/* Rank Badge */}
                                        <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white text-[10px] font-bold px-1.5 rounded border border-white shadow-sm">
                                            {currentRank}/{talent.maxRank}
                                        </div>
                                    </div>

                                    {/* Text Info */}
                                    <div className="flex-grow flex flex-col justify-center">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`font-black text-sm uppercase ${currentRank > 0 ? 'text-slate-900' : 'text-slate-500'}`}>{talent.name}</span>
                                        </div>
                                        <div className="text-xs text-slate-600 font-medium leading-tight">{talent.description}</div>
                                        
                                        {/* Requirements Text (Only if locked) */}
                                        {isLocked && (
                                            <div className="mt-2 text-[9px] font-bold text-red-500 uppercase bg-red-50 px-2 py-0.5 rounded inline-block self-start border border-red-100">
                                                {!isUnlocked ? `Requires Lvl ${talent.reqLevel}` : `Requires Previous Talent`}
                                            </div>
                                        )}
                                        {/* Help Text for Removal */}
                                        {currentRank > 0 && (
                                            <div className="mt-1 text-[8px] text-slate-400 italic opacity-0 group-hover:opacity-100 transition-opacity">
                                                Right-click to unlearn
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Upgrade Indicator */}
                                    {canUpgrade && (
                                        <div className="absolute top-2 right-2 flex h-3 w-3">
                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${themeColor}-400 opacity-75`}></span>
                                            <span className={`relative inline-flex rounded-full h-3 w-3 bg-${themeColor}-500`}></span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                    
                    {/* End Cap */}
                    <div className={`w-4 h-4 rounded-full border-4 ${borderColor} bg-white z-10 mt-auto`}></div>
                </div>
            </div>
        );
  };

  const getPathDetails = (classType: ClassType) => {
      if (classType === ClassType.Hustler) return { A: { name: 'Kingpin', desc: 'Empire Management' }, B: { name: 'Playboy', desc: 'Risk & Reward' }, C: { name: 'Utility', desc: 'General Upgrades' } };
      if (classType === ClassType.Thug) return { A: { name: 'Juggernaut', desc: 'Tank & Survival' }, B: { name: 'Enforcer', desc: 'Melee Damage' }, C: { name: 'Utility', desc: 'General Upgrades' } };
      if (classType === ClassType.Smuggler) return { A: { name: 'Ghost', desc: 'Evasion & Stealth' }, B: { name: 'Guerilla', desc: 'Mobility & Flanking' }, C: { name: 'Utility', desc: 'General Upgrades' } };
      if (classType === ClassType.Dealer) return { A: { name: 'Chemist', desc: 'Buffs & AoE' }, B: { name: 'Corner Boss', desc: 'Strategic Control' }, C: { name: 'Utility', desc: 'General Upgrades' } };
      if (classType === ClassType.Entertainer) return { A: { name: 'Idol', desc: 'Support & Healing' }, B: { name: 'Diva', desc: 'CC & Debuffs' }, C: { name: 'Utility', desc: 'General Upgrades' } };
      return { A: { name: 'Path A', desc: 'Specialization A' }, B: { name: 'Path B', desc: 'Specialization B' }, C: { name: 'Utility', desc: 'General Upgrades' } };
  };

  const strategy = getRetreatStrategy(retreatThreshold);
  const selectedOffensive = TACTIC_OPTIONS.find(t => t.id === offensiveTactic) || TACTIC_OPTIONS[0];
  const selectedDefensive = TACTIC_OPTIONS.find(t => t.id === defensiveTactic) || TACTIC_OPTIONS[5]; // Default to bunker if not found
  const offChess = getChessMeta(selectedOffensive.id);
  const defChess = getChessMeta(selectedDefensive.id);

  return (
    <div className="flex flex-col h-full bg-slate-50 font-waze w-full relative">
         
         {/* Navigation */}
         <div className="flex bg-slate-900 border-b border-slate-800 flex-shrink-0 px-4 pt-2">
             {[
                 { id: 'abilities', label: 'Abilities', icon: '⚡' },
                 { id: 'plan', label: 'Tactics', icon: '⚔️' },
                 { id: 'setup', label: 'Setup', icon: '♟️' },
                 { id: 'talents', label: 'Talents', icon: '🌳' },
             ].map(tab => (
                 <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                        px-8 py-4 text-sm font-black uppercase tracking-widest transition-all rounded-t-lg flex items-center gap-2
                        ${activeTab === tab.id 
                            ? 'bg-slate-50 text-slate-900 translate-y-0.5 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]' 
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                        }
                    `}
                 >
                     <span className="text-lg opacity-80">{tab.icon}</span>
                     {tab.label}
                 </button>
             ))}
         </div>

         <div className="flex-grow overflow-hidden relative w-full bg-slate-50">
             
             {/* Battle Tactics Tab */}
             {activeTab === 'plan' && (
                 <div className="flex flex-col h-full">
                     {/* Top Half: Selection Columns */}
                     <div className="flex flex-grow overflow-hidden bg-slate-100">
                         {/* Offense Column */}
                         <div className="w-1/2 p-6 overflow-y-auto custom-scrollbar border-r border-slate-200">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-amber-200">
                                <span className="text-2xl text-amber-600">⚔️</span>
                                <div>
                                    <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight font-news">Offensive Doctrine</h4>
                                    <div className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">Command Protocol</div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {TACTIC_OPTIONS.filter(t => t.type === 'attack').map(tactic => {
                                    const isLocked = tactic.reqLevel && leaderLevel < tactic.reqLevel;
                                    const isSelected = offensiveTactic === tactic.id;
                                    
                                    return (
                                        <button 
                                            key={tactic.id}
                                            onClick={() => !isLocked && onUpdateTactics('offensive', tactic.id)}
                                            disabled={isLocked}
                                            className={`w-full p-4 rounded-lg border-2 text-left transition-all group relative overflow-hidden flex items-center gap-4
                                                ${isLocked
                                                    ? 'bg-slate-200 border-slate-300 opacity-60 cursor-not-allowed grayscale'
                                                    : isSelected
                                                        ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-100/50' 
                                                        : 'bg-white border-slate-300 hover:border-amber-400 hover:shadow-sm'
                                                }
                                            `}
                                        >
                                            {/* Folder Tab Effect */}
                                            {isSelected && <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-r-[20px] border-t-amber-500 border-r-transparent"></div>}
                                            
                                            <div className="text-4xl filter drop-shadow-sm opacity-80">{tactic.icon}</div>
                                            
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <span className={`font-black uppercase text-sm font-news tracking-wide ${isSelected ? 'text-amber-800' : 'text-slate-700'}`}>
                                                        {tactic.name}
                                                    </span>
                                                    {isLocked ? (
                                                        <span className="text-[9px] font-black text-white bg-slate-500 px-2 py-0.5 rounded uppercase">CLASSIFIED LVL {tactic.reqLevel}</span>
                                                    ) : isSelected && (
                                                        <span className="text-[9px] font-black text-white bg-amber-500 px-2 py-0.5 rounded uppercase tracking-wider">ACTIVE</span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-slate-500 font-medium truncate">{tactic.description}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                         </div>

                         {/* Defense Column */}
                         <div className="w-1/2 p-6 overflow-y-auto custom-scrollbar bg-slate-50">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-200">
                                <span className="text-2xl text-blue-600">🛡️</span>
                                <div>
                                    <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight font-news">Defensive Formation</h4>
                                    <div className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Security Protocol</div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {TACTIC_OPTIONS.filter(t => t.type === 'defense').map(tactic => {
                                    const isLocked = tactic.reqLevel && leaderLevel < tactic.reqLevel;
                                    const isSelected = defensiveTactic === tactic.id;
                                    
                                    return (
                                        <button 
                                            key={tactic.id}
                                            onClick={() => !isLocked && onUpdateTactics('defensive', tactic.id)}
                                            disabled={isLocked}
                                            className={`w-full p-4 rounded-lg border-2 text-left transition-all group relative overflow-hidden flex items-center gap-4
                                                ${isLocked
                                                    ? 'bg-slate-200 border-slate-300 opacity-60 cursor-not-allowed grayscale'
                                                    : isSelected 
                                                        ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-100/50' 
                                                        : 'bg-white border-slate-300 hover:border-blue-400 hover:shadow-sm'
                                                }
                                            `}
                                        >
                                            {isSelected && <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-r-[20px] border-t-blue-500 border-r-transparent"></div>}

                                            <div className="text-4xl filter drop-shadow-sm opacity-80">{tactic.icon}</div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <span className={`font-black uppercase text-sm font-news tracking-wide ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>{tactic.name}</span>
                                                    {isLocked ? (
                                                        <span className="text-[9px] font-black text-white bg-slate-500 px-2 py-0.5 rounded uppercase">CLASSIFIED LVL {tactic.reqLevel}</span>
                                                    ) : isSelected && (
                                                        <span className="text-[9px] font-black text-white bg-blue-500 px-2 py-0.5 rounded uppercase tracking-wider">ACTIVE</span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-slate-500 font-medium truncate">{tactic.description}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                         </div>
                     </div>
                     
                     {/* Bottom: Strategic Analysis Console */}
                     <div className="w-full h-80 bg-slate-900 border-t-4 border-slate-800 p-0 flex flex-shrink-0 relative overflow-hidden text-white shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20">
                        {/* Background Grid */}
                        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
                        
                        {/* LEFT: OFFENSE DETAILS */}
                        <div className="w-1/2 border-r border-slate-700 p-8 flex flex-col relative">
                            <div className="absolute top-0 left-0 bg-amber-600 text-black px-4 py-1 text-[10px] font-black uppercase tracking-widest">ATK Parameters</div>
                            
                            <div className="flex gap-8 h-full items-center">
                                {/* Chess Piece */}
                                <div className="flex flex-col items-center justify-center w-32 shrink-0">
                                    <div className="text-8xl text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] mb-2 font-serif">
                                        {offChess.piece}
                                    </div>
                                    <div className="text-sm font-black uppercase text-amber-400 tracking-wider border-b border-amber-500/30 pb-1 mb-1">{offChess.label}</div>
                                    <div className="text-[10px] font-mono text-amber-600/80 uppercase">{offChess.desc}</div>
                                </div>
                                
                                {/* Data Grid */}
                                <div className="flex-grow space-y-4">
                                    <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                                        <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-2 border-b border-slate-600 pb-1">Projected Gains</div>
                                        <div className="space-y-1">
                                            {selectedOffensive.advantages?.map((adv, i) => (
                                                <div key={i} className="text-[10px] font-mono text-emerald-300 flex items-start gap-2">
                                                    <span>+</span> {adv}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                                        <div className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-2 border-b border-slate-600 pb-1">Liabilities</div>
                                        <div className="space-y-1">
                                            {selectedOffensive.disadvantages?.map((dis, i) => (
                                                <div key={i} className="text-[10px] font-mono text-red-300 flex items-start gap-2">
                                                    <span>-</span> {dis}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: DEFENSE DETAILS */}
                        <div className="w-1/2 p-8 flex flex-col relative">
                            <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest">DEF Parameters</div>

                            <div className="flex gap-8 h-full items-center flex-row-reverse">
                                {/* Chess Piece */}
                                <div className="flex flex-col items-center justify-center w-32 shrink-0">
                                    <div className="text-8xl text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] mb-2 font-serif">
                                        {defChess.piece}
                                    </div>
                                    <div className="text-sm font-black uppercase text-blue-400 tracking-wider border-b border-blue-500/30 pb-1 mb-1">{defChess.label}</div>
                                    <div className="text-[10px] font-mono text-blue-600/80 uppercase">{defChess.desc}</div>
                                </div>
                                
                                {/* Data Grid */}
                                <div className="flex-grow space-y-4">
                                    <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                                        <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-2 border-b border-slate-600 pb-1">Tactical Assets</div>
                                        <div className="space-y-1">
                                            {selectedDefensive.advantages?.map((adv, i) => (
                                                <div key={i} className="text-[10px] font-mono text-emerald-300 flex items-start gap-2">
                                                    <span>+</span> {adv}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
                                        <div className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-2 border-b border-slate-600 pb-1">Vulnerabilities</div>
                                        <div className="space-y-1">
                                            {selectedDefensive.disadvantages?.map((dis, i) => (
                                                <div key={i} className="text-[10px] font-mono text-red-300 flex items-start gap-2">
                                                    <span>-</span> {dis}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Center Divider/VS */}
                        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-700"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-slate-900 border-2 border-slate-600 rounded-full flex items-center justify-center z-10 shadow-xl">
                            <span className="text-[10px] font-black text-slate-500">LINK</span>
                        </div>

                     </div>
                 </div>
             )}

             {/* Setup Tab */}
             {activeTab === 'setup' && (
                 <div className="h-full flex">
                     {/* Unit Selector */}
                     <div className="w-64 bg-slate-100 border-r border-slate-200 p-4 overflow-y-auto flex-shrink-0">
                         <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Crew Roster</div>
                         <div className="space-y-2">
                             {playerCrew.map(member => {
                                 const isPlaced = savedFormation[member.id] !== undefined;
                                 return (
                                     <button
                                        key={member.id}
                                        onClick={() => setActivePlacementId(member.id)}
                                        className={`w-full p-2 rounded-lg border-2 flex items-center gap-2 transition-all 
                                            ${activePlacementId === member.id ? 'bg-amber-100 border-amber-500 text-amber-900' : isPlaced ? 'bg-white border-slate-200 opacity-50' : 'bg-white border-slate-300 hover:border-amber-400'}
                                        `}
                                     >
                                         <div className="w-8 h-8 rounded bg-slate-200 overflow-hidden">
                                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.imageSeed}`} />
                                         </div>
                                         <div className="text-left">
                                             <div className="text-xs font-bold leading-none">{member.name}</div>
                                             <div className="text-[9px] uppercase font-bold text-slate-400">{member.isLeader ? 'Leader' : member.pawnType || 'Pawn'}</div>
                                         </div>
                                         {isPlaced && <div className="ml-auto text-green-500 text-xs">✓</div>}
                                     </button>
                                 )
                             })}
                         </div>
                     </div>

                     {/* Grid Area & Rules */}
                     <div className="flex-grow bg-slate-200 flex flex-col p-8 relative overflow-y-auto">
                         
                         {/* Retreat Logic Panel */}
                         <div className="bg-slate-900 rounded-2xl p-6 shadow-xl mb-8 flex items-stretch gap-8 border-4 border-slate-800 relative overflow-hidden flex-shrink-0">
                             <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 transform origin-bottom-right pointer-events-none"></div>
                             <div className="flex flex-col justify-center flex-shrink-0 w-24 text-center border-r border-slate-700 pr-6">
                                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Retreat At</span>
                                 <span className={`text-5xl font-black font-mono leading-none ${strategy.color}`}>{retreatThreshold}%</span>
                                 <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider mt-1">Boss Health</span>
                             </div>
                             <div className="flex-grow flex flex-col justify-center px-4 relative">
                                <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase mb-4 tracking-widest w-full px-1">
                                    <span className="text-emerald-600">Early Retreat</span>
                                    <span>Balanced</span>
                                    <span className="text-red-600">Last Stand</span>
                                </div>
                                <div className="relative h-12 w-full flex items-center">
                                    <div className="absolute left-0 right-0 h-4 bg-slate-800 rounded-full shadow-inner border border-slate-700 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 via-amber-900 to-red-900 opacity-60"></div>
                                        <div className="absolute inset-0 flex justify-between px-2 items-center">
                                            {[...Array(10)].map((_, i) => <div key={i} className="w-0.5 h-2 bg-black/30"></div>)}
                                        </div>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="95" 
                                        step="5" 
                                        value={riskFactor} 
                                        onChange={(e) => onUpdateRetreatThreshold(95 - parseInt(e.target.value))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                    />
                                    <div 
                                        className="absolute h-8 w-8 bg-white rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.5)] border-4 border-slate-700 flex items-center justify-center pointer-events-none transition-all duration-100 z-10"
                                        style={{ left: `calc(${riskFactor * 1.05}% - 16px)` }} 
                                    >
                                        <div className={`w-3 h-3 rounded-full ${strategy.color.replace('text-', 'bg-')}`}></div>
                                    </div>
                                </div>
                             </div>
                             <div className="flex flex-col justify-center w-64 flex-shrink-0 pl-6 border-l border-slate-700">
                                 <div className={`text-xs font-black uppercase tracking-widest mb-1 ${strategy.color} flex items-center gap-2`}>
                                     <span className="text-lg">{strategy.icon}</span>
                                     {strategy.label}
                                 </div>
                                 <p className="text-slate-400 text-xs font-medium leading-relaxed">"{strategy.desc}"</p>
                             </div>
                         </div>

                         {/* Firearms Protocol Panel */}
                         <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border-4 border-slate-700 relative overflow-hidden mb-8 flex-shrink-0">
                            {/* Hazard Stripes */}
                            <div className="absolute top-0 left-0 right-0 h-2 bg-[repeating-linear-gradient(45deg,#f59e0b,#f59e0b_10px,#000_10px,#000_20px)] opacity-50"></div>
                            
                            <div className="flex justify-between items-start">
                                <div className="flex-grow pr-8">
                                    <h4 className="font-black text-slate-300 uppercase text-lg tracking-widest flex items-center gap-3 mb-2">
                                        <span className="text-2xl">🔫</span> Firearms Protocol
                                    </h4>
                                    
                                    <div className="bg-slate-900/50 border-l-4 border-amber-500 p-3 rounded-r-lg mb-4">
                                        <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Logistics Note</div>
                                        <p className="text-xs text-slate-400 italic">
                                            "Unassigned weapons in the Boss's inventory are automatically distributed to unarmed crew members at the start of combat. Keep your inventory stocked."
                                        </p>
                                    </div>

                                    <div className="flex gap-8">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-colors ${combatPreferences?.fleeBossOnGun ? 'bg-emerald-600 border-emerald-400' : 'bg-slate-900 border-slate-600 group-hover:border-slate-400'}`}>
                                                {combatPreferences?.fleeBossOnGun && <span className="text-white font-bold text-xs">✓</span>}
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                className="hidden" 
                                                checked={combatPreferences?.fleeBossOnGun || false}
                                                onChange={(e) => onUpdateCombatPreferences && onUpdateCombatPreferences({ ...combatPreferences || { fleeBossOnGun: false, fleePawnsOnGun: false }, fleeBossOnGun: e.target.checked })}
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-200 uppercase">Boss Safety</span>
                                                <span className="text-[9px] text-slate-500 uppercase font-bold">Flee if Unarmed vs Gun</span>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-colors ${combatPreferences?.fleePawnsOnGun ? 'bg-emerald-600 border-emerald-400' : 'bg-slate-900 border-slate-600 group-hover:border-slate-400'}`}>
                                                {combatPreferences?.fleePawnsOnGun && <span className="text-white font-bold text-xs">✓</span>}
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                className="hidden"
                                                checked={combatPreferences?.fleePawnsOnGun || false}
                                                onChange={(e) => onUpdateCombatPreferences && onUpdateCombatPreferences({ ...combatPreferences || { fleeBossOnGun: false, fleePawnsOnGun: false }, fleePawnsOnGun: e.target.checked })}
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-200 uppercase">Crew Safety</span>
                                                <span className="text-[9px] text-slate-500 uppercase font-bold">Flee if Unarmed vs Gun</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="w-64 bg-slate-900/80 p-4 rounded-xl border border-slate-600">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <span>💡</span> Intel
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                        "Rival gangs often bluff with concealed gestures. Waiting to verify a firearm at melee range allows for a counter-attack, but risks a point-blank execution if the gun is real."
                                    </p>
                                </div>
                            </div>
                         </div>

                         <div className="flex-grow flex items-center justify-center">
                             <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border-4 border-slate-700 relative">
                                 <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-900 px-6 py-2 rounded-full text-xs font-black uppercase shadow-lg border-2 border-white z-20 whitespace-nowrap animate-bounce">
                                     {activePlacementId ? 'Click a slot to place unit' : 'Select a unit to place'}
                                 </div>
                                 <div className="grid grid-cols-8 gap-2">
                                     {[...Array(8)].map((_, i) => <div key={`lbl-${i}`} className="text-center text-[10px] font-bold text-slate-500 pb-1">{i}</div>)}
                                     {[0, 1, 2].map(y => (
                                         <React.Fragment key={y}>
                                             {[...Array(8)].map((_, x) => {
                                                 const occupantId = Object.keys(savedFormation).find(id => savedFormation[id].x === x && savedFormation[id].y === y);
                                                 const occupant = occupantId ? playerCrew.find(c => c.id === occupantId) : null;
                                                 return (
                                                     <div 
                                                        key={`${x}-${y}`}
                                                        onClick={() => handleGridClick(x, y)}
                                                        className={`w-24 h-24 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all relative
                                                            ${occupant ? 'bg-slate-700 border-slate-500' : 'bg-slate-900/50 border-slate-700 hover:bg-slate-700 hover:border-amber-500/50'}
                                                            ${activePlacementId && !occupant ? 'animate-pulse bg-amber-900/20 border-amber-500/30' : ''}
                                                        `}
                                                     >
                                                         {occupant && (
                                                             <div className="flex flex-col items-center pointer-events-none transform scale-125">
                                                                 <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white overflow-hidden shadow-sm">
                                                                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${occupant.imageSeed}`} />
                                                                 </div>
                                                                 <div className="text-[8px] font-bold text-white uppercase bg-black/50 px-1 rounded mt-[-4px] z-10">{occupant.isLeader ? '👑' : ''}</div>
                                                             </div>
                                                         )}
                                                     </div>
                                                 );
                                             })}
                                         </React.Fragment>
                                     ))}
                                 </div>
                                 <div className="text-center text-[10px] font-bold text-slate-500 pt-4 uppercase tracking-widest">
                                     Front Line (Top) • Back Line (Bottom)
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>
             )}

             {/* Talents Tab */}
             {activeTab === 'talents' && selectedMember && (
                 <div className="h-full flex overflow-hidden">
                     {/* Member Selector */}
                     <div className="w-64 bg-slate-100 border-r border-slate-200 p-4 overflow-y-auto flex-shrink-0">
                         <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Select Unit</div>
                         <div className="space-y-2">
                             {playerCrew.map(member => (
                                 <button
                                    key={member.id}
                                    onClick={() => setSelectedMemberId(member.id)}
                                    className={`w-full p-2 rounded-lg border-2 flex items-center gap-3 transition-all text-left
                                        ${selectedMemberId === member.id ? 'bg-white border-amber-500 shadow-md' : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-300'}
                                    `}
                                 >
                                     <div className="w-10 h-10 rounded bg-slate-200 overflow-hidden border border-slate-300">
                                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.imageSeed}`} />
                                     </div>
                                     <div>
                                         <div className="text-xs font-black text-slate-800">{member.name}</div>
                                         <div className="text-[10px] uppercase font-bold text-slate-400">{member.isLeader ? 'Leader' : 'Crew'}</div>
                                     </div>
                                 </button>
                             ))}
                         </div>
                     </div>

                     {/* Content Area */}
                     <div className="flex-grow overflow-y-auto custom-scrollbar p-8 bg-slate-50">
                         {!selectedMember.isLeader ? ( // Use !isLeader as pawns might not have isPawn flag set in all legacy saves
                             // NEW PAWN LEVELING COMPONENT
                             <PawnLevelingTree 
                                member={selectedMember} 
                                onPromote={(id, role) => onPromotePawn && onPromotePawn(id, role)} 
                             />
                         ) : (
                             // EXISTING BOSS TREE
                             <div className="flex flex-col h-full">
                                 <div className="flex justify-between items-end mb-8 border-b-2 border-slate-200 pb-4">
                                     <div>
                                         <h2 className="text-3xl font-black font-news uppercase tracking-tighter text-slate-900">{selectedMember.name}</h2>
                                         <div className="text-xs font-bold text-amber-600 uppercase tracking-widest">{CLASSES[selectedMember.classType].label} Talent Tree</div>
                                     </div>
                                     <div className="text-right">
                                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Available Points</div>
                                         <div className="text-4xl font-black font-mono text-emerald-600 leading-none">{remainingPoints}</div>
                                     </div>
                                 </div>
                                 
                                 {/* 3 COLUMN TALENT TREE */}
                                 <div className="grid grid-cols-3 gap-6 flex-grow">
                                     {renderTalentPath('A', getPathDetails(selectedMember.classType).A, selectedMember)}
                                     {renderTalentPath('B', getPathDetails(selectedMember.classType).B, selectedMember)}
                                     {renderTalentPath('C', getPathDetails(selectedMember.classType).C, selectedMember)}
                                 </div>
                             </div>
                         )}
                     </div>
                 </div>
             )}

             {/* ABILITIES TAB */}
             {activeTab === 'abilities' && (
                 <div className="h-full flex flex-col p-8 overflow-y-auto custom-scrollbar bg-slate-50">
                     
                     {/* Section 1: Active Loadout */}
                     <div className="bg-slate-100 rounded-xl p-6 border-2 border-slate-200 mb-8 flex-shrink-0">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight font-news">Active Loadout</h4>
                                <div className="text-xs text-slate-500 font-bold">5 Ability Slots Available • <span className="text-amber-600">Click to Select/Swap</span></div>
                            </div>
                            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded bg-white border border-slate-300 shadow-sm`}>
                                {activeAbilityIds.filter(id => id !== '').length} / 5 Assigned
                            </span>
                        </div>
                        
                        <div className="flex justify-center gap-6">
                            {[0, 1, 2, 3, 4].map(idx => {
                                const abilityId = currentLoadout[idx];
                                const card = abilityId ? CARDS[abilityId] : null;
                                const isSelected = selectedLoadoutIndex === idx;
                                
                                return (
                                    <div key={idx} className="relative group">
                                        <button 
                                            onClick={() => handleLoadoutSlotClick(idx)}
                                            onMouseEnter={(e) => card && handleCardMouseEnter(e, card)}
                                            onMouseLeave={handleCardMouseLeave}
                                            className={`
                                                w-24 h-24 rounded-2xl border-4 flex flex-col items-center justify-center transition-all relative
                                                ${card 
                                                    ? 'bg-white border-amber-400 shadow-lg cursor-pointer hover:scale-105' 
                                                    : 'bg-slate-200 border-dashed border-slate-300 hover:bg-slate-300 hover:border-slate-400'
                                                }
                                                ${isSelected ? 'ring-4 ring-amber-300 border-amber-500 transform -translate-y-2' : ''}
                                            `}
                                        >
                                            {card ? (
                                                <>
                                                    <div className="text-4xl mb-1 filter drop-shadow-sm">{card.icon}</div>
                                                    <div className="absolute top-2 right-2 w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold border border-slate-300 text-slate-600">{card.cost}</div>
                                                </>
                                            ) : (
                                                <div className="text-slate-400 text-xs font-black uppercase tracking-widest">Empty</div>
                                            )}
                                        </button>
                                        
                                        {card && (
                                            <button 
                                                onClick={(e) => handleClearSlot(e, idx)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                            >
                                                ✕
                                            </button>
                                        )}
                                        
                                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Slot {idx + 1}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                     </div>

                     {/* Section 2: Ability Pool */}
                     <div className="mb-8">
                         <div className="flex items-center gap-3 mb-4 border-b border-slate-200 pb-2">
                            <span className="text-2xl">📚</span>
                            <h4 className="text-lg font-black text-slate-700 uppercase tracking-wide font-news">Learned Abilities</h4>
                         </div>
                         
                         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                             {acquiredCards.map(card => {
                                 const isInLoadout = activeAbilityIds.includes(card.id);
                                 return (
                                     <AbilityTile 
                                        key={card.id}
                                        card={card}
                                        isLocked={false}
                                        isActive={isInLoadout}
                                        isSelected={selectedPoolAbilityId === card.id}
                                        onClick={() => !isInLoadout && handlePoolAbilityClick(card.id)}
                                        onMouseEnter={(e) => handleCardMouseEnter(e, card)}
                                        onMouseLeave={handleCardMouseLeave}
                                        size="small"
                                     />
                                 );
                             })}
                             {acquiredCards.length === 0 && (
                                <div className="col-span-full py-4 text-center text-slate-400 text-xs italic bg-slate-100 rounded-lg border border-dashed border-slate-300">
                                    No reserve abilities learned.
                                </div>
                             )}
                         </div>
                     </div>

                     {/* Section 3: Future Potential */}
                     <div>
                         <div className="flex items-center gap-3 mb-4 border-b border-slate-200 pb-2">
                            <span className="text-2xl grayscale opacity-50">🔒</span>
                            <h4 className="text-lg font-black text-slate-400 uppercase tracking-wide font-news">Future Potential</h4>
                         </div>
                         
                         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 opacity-70">
                             {futureCards.map(({card, reason}) => (
                                 <AbilityTile 
                                    key={card.id}
                                    card={card}
                                    isLocked={true}
                                    lockReason={reason}
                                    onMouseEnter={(e) => handleCardMouseEnter(e, card)}
                                    onMouseLeave={handleCardMouseLeave}
                                    size="small"
                                 />
                             ))}
                         </div>
                     </div>

                 </div>
             )}

         </div>

         {/* FIXED TOOLTIP OVERLAY FOR ABILITIES */}
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
                    <div className="text-xs text-slate-200 leading-relaxed italic mb-3">"{hoveredCard.card.description}"</div>
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

export default TacticsScreen;
