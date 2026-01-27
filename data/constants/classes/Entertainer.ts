
import { CharacterClass, ClassType, Talent } from '../../../types';

export const ENTERTAINER_DEF: CharacterClass = { 
    type: ClassType.Entertainer, 
    label: 'The Entertainer', 
    description: 'Charismatic', 
    baseStats: { strength: 3, agility: 5, intelligence: 4, luck: 6, charisma: 8, willpower: 5 }, 
    role: 'Crowd Control', 
    color: 'bg-purple-700' 
};

export const ENTERTAINER_TALENTS: Talent[] = [
    // Path A: Idol (Healing/Support)
    { id: 'e_a1', name: 'Star Quality', description: '+5 Max Mana.', rank: 0, maxRank: 3, reqLevel: 1, icon: '🌟', path: 'A', tier: 1 },
    { id: 'e_a2', name: 'Pep Talk', description: 'Start combat with 15 Mana per rank.', rank: 0, maxRank: 3, reqLevel: 3, reqTalentId: 'e_a1', icon: '🗣️', path: 'A', tier: 2 },
    { id: 'e_a3', name: 'Encore', description: 'Unlocks [Encore] ability.', rank: 0, maxRank: 3, reqLevel: 5, reqTalentId: 'e_a2', icon: '👏', path: 'A', tier: 3, grantsAbilityId: 'encore' },
    { id: 'e_a4', name: 'Fan Club', description: 'Unlocks [Summon Fan].', rank: 0, maxRank: 1, reqLevel: 7, reqTalentId: 'e_a3', icon: '👯', path: 'A', tier: 4, grantsAbilityId: 'summon_fan' },
    { id: 'e_a5', name: 'Icon', description: 'Heals are 50% more effective.', rank: 0, maxRank: 1, reqLevel: 10, reqTalentId: 'e_a4', icon: '🏆', path: 'A', tier: 5 },

    // Path B: Diva (CC/Debuff)
    { id: 'e_b1', name: 'High Note', description: 'Spells deal +2 damage.', rank: 0, maxRank: 3, reqLevel: 1, icon: '🎵', path: 'B', tier: 1 },
    { id: 'e_b2', name: 'Spotlight', description: 'Unlocks [Spotlight] ability.', rank: 0, maxRank: 3, reqLevel: 3, reqTalentId: 'e_b1', icon: '🔦', path: 'B', tier: 2, grantsAbilityId: 'spotlight' },
    { id: 'e_b3', name: 'Siren Song', description: 'Unlocks [Siren Song] ability.', rank: 0, maxRank: 1, reqLevel: 5, reqTalentId: 'e_b2', icon: '🧜‍♀️', path: 'B', tier: 3, grantsAbilityId: 'siren_song' },
    { id: 'e_b4', name: 'Drama Queen', description: 'When hit, 20% chance per rank to Confuse attacker.', rank: 0, maxRank: 3, reqLevel: 7, reqTalentId: 'e_b3', icon: '🎭', path: 'B', tier: 4 },
    { id: 'e_b5', name: 'Showstopper', description: 'Ultimate stuns all enemies for 1 turn.', rank: 0, maxRank: 1, reqLevel: 10, reqTalentId: 'e_b4', icon: '🎬', path: 'B', tier: 5 },

    // Path C: Utility
    { id: 'e_c1', name: 'Medkit Toss', description: 'Unlocks [Medkit Toss].', rank: 0, maxRank: 1, reqLevel: 2, icon: '❤️', path: 'C', tier: 1, grantsAbilityId: 'medkit_toss' },
    { id: 'e_c2', name: 'Charisma', description: 'Shop prices -10%.', rank: 0, maxRank: 3, reqLevel: 4, icon: '👄', path: 'C', tier: 2 },
    { id: 'e_c3', name: 'V.I.P.', description: 'Free entry to all clubs.', rank: 0, maxRank: 1, reqLevel: 6, icon: '🎫', path: 'C', tier: 3 }
];
