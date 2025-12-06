
import React, { useState, useMemo } from 'react';
import { CLASSES, RECRUIT_COST, BACKSTORY_STEPS, TRAITS, TRAIT_POINT_BUDGET } from '../constants';
import { ClassType, Stats, Trait } from '../types';
import StatBar from './StatBar';

interface RecruitPanelProps {
  onRecruit: (classType: ClassType, finalStats: Stats, backstory: string[], name: string, traits: {id: string, rank: number}[]) => void;
  onCancel: () => void;
  canAfford: boolean;
  isFull: boolean;
  isRecruiting: boolean;
  gameStarted: boolean;
}

const RecruitPanel: React.FC<RecruitPanelProps> = ({ onRecruit, onCancel, canAfford, isFull, isRecruiting, gameStarted }) => {
  const [step, setStep] = useState(0); // 0 = Class, 1...N = Backstory, N+1 = Traits, N+2 = Allegiance, N+3 = Ready
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
  const [backstoryChoices, setBackstoryChoices] = useState<string[]>([]);
  const [traitSelections, setTraitSelections] = useState<Record<string, number>>({}); // Trait ID -> Rank
  const [animatingClass, setAnimatingClass] = useState<ClassType | null>(null);
  const [characterName, setCharacterName] = useState("");

  const handleClassSelect = (type: ClassType) => {
    setSelectedClass(type);
    setAnimatingClass(type);
    setTimeout(() => {
      setAnimatingClass(null);
      setStep(1);
    }, 600);
  };

  const handleBackstorySelect = (optionId: string) => {
    setBackstoryChoices([...backstoryChoices, optionId]);
    
    // Check if we need to go to traits or next backstory
    if (step < BACKSTORY_STEPS.length - 1) {
        // Next Backstory (Not yet allegiance)
        setStep(step + 1);
    } else {
        // Go to Traits (Insert step before Allegiance)
        // Current structure:
        // 0: Class
        // 1: Father
        // 2: Early Life
        // 3: Adolescence
        // 4: Motivation
        // (Step 4 is index 3 in array)
        // Next should be Traits, then Allegiance
        setStep(step + 1);
    }
  };

  const handleTraitToggle = (trait: Trait) => {
    setTraitSelections(prev => {
      const currentRank = prev[trait.id] || 0;
      let nextRank = currentRank + 1;
      
      // If cycling past max rank, go back to 0
      if (nextRank > trait.maxRank) {
        nextRank = 0;
      }

      // Check budget if we are increasing rank of a perk (positive cost)
      if (nextRank > currentRank && trait.cost > 0) {
        const currentSpent = calculatePointsSpent(prev);
        // If increasing rank exceeds budget, don't update (or maybe loop to 0? let's just prevent for now or loop to 0)
        // Actually loop to 0 is cleaner UI behavior if blocked, or just do nothing?
        // Let's check cost.
        const additionalCost = trait.cost * (nextRank - currentRank);
        if (currentSpent + additionalCost > TRAIT_POINT_BUDGET) {
            // Cannot afford, reset to 0 to make UI responsive, or shake? 
            // Let's just loop to 0 if we can't afford next rank
            nextRank = 0;
        }
      }

      if (nextRank === 0) {
        const copy = { ...prev };
        delete copy[trait.id];
        return copy;
      }

      return { ...prev, [trait.id]: nextRank };
    });
  };

  const calculatePointsSpent = (selections: Record<string, number>) => {
    let spent = 0;
    Object.entries(selections).forEach(([id, rank]) => {
      const trait = TRAITS.find(t => t.id === id);
      if (trait) {
        spent += trait.cost * rank;
      }
    });
    return spent;
  };

  const handleBack = () => {
      if (step > 1) {
          setStep(step - 1);
          // If we are backing out of Allegiance, don't remove backstory, just step back.
          // If we are backing out of Traits, don't remove backstory.
          // If we are backing out of a Backstory step, remove the last choice.
          
          // Logic check:
          const traitStepIndex = BACKSTORY_STEPS.length; // e.g., 4 steps (0-3) -> index 4 is Traits
          const allegianceStepIndex = traitStepIndex + 1; // index 5 is Allegiance
          const nameStepIndex = allegianceStepIndex + 1; // index 6 is Name

          if (step <= BACKSTORY_STEPS.length - 1) { 
              // We are in backstories (Father, Early, Adol, Motive)
              // If we go back from Early (2) to Father (1), remove selection 1
              setBackstoryChoices(prev => prev.slice(0, -1));
          } else if (step === traitStepIndex) {
             // Backing OUT of Traits into Motivation
             setBackstoryChoices(prev => prev.slice(0, -1));
          }
          // If backing out of Allegiance (5) to Traits (4), do nothing to choices.
          // If backing out of Name (6) to Allegiance (5), do nothing.

      } else if (step === 1) {
          setStep(0);
          setSelectedClass(null);
          setBackstoryChoices([]);
          setTraitSelections({});
      } else if (step === 0) {
          onCancel();
      }
  };

  const pointsSpent = calculatePointsSpent(traitSelections);
  const remainingPoints = TRAIT_POINT_BUDGET - pointsSpent;

  // Dynamically calculate stats
  const currentStats = useMemo(() => {
    if (!selectedClass) return null;
    const base = { ...CLASSES[selectedClass].baseStats };
    
    // Backstory Modifiers
    backstoryChoices.forEach((choiceId, index) => {
        // Note: Allegiance is inside BACKSTORY_STEPS but selected separately now? 
        // Wait, standard flow handles Allegiance as a backstory choice in the final step usually.
        // My new flow inserts Traits BEFORE Allegiance.
        // Let's find the option across all steps for safety
        let found = false;
        BACKSTORY_STEPS.forEach(cat => {
             const opt = cat.options.find(o => o.id === choiceId);
             if (opt && opt.statModifiers) {
                Object.entries(opt.statModifiers).forEach(([key, val]) => {
                    if (key !== 'money' && key !== 'respect' && typeof val === 'number') {
                        base[key as keyof Stats] = (base[key as keyof Stats] || 0) + val;
                    }
                });
                found = true;
             }
        });
    });

    // Trait Modifiers
    Object.entries(traitSelections).forEach(([id, rank]) => {
        const trait = TRAITS.find(t => t.id === id);
        if (trait && trait.statModifiers) {
            Object.entries(trait.statModifiers).forEach(([key, val]) => {
                 if (typeof val === 'number') {
                     base[key as keyof Stats] = (base[key as keyof Stats] || 0) + (val * rank);
                 }
            });
        }
    });

    return base;
  }, [selectedClass, backstoryChoices, traitSelections]);

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

  const currentClassDef = selectedClass ? CLASSES[selectedClass] : null;
  
  // Step Logic Layout:
  // 0: Class
  // 1: Father (BS[0])
  // 2: Early (BS[1])
  // 3: Adol (BS[2])
  // 4: Motive (BS[3])  <-- Last Backstory step
  // 5: TRAITS         <-- Inserted
  // 6: Allegiance (BS[4]) <-- Shifted
  // 7: Name

  const traitStepIndex = 5;
  const allegianceStepIndex = 6;
  const nameStepIndex = 7;

  // Determine what content to show
  let currentStepData = null;
  let stepTitle = "";
  let stepDesc = "";

  if (step > 0 && step <= 4) {
      currentStepData = BACKSTORY_STEPS[step - 1];
      stepTitle = currentStepData.title;
      stepDesc = currentStepData.description;
  } else if (step === traitStepIndex) {
      // Traits Step
      stepTitle = "Personality";
      stepDesc = "Define your quirks. Flaws give you points to spend on Perks.";
  } else if (step === allegianceStepIndex) {
      // Allegiance Step (The original last backstory step)
      currentStepData = BACKSTORY_STEPS[4]; // Hardcoded index for Allegiance
      stepTitle = currentStepData.title;
      stepDesc = currentStepData.description;
  } else if (step === nameStepIndex) {
      stepTitle = "Identity Check";
      stepDesc = "Final Registration Step";
  }

  // Special styling
  const isAllegianceStep = step === allegianceStepIndex;

  const triggerRecruit = () => {
      if (selectedClass && currentStats && characterName.trim() !== "") {
          const formattedTraits = Object.entries(traitSelections).map(([id, rank]) => ({id, rank}));
          onRecruit(selectedClass, currentStats, backstoryChoices, characterName, formattedTraits);
          // Reset is handled by parent usually or we can do it here if needed
      }
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden font-waze relative">
      <div className="absolute top-0 left-0 w-full h-32 pattern-deco opacity-40 z-0 pointer-events-none"></div>

      <div className="p-8 pb-4 z-10 flex-shrink-0 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-2">
             <div className="h-8 w-1.5 bg-amber-500 rounded-sm"></div>
             <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter font-news">
               {step === 0 ? (gameStarted ? "Recruitment" : "Origin Story") : "Building Legacy"}
             </h2>
        </div>
        <div className="flex items-center justify-between pl-5">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">
            {step === 0 ? "Select Archetype" : `Phase ${step}: ${stepTitle}`}
            </p>
            
            <button 
                onClick={handleBack}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 uppercase tracking-widest flex items-center gap-1 px-3 py-1.5 rounded border border-amber-200 hover:bg-amber-50 transition-all"
            >
                <span>←</span> {step === 0 ? "Back to Menu" : "Back"}
            </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar px-8 py-6 z-10 flex flex-col">
        
        {/* STEP 0: CLASS SELECTION */}
        {step === 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8 animate-fade-in">
            {Object.values(CLASSES).map((c) => {
                return (
                <div
                    key={c.type}
                    onClick={() => handleClassSelect(c.type)}
                    className={`
                    relative flex flex-col items-center justify-center p-6 rounded-2xl cursor-pointer transition-all duration-300
                    border-2 border-slate-100 bg-white hover:border-amber-400 hover:shadow-xl group
                    `}
                >
                    <div className={`w-20 h-20 mb-4 transition-transform duration-300 group-hover:scale-110 ${animatingClass === c.type ? 'animate-jump' : ''}`}>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-slate-300 group-hover:text-slate-800">
                        {c.type === ClassType.Thug && <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>}
                        {c.type === ClassType.Smuggler && <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>}
                        {c.type === ClassType.Dealer && <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z"/>}
                        {c.type === ClassType.Entertainer && <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.07 0-3.75-1.68-3.75-3.75S9.93 9 12 9s3.75 1.68 3.75 3.75S14.07 16.5 12 16.5zm0-9c-.69 0-1.25-.56-1.25-1.25S11.31 5 12 5s1.25.56 1.25 1.25S12.69 7.5 12 7.5z"/>}
                        {c.type === ClassType.Hustler && <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>}
                    </svg>
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest font-news text-slate-500 group-hover:text-amber-600">
                    {c.label.replace('The ', '')}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mt-1">{c.role}</span>
                </div>
                );
            })}
            </div>
        )}

        {/* STEP 1-N: PROGRESSION */}
        {step > 0 && currentClassDef && (
            <div className="flex flex-col lg:flex-row gap-8 animate-fade-in h-full">
                
                {/* Current Character Preview (Left/Top) */}
                <div className="relative bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm flex-shrink-0 lg:w-1/3">
                    <div className="flex items-center gap-4 mb-6">
                         <div className="w-20 h-20 rounded-full bg-white border-2 border-amber-400 flex items-center justify-center overflow-hidden shadow-md">
                            <svg className="w-12 h-12 text-slate-800" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                         </div>
                         <div className="flex-grow">
                             {characterName ? (
                                 <h3 className="text-2xl font-black text-slate-900 font-news uppercase tracking-tight leading-none mb-1">{characterName}</h3>
                             ) : (
                                 <div className="text-slate-300 text-sm italic mb-1">Unidentified</div>
                             )}
                             <h4 className="text-sm font-bold text-slate-500 uppercase tracking-tight">{currentClassDef.label}</h4>
                             <div className="text-amber-600 font-bold text-[10px] uppercase tracking-widest">{currentClassDef.role}</div>
                         </div>
                    </div>
                    
                    {currentStats && (
                        <div className="space-y-2 mb-6">
                            <StatBar label="STR" value={currentStats.strength} colorClass={getStatColor('STR')} />
                            <StatBar label="AGI" value={currentStats.agility} colorClass={getStatColor('AGI')} />
                            <StatBar label="INT" value={currentStats.intelligence} colorClass={getStatColor('INT')} />
                            <StatBar label="LCK" value={currentStats.luck} colorClass={getStatColor('LCK')} />
                            <StatBar label="CHA" value={currentStats.charisma} colorClass={getStatColor('CHA')} />
                        </div>
                    )}

                    {/* Life Path Log */}
                    <div className="mt-auto border-t border-slate-200 pt-4">
                         <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Dossier</h5>
                         <div className="flex flex-col gap-2 text-xs">
                           {backstoryChoices.map((choiceId, idx) => {
                              // Map flat choices to steps. 
                              // Standard steps 0-3 correspond to idx 0-3.
                              // Allegiance (last choice) corresponds to step index 4 in constants, but might be appended last.
                              // If we have traits, they aren't in backstoryChoices string array.
                              const stepData = BACKSTORY_STEPS[idx];
                              if (!stepData) return null; // Allegiance logic handled separately if needed or order preserved
                              const optionData = stepData.options.find(o => o.id === choiceId);
                              return (
                                <div key={choiceId} className="flex flex-col">
                                   <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-0.5">{stepData.title}</span>
                                   <span className="text-slate-800 font-news font-bold text-sm leading-tight" style={{color: optionData?.color ? undefined : ''}}>{optionData?.label}</span>
                                </div>
                              );
                           })}
                           
                           {/* Traits in Dossier */}
                           {Object.keys(traitSelections).length > 0 && (
                               <div className="flex flex-col mt-1">
                                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-0.5">Personality</span>
                                  <div className="flex flex-wrap gap-1">
                                    {Object.entries(traitSelections).map(([id, rank]) => {
                                        const t = TRAITS.find(tr => tr.id === id);
                                        return (
                                            <span key={id} className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase ${t?.cost && t.cost > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                {t?.label} {rank > 1 ? `(${rank})` : ''}
                                            </span>
                                        );
                                    })}
                                  </div>
                               </div>
                           )}

                           {backstoryChoices.length === 0 && (
                               <span className="text-xs text-slate-300 italic">Pending selection...</span>
                           )}
                         </div>
                    </div>
                </div>

                {/* Content Area (Right/Main) */}
                <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 lg:w-2/3">
                    
                    {/* TRAITS STEP */}
                    {step === traitStepIndex ? (
                        <div className="animate-fade-in">
                            <div className="mb-6 flex items-end justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <h4 className="text-2xl font-black text-slate-800 mb-1 font-news">{stepTitle}</h4>
                                    <p className="text-slate-500 text-sm font-medium">{stepDesc}</p>
                                </div>
                                {/* Budget Display */}
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trait Points</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-2xl font-black font-mono ${remainingPoints < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{remainingPoints}</span>
                                        <span className="text-slate-300 text-lg">/</span>
                                        <span className="text-slate-400 text-lg">{TRAIT_POINT_BUDGET}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {TRAITS.map(trait => {
                                    const currentRank = traitSelections[trait.id] || 0;
                                    const isPerk = trait.cost > 0;
                                    // Check if affordable for next rank
                                    // Note: We allow clicking to cycle, logic handles limit inside handler
                                    
                                    return (
                                        <button
                                            key={trait.id}
                                            onClick={() => handleTraitToggle(trait)}
                                            className={`
                                                relative p-4 rounded-xl border-2 transition-all text-left flex gap-4 items-start group
                                                ${currentRank > 0 
                                                    ? (isPerk ? 'bg-emerald-50 border-emerald-400' : 'bg-red-50 border-red-400') 
                                                    : 'bg-white border-slate-100 hover:border-amber-300'
                                                }
                                            `}
                                        >
                                            {/* Cute Waze Icon */}
                                            <div className={`
                                                w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border-2
                                                ${currentRank > 0 
                                                    ? (isPerk ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-red-100 border-red-300 text-red-700') 
                                                    : 'bg-slate-50 border-slate-200 text-slate-300 group-hover:bg-amber-50 group-hover:text-amber-600 group-hover:border-amber-200'
                                                }
                                            `}>
                                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                                                    <path d={trait.iconPath} />
                                                </svg>
                                            </div>

                                            <div className="flex-grow">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className={`font-black font-news text-lg ${currentRank > 0 ? 'text-slate-900' : 'text-slate-500'}`}>
                                                        {trait.label}
                                                    </span>
                                                    <div className="flex gap-0.5">
                                                        {[...Array(trait.maxRank)].map((_, i) => (
                                                            <div key={i} className={`w-2 h-2 rounded-full ${i < currentRank ? (isPerk ? 'bg-emerald-500' : 'bg-red-500') : 'bg-slate-200'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium mb-2 leading-tight">{trait.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-[10px] font-black uppercase tracking-wider ${isPerk ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        {isPerk ? 'Cost' : 'Refund'}: {Math.abs(trait.cost)}
                                                    </span>
                                                    {/* Stat mod preview */}
                                                    <div className="flex gap-1">
                                                        {Object.keys(trait.statModifiers).map(k => (
                                                            <span key={k} className="text-[9px] bg-white px-1 rounded border border-slate-200 text-slate-400 uppercase">
                                                                {trait.statModifiers[k as keyof Stats]! > 0 ? '+' : ''}{trait.statModifiers[k as keyof Stats]} {k.substring(0,3)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => remainingPoints >= 0 ? setStep(step + 1) : null}
                                    disabled={remainingPoints < 0}
                                    className={`
                                        px-8 py-3 rounded-xl font-black uppercase tracking-widest shadow-lg transition-all font-news
                                        ${remainingPoints < 0 
                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                            : 'bg-slate-900 text-amber-400 hover:bg-slate-800 hover:text-amber-300'
                                        }
                                    `}
                                >
                                    {remainingPoints < 0 ? "Over Budget" : "Confirm Traits"}
                                </button>
                            </div>

                        </div>
                    ) : currentStepData ? (
                         // STANDARD BACKSTORY & ALLEGIANCE STEPS
                        <div className="animate-fade-in">
                            <div className="mb-6">
                                <h4 className="text-2xl font-black text-slate-800 mb-2 font-news">
                                    {stepTitle}
                                </h4>
                                <p className="text-slate-500 text-sm font-medium">{stepDesc}</p>
                            </div>
                            
                            <div className={`space-y-3 ${isAllegianceStep ? 'grid grid-cols-1 gap-4 space-y-0' : ''}`}>
                                {currentStepData.options.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleBackstorySelect(opt.id)}
                                        className={`
                                            w-full text-left rounded-xl border-2 transition-all group relative overflow-hidden
                                            ${isAllegianceStep 
                                                ? `h-40 flex flex-col justify-end p-6 ${opt.color || 'bg-slate-800'} border-transparent hover:scale-[1.01] hover:shadow-2xl`
                                                : 'p-5 border-slate-100 bg-white hover:border-amber-400 hover:bg-amber-50/30 hover:shadow-lg'
                                            }
                                        `}
                                    >
                                        {isAllegianceStep && opt.icon && (
                                            <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                                                <img src={opt.icon} alt="" className="w-full h-full object-cover grayscale mix-blend-overlay" />
                                            </div>
                                        )}

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`font-black font-news uppercase text-xl tracking-tight ${isAllegianceStep ? (opt.textColor || 'text-white') : 'text-slate-800'}`}>
                                                    {opt.label}
                                                </span>
                                            </div>
                                            <div className={`text-xs font-bold uppercase tracking-wide mb-3 ${isAllegianceStep ? 'text-white/70' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                                {opt.description}
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                {Object.keys(opt.statModifiers).map(stat => (
                                                    <span key={stat} className={`
                                                        text-[10px] px-2 py-1 rounded uppercase font-black tracking-wider border 
                                                        ${isAllegianceStep 
                                                            ? 'bg-black/40 text-white border-white/20' 
                                                            : 'bg-slate-100 text-slate-600 border-slate-200'
                                                        }
                                                    `}>
                                                        +{opt.statModifiers[stat as keyof Stats]} {stat}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        // NAME STEP
                        <div className="flex-grow flex flex-col items-center justify-center p-8 animate-fade-in">
                            <div className="w-full max-w-md bg-white border-2 border-amber-200 rounded-2xl p-8 shadow-2xl text-center relative">
                                <div className="absolute top-0 left-0 w-full h-2 bg-amber-400 rounded-t-xl"></div>
                                
                                <h3 className="text-3xl font-black text-slate-900 font-news mb-2 uppercase">Identity Check</h3>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">
                                    Final Registration Step
                                </p>

                                <div className="mb-8 text-left">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                        Enter Code Name
                                    </label>
                                    <input 
                                        type="text" 
                                        value={characterName}
                                        onChange={(e) => setCharacterName(e.target.value)}
                                        placeholder="e.g. Lucky Luciano"
                                        className="w-full bg-slate-50 border-2 border-slate-200 text-slate-900 text-xl font-black font-news p-4 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all placeholder:text-slate-300"
                                        autoFocus
                                    />
                                </div>
                                
                                <div className="text-xs text-slate-400 mb-4">
                                    "Remember, once you're in, there's no getting out."
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        )}
      </div>

      {/* Action Bar (Only for final recruit) */}
      <div className="p-8 bg-white border-t border-slate-100 z-20 relative flex-shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
         {step === nameStepIndex && (
            <button
              onClick={triggerRecruit}
              disabled={isRecruiting || characterName.trim() === ""}
              className={`
                w-full py-5 rounded-xl font-black text-2xl uppercase tracking-[0.2em] shadow-xl transition-all transform hover:-translate-y-1 font-news border-b-4
                ${characterName.trim() === "" 
                    ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed' 
                    : 'bg-slate-900 text-amber-400 border-amber-600 hover:bg-slate-800 hover:border-amber-500 hover:text-amber-300 active:scale-[0.99] active:translate-y-0'
                }
              `}
            >
              {isRecruiting 
                ? "Establishing Identity..." 
                : "Sign in Blood"}
            </button>
         )}
      </div>
    </div>
  );
};

export default RecruitPanel;
