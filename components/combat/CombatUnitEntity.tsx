
import React from 'react';
import { CombatUnit, ClassType } from '../../types';
import { ITEMS } from '../../constants';
import AvatarDisplay from '../AvatarDisplay';

interface CombatUnitEntityProps {
    unit: CombatUnit;
    isActive?: boolean;
    isTarget?: boolean;
    isAttacking?: boolean;
}

const isHeavyUnit = (unit: CombatUnit): boolean => {
    return unit.pawnType === 'heavy' || unit.pawnType === 'tank' || unit.pawnType === 'soldier';
};

const isRangedUnit = (unit: CombatUnit): boolean => {
    if (unit.pawnType === 'shooter') return true;
    if (unit.equipment?.main_hand === 'glock') return true;
    return false;
};

const CombatUnitEntity: React.FC<CombatUnitEntityProps> = ({ unit, isActive, isTarget, isAttacking }) => {
    const isPlayer = unit.team === 'player';
    
    // Class Colors mapping for Body (Uniform)
    const getClassColor = (cType: ClassType) => {
        switch(cType) {
            case ClassType.Thug: return 'bg-slate-600';
            case ClassType.Smuggler: return 'bg-amber-700';
            case ClassType.Dealer: return 'bg-blue-700';
            case ClassType.Entertainer: return 'bg-purple-700';
            case ClassType.Hustler: return 'bg-emerald-700';
            default: return 'bg-gray-600';
        }
    };
    
    const bodyColor = isPlayer ? getClassColor(unit.classType) : 'bg-red-800';
    
    // Determine Scale based on Role
    let scaleClass = 'scale-100';
    if (unit.isLeader) {
        scaleClass = 'scale-125 z-50';
    } else if (isHeavyUnit(unit)) {
        scaleClass = 'scale-100 z-40';
    } else {
        scaleClass = 'scale-75 z-30';
    }

    // Animation Classes
    const isRanged = isRangedUnit(unit);
    const animationClass = isAttacking 
        ? (isRanged ? 'animate-recoil' : 'animate-lunge') 
        : '';
    
    // Weapon Icon
    let weaponIcon = '';
    if (unit.equipment?.main_hand && ITEMS[unit.equipment.main_hand]) {
        weaponIcon = ITEMS[unit.equipment.main_hand].icon;
    } else {
        if (unit.pawnType === 'heavy') weaponIcon = '🛡️';
        else if (unit.pawnType === 'tank') weaponIcon = '🧱';
        else if (unit.pawnType === 'soldier') weaponIcon = '🎖️';
        else if (unit.pawnType === 'hitter') weaponIcon = '⚔️';
        else if (unit.pawnType === 'bruiser') weaponIcon = '🥊';
        else if (unit.pawnType === 'shooter') weaponIcon = '🏹';
        else weaponIcon = '🔪';
    }

    const hpPercent = Math.min(100, (unit.hp / unit.maxHp) * 100);
    const manaPercent = Math.min(100, (unit.mana / unit.maxMana) * 100);

    return (
        <div className={`
            relative w-full h-full flex flex-col items-center justify-center transition-all duration-200
            ${unit.isDead ? 'opacity-40 grayscale rotate-90 scale-50 z-0' : 'z-10'}
            ${scaleClass}
            ${animationClass}
        `}>
            {/* Selection/Target Indicators (Ground Ring) */}
            {!unit.isDead && isActive && <div className="absolute bottom-0 w-12 h-5 bg-emerald-400/40 rounded-full blur-[3px] animate-pulse"></div>}
            {!unit.isDead && isTarget && <div className="absolute bottom-0 w-12 h-5 bg-red-600/40 rounded-full blur-[3px] animate-pulse"></div>}
            
            {/* Shadow */}
            {!unit.isDead && <div className="absolute bottom-1 w-10 h-3 bg-black/50 rounded-full blur-[1px]"></div>}

            {/* The Pawn Construction */}
            <div className="relative flex flex-col items-center -mb-2 filter drop-shadow-md">
                
                {/* Leader Crown */}
                {unit.isLeader && !unit.isDead && (
                    <div className="absolute -top-9 z-30 text-2xl drop-shadow-md animate-bounce text-amber-400" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                        👑
                    </div>
                )}
                
                {/* SHOOTER MUZZLE FLASH */}
                {isAttacking && isRanged && (
                    <div className={`absolute top-1/2 -translate-y-1/2 ${isPlayer ? '-right-6 rotate-90' : '-left-6 -rotate-90'} z-50`}>
                        <div className="text-3xl text-yellow-300 drop-shadow-[0_0_10px_rgba(255,200,0,0.8)] animate-ping">💥</div>
                    </div>
                )}

                {/* HEAD - Avatar */}
                <div className="relative z-20 flex items-center justify-center filter drop-shadow-sm">
                    <div className="w-10 h-10 overflow-hidden rounded-lg relative bg-white/20 backdrop-blur-sm border border-white/30"> 
                         <AvatarDisplay 
                            seed={unit.imageSeed.toString()}
                            role={unit.classType} // Or pawnType if better logic exists
                            className="w-full h-full transform scale-[1.8] translate-y-2"
                         />
                    </div>
                </div>

                {/* BODY - Pill Shape */}
                <div className={`
                    w-8 h-9 rounded-xl -mt-4 z-10 shadow-inner border border-black/20
                    ${bodyColor} relative flex justify-center
                `}>
                    <div className="w-4 h-3 bg-black/10 rounded-b-lg"></div>
                </div>

                {/* WEAPON ICON - Enlarged & Floating (Updated) */}
                <div className={`
                    absolute top-6 -right-6 z-30 text-3xl filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]
                    transform rotate-12 transition-transform duration-300 group-hover:rotate-45
                `}>
                    {weaponIcon}
                </div>

                {/* Casting State Overlay */}
                {unit.mana >= unit.maxMana && !unit.isDead && (
                    <div className="absolute inset-0 bg-white/50 rounded-full animate-ping z-0"></div>
                )}

            </div>

            {/* BARS - Floating above head */}
            {!unit.isDead && (
                <div className="absolute -top-7 flex flex-col gap-[1px] z-40 w-12 pointer-events-none">
                    {/* HP Bar */}
                    <div className="w-full h-1.5 bg-slate-900/80 rounded-[1px] p-[1px]">
                         <div 
                            className={`h-full transition-all duration-300 ${isPlayer ? 'bg-emerald-400' : 'bg-red-500'}`} 
                            style={{ width: `${hpPercent}%` }} 
                        />
                    </div>
                    {/* Mana Bar */}
                    <div className="w-full h-1 bg-slate-900/80 rounded-[1px] p-[1px]">
                         <div 
                            className="h-full bg-blue-400 transition-all duration-300 relative"
                            style={{ width: `${manaPercent}%` }} 
                        >
                            {unit.mana >= unit.maxMana && <div className="absolute inset-0 bg-white/50 animate-pulse"></div>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CombatUnitEntity;
