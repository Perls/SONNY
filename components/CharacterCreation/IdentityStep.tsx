
import React from 'react';
import { ClassType } from '../../types';
import { CLASSES } from '../../constants';

export const AVATAR_COLORS = {
    hairColor: [
        { label: 'Auburn', value: 'A55728' },
        { label: 'Black', value: '2C1B18' },
        { label: 'Blonde', value: 'B58143' },
        { label: 'Golden', value: 'D6B370' },
        { label: 'Brown', value: '724133' },
        { label: 'Dark', value: '4A312C' },
        { label: 'Pink', value: 'F59797' },
        { label: 'Platinum', value: 'ECDCBF' },
        { label: 'Red', value: 'C93305' },
        { label: 'Silver', value: 'E8E1E1' }
    ],
    skinColor: [
        { label: 'Pale', value: 'FFDBB4' },
        { label: 'Light', value: 'EDB98A' },
        { label: 'Tan', value: 'FD9841' },
        { label: 'Brown', value: 'D08B5B' },
        { label: 'Dark Brown', value: 'AE5D29' },
        { label: 'Black', value: '614335' },
        { label: 'Yellow', value: 'F8D25C' }
    ],
    clotheColor: [
        { label: 'Black', value: '262626' },
        { label: 'Grey', value: '65C9FF' },
        { label: 'Red', value: 'FF5C5C' },
        { label: 'Blue', value: '5199E4' },
        { label: 'Green', value: '26FA79' },
        { label: 'Pink', value: 'FF4F99' },
        { label: 'Orange', value: 'FF9D42' },
        { label: 'White', value: 'FFFFFF' }
    ]
};

export const AVATAR_OPS = {
    topType: ['noHair', 'eyepatch', 'hat', 'hijab', 'turban', 'winterHat1', 'winterHat2', 'winterHat3', 'winterHat4', 'longHairBigHair', 'longHairBob', 'longHairBun', 'longHairCurly', 'longHairCurvy', 'longHairDreads', 'longHairFrida', 'longHairFro', 'longHairFroBand', 'longHairNotTooLong', 'longHairShavedSides', 'longHairMiaWallace', 'longHairStraight', 'longHairStraight2', 'longHairStraightStrand', 'shortHairDreads01', 'shortHairDreads02', 'shortHairFrizzle', 'shortHairShaggyMullet', 'shortHairShortCurly', 'shortHairShortFlat', 'shortHairShortRound', 'shortHairShortWaved', 'shortHairSides', 'shortHairTheCaesar', 'shortHairTheCaesarSidePart'],
    accessoriesType: ['none', 'kurt', 'prescription01', 'prescription02', 'round', 'sunglasses', 'wayfarers'],
    facialHairType: ['none', 'beardMedium', 'beardLight', 'beardMajestic', 'moustacheFancy', 'moustacheMagnum'],
    clotheType: ['blazerAndShirt', 'blazerAndSweater', 'collarAndSweater', 'graphicShirt', 'hoodie', 'overall', 'shirtCrewNeck', 'shirtScoopNeck', 'shirtVNeck'],
    eyeType: ['close', 'cry', 'default', 'dizzy', 'eyeRoll', 'happy', 'hearts', 'side', 'squint', 'surprised', 'wink', 'winkWacky'],
    eyebrowType: ['angry', 'angryNatural', 'default', 'defaultNatural', 'flatNatural', 'raisedExcited', 'sadConcerned', 'unibrowNatural', 'upDown', 'upDownNatural'],
    mouthType: ['concerned', 'default', 'disbelief', 'eating', 'grimace', 'sad', 'screamOpen', 'serious', 'smile', 'tongue', 'twinkle', 'vomit']
};

interface IdentityStepProps {
    selectedClass: ClassType | null;
    onSelectClass: (c: ClassType) => void;
    avatarConfig: any;
    onUpdateAvatar: (key: string, value: number) => void;
}

