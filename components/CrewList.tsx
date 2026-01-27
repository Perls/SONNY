
import React, { useState } from 'react';
import { CrewMember, Officer, Stats } from '../types';
import { CONSIGLIERE_QUOTES, XP_TO_LEVEL_2, XP_TO_LEVEL_3, MAX_CREW_SIZE } from '../constants';
import { useGameEngine } from '../contexts/GameEngineContext';
import AvatarDisplay from './AvatarDisplay';

interface CrewListProps {
  crew: CrewMember[];
  officers: Officer[];
  onRemove: (id: string) => void;
  onPromote: (id: string) => void;
  onInspect?: (id: string) => void;
  onUpdateOfficer: (index: number, officer: Officer) => void;
  onAssignMission: (officerIndex: number, missionIndex: number) => void;
}

// DEFINITION OF OFFICER MISSIONS
const OFFICER_MISSIONS: Record<string, { icon: string; label: string; desc: string; color: string }[]> = {
    'Consigliere': [
        { icon: '🤝', label: 'Diplomacy', desc: 'Improve Faction Relations', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
        { icon: '💸', label: 'Bribes', desc: 'Reduce Heat Generation', color: 'bg-amber-100 text-amber-700 border-amber-200' },
        { icon: '🕵️', label: 'Gather Intel', desc: 'Reveal Enemy Tactics', color: 'bg-blue-100 text-blue-700 border-blue-200' }
    ],
    'Underboss': [
        { icon: '🏙️', label: 'Manage Turf', desc: 'Generate Passive Income', color: 'bg-blue-100 text-blue-700 border-blue-200' },
        { icon: '👥', label: 'Recruitment', desc: 'Find Higher Quality Recruits', color: 'bg-purple-100 text-purple-700 border-purple-200' },
        { icon: '🏋️', label: 'Training', desc: 'Passive XP for Crew', color: 'bg-orange-100 text-orange-700 border-orange-200' }
    ],
    'Enforcer': [
        { icon: '🛡️', label: 'Protection', desc: 'Defensive Bonus to Crew', color: 'bg-slate-100 text-slate-700 border-slate-200' },
        { icon: '👊', label: 'Extortion', desc: 'Aggressive Income Collection', color: 'bg-red-100 text-red-700 border-red-200' },
        { icon: '🕶️', label: 'Bodyguard', desc: 'Join Boss in Combat', color: 'bg-zinc-100 text-zinc-900 border-zinc-400' }
    ],
    'Lawyer': [
        { icon: '🧼', label: 'Laundering', desc: 'Clean Dirty Money (+10%)', color: 'bg-green-100 text-green-700 border-green-200' },
        { icon: '⚖️', label: 'Legal Defense', desc: 'Reduce Jail Chance', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
        { icon: '💼', label: 'Bail Bonds', desc: 'Instant release if jailed', color: 'bg-teal-100 text-teal-700 border-teal-200' }
    ]
};

const OFFICER_STAT_HINTS: Record<string, { stat: keyof Stats, label: string, short: string, color: string }> = {
    'Consigliere': { stat: 'intelligence', label: 'Intelligence', short: 'INT', color: 'text-blue-600' },
    'Underboss': { stat: 'luck', label: 'Luck', short: 'LCK', color: 'text-emerald-600' },
    'Enforcer': { stat: 'strength', label: 'Strength', short: 'STR', color: 'text-red-600' },
    'Lawyer': { stat: 'charisma', label: 'Charisma', short: 'CHA', color: 'text-purple-600' }
};

interface OfficerSlotProps {
    role: string;
    name?: string;
    seed?: string;
    activeMissionIdx: number;
    isEmpty?: boolean;
    target?: string;
    onKick: () => void;
    salary: number;
    onSetMission: (idx: number) => void;
    level?: number;
    onPromote?: () => void; // New Handler for empty slot
}

const OfficerSlot: React.FC<OfficerSlotProps> = ({ 
    role, name, seed, activeMissionIdx, isEmpty, target, onKick, salary, onSetMission, level, onPromote
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const missions = OFFICER_MISSIONS[role] || [];
    const currentMission = missions[activeMissionIdx];
    const statHint = OFFICER_STAT_HINTS[role];

    return (
        <div className={`
            flex flex-col p-4 rounded-xl border-2 w-full relative group transition-all z-10
            ${isEmpty ? 'bg-slate-50 border-dashed border-slate-300 items-center justify-center min-h-[180px] cursor-pointer hover:border-amber-400 hover:bg-amber-50 hover:shadow-md' : 'bg-white border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-lg hover:z-50'}
        `}
            onClick={isEmpty ? onPromote : undefined}
        >
            {isEmpty ? (
                 <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-amber-600 transition-colors">
                     <div className="text-3xl mb-2 opacity-50">👤</div>
                     <div className="text-xs font-black uppercase tracking-widest">{role}</div>
                     <div className="text-[10px] italic font-bold mt-1 bg-white px-2 py-0.5 rounded border border-slate-200 group-hover:border-amber-300">Click to Assign</div>
                     {statHint && (
                         <div className="mt-3 text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded border border-slate-200 text-center">
                             Depends on <span className={`${statHint.color} uppercase`}>{statHint.label}</span>
                         </div>
                     )}
                 </div>
            ) : (
                <>
                    {/* Header */}
                    <div className="flex w-full items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full bg-slate-200 border-2 border-slate-300 overflow-hidden relative flex-shrink-0 shadow-sm">
                            {seed ? (
                                <AvatarDisplay 
                                    seed={seed}
                                    role={role}
                                    className="w-full h-full"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 text-lg">?</div>
                            )}
                        </div>
                        <div className="min-w-0 flex-grow text-left">
                            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">{role}</div>
                            <div className="text-slate-900 font-bold font-news text-base leading-tight truncate">{name}</div>
                            {level && <div className="text-[9px] font-bold text-slate-500 uppercase mt-1 bg-slate-100 inline-block px-1.5 py-0.5 rounded">Level {level}</div>}
                            <div className="text-[10px] font-mono text-emerald-600 font-bold mt-1">N${salary}/d</div>
                        </div>
                    </div>

                    {/* Mission Selector (Custom Dropdown) */}
                    <div className="mt-auto">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Mission Orders</span>
                        </div>
                        
                        <div className="relative mb-2">
                            {/* Trigger Button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
                                className={`
                                    w-full p-2 pl-3 pr-3 border-2 rounded-lg text-xs font-bold uppercase flex justify-between items-center transition-all bg-white
                                    ${isDropdownOpen ? 'border-amber-400 shadow-md ring-2 ring-amber-100 z-50 relative' : 'border-slate-200 hover:border-slate-300 text-slate-700'}
                                `}
                            >
                                <span className="flex items-center gap-2 overflow-hidden">
                                    <span className="text-lg leading-none">{missions[activeMissionIdx]?.icon || '❓'}</span>
                                    <span className="truncate">{missions[activeMissionIdx]?.label || 'Select Mission'}</span>
                                </span>
                                <span className={`text-[10px] text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-amber-500' : ''}`}>▼</span>
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <>
                                    {/* Backdrop to close on click outside */}
                                    <div className="fixed inset-0 z-40 cursor-default" onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(false); }}></div>
                                    
                                    <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border-2 border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden animate-slide-up origin-top max-h-48 overflow-y-auto custom-scrollbar">
                                        {missions.map((m, idx) => (
                                            <button
                                                key={idx}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSetMission(idx);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`
                                                    w-full text-left p-2 pl-3 flex items-center gap-3 transition-colors text-xs font-bold uppercase border-b border-slate-50 last:border-0
                                                    ${activeMissionIdx === idx 
                                                        ? 'bg-amber-50 text-slate-900' 
                                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                                    }
                                                `}
                                            >
                                                <span className="text-lg leading-none filter drop-shadow-sm">{m.icon}</span>
                                                <div className="flex flex-col flex-grow min-w-0">
                                                    <span className="truncate">{m.label}</span>
                                                    {activeMissionIdx === idx && <span className="text-[8px] text-amber-600 leading-none mt-0.5">Active</span>}
                                                </div>
                                                {activeMissionIdx === idx && <span className="text-amber-500 font-black ml-2">✓</span>}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        
                        {/* Active Mission Details Card */}
                        <div className={`p-3 rounded-lg border-2 flex items-start gap-3 transition-all ${currentMission?.color || 'bg-slate-50 border-slate-200'}`}>
                            <div className="text-xl pt-0.5">{currentMission?.icon}</div>
                            <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-center">
                                    <div className="text-[10px] font-black uppercase leading-none mb-1">{currentMission?.label}</div>
                                </div>
                                <div className="text-[10px] opacity-80 leading-tight">{currentMission?.desc}</div>
                                {target && <div className="text-[9px] font-bold text-emerald-700 uppercase bg-white/60 px-1.5 py-0.5 rounded border border-emerald-200/50 inline-block mt-2 shadow-sm">Target: {target}</div>}
                            </div>
                        </div>
                    </div>
                    
                    {/* Kick Button */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onKick(); }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity p-1.5 hover:bg-red-50 rounded-full"
                        title="Dismiss Officer"
                    >
                        <span className="text-sm font-bold block leading-none">✕</span>
                    </button>
                </>
            )}
        </div>
    );
};

const CrewList: React.FC<CrewListProps> = ({ crew, officers, onRemove, onPromote, onInspect, onUpdateOfficer, onAssignMission }) => {
  const { gameState, handleAddXp, handlePromoteToOfficer } = useGameEngine();
  const [promotingSlotIndex, setPromotingSlotIndex] = useState<number | null>(null);

  const leader = crew.find(c => c.isLeader);
  const minions = crew.filter(c => !c.isLeader);
  
  // Calculate busy status (Holdings + Missions)
  const busyCrewIds = new Set<string>();
  const missionCrewIds = new Set<string>();

  if (gameState) {
      gameState.holdings.forEach(h => {
          if (h.type === 'corner' && h.cornerData?.assignedCrewIds) {
              h.cornerData.assignedCrewIds.forEach(id => busyCrewIds.add(id));
          }
      });
      gameState.activeMissions?.forEach(m => {
          m.crewIds.forEach(id => {
              busyCrewIds.add(id);
              missionCrewIds.add(id);
          });
      });
  }

  const handleKickOfficer = (idx: number) => {
      onUpdateOfficer(idx, { ...officers[idx], isEmpty: true, name: undefined, seed: undefined, activeMissionIdx: 0, level: undefined, target: undefined });
  };

  const handleOpenMissionConfig = (officerIdx: number, missionIdx: number) => {
      const officer = officers[officerIdx];
      if (officer.role === 'Enforcer' && (missionIdx === 2 || missionIdx === 0)) {
          onUpdateOfficer(officerIdx, {
              ...officer,
              activeMissionIdx: missionIdx,
              target: missionIdx === 2 ? 'Boss' : undefined
          });
          return;
      }
      onAssignMission(officerIdx, missionIdx);
  };

  const handleSelectPawnForPromotion = (pawnId: string) => {
      if (promotingSlotIndex === null) return;
      handlePromoteToOfficer(pawnId, promotingSlotIndex);
      setPromotingSlotIndex(null);
  };

  const getPawnIcon = (type?: string) => {
      switch(type) {
          case 'tank': return '🧱';
          case 'soldier': return '🎖️';
          case 'heavy': return '🛡️';
          case 'shooter': return '🏹';
          case 'bruiser': return '🥊';
          case 'hitter': return '⚔️';
          default: return '♟️';
      }
  };
  
  const getPawnTypeColor = (type?: string) => {
       switch(type) {
          case 'tank': return 'bg-slate-700 text-white';
          case 'soldier': return 'bg-blue-700 text-white';
          case 'heavy': return 'bg-slate-500 text-white';
          case 'shooter': return 'bg-amber-500 text-white';
          case 'bruiser': return 'bg-red-700 text-white';
          case 'hitter': return 'bg-red-500 text-white';
          default: return 'bg-slate-200 text-slate-500';
      }
  };

  const getPawnSalary = (member: CrewMember) => {
      let base = 50;
      base += member.level * 10;
      if (member.pawnType === 'heavy') base += 20;
      if (member.pawnType === 'shooter') base += 30;
      return base;
  };
  
  const calculateMaxHp = (member: CrewMember) => {
      if (member.stats.maxHp) return member.stats.maxHp; 
      
      let maxHp = member.isPawn ? 15 : 20 + (member.stats.strength * 3);
      if (member.stats.maxHp) maxHp += member.stats.maxHp;
      if (member.pawnType === 'heavy') maxHp += 15;
      if (member.pawnType === 'tank') maxHp += 25;
      if (member.pawnType === 'soldier') maxHp += 10;
      if (member.pawnType === 'shooter') maxHp = Math.floor(maxHp * 0.7);
      return maxHp;
  };

  const totalDailyCost = officers.reduce((acc, o) => acc + (o.isEmpty ? 0 : o.salary), 0) + minions.reduce((acc, m) => acc + getPawnSalary(m), 0);
  
  // Calculate max soldiers (excluding leader)
  const maxSoldiers = MAX_CREW_SIZE - 1;

  const getPromotionHint = () => {
      if (promotingSlotIndex === null) return null;
      const role = officers[promotingSlotIndex].role;
      return OFFICER_STAT_HINTS[role];
  };
  
  const promotionHint = getPromotionHint();

  return (
    <div className="flex flex-col h-full bg-slate-50 font-waze overflow-hidden relative">
      
      {/* 1. ORGANIZATION HEADER (Minimized Boss) */}
      <div 
        className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shadow-sm flex-shrink-0 z-20 cursor-pointer hover:bg-slate-50 transition-colors group"
        onClick={() => leader && onInspect && onInspect(leader.id)}
      >
          <div className="flex items-center gap-5">
              {leader ? (
                  <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full border-4 border-slate-800 overflow-hidden bg-slate-700 shadow-md relative group-hover:border-amber-400 transition-colors">
                           <AvatarDisplay 
                                seed={leader.imageSeed.toString()}
                                role={leader.classType}
                                className="w-full h-full"
                           />
                           <div className="absolute bottom-0 right-0 w-5 h-5 bg-amber-500 border-2 border-white rounded-full flex items-center justify-center text-[10px]">★</div>
                      </div>
                      <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 group-hover:text-amber-500 transition-colors">The Boss</div>
                          <div className="text-2xl font-black font-news leading-none text-slate-900">{leader.name}</div>
                          <div className="text-xs text-amber-600 font-bold uppercase mt-1">"{leader.nickname}"</div>
                      </div>
                  </div>
               ) : (
                  <div className="text-red-500 font-bold uppercase text-xs">Boss Missing</div>
               )}
          </div>

          <div className="flex items-center gap-8 border-l border-slate-200 pl-8">
               {/* XP Test Button */}
               <button 
                 onClick={(e) => { e.stopPropagation(); handleAddXp(500); }}
                 className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 rounded font-bold uppercase text-[10px] hover:bg-blue-200 transition-colors"
                 title="Dev Tool: Give XP to All"
               >
                 +500 XP (Test)
               </button>

               <div className="text-right">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Daily Payroll</div>
                    <div className="font-mono font-bold text-red-500 text-lg">
                        N$ {totalDailyCost.toLocaleString()}
                    </div>
               </div>
               <div className="text-right">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Crew Strength</div>
                    <div className="font-mono font-bold text-slate-700 text-lg">{minions.length} / {maxSoldiers}</div>
               </div>
          </div>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar p-8">
          
          {/* 2. OFFICERS SECTION */}
          <div className="mb-10">
              <div className="flex items-center gap-4 mb-6">
                  <div className="h-px bg-slate-300 flex-grow"></div>
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Inner Circle</span>
                  <div className="h-px bg-slate-300 flex-grow"></div>
              </div>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
                  {officers.map((off, idx) => (
                      <OfficerSlot 
                        key={idx}
                        role={off.role} 
                        name={off.name} 
                        seed={off.seed} 
                        activeMissionIdx={off.activeMissionIdx} 
                        isEmpty={off.isEmpty} 
                        salary={off.salary}
                        level={off.level}
                        target={off.target}
                        onKick={() => handleKickOfficer(idx)}
                        onSetMission={(mIdx) => handleOpenMissionConfig(idx, mIdx)}
                        onPromote={() => setPromotingSlotIndex(idx)}
                      />
                  ))}
              </div>
          </div>

          {/* 3. SOLDIERS SECTION */}
          <div>
              <div className="flex items-center gap-4 mb-6">
                  <div className="h-px bg-slate-300 flex-grow"></div>
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Street Soldiers</span>
                  <div className="h-px bg-slate-300 flex-grow"></div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {minions.map(member => {
                      const xp = member.xp || 0;
                      const maxXp = member.maxXp || (member.level === 1 ? XP_TO_LEVEL_2 : XP_TO_LEVEL_3);
                      // Promotion logic needs to check if max rank (5) is reached to disable promtion
                      const isReadyForPromotion = xp >= maxXp && member.level < 3;
                      
                      const maxHp = calculateMaxHp(member);
                      const currentHp = member.hp !== undefined ? member.hp : maxHp;
                      const hpPercent = (currentHp / maxHp) * 100;
                      
                      // Check busy status
                      const isBusy = busyCrewIds.has(member.id);
                      const isOnMission = missionCrewIds.has(member.id);

                      return (
                          <div 
                              key={member.id} 
                              onClick={() => !isBusy && onInspect && onInspect(member.id)}
                              className={`bg-white border rounded-xl p-4 transition-all group relative flex flex-col
                                  ${isBusy 
                                      ? 'border-slate-200 bg-slate-50 opacity-80 cursor-default' 
                                      : 'border-slate-200 hover:border-amber-400 hover:shadow-md cursor-pointer hover:bg-slate-50 hover:z-50'
                                  }
                              `}
                          >
                              {/* Hover Inspect Indicator - Hide if busy */}
                              {!isBusy && (
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 bg-slate-900/80 text-white text-[10px] font-bold px-3 py-1.5 rounded backdrop-blur-sm uppercase tracking-wider">
                                    Inspect Unit
                                </div>
                              )}

                              <div className="flex items-center gap-3 mb-3">
                                   <div className={`w-12 h-12 rounded bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0 relative ${['heavy','tank'].includes(member.pawnType || '') ? 'transform scale-x-110' : ''} ${isBusy ? 'grayscale' : ''}`}>
                                        <AvatarDisplay 
                                            seed={member.imageSeed.toString()}
                                            role={member.pawnType || 'pawn'}
                                            className="w-full h-full group-hover:scale-110 transition-transform duration-500"
                                        />
                                        
                                        {/* MISSION OVERLAY */}
                                        {isOnMission && (
                                            <div className="absolute inset-0 bg-red-900/60 flex flex-col items-center justify-center p-0.5">
                                                <span className="text-white font-black text-[8px] leading-none text-center">ON</span>
                                                <span className="text-white font-black text-[8px] leading-none text-center">MISSION</span>
                                            </div>
                                        )}
                                        
                                        {/* STATION BADGE */}
                                        {isBusy && !isOnMission && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <span className="text-lg">🔒</span>
                                            </div>
                                        )}

                                        <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-tl-lg flex items-center justify-center text-[10px] shadow-sm ${getPawnTypeColor(member.pawnType)}`}>
                                            {getPawnIcon(member.pawnType)}
                                        </div>
                                   </div>
                                   <div className="min-w-0">
                                       <div className="font-bold text-slate-800 text-sm truncate font-news">{member.name}</div>
                                       {isOnMission ? (
                                           <div className="text-[9px] font-black text-red-600 bg-red-50 px-1.5 rounded border border-red-100 uppercase inline-block mt-0.5 tracking-wide">
                                               On Mission
                                           </div>
                                       ) : isBusy ? (
                                           <div className="text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 rounded border border-blue-100 uppercase inline-block mt-0.5 tracking-wide">
                                               Stationed
                                           </div>
                                       ) : (
                                           <div className="text-[10px] font-black text-slate-400 uppercase">Level {member.level}</div>
                                       )}
                                   </div>
                              </div>
                              
                              <div className="mt-auto w-full space-y-2">
                                   {/* HP Bar */}
                                   <div>
                                       <div className="flex justify-between text-[8px] uppercase font-bold text-slate-400 mb-0.5">
                                           <span>HP {currentHp}/{maxHp}</span>
                                       </div>
                                       <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
                                           <div className={`h-full transition-all duration-500 ${hpPercent < 30 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, hpPercent)}%` }}></div>
                                       </div>
                                   </div>

                                   {/* XP Bar */}
                                   <div>
                                       <div className="flex justify-between text-[8px] uppercase font-bold text-slate-400 mb-0.5">
                                           <span>XP {xp}/{maxXp}</span>
                                           {isReadyForPromotion && !isBusy && <span className="text-amber-500 animate-pulse">PROMOTE!</span>}
                                       </div>
                                       <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
                                           <div className="h-full bg-blue-500 transition-all duration-500 relative" style={{ width: `${Math.min(100, (xp / maxXp) * 100)}%` }}>
                                               {isReadyForPromotion && !isBusy && <div className="absolute inset-0 bg-white/50 animate-pulse"></div>}
                                           </div>
                                       </div>
                                   </div>
                              </div>

                              {/* Dismiss Button (Propagation Stopper) - Hide if busy */}
                              {!isBusy && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); onRemove(member.id); }}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity p-1 z-20"
                                    title="Dismiss"
                                  >
                                      ✕
                                  </button>
                              )}
                          </div>
                      );
                  })}
                  
                  {/* Empty Slots visuals */}
                  {[...Array(Math.max(0, maxSoldiers - minions.length))].map((_, i) => (
                      <div key={`empty-${i}`} className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center opacity-40 min-h-[100px]">
                          <span className="text-slate-300 text-3xl mb-1">+</span>
                          <span className="text-slate-300 text-[9px] font-bold uppercase tracking-widest">Recruit</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* PROMOTION SELECTOR MODAL */}
      {promotingSlotIndex !== null && (
          <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border-4 border-amber-500 overflow-hidden flex flex-col max-h-[80vh]">
                  <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
                      <div>
                          <h3 className="text-lg font-black uppercase text-slate-800">Assign Officer</h3>
                          <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Select a crew member to promote</div>
                      </div>
                      <button onClick={() => setPromotingSlotIndex(null)} className="text-slate-400 hover:text-red-500 font-bold text-xl">✕</button>
                  </div>
                  
                  {/* Optional Hint Banner */}
                  {promotionHint && (
                      <div className="bg-amber-50 px-4 py-2 border-b border-amber-100 flex items-center justify-center text-center">
                          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">
                              Ideal Candidate: High <span className="font-black">{promotionHint.label}</span>
                          </span>
                      </div>
                  )}

                  <div className="flex-grow overflow-y-auto p-4 custom-scrollbar bg-slate-50">
                      {minions.filter(m => !busyCrewIds.has(m.id)).length === 0 ? (
                          <div className="text-center text-slate-400 py-8 italic border-2 border-dashed border-slate-200 rounded-lg">
                              No eligible crew members available.
                          </div>
                      ) : (
                          <div className="space-y-2">
                              {minions.filter(m => !busyCrewIds.has(m.id)).map(member => {
                                  // Determine visual highlighting for relevant stat
                                  const relevantStatVal = promotionHint ? member.stats[promotionHint.stat] : 0;
                                  const isGoodStat = relevantStatVal >= 5;

                                  return (
                                      <button
                                          key={member.id}
                                          onClick={() => handleSelectPawnForPromotion(member.id)}
                                          className="w-full flex items-center gap-4 p-3 bg-white border-2 border-slate-200 rounded-lg hover:border-amber-400 hover:shadow-md transition-all text-left group"
                                      >
                                          <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 overflow-hidden relative">
                                              <AvatarDisplay 
                                                seed={member.imageSeed.toString()}
                                                role={member.pawnType || 'pawn'}
                                                className="w-full h-full"
                                              />
                                              <div className={`absolute bottom-0 right-0 w-4 h-4 flex items-center justify-center text-[8px] rounded-tl shadow-sm ${getPawnTypeColor(member.pawnType)}`}>
                                                  {getPawnIcon(member.pawnType)}
                                              </div>
                                          </div>
                                          <div className="flex-grow min-w-0">
                                              <div className="font-bold text-sm text-slate-800 uppercase group-hover:text-amber-700">{member.name}</div>
                                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                                  Level {member.level} • {member.pawnType || 'Pawn'}
                                              </div>
                                          </div>
                                          
                                          {/* Stat Highlight */}
                                          {promotionHint && (
                                              <div className={`flex flex-col items-end mr-2 px-2 py-1 rounded border ${isGoodStat ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{promotionHint.short}</span>
                                                  <span className={`text-sm font-black ${isGoodStat ? 'text-emerald-600' : 'text-slate-600'}`}>{relevantStatVal}</span>
                                              </div>
                                          )}

                                          <div className="ml-auto bg-amber-50 text-amber-600 text-[9px] font-black uppercase px-2 py-1 rounded border border-amber-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                              Promote
                                          </div>
                                      </button>
                                  );
                              })}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default CrewList;
