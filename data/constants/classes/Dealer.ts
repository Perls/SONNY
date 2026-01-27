
import { CharacterClass, ClassType, Talent } from '../../../types';

export const DEALER_DEF: CharacterClass = { 
    type: ClassType.Dealer, 
    label: 'The Dealer', 
    description: 'Smart', 
    baseStats: { strength: 3, agility: 4, intelligence: 8, luck: 4, charisma: 5, willpower: 4 }, 
    role: 'Support/Buff', 
    color: 'bg-blue-700' 
};

export const DEALER_TALENTS: Talent[] = [
    // Path A: Chemist (Production/Buffs)
    { id: 'd_a1', name: 'Potency', description: 'Buffs last 1 turn longer.', rank: 0, maxRank: 3, reqLevel: 1, icon: '⚗️', path: 'A', tier: 1 },
    { id: 'd_a2', name: 'Supplier', description: 'Reduces mana cost of abilities by 2 per rank.', rank: 0, maxRank: 3, reqLevel: 3, reqTalentId: 'd_a1', icon: '🚚', path: 'A', tier: 2 },
    { id: 'd_a3', name: 'Experimental Drug', description: 'Unlocks [Experimental Drug] ability.', rank: 0, maxRank: 3, reqLevel: 5, reqTalentId: 'd_a2', icon: '🧪', path: 'A', tier: 3, grantsAbilityId: 'experimental_drug' },
    { id: 'd_a4', name: 'Blue Magic', description: 'Unlocks [Blue Magic] ability.', rank: 0, maxRank: 1, reqLevel: 7, reqTalentId: 'd_a3', icon: '💎', path: 'A', tier: 4, grantsAbilityId: 'blue_magic' },
    { id: 'd_a5', name: 'Mad Scientist', description: 'Buffs are 50% stronger.', rank: 0, maxRank: 1, reqLevel: 10, reqTalentId: 'd_a4', icon: '🧬', path: 'A', tier: 5 },

    // Path B: Corner Boss (Control/Summon)
    { id: 'd_b1', name: 'Turf War', description: '+2 Damage on owned turf.', rank: 0, maxRank: 3, reqLevel: 1, icon: '🏙️', path: 'B', tier: 1 },
    { id: 'd_b2', name: 'Bad Batch', description: 'Unlocks [Bad Batch] ability.', rank: 0, maxRank: 3, reqLevel: 3, reqTalentId: 'd_b1', icon: '☠️', path: 'B', tier: 2, grantsAbilityId: 'bad_batch' },
    { id: 'd_b3', name: 'Addict Army', description: 'Unlocks [Summon Pusher] ability.', rank: 0, maxRank: 1, reqLevel: 5, reqTalentId: 'd_b2', icon: '🧟', path: 'B', tier: 3, grantsAbilityId: 'summon_pusher' },
    { id: 'd_b4', name: 'Cut the Product', description: 'Abilities cost 2 less Health/Mana per rank.', rank: 0, maxRank: 3, reqLevel: 7, reqTalentId: 'd_b3', icon: '🔪', path: 'B', tier: 4 },
    { id: 'd_b5', name: 'Kingpin', description: 'Minions have +50% Stats.', rank: 0, maxRank: 1, reqLevel: 10, reqTalentId: 'd_b4', icon: '👑', path: 'B', tier: 5 },

    // Path C: Utility
    { id: 'd_c1', name: 'Free Sample', description: 'Unlocks [Free Sample].', rank: 0, maxRank: 1, reqLevel: 2, icon: '🍬', path: 'C', tier: 1, grantsAbilityId: 'free_sample' },
    { id: 'd_c2', name: 'Lab Rat', description: 'Production speed +25%.', rank: 0, maxRank: 3, reqLevel: 4, icon: '🔬', path: 'C', tier: 2 },
    { id: 'd_c3', name: 'Money Laundering', description: 'Reduce heat from sales by 10%.', rank: 0, maxRank: 1, reqLevel: 6, icon: '💵', path: 'C', tier: 3 }
];
