
import React, { useState, useMemo } from 'react';
import { CrewMember, ClassType, PlayerHousing } from '../types';
import { CLASSES, XP_TO_LEVEL_2, XP_TO_LEVEL_3, BOROUGHS, BACKSTORY_STEPS, CONNECTION_OPTIONS } from '../constants';
import StatBar from './StatBar';
import StatsDisplay from './StatsDisplay';
import StressMeter from './StressMeter';
import EffectsList from './EffectsList';
import { useGameEngine } from '../contexts/GameEngineContext';
import AvatarDisplay from './AvatarDisplay';

interface ProfileWindowProps {
  boss: CrewMember;
  money: number;
  respect: number;
  onUpdateStatus?: (memberId: string, status: string) => void;
  currentEnergy?: number;
}

const ProfileWindow: React.FC<ProfileWindowProps> = ({ boss, money, respect, onUpdateStatus, currentEnergy = 50 }) => {
  const { setIsHousingOpen, gameState } = useGameEngine();
  const [activeTab, setActiveTab] = useState<'stats' | 'origin'>('stats');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [tempStatus, setTempStatus] = useState(boss.statusMessage || "");

  const classDef = CLASSES[boss.classType];
  const boroughDef = boss.borough ? BOROUGHS.find(b => b.id === boss.borough) : null;
  const housing = gameState?.playerHousing;
  const housingHolding = housing && gameState ? gameState.holdings.find(h => h.x === housing.location.x && h.y === housing.location.y) : null;

  // Stats
  const maxHp = boss.stats.maxHp ? boss.stats.maxHp + (20 + (boss.stats.strength * 3)) : (20 + (boss.stats.strength * 3));
  const currentHp = boss.hp !== undefined ? boss.hp : maxHp;
  const hpPercent = (currentHp / maxHp) * 100;

  // XP
  const xp = boss.xp || 0;
  const maxXp = boss.maxXp || (boss.level === 1 ? XP_TO_LEVEL_2 : XP_TO_LEVEL_3);
  const xpPercent = Math.min(100, (xp / maxXp) * 100);

  // Prepare active traits list including temporary ones
  const activeTraits = [...boss.traits];

  // Inject Low Energy Debuff
  if (currentEnergy < 15) {
      activeTraits.push({
          id: 'low_energy',
          rank: 1
      });
  }

  // Family Logic (unchanged)
  const familyTree = useMemo(() => {
      const getSeed = (val: string | number) => {
          if (typeof val === 'number') return val;
          let hash = 0;
          for (let i = 0; i < val.length; i++) {
              hash = ((hash << 5) - hash) + val.charCodeAt(i);
              hash |= 0;
          }
          return Math.abs(hash);
      };
      
      let seed = parseInt(boss.id.substring(0, 8), 36) || getSeed(boss.imageSeed);
      const rand = () => {
          seed = (seed * 9301 + 49297) % 233280;
          return seed / 233280;
      };

      const lastNames = ["Rossi", "Moretti", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino"];
      const bossLastName = boss.name.split(' ').length > 1 ? boss.name.split(' ').pop() : lastNames[Math.floor(rand() * lastNames.length)];

      const fatherNames = ["Vito", "Lorenzo", "Antonio", "Giovanni", "Dante", "Enzo", "Salvatore"];
      const motherNames = ["Maria", "Carmela", "Lucia", "Sofia", "Giulia", "Rosa", "Francesca"];
      const siblingNames = ["Sonny", "Fredo", "Connie", "Michael", "Carlo", "Tom", "Paolo"];

      const fatherStatus = rand() > 0.4 ? "Deceased" : rand() > 0.7 ? "Incarcerated" : "Retired";
      const motherStatus = rand() > 0.6 ? "Alive" : "Deceased";

      const numSiblings = Math.floor(rand() * 4); // 0 to 3 siblings
      const siblings = [];
      
      for(let i=0; i<numSiblings; i++) {
          const sStatus = rand() > 0.8 ? "Deceased" : rand() > 0.6 ? "Incarcerated" : "Alive";
          siblings.push({
              name: `${siblingNames[Math.floor(rand() * siblingNames.length)]} ${bossLastName}`,
              relation: rand() > 0.5 ? "Brother" : "Sister",
              status: sStatus,
              seed: (typeof boss.imageSeed === 'number' ? boss.imageSeed : getSeed(boss.imageSeed)) + 100 + i
          });
      }

      return {
          father: { name: `${fatherNames[Math.floor(rand() * fatherNames.length)]} ${bossLastName}`, status: fatherStatus, seed: (typeof boss.imageSeed === 'number' ? boss.imageSeed : getSeed(boss.imageSeed)) + 50 },
          mother: { name: `${motherNames[Math.floor(rand() * motherNames.length)]} ${bossLastName}`, status: motherStatus, seed: (typeof boss.imageSeed === 'number' ? boss.imageSeed : getSeed(boss.imageSeed)) + 51 },
          siblings
      };
  }, [boss.id, boss.imageSeed, boss.name]);

  const getClassColorBg = (type: ClassType) => {
    switch(type) {
        case ClassType.Thug: return 'bg-slate-700';
        case ClassType.Smuggler: return 'bg-yellow-600';
        case ClassType.Dealer: return 'bg-blue-700';
        case ClassType.Entertainer: return 'bg-purple-700';
        case ClassType.Hustler: return 'bg-emerald-700';
        default: return 'bg-slate-700';
    }
  };

  const getStatColor = (stat: string) => {
    switch(stat) {
      case 'STR': return 'bg-red-700';
      case 'AGI': return 'bg-amber-500';
      case 'INT': return 'bg-teal-600';
      case 'LCK': return 'bg-emerald-600';
      case 'CHA': return 'bg-purple-700';
      default: return 'bg-slate-400';
    }
  };

  const getClassIcon = (type: ClassType) => {
    switch(type) {
        case ClassType.Thug: return <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>;
        case ClassType.Smuggler: return <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>;
        case ClassType.Dealer: return <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z"/>;
        case ClassType.Entertainer: return <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.07 0-3.75-1.68-3.75-3.75S9.93 9 12 9s3.75 1.68 3.75 3.75S14.07 16.5 12 16.5zm0-9c-.69 0-1.25-.56-1.25-1.25S11.31 5 12 5s1.25.56 1.25 1.25S12.69 7.5 12 7.5z"/>;
        case ClassType.Hustler: return <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>;
    }
  }

  const handleStatusSubmit = () => {
      if (onUpdateStatus) {
          onUpdateStatus(boss.id, tempStatus);
          setIsEditingStatus(false);
      }
  };

  return (
    <div className="h-full bg-slate-100 flex overflow-hidden font-waze relative">
        
        {/* Left Column: Identity & Resources */}
        <div className="w-80 bg-slate-200 border-r border-slate-300 flex flex-col p-6 overflow-y-auto custom-scrollbar shadow-inner flex-shrink-0 z-20">
            
            <div className="flex flex-col items-center mb-6">
                <div className={`w-32 h-32 rounded-full border-4 border-slate-300 shadow-xl overflow-visible mb-4 relative group ${getClassColorBg(boss.classType)}`}>
                    <div className="w-full h-full rounded-full overflow-hidden">
                        <AvatarDisplay 
                            seed={boss.imageSeed.toString()}
                            role={boss.classType}
                            className="w-full h-full transform scale-110 translate-y-2"
                        />
                    </div>
                </div>
                
                <h2 className="text-3xl font-black font-news text-slate-800 text-center leading-none mb-1">{boss.name}</h2>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center mb-3">"{boss.nickname}"</div>
                
                <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm flex items-center gap-2 ${
                    classDef.type.includes('Thug') ? 'bg-slate-100 text-slate-700 border-slate-300' :
                    classDef.type.includes('Smuggler') ? 'bg-amber-100 text-amber-800 border-amber-200' :
                    classDef.type.includes('Dealer') ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    classDef.type.includes('Entertainer') ? 'bg-purple-100 text-purple-800 border-purple-200' :
                    'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                        {getClassIcon(boss.classType)}
                    </svg>
                    {classDef.label.replace('The ', '')}
                </div>
            </div>

            {/* HP and XP Bars */}
            <div className="space-y-4 mb-6">
                 {/* HP */}
                 <div>
                    <div className="flex justify-between items-end mb-1 px-1">
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Health</span>
                         <span className="text-[10px] font-mono font-bold text-emerald-600">{currentHp}/{maxHp}</span>
                    </div>
                    <div className="h-3 w-full bg-slate-300 rounded-full overflow-hidden border border-slate-400 shadow-inner">
                        <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                            style={{ width: `${hpPercent}%` }}
                        ></div>
                    </div>
                 </div>

                 {/* XP */}
                 <div>
                    <div className="flex justify-between items-end mb-1 px-1">
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Experience</span>
                         <span className="text-[10px] font-mono font-bold text-blue-600">{xp}/{maxXp}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-300 rounded-full overflow-hidden border border-slate-400 shadow-inner">
                        <div 
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${xpPercent}%` }}
                        ></div>
                    </div>
                 </div>
            </div>
            
            <div className="space-y-3 mb-8">
                <div className="bg-white p-3 rounded-xl border border-slate-300 shadow-sm flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net Worth</span>
                    <span className="font-mono font-bold text-emerald-600">N$ {money.toLocaleString()}</span>
                </div>
                
                <div className="bg-white p-3 rounded-xl border border-slate-300 shadow-sm flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Influence</span>
                    <span className="font-bold text-amber-600 flex items-center gap-1">👑 {respect}</span>
                </div>

                {/* Stress Meter */}
                <StressMeter value={boss.stress || 0} />
            </div>
            
            {/* Status Section */}
            <div className="mt-auto">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-300 pb-1">Set Status</div>
                <div className="bg-white rounded-lg border-2 border-slate-300 p-2 shadow-sm focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
                    {isEditingStatus ? (
                        <div className="flex flex-col gap-2">
                             <input 
                                type="text" 
                                autoFocus
                                value={tempStatus}
                                onChange={(e) => setTempStatus(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleStatusSubmit()}
                                placeholder="What's the word on the street?"
                                className="w-full text-xs font-medium text-slate-700 placeholder:text-slate-300 outline-none"
                             />
                             <div className="flex justify-end gap-2">
                                 <button onClick={() => setIsEditingStatus(false)} className="text-[9px] font-bold uppercase text-slate-400 hover:text-slate-600">Cancel</button>
                                 <button onClick={handleStatusSubmit} className="text-[9px] font-bold uppercase text-amber-600 hover:text-amber-800">Save</button>
                             </div>
                        </div>
                    ) : (
                        <div 
                            onClick={() => { setIsEditingStatus(true); setTempStatus(boss.statusMessage || ""); }}
                            className="text-xs font-medium text-slate-700 min-h-[1.5em] cursor-pointer hover:text-slate-900 flex items-center gap-2"
                        >
                            <span className="ml-auto text-slate-300 text-[10px] opacity-0 group-hover:opacity-100">✏️</span>
                            <span className={boss.statusMessage ? "" : "text-slate-300 italic"}>
                                {boss.statusMessage || "Set a status..."}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Column: Tabbed Content */}
        <div className="flex-grow flex flex-col min-w-0 bg-slate-50">
            
            {/* Tab Header */}
            <div className="flex border-b border-slate-200 bg-white">
                <button 
                    onClick={() => setActiveTab('stats')}
                    className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === 'stats' ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                >
                    <span className="text-lg">⚔️</span> Profile & Stats
                </button>
                <button 
                    onClick={() => setActiveTab('origin')}
                    className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === 'origin' ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                >
                    <span className="text-lg">🌳</span> Legacy & Origin
                </button>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-grow overflow-y-auto custom-scrollbar p-8">
                
                {/* 1. STATS TAB */}
                {activeTab === 'stats' && (
                    <div className="animate-fade-in space-y-8">
                        {/* Use New Stats Display Component */}
                        <StatsDisplay stats={boss.stats} />

                        {/* Effects List (Includes Traits, Buffs, Reputations) */}
                        <EffectsList activeTraits={activeTraits} isOwner={true} />

                         {/* Safehouse Section */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-px bg-slate-300 flex-grow"></div>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Property</span>
                                <div className="h-px bg-slate-300 flex-grow"></div>
                            </div>
                            
                            {housing ? (
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-2xl border border-amber-200">
                                            🏠
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-800 uppercase text-sm">{housing.name}</h4>
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                                Location: Block {housing.location.x}-{housing.location.y}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Right Side Info instead of Button */}
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Level {housingHolding?.level || 1}</span>
                                            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Acquired: {new Date(gameState?.lastPlayed || Date.now()).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-[10px] font-black text-slate-700 uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                            Crew: Leader Only
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                                    <span className="text-xs text-slate-400 font-bold uppercase">No Safehouse Assigned</span>
                                </div>
                            )}
                        </div>

                    </div>
                )}

                {/* 2. ORIGIN TAB */}
                {activeTab === 'origin' && (
                    <div className="animate-fade-in space-y-8">
                        {/* Improved Borough Display */}
                        {boroughDef && (
                            <div className={`relative overflow-hidden rounded-xl border-2 p-6 mb-6 group ${boroughDef.color.replace('bg-', 'border-').replace('600', '200')} bg-white shadow-sm`}>
                                {/* Background Abbreviation */}
                                <div className="absolute top-0 right-0 p-4 opacity-5 font-news text-9xl font-black text-slate-900 pointer-events-none leading-none select-none -mt-4 -mr-4">
                                    {boroughDef.abbreviation}
                                </div>

                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-white font-black text-2xl shadow-md ${boroughDef.color}`}>
                                            {boroughDef.id.substring(0,2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Borough of Origin</div>
                                            <div className="font-news font-black text-slate-900 text-4xl leading-none uppercase tracking-tight">{boroughDef.label}</div>
                                            <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-1">{boroughDef.description}</div>
                                        </div>
                                    </div>

                                    {/* Stat Modifiers */}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {Object.entries(boroughDef.statModifiers).map(([stat, val]) => (
                                            <div key={stat} className="flex items-center bg-slate-100 border border-slate-200 rounded px-2 py-1 shadow-sm">
                                                <span className="text-[10px] font-black text-slate-500 uppercase mr-1">{stat}</span>
                                                <span className={`text-xs font-black ${Number(val) > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {Number(val) > 0 ? '+' : ''}{val}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Updated Life Path (Timeline Style) */}
                        {boss.originPath && boss.originPath.length > 0 && (
                            <div className="mb-6 pb-6 border-b border-slate-100">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Life Path & Connections</div>
                                <div className="flex flex-col gap-3">
                                    {boss.originPath.map((choiceId, idx) => {
                                        // Resolve Option Details
                                        let stepTitle = "Event";
                                        let optionLabel = choiceId;
                                        let optionDesc = "";
                                        let option = null;

                                        // Check standard steps
                                        if (idx < BACKSTORY_STEPS.length) {
                                            const step = BACKSTORY_STEPS[idx];
                                            option = step.options.find(o => o.id === choiceId);
                                            if (option) {
                                                stepTitle = step.title;
                                                optionLabel = option.label;
                                                optionDesc = option.description;
                                            }
                                        }

                                        // Check connections (usually last, or missed)
                                        if (!option) {
                                            const connOption = CONNECTION_OPTIONS.find(o => o.id === choiceId);
                                            if (connOption) {
                                                stepTitle = "Connection";
                                                optionLabel = connOption.label;
                                                optionDesc = connOption.description;
                                                option = connOption;
                                            }
                                        }
                                        
                                        // Handle special real name string
                                        if (!option) {
                                            if (choiceId.startsWith("Real Name:")) {
                                                stepTitle = "Identity";
                                                optionLabel = choiceId.replace("Real Name: ", "");
                                                optionDesc = "Legal Name";
                                            } else {
                                                return null;
                                            }
                                        }

                                        return (
                                            <div key={idx} className="flex items-start gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg relative overflow-hidden group hover:border-slate-300 transition-colors">
                                                {/* Connecting Line */}
                                                {idx < boss.originPath!.length - 1 && (
                                                    <div className="absolute left-[27px] top-12 bottom-[-20px] w-0.5 bg-slate-300 z-0"></div>
                                                )}
                                                
                                                <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center text-[10px] font-black text-slate-500 z-10 shrink-0 shadow-sm">
                                                    {idx + 1}
                                                </div>
                                                
                                                <div>
                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{stepTitle}</div>
                                                    <div className="text-sm font-bold text-slate-800">{optionLabel}</div>
                                                    <div className="text-xs text-slate-500 italic leading-tight mt-1 opacity-80">{optionDesc}</div>
                                                    
                                                    {/* Stat mods for this step */}
                                                    {option && option.statModifiers && (
                                                        <div className="flex gap-1 mt-2">
                                                            {Object.entries(option.statModifiers).map(([k,v]) => (
                                                                <span key={k} className="text-[8px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500 uppercase">
                                                                    {Number(v) > 0 ? '+' : ''}{v as number} {k.substring(0,3)}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="relative">
                            <span className="absolute -left-2 -top-2 text-4xl text-slate-200 font-serif">"</span>
                            <p className="text-sm text-slate-600 font-serif leading-relaxed italic px-6 relative z-10">
                                {boss.backstory.split('[')[0].trim()}
                            </p>
                            <span className="absolute -right-2 -bottom-4 text-4xl text-slate-200 font-serif rotate-180">"</span>
                        </div>

                        {/* Family Tree Visualization */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-px bg-slate-300 flex-grow"></div>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Family Record</span>
                                <div className="h-px bg-slate-300 flex-grow"></div>
                            </div>

                            <div className="flex flex-col items-center">
                                {/* Parents Level */}
                                <div className="flex gap-16 mb-8 relative">
                                    {/* Connector Line */}
                                    <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-slate-300 -z-10"></div>
                                    <div className="absolute top-1/2 left-1/2 w-0.5 h-12 bg-slate-300 -z-10"></div>

                                    {[familyTree.father, familyTree.mother].map((parent, idx) => (
                                        <div key={idx} className="flex flex-col items-center group">
                                            <div className={`w-16 h-16 rounded-full border-2 p-0.5 shadow-sm bg-white relative ${parent.status === 'Deceased' ? 'border-slate-300 grayscale opacity-70' : 'border-slate-400'}`}>
                                                <AvatarDisplay 
                                                    seed={parent.seed.toString()}
                                                    className="rounded-full w-full h-full"
                                                />
                                                {parent.status === 'Deceased' && <div className="absolute inset-0 flex items-center justify-center text-red-800 text-2xl font-black opacity-50">†</div>}
                                            </div>
                                            <div className="mt-2 text-center">
                                                <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">{idx === 0 ? 'Father' : 'Mother'}</div>
                                                <div className="text-xs font-black text-slate-800 leading-tight">{parent.name}</div>
                                                <div className={`text-[9px] font-bold px-2 py-0.5 rounded mt-1 inline-block ${
                                                    parent.status === 'Alive' ? 'bg-emerald-100 text-emerald-700' :
                                                    parent.status === 'Incarcerated' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-200 text-slate-500'
                                                }`}>
                                                    {parent.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Boss Level */}
                                <div className="mb-8 relative z-10">
                                    <div className="w-24 h-24 rounded-full border-4 border-amber-400 bg-white p-1 shadow-lg relative">
                                        <AvatarDisplay 
                                            seed={boss.imageSeed.toString()}
                                            role={boss.classType}
                                            className="rounded-full w-full h-full"
                                        />
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded border border-white shadow-sm">
                                            The Boss
                                        </div>
                                    </div>
                                    {/* Line to siblings if any */}
                                    {familyTree.siblings.length > 0 && (
                                        <div className="absolute top-full left-1/2 w-0.5 h-8 bg-slate-300 -z-10"></div>
                                    )}
                                </div>

                                {/* Siblings Level */}
                                {familyTree.siblings.length > 0 ? (
                                    <div className="relative w-full flex justify-center gap-8 border-t-2 border-slate-300 pt-8 mt-[-1px]">
                                        {/* Connector Crossbar Logic (Visual only) */}
                                        <div className="absolute -top-[2px] left-[15%] right-[15%] h-0.5 bg-slate-300"></div>
                                        
                                        {familyTree.siblings.map((sib, idx) => (
                                            <div key={idx} className="flex flex-col items-center relative">
                                                <div className="absolute -top-8 w-0.5 h-8 bg-slate-300 -z-10"></div>
                                                <div className={`w-12 h-12 rounded-full border-2 p-0.5 bg-white ${sib.status === 'Deceased' ? 'border-slate-300 grayscale opacity-60' : 'border-slate-300'}`}>
                                                    <AvatarDisplay 
                                                        seed={sib.seed.toString()}
                                                        className="rounded-full w-full h-full"
                                                    />
                                                </div>
                                                <div className="mt-1 text-center">
                                                    <div className="text-[8px] text-slate-400 uppercase font-bold">{sib.relation}</div>
                                                    <div className="text-[10px] font-bold text-slate-700 leading-tight w-20 truncate">{sib.name}</div>
                                                    <div className={`text-[8px] font-bold mt-0.5 ${
                                                        sib.status === 'Alive' ? 'text-emerald-600' :
                                                        sib.status === 'Incarcerated' ? 'text-amber-600' :
                                                        'text-slate-400'
                                                    }`}>
                                                        {sib.status}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-xs text-slate-400 italic">No Known Siblings</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>

    </div>
  );
};

export default ProfileWindow;
