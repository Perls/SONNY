
import { CharacterClass, ClassType, Talent } from '../../../types';

export const SMUGGLER_DEF: CharacterClass = { 
    type: ClassType.Smuggler, 
    label: 'The Smuggler', 
    description: 'Fast', 
    baseStats: { strength: 4, agility: 8, intelligence: 4, luck: 5, charisma: 3, willpower: 5 }, 
    role: 'Stealth/Speed', 
    color: 'bg-amber-600' 
};

export const SMUGGLER_TALENTS: Talent[] = [
    // Path A: Ghost (Stealth/Evasion)
    { id: 's_a1', name: 'Light Footed', description: '+5 Evasion.', rank: 0, maxRank: 3, reqLevel: 1, icon: '👻', path: 'A', tier: 1 },
    { id: 's_a2', name: 'Smoke Bomb', description: 'Unlocks [Smoke Bomb] ability.', rank: 0, maxRank: 1, reqLevel: 3, reqTalentId: 's_a1', icon: '💨', path: 'A', tier: 2, grantsAbilityId: 'smoke_bomb' },
    { id: 's_a3', name: 'Shadow Step', description: 'Unlocks [Shadow Step] ability.', rank: 0, maxRank: 3, reqLevel: 5, reqTalentId: 's_a2', icon: '🌑', path: 'A', tier: 3, grantsAbilityId: 'shadow_step' },
    { id: 's_a4', name: 'Vanish', description: 'Becomes untargetable when HP drops below 15% per rank.', rank: 0, maxRank: 3, reqLevel: 7, reqTalentId: 's_a3', icon: '🌫️', path: 'A', tier: 4 },
    { id: 's_a5', name: 'Phantom', description: '+20% Evasion.', rank: 0, maxRank: 1, reqLevel: 10, reqTalentId: 's_a4', icon: '👤', path: 'A', tier: 5 },

    // Path B: Guerilla (Ranged/Speed)
    { id: 's_b1', name: 'Gun Nut', description: '+2 Ranged Damage.', rank: 0, maxRank: 3, reqLevel: 1, icon: '🔫', path: 'B', tier: 1 },
    { id: 's_b2', name: 'Quick Draw', description: '+2 Initiative per rank.', rank: 0, maxRank: 3, reqLevel: 3, reqTalentId: 's_b1', icon: '🤠', path: 'B', tier: 2 },
    { id: 's_b3', name: 'Sniper', description: '+2 Range.', rank: 0, maxRank: 3, reqLevel: 5, reqTalentId: 's_b2', icon: '🎯', path: 'B', tier: 3 },
    { id: 's_b4', name: 'Assassinate', description: 'Unlocks [Assassinate] ability.', rank: 0, maxRank: 1, reqLevel: 7, reqTalentId: 's_b3', icon: '🗡️', path: 'B', tier: 4, grantsAbilityId: 'assassinate' },
    { id: 's_b5', name: 'Headhunter', description: 'Critical hits execute low HP targets.', rank: 0, maxRank: 1, reqLevel: 10, reqTalentId: 's_b4', icon: '💀', path: 'B', tier: 5 },

    // Path C: Utility
    { id: 's_c1', name: 'Getaway', description: 'Unlocks [Getaway] ability.', rank: 0, maxRank: 1, reqLevel: 2, icon: '🚗', path: 'C', tier: 1, grantsAbilityId: 'getaway' },
    { id: 's_c2', name: 'Fence', description: '+10% sale price for stolen goods.', rank: 0, maxRank: 3, reqLevel: 4, icon: '💰', path: 'C', tier: 2 },
    { id: 's_c3', name: 'Blockade Runner', description: 'Travel time reduced by 20%.', rank: 0, maxRank: 1, reqLevel: 6, icon: '🚤', path: 'C', tier: 3 }
];
