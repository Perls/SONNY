
import React from 'react';
import { CrewMember, PawnRole, ClassType } from '../types';
import { CLASSES, PAWN_JOBS, PAWN_TREE, XP_TO_LEVEL_2, XP_TO_LEVEL_3 } from '../constants';
import StatBar from './StatBar';
import EffectsList from './EffectsList';
import AvatarDisplay from './AvatarDisplay';

interface CharacterInspectWindowProps {
  member: CrewMember;
  onDismiss?: (id: string) => void;
  onPromote?: (id: string, newRole: PawnRole) => void;
}

const CharacterInspectWindow: React.FC<CharacterInspectWindowProps> = ({ member, onDismiss, onPromote }) => {
  const classDef = CLASSES[member.classType];
  
  // Calculate Derived Stats
  const hp = member.hp || (20 + (member.stats.strength * 3));
  const maxHp = member.stats.maxHp ? member.stats.maxHp + (20 + (member.stats.strength * 3)) : (20 + (member.stats.strength * 3)); 
  
  const getStatColor = (stat: string) => {
    switch(stat) {
      case 'STR': return 'bg-red-700';
      case 'AGI': return 'bg-amber-500';
      case 'INT': return 'bg-teal-600';
      case 'LCK': return 'bg-emerald-600';
      case 'CHA': return 'bg-purple-700';
      case 'WIL': return 'bg-indigo-600';
      default: return 'bg-slate-400';
    }
  };

  const getClassColorBg = (type: ClassType) => {
    if (member.isPawn || !member.isLeader) return 'bg-slate-400'; // Generic grey for pawns
    
    switch(type) {
        case ClassType.Thug: return 'bg-slate-700';
        case ClassType.Smuggler: return 'bg-yellow-600';
        case ClassType.Dealer: return 'bg-blue-700';
        case ClassType.Entertainer: return 'bg-purple-700';
        case ClassType.Hustler: return 'bg-emerald-700';
        default: return 'bg-slate-700';
    }
  };

  // XP Logic
  const xp = member.xp || 0;
  const maxXp = member.maxXp || (member.level === 1 ? XP_TO_LEVEL_2 : XP_TO_LEVEL_3);
  const isReadyForPromotion = xp >= maxXp && member.level < 3 && !member.isLeader;
  
  const currentRole = member.pawnType || 'pawn';
  const promotionOptions = PAWN_TREE[currentRole] || [];

  return (
    <div className="h-full bg-slate-100 flex overflow-hidden font-waze text-slate-900">
        
        {/* Left Column: Identity & Status */}
        <div className="w-72 bg-slate-200 border-r border-slate-300 flex flex-col p-6 overflow-y-auto custom-scrollbar shadow-inner flex-shrink-0">
            
            <div className="flex flex-col items-center mb-6">
                <div className={`w-32 h-32 rounded-lg border-4 border-slate-300 shadow-xl overflow-hidden mb-4 relative group ${getClassColorBg(member.classType)}`}>
                    <AvatarDisplay 
                        seed={member.imageSeed.toString()}
                        role={!member.isLeader ? member.pawnType : member.classType}
                        className="w-full h-full transform scale-110 translate-y-2"
                    />
                    {/* Role Icon Overlay */}
                    <div className="absolute bottom-0 right-0 bg-slate-900 text-white w-8 h-8 flex items-center justify-center text-lg font-bold border-t-2 border-l-2 border-slate-300 rounded-tl-lg">
                        {!member.isLeader && member.pawnType ? PAWN_JOBS[member.pawnType].icon : '👑'}
                    </div>
                </div>
                
                <h2 className="text-2xl font-black font-news text-slate-800 text-center leading-none mb-1">{member.name}</h2>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center mb-3">"{member.nickname}"</div>
                
                <div className="flex flex-wrap gap-2 justify-center">
                    <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border shadow-sm bg-white border-slate-300 text-slate-600`}>
                        Lvl {member.level}
                    </div>
                    {/* Updated Class Display Logic */}
                    {!member.isLeader ? (
                         <>
                            <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border shadow-sm bg-slate-600 text-white border-slate-700`}>
                                BUTTONMAN
                            </div>
                            <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border shadow-sm bg-amber-100 text-amber-800 border-amber-200`}>
                                {member.pawnType ? PAWN_JOBS[member.pawnType].label : 'Pawn'}
                            </div>
                         </>
                    ) : (
                        <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border shadow-sm bg-slate-800 text-amber-500 border-slate-700`}>
                            {classDef.label}
                        </div>
                    )}
                </div>
            </div>

            {/* XP Bar */}
            <div className="bg-white p-3 rounded-xl border border-slate-300 shadow-sm mb-6">
                <div className="flex justify-between items-end mb-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Experience</div>
                    <div className="text-[10px] font-mono font-bold text-blue-600">{xp} / {maxXp}</div>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                     <div className={`h-full bg-blue-500 transition-all duration-500 ${isReadyForPromotion ? 'animate-pulse bg-amber-500' : ''}`} style={{ width: `${Math.min(100, (xp/maxXp)*100)}%` }}></div>
                </div>
                {isReadyForPromotion && (
                    <div className="text-[9px] font-black text-amber-600 uppercase mt-1 text-center animate-pulse">
                        Promotion Available
                    </div>
                )}
            </div>
            
            <div className="mt-auto space-y-3">
                 {/* Dismiss Button (Only for pawns/non-leaders) */}
                 {!member.isLeader && onDismiss && (
                     <button 
                        onClick={() => onDismiss(member.id)}
                        className="w-full py-3 border-2 border-red-200 bg-red-50 text-red-700 font-bold uppercase tracking-widest text-xs rounded hover:bg-red-100 hover:border-red-400 transition-all"
                     >
                         Dismiss Unit
                     </button>
                 )}
            </div>
        </div>

        {/* Right Column: Stats & Actions */}
        <div className="flex-grow p-8 overflow-y-auto custom-scrollbar bg-slate-50">
            
            {/* PROMOTION ZONE */}
            {isReadyForPromotion && onPromote && (
                <div className="mb-8 bg-amber-50 border-2 border-amber-200 rounded-xl p-4 shadow-sm animate-slide-up">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl">⭐</span>
                        <div>
                            <h3 className="font-black font-news uppercase text-amber-800 text-lg leading-none">Field Promotion</h3>
                            <p className="text-xs text-amber-700/70">Select a specialization for this unit.</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        {promotionOptions.map(role => {
                            const job = PAWN_JOBS[role];
                            return (
                                <button
                                    key={role}
                                    onClick={() => onPromote(member.id, role as PawnRole)}
                                    className="bg-white border border-amber-300 p-3 rounded-lg flex items-center gap-3 hover:bg-amber-100 hover:shadow-md transition-all text-left group"
                                >
                                    <div className="w-10 h-10 rounded bg-amber-200 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                        {job.icon}
                                    </div>
                                    <div>
                                        <div className="font-black uppercase text-slate-800 text-sm">{job.label}</div>
                                        <div className="text-[10px] text-slate-500">{job.description}</div>
                                        {/* Stat Preview */}
                                        <div className="flex gap-1 mt-1">
                                             {Object.entries(job.statBonus).map(([k,v]) => (
                                                 <span key={k} className="text-[8px] px-1 bg-slate-100 border border-slate-200 rounded text-slate-600 uppercase">+{v as number} {k.substring(0,3)}</span>
                                             ))}
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                        {promotionOptions.length === 0 && (
                            <div className="col-span-2 text-center text-xs text-slate-400 italic">Max Rank Achieved</div>
                        )}
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-px bg-slate-300 flex-grow"></div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Combat Metrics</span>
                    <div className="h-px bg-slate-300 flex-grow"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    <StatBar label="Strength" value={member.stats.strength} colorClass={getStatColor('STR')} />
                    <StatBar label="Agility" value={member.stats.agility} colorClass={getStatColor('AGI')} />
                    <StatBar label="Intellect" value={member.stats.intelligence} colorClass={getStatColor('INT')} />
                    <StatBar label="Luck" value={member.stats.luck} colorClass={getStatColor('LCK')} />
                    <StatBar label="Charisma" value={member.stats.charisma} colorClass={getStatColor('CHA')} />
                    <StatBar label="Willpower" value={member.stats.willpower || 0} colorClass={getStatColor('WIL')} />
                </div>
            </div>

            {/* Effects List Integration */}
            <div className="mb-8">
                {/* We treat inspection of owned pawns as Owner view */}
                <EffectsList activeTraits={member.traits} isOwner={true} />
            </div>

            {/* Backstory / Flavor */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-px bg-slate-300 flex-grow"></div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Background</span>
                    <div className="h-px bg-slate-300 flex-grow"></div>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-sm text-slate-600 font-serif leading-relaxed italic">
                        "{member.backstory}"
                    </p>
                </div>
            </div>

        </div>
    </div>
  );
};

export default CharacterInspectWindow;