const IdentityStep: React.FC<IdentityStepProps> = ({ selectedClass, onSelectClass, avatarConfig, onUpdateAvatar }) => {
    const getOptionsForKey = (key: string) => {
        if (key === 'hairColor') return AVATAR_COLORS.hairColor;
        if (key === 'skinColor') return AVATAR_COLORS.skinColor;
        if (key === 'clotheColor') return AVATAR_COLORS.clotheColor;
        return (AVATAR_OPS as any)[key] || [];
    };

    return (
        <div className="w-1/2 flex flex-col overflow-y-auto custom-scrollbar p-10 border-r border-slate-200 bg-white">
            {/* Class Selection */}
            <div className="mb-10">
                <h3 className="text-lg font-black uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-200 pb-2">Select Archetype</h3>
                <div className="grid grid-cols-2 gap-6">
                    {Object.values(CLASSES).map((c) => {
                        const isSelected = selectedClass === c.type;
                        let colorClass = isSelected ? 'border-slate-500 bg-slate-50 shadow-md ring-2 ring-slate-200' : 'border-slate-200 bg-white hover:border-slate-300';
                        
                        return (
                            <div
                                key={c.type}
                                onClick={() => onSelectClass(c.type)}
                                className={`relative flex flex-col items-center justify-center p-6 rounded-xl cursor-pointer transition-all duration-200 border-4 ${colorClass}`}
                            >
                                <div className="w-16 h-16 mb-4 text-slate-400">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className={`w-full h-full`}>
                                        {c.type === ClassType.Thug && <path d="M19,6 C19,6 19,3 14,3 C11,3 7,5 7,5 V15 C7,15 7,19 2,19 V21 H14 V19 C14,19 19,19 19,15 V6 Z M5,10 C5,10 2,10 2,6 C2,3 5,2 5,2 V10 Z" />}
                                        {c.type === ClassType.Smuggler && <path d="M7.5,21.5 L12.5,16.5 L15.5,19.5 L19.5,15.5 L2.5,2.5 L6.5,14.5 L7.5,21.5 Z" />}
                                        {c.type === ClassType.Dealer && <path d="M9,2 V4 H7 V18 A2,2 0 0,0 9,20 H15 A2,2 0 0,0 17,18 V4 H15 V2 H9 M11,8 L13,8 L13,10 L11,10 V8" />}
                                        {c.type === ClassType.Entertainer && <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />}
                                        {c.type === ClassType.Hustler && <path d="M12,2C12,2 11,2 11,3V4C8,4 6,6 6,9C6,12.5 9,13 11,13.5V17C8.5,17 7.5,15.5 7,15L5,17C6,18.5 8,20 11,20V21C11,22 12,22 12,22C12,22 13,22 13,21V20C16,20 18,18 18,15C18,11.5 15,11 13,10.5V7C15.5,7 16.5,8.5 17,9L19,7C18,5.5 16,4 13,4V3C13,2 12,2 12,2M13,13.5C15.5,14 16,14.5 16,15C16,16.5 14.5,18 12,18V13C12.5,13.25 13,13.5 13,13.5M11,10.5C8.5,10 8,9.5 8,9C8,7.5 9.5,6 12,6V11C11.5,10.75 11,10.5 11,10.5Z" />}
                                    </svg>
                                </div>
                                <span className={`text-base font-black uppercase tracking-widest font-news ${isSelected ? 'text-slate-800' : 'text-slate-500'}`}>
                                    {c.label.replace('The ', '')}
                                </span>
                                <span className={`text-xs font-bold uppercase tracking-wide mt-1 ${isSelected ? 'text-slate-600' : 'text-slate-400'}`}>{c.role}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Avatar Customization */}
            <div>
                <h3 className="text-lg font-black uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-200 pb-2">Appearance</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    {[
                        { key: 'skinColor', label: 'Skin Tone' },
                        { key: 'hairColor', label: 'Hair Color' },
                        { key: 'topType', label: 'Hair Style' },
                        { key: 'facialHairType', label: 'Facial Hair' },
                        { key: 'clotheType', label: 'Clothing' },
                        { key: 'clotheColor', label: 'Clothing Color' },
                        { key: 'accessoriesType', label: 'Accessories' },
                        { key: 'eyeType', label: 'Eyes' },
                        { key: 'eyebrowType', label: 'Eyebrows' },
                        { key: 'mouthType', label: 'Mouth' }
                    ].map((setting) => {
                        const options = getOptionsForKey(setting.key);
                        // @ts-ignore
                        const currentIndex = avatarConfig[setting.key];
                        const currentOption = options[currentIndex];
                        
                        let labelDisplay = currentOption?.label || currentOption;
                        // Prettify camelCase labels for display
                        if (typeof labelDisplay === 'string' && labelDisplay !== 'none') {
                           labelDisplay = labelDisplay.replace(/([A-Z])/g, ' $1').trim();
                        }

                        return (
                            <div key={setting.key} className="flex flex-col">
                                <div className="flex justify-between items-baseline mb-2">
                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{setting.label}</span>
                                    <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{currentIndex + 1} / {options.length}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => onUpdateAvatar(setting.key, (currentIndex - 1 + options.length) % options.length)} className="w-8 h-8 flex items-center justify-center bg-slate-200 hover:bg-slate-300 rounded text-slate-600 font-bold shadow-sm active:translate-y-0.5 text-sm">←</button>
                                    <div className="flex-grow relative h-8 flex items-center">
                                        <input type="range" min={0} max={options.length - 1} value={currentIndex} onChange={(e) => onUpdateAvatar(setting.key, parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                                    </div>
                                    <button onClick={() => onUpdateAvatar(setting.key, (currentIndex + 1) % options.length)} className="w-8 h-8 flex items-center justify-center bg-slate-200 hover:bg-slate-300 rounded text-slate-600 font-bold shadow-sm active:translate-y-0.5 text-sm">→</button>
                                </div>
                                <div className="text-center text-xs font-black uppercase text-slate-700 mt-2 truncate">
                                    {labelDisplay}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default IdentityStep;
