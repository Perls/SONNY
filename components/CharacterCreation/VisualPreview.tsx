
import React from 'react';
import { CLASSES, BOROUGHS, BACKSTORY_STEPS, CONNECTION_OPTIONS, TRAITS } from '../../constants';
import { ClassType, Stats } from '../../types';
import StatBar from '../StatBar';
import { AVATAR_COLORS, AVATAR_OPS } from './IdentityStep';

interface VisualPreviewProps {
    mode: 'hero' | 'sidebar';
    avatarConfig: any;
    selectedClass: ClassType | null;
    characterName?: string;
    currentStats?: Stats;
    selectedBorough?: string;
    backstoryChoices?: string[];
    traitSelections?: Record<string, number>;
    onNext?: () => void;
}

const VisualPreview: React.FC<VisualPreviewProps> = ({ mode, avatarConfig, selectedClass, characterName, currentStats, selectedBorough, backstoryChoices, traitSelections, onNext }) => {
    
    // Construct Preview URL with Correct API Parameter Names (v9 Avataaars)
    // Helper to handle optional/none values
    const getParam = (key: string, value: string) => {
        if (value === 'none') {
            return `${key}Probability=0`; // Effectively disables it
        }
        return `${key}=${value}&${key}Probability=100`;
    };

    const previewUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=preview&backgroundColor=transparent&` + 
      `${getParam('top', AVATAR_OPS.topType[avatarConfig.topType])}&` +
      `${getParam('accessories', AVATAR_OPS.accessoriesType[avatarConfig.accessoriesType])}&` +
      `hairColor=${AVATAR_COLORS.hairColor[avatarConfig.hairColor].value}&` + 
      `${getParam('facialHair', AVATAR_OPS.facialHairType[avatarConfig.facialHairType])}&` +
      `${getParam('clothing', AVATAR_OPS.clotheType[avatarConfig.clotheType])}&` +
      `clothingColor=${AVATAR_COLORS.clotheColor[avatarConfig.clotheColor].value}&` +
      `skinColor=${AVATAR_COLORS.skinColor[avatarConfig.skinColor].value}&` + 
      `eyes=${AVATAR_OPS.eyeType[avatarConfig.eyeType]}&` +
      `eyebrows=${AVATAR_OPS.eyebrowType[avatarConfig.eyebrowType]}&` +
      `mouth=${AVATAR_OPS.mouthType[avatarConfig.mouthType]}`;

    const currentClassDef = selectedClass ? CLASSES[selectedClass] : null;

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

    if (mode === 'hero') {
        return (
            <div className="w-1/2 relative flex flex-col items-center justify-center p-8 overflow-hidden bg-slate-900 border-l-4 border-slate-800">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/20"></div>
                    <div className="absolute inset-0 pattern-deco opacity-10"></div>
                </div>
                
                <div className="relative z-10 w-[450px] h-[450px] rounded-full border-8 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-gradient-to-b from-white/10 to-transparent backdrop-blur-sm overflow-hidden mb-8 group">
                    <div className="absolute inset-0 bg-radial-gradient(circle at center, rgba(255,255,255,0.1), transparent) opacity-50"></div>
                    <img src={previewUrl} className="w-full h-full object-cover scale-110 translate-y-8 relative z-20 drop-shadow-2xl transition-transform duration-500 group-hover:scale-115" alt="Avatar Preview" />
                </div>

                {selectedClass ? (
                    <div className="text-center animate-slide-up relative z-10 w-full max-w-md">
                        <h3 className="text-5xl font-black font-news text-white uppercase tracking-[0.2em] mb-2 drop-shadow-lg">
                            {CLASSES[selectedClass].label.replace('The ', '')}
                        </h3>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest bg-black/40 px-6 py-2 rounded-full inline-block border border-white/10 mb-6">
                            {CLASSES[selectedClass].role}
                        </p>
                        {onNext && (
                            <button onClick={onNext} className={`w-full py-6 rounded-xl font-black text-2xl uppercase tracking-[0.25em] shadow-2xl transition-all transform hover:-translate-y-1 font-news border-b-4 bg-amber-500 text-slate-900 border-amber-700 hover:bg-amber-400 hover:border-amber-600 hover:shadow-amber-500/20 active:translate-y-0 active:border-b-0`}>
                                Confirm Identity
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-slate-500 text-lg font-bold uppercase tracking-widest animate-pulse relative z-10">
                        Select an Archetype to Begin
                    </div>
                )}
            </div>
        );
    }

    // Sidebar Mode (Step 2+)
    return (
        <div className="relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex-shrink-0 lg:w-1/3 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                 <div className="w-20 h-20 rounded-full bg-white border-2 border-amber-400 flex items-center justify-center overflow-hidden shadow-md">
                    <img src={previewUrl} className="w-full h-full object-cover scale-110 translate-y-2" />
                 </div>
                 <div className="flex-grow">
                     <h3 className="text-xl font-black text-slate-900 font-news uppercase tracking-tight leading-none mb-1">{characterName || "Unknown"}</h3>
                     <h4 className="text-xs font-bold text-slate-500 uppercase tracking-tight">{currentClassDef?.label.replace('The ', '')}</h4>
                 </div>
            </div>
            {currentStats && (
                <div className="space-y-2 mb-6">
                    <StatBar label="STR" value={currentStats.strength} colorClass={getStatColor('STR')} />
                    <StatBar label="AGI" value={currentStats.agility} colorClass={getStatColor('AGI')} />
                    <StatBar label="INT" value={currentStats.intelligence} colorClass={getStatColor('INT')} />
                    <StatBar label="LCK" value={currentStats.luck} colorClass={getStatColor('LCK')} />
                    <StatBar label="CHA" value={currentStats.charisma} colorClass={getStatColor('CHA')} />
                    <StatBar label="WIL" value={currentStats.willpower || 0} colorClass={getStatColor('WIL')} />
                </div>
            )}
            
            {/* Dossier if requested via specific props availability or always visible in sidebar */}
            <div className="mt-auto border-t border-slate-200 pt-4 animate-slide-up">
                 <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Dossier</h4>
                 
                 {selectedBorough && (
                    <div className="mb-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Origin</span>
                        <span className="text-sm font-bold text-slate-800">{BOROUGHS.find(b => b.id === selectedBorough)?.label}</span>
                    </div>
                 )}

                 {backstoryChoices && backstoryChoices.length > 0 && (
                    <div className="mb-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Background</span>
                        <div className="flex flex-wrap gap-1">
                             {backstoryChoices.map((id, i) => {
                                 let label = id;
                                 BACKSTORY_STEPS.forEach(step => {
                                     const found = step.options.find(o => o.id === id);
                                     if (found) label = found.label;
                                 });
                                 const conn = CONNECTION_OPTIONS.find(o => o.id === id);
                                 if (conn) label = conn.label;
                                 return (
                                     <span key={i} className="text-[9px] bg-slate-100 border border-slate-200 px-2 py-1 rounded text-slate-600 font-bold uppercase tracking-tight">{label}</span>
                                 );
                             })}
                        </div>
                    </div>
                 )}

                 {traitSelections && (
                    <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Personality</span>
                        <div className="flex flex-wrap gap-1">
                            {Object.keys(traitSelections).length === 0 && <span className="text-[10px] text-slate-400 italic">None</span>}
                            {Object.keys(traitSelections).map(id => {
                                const t = TRAITS.find(trait => trait.id === id);
                                if (!t) return null;
                                return (
                                    <span key={id} className={`text-[9px] px-2 py-1 rounded border font-bold uppercase ${t.type === 'reputation' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                        {t.label}
                                    </span>
                                )
                            })}
                        </div>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default VisualPreview;
