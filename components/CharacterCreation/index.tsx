
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BACKSTORY_STEPS, TRAITS, TRAIT_POINT_BUDGET, BOROUGHS, CONNECTION_OPTIONS } from '../../constants';
import { ClassType, Stats, Trait } from '../../types';
import IdentityStep, { AVATAR_OPS, AVATAR_COLORS } from './IdentityStep';
import BoroughStep from './BoroughStep';
import StoryPhase from './StoryPhase';
import ReviewStep from './ReviewStep';
import VisualPreview from './VisualPreview';
import { CLASSES } from '../../constants';

interface CharacterCreationProps {
  onRecruit: (
      classType: ClassType, 
      finalStats: Stats, 
      backstory: string[], 
      name: string, 
      nickname: string, 
      phoneNumber: string, 
      traits: {id: string, rank: number}[], 
      borough: string, 
      imageSeed: string
  ) => void;
  onCancel: () => void;
  canAfford: boolean;
  isFull: boolean;
  isRecruiting: boolean;
  gameStarted: boolean;
}

const CharacterCreation: React.FC<CharacterCreationProps> = ({ onRecruit, onCancel, canAfford, isFull, isRecruiting, gameStarted }) => {
  const [step, setStep] = useState(0); 
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
  const [selectedBorough, setSelectedBorough] = useState<string | null>(null);
  const [backstoryChoices, setBackstoryChoices] = useState<string[]>([]);
  const [traitSelections, setTraitSelections] = useState<Record<string, number>>({});
  const [characterName, setCharacterName] = useState("");
  const [realName, setRealName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New State for "Server/Neighborhood" Selection (defaults to the placeholder)
  const [selectedServerNeighborhood, setSelectedServerNeighborhood] = useState("hudson_sq");
  
  // Safety timeout ref
  const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Avatar State
  const [avatarConfig, setAvatarConfig] = useState({
      topType: 12,
      accessoriesType: 0,
      hairColor: 1,
      facialHairType: 0,
      clotheType: 0,
      clotheColor: 0,
      skinColor: 2,
      eyeType: 2,
      eyebrowType: 2,
      mouthType: 1
  });

  const generatePhoneNumber = () => {
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const twoLetters = Array(2).fill(0).map(() => letters.charAt(Math.floor(Math.random() * letters.length))).join('');
      const fourNumbers = Math.floor(1000 + Math.random() * 9000);
      return `917-501-${fourNumbers}-${twoLetters}`;
  };

  useEffect(() => {
      setPhoneNumber(generatePhoneNumber());
      return () => {
          if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
      };
  }, []);

  const handleAvatarChange = (key: string, value: number) => {
      setAvatarConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleBoroughSelect = (boroughId: string) => {
      setSelectedBorough(boroughId);
      setStep(2); // Go to Backstory
  };

  const handleBackstorySelect = (optionId: string) => {
    setBackstoryChoices([...backstoryChoices, optionId]);
    setStep(step + 1);
  };

  const calculatePointsSpent = (selections: Record<string, number>) => {
    let spent = 0;
    Object.entries(selections).forEach(([id, rank]) => {
      const trait = TRAITS.find(t => t.id === id);
      if (trait) spent += trait.cost * rank; 
    });
    return spent;
  };

  const handleTraitToggle = (trait: Trait) => {
    setTraitSelections(prev => {
      const currentSelectedCount = Object.keys(prev).length;
      const isCurrentlySelected = !!prev[trait.id];
      
      if (!isCurrentlySelected && currentSelectedCount >= 3) return prev;
      if (isCurrentlySelected) {
          const copy = { ...prev };
          delete copy[trait.id];
          return copy;
      }
      const currentSpent = calculatePointsSpent(prev);
      const nextSpent = currentSpent + trait.cost;
      if (nextSpent > TRAIT_POINT_BUDGET) return prev;
      return { ...prev, [trait.id]: 1 };
    });
  };

  const handleBack = () => {
      if (step === 0) onCancel();
      else if (step === 1) { setStep(0); }
      else if (step === 2) { setStep(1); setBackstoryChoices([]); }
      else {
          setStep(step - 1);
          if (step > 2) { 
              setBackstoryChoices(prev => prev.slice(0, -1));
          }
      }
  };

  const currentStats = useMemo(() => {
    const base: Stats = { strength: 1, agility: 1, intelligence: 1, luck: 1, charisma: 1, willpower: 1, maxHp: 0, money: 0, respect: 0 };
    
    if (selectedBorough) {
        const b = BOROUGHS.find(bo => bo.id === selectedBorough);
        if (b && b.statModifiers) {
            Object.entries(b.statModifiers).forEach(([key, v]) => {
                const val = v as any;
                if (key !== 'money' && key !== 'respect' && typeof val === 'number') {
                    const statKey = key as keyof Stats;
                    base[statKey] = (base[statKey] || 0) + val;
                }
            });
        }
    }

    backstoryChoices.forEach((choiceId) => {
        BACKSTORY_STEPS.forEach(cat => {
             const opt = cat.options.find(o => o.id === choiceId);
             if (opt && opt.statModifiers) {
                Object.entries(opt.statModifiers).forEach(([key, v]) => {
                    const val = v as any; 
                    if (key !== 'money' && key !== 'respect' && typeof val === 'number') {
                        const statKey = key as keyof Stats;
                        base[statKey] = (base[statKey] || 0) + val;
                    }
                });
             }
        });
        const connOpt = CONNECTION_OPTIONS.find(o => o.id === choiceId);
        if (connOpt && connOpt.statModifiers) {
            Object.entries(connOpt.statModifiers).forEach(([key, v]) => {
                const val = v as any;
                if (key !== 'money' && key !== 'respect' && typeof val === 'number') {
                     const statKey = key as keyof Stats;
                     base[statKey] = (base[statKey] || 0) + val;
                }
            });
        }
    });

    Object.entries(traitSelections).forEach(([id, rank]) => {
        const trait = TRAITS.find(t => t.id === id);
        if (trait && trait.statModifiers) {
            Object.entries(trait.statModifiers).forEach(([key, v]) => {
                 const val = v as number;
                 if (typeof val === 'number') {
                     base[key as keyof Stats] = (base[key as keyof Stats] || 0) + (val * (rank as number));
                 }
            });
        }
    });

    return base;
  }, [selectedClass, selectedBorough, backstoryChoices, traitSelections]);

  const traitStepIndex = BACKSTORY_STEPS.length + 2;
  const connectionStepIndex = traitStepIndex + 1;
  const nameStepIndex = connectionStepIndex + 1;

  let stepTitle = "";
  if (step === 0) stepTitle = "Character Identity";
  else if (step === 1) stepTitle = "Building Legacy";
  else if (step === nameStepIndex) stepTitle = "Finalize";
  else stepTitle = "Building Legacy";

  const triggerRecruit = () => {
      if (isSubmitting) return;

      if (selectedClass && currentStats && characterName.trim() !== "" && selectedBorough) {
          setIsSubmitting(true);
          
          // Safety timeout to reset button state if parent fails to unmount
          submitTimeoutRef.current = setTimeout(() => {
              setIsSubmitting(false);
          }, 5000);

          try {
              const formattedTraits = Object.entries(traitSelections).map(([id, rank]) => ({id, rank}));
              
              // Correct API Mapping for Seed String
              const seedString = `custom&` +
                    `top=${AVATAR_OPS.topType[avatarConfig.topType]}&` +
                    `accessories=${AVATAR_OPS.accessoriesType[avatarConfig.accessoriesType]}&` +
                    `hairColor=${AVATAR_COLORS.hairColor[avatarConfig.hairColor].value}&` + 
                    `facialHair=${AVATAR_OPS.facialHairType[avatarConfig.facialHairType]}&` +
                    `clothing=${AVATAR_OPS.clotheType[avatarConfig.clotheType]}&` +
                    `clothingColor=${AVATAR_COLORS.clotheColor[avatarConfig.clotheColor].value}&` +
                    `skinColor=${AVATAR_COLORS.skinColor[avatarConfig.skinColor].value}&` + 
                    `eyes=${AVATAR_OPS.eyeType[avatarConfig.eyeType]}&` +
                    `eyebrows=${AVATAR_OPS.eyebrowType[avatarConfig.eyebrowType]}&` +
                    `mouth=${AVATAR_OPS.mouthType[avatarConfig.mouthType]}`;

              const nickname = "The " + (CLASSES[selectedClass].label.replace('The ', '') || "Boss");
              const augmentedBackstory = [...backstoryChoices];
              if (realName) augmentedBackstory.push(`Real Name: ${realName}`);

              console.log("Creating character:", characterName);
              // NOTE: Passing selectedServerNeighborhood here if backend support is added later. 
              // For now, it's visual flavor in the ReviewStep but validated here.
              onRecruit(selectedClass, currentStats, augmentedBackstory, characterName, nickname, phoneNumber, formattedTraits, selectedBorough, seedString);
          } catch (e) {
              console.error("Error creating character", e);
              setIsSubmitting(false); // Reset on error
          }
      } else {
          console.error("Missing required fields for recruitment");
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white overflow-hidden font-waze">
      <div className="absolute top-0 left-0 w-full h-32 pattern-deco opacity-40 z-0 pointer-events-none"></div>

      <div className="p-8 pb-4 z-10 flex-shrink-0 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3 mb-2">
             <div className="h-8 w-1.5 bg-amber-500 rounded-sm"></div>
             <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter font-news">
               {stepTitle}
             </h2>
        </div>
        <div className="flex items-center justify-between pl-5">
            <p className="text-slate-500 text-lg font-bold uppercase tracking-wide">
            {step === 0 ? "Step 1: Archetype & Appearance" : `Phase ${step + 1}: ${stepTitle}`}
            </p>
            
            <button 
                onClick={handleBack}
                className="text-sm font-bold text-amber-700 hover:text-amber-900 uppercase tracking-widest flex items-center gap-1 px-4 py-2 rounded border border-amber-200 hover:bg-amber-50 transition-all"
            >
                <span>←</span> {step === 0 ? "Cancel" : "Back"}
            </button>
        </div>
      </div>

      <div className="flex-grow overflow-hidden z-10 flex flex-col relative bg-slate-50">
          {step === 0 && (
              <div className="flex h-full w-full">
                  <IdentityStep 
                    selectedClass={selectedClass} 
                    onSelectClass={setSelectedClass} 
                    avatarConfig={avatarConfig} 
                    onUpdateAvatar={handleAvatarChange} 
                  />
                  <VisualPreview 
                    mode="hero" 
                    avatarConfig={avatarConfig} 
                    selectedClass={selectedClass} 
                    onNext={() => setStep(1)}
                  />
              </div>
          )}

          {step === 1 && (
              <BoroughStep selectedBorough={selectedBorough} onSelectBorough={handleBoroughSelect} />
          )}

          {step > 1 && (
              <div className={`flex flex-col gap-8 animate-fade-in h-full bg-slate-50 ${step === nameStepIndex ? 'p-0' : 'lg:flex-row p-8'}`}>
                  {step !== nameStepIndex && (
                    <VisualPreview 
                        mode="sidebar" 
                        avatarConfig={avatarConfig} 
                        selectedClass={selectedClass} 
                        characterName={characterName}
                        currentStats={currentStats}
                        selectedBorough={selectedBorough || undefined}
                        backstoryChoices={backstoryChoices}
                        traitSelections={traitSelections}
                    />
                  )}
                  
                  <div className={`flex-grow overflow-y-auto custom-scrollbar ${step === nameStepIndex ? 'w-full' : 'pr-2 lg:w-2/3'}`}>
                      {step === nameStepIndex ? (
                          <ReviewStep 
                            characterName={characterName} 
                            setCharacterName={setCharacterName} 
                            realName={realName} 
                            setRealName={setRealName} 
                            phoneNumber={phoneNumber}
                            onRegeneratePhone={() => setPhoneNumber(generatePhoneNumber())}
                            selectedNeighborhood={selectedServerNeighborhood}
                            onSelectNeighborhood={setSelectedServerNeighborhood}
                          />
                      ) : (
                          <StoryPhase 
                            step={step} 
                            backstoryChoices={backstoryChoices} 
                            onSelectBackstory={handleBackstorySelect} 
                            traitSelections={traitSelections}
                            onToggleTrait={handleTraitToggle}
                            pointsSpent={calculatePointsSpent(traitSelections)}
                            onNextStep={() => setStep(step + 1)}
                          />
                      )}
                  </div>
              </div>
          )}
      </div>

      {/* Action Bar (Final Step) */}
      <div className="p-8 bg-white border-t border-slate-100 z-20 relative flex-shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
         {step === nameStepIndex && (
            <button
              onClick={triggerRecruit}
              disabled={isSubmitting || characterName.trim() === ""}
              className={`w-full py-5 rounded-xl font-black text-2xl uppercase tracking-[0.2em] shadow-xl transition-all transform font-news border-b-4
                  ${characterName.trim() === "" 
                      ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed' 
                      : isSubmitting 
                          ? 'bg-amber-600 text-white border-amber-800 cursor-wait' 
                          : 'bg-slate-900 text-amber-400 border-amber-600 hover:bg-slate-800 hover:border-amber-500 hover:text-amber-300 hover:-translate-y-1 active:scale-[0.99] active:translate-y-0'
                  }
              `}
            >
              {isSubmitting ? "Establishing Identity..." : "Sign in Blood"}
            </button>
         )}
      </div>
    </div>
  );
};

export default CharacterCreation;
