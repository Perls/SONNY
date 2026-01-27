
import { CharacterClass, ClassType, Talent } from '../../../types';

export const HUSTLER_DEF: CharacterClass = { 
    type: ClassType.Hustler, 
    label: 'The Hustler', 
    description: 'Lucky', 
    baseStats: { strength: 4, agility: 5, intelligence: 5, luck: 8, charisma: 6, willpower: 7 }, 
    role: 'Economy/Jack', 
    color: 'bg-emerald-700' 
};

export const HUSTLER_TALENTS: Talent[] = [
    // Path A: Kingpin (Economy/Management)
    { id: 'h_a1', name: 'Greed', description: '+5 Money per turn in combat.', rank: 0, maxRank: 3, reqLevel: 1, icon: '💰', path: 'A', tier: 1 },
    { id: 'h_a2', name: 'Bribe', description: 'Unlocks [Bribe] ability.', rank: 0, maxRank: 3, reqLevel: 3, reqTalentId: 'h_a1', icon: '💵', path: 'A', tier: 2, grantsAbilityId: 'bribe' },
    { id: 'h_a3', name: 'Payoff', description: 'Unlocks [Payoff] ability. Rank increases effectiveness.', rank: 0, maxRank: 3, reqLevel: 5, reqTalentId: 'h_a2', icon: '🤝', path: 'A', tier: 3, grantsAbilityId: 'payoff' },
    { id: 'h_a4', name: 'Make It Rain', description: 'Unlocks [Make It Rain].', rank: 0, maxRank: 1, reqLevel: 7, reqTalentId: 'h_a3', icon: '💸', path: 'A', tier: 4, grantsAbilityId: 'make_it_rain' },
    { id: 'h_a5', name: 'Tycoon', description: 'Double all passive income.', rank: 0, maxRank: 1, reqLevel: 10, reqTalentId: 'h_a4', icon: '🏢', path: 'A', tier: 5 },

    // Path B: Playboy (Luck/Risk)
    { id: 'h_b1', name: 'Gambler', description: '+5 Luck.', rank: 0, maxRank: 3, reqLevel: 1, icon: '🎲', path: 'B', tier: 1 },
    { id: 'h_b2', name: 'High Roller', description: 'Crit chance +5% per rank.', rank: 0, maxRank: 3, reqLevel: 3, reqTalentId: 'h_b1', icon: '🎰', path: 'B', tier: 2 },
    { id: 'h_b3', name: 'Pocket Sand', description: 'Unlocks [Pocket Sand].', rank: 0, maxRank: 3, reqLevel: 5, reqTalentId: 'h_b2', icon: '⏳', path: 'B', tier: 3, grantsAbilityId: 'pocket_sand' },
    { id: 'h_b4', name: 'Lucky Break', description: 'Chance to ignore damage.', rank: 0, maxRank: 1, reqLevel: 7, reqTalentId: 'h_b3', icon: '🍀', path: 'B', tier: 4 },
    { id: 'h_b5', name: 'Jackpot', description: 'Crits deal 300% damage.', rank: 0, maxRank: 1, reqLevel: 10, reqTalentId: 'h_b4', icon: '7️⃣', path: 'B', tier: 5 },

    // Path C: Utility
    { id: 'h_c1', name: 'Negotiator', description: 'Recruit cost -20%.', rank: 0, maxRank: 1, reqLevel: 2, icon: '🗣️', path: 'C', tier: 1 },
    { id: 'h_c2', name: 'Insider Trading', description: 'See enemy stats.', rank: 0, maxRank: 1, reqLevel: 4, icon: '📈', path: 'C', tier: 2 },
    { id: 'h_c3', name: 'Tax Evasion', description: '+5% income retention.', rank: 0, maxRank: 3, reqLevel: 6, icon: '📉', path: 'C', tier: 3 }
];
