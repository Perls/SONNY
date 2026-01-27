
import { CharacterClass, ClassType, Talent } from '../../../types';

export const THUG_DEF: CharacterClass = { 
    type: ClassType.Thug, 
    label: 'The Thug', 
    description: 'Strong', 
    baseStats: { strength: 8, agility: 4, intelligence: 2, luck: 3, charisma: 3, willpower: 8 }, 
    role: 'Tank/DPS', 
    color: 'bg-slate-700' 
};

export const THUG_TALENTS: Talent[] = [
    // Path A: Juggernaut (Tank/Survival)
    { id: 't_a1', name: 'Iron Skin', description: '+10 Max HP per rank.', rank: 0, maxRank: 3, reqLevel: 1, icon: '🛡️', path: 'A', tier: 1 },
    { id: 't_a2', name: 'Pain Tolerance', description: 'Reduce incoming damage by 1 per rank.', rank: 0, maxRank: 3, reqLevel: 3, reqTalentId: 't_a1', icon: '🤕', path: 'A', tier: 2 },
    { id: 't_a3', name: 'Riot Shield', description: 'Unlocks [Riot Shield] ability.', rank: 0, maxRank: 3, reqLevel: 5, reqTalentId: 't_a2', icon: '🧱', path: 'A', tier: 3, grantsAbilityId: 'riot_shield' },
    { id: 't_a4', name: 'Thick Skull', description: 'Immunity to Stun.', rank: 0, maxRank: 1, reqLevel: 7, reqTalentId: 't_a3', icon: '🗿', path: 'A', tier: 4 },
    { id: 't_a5', name: 'Unstoppable', description: 'Unlocks [Titan Form].', rank: 0, maxRank: 1, reqLevel: 10, reqTalentId: 't_a4', icon: '🦍', path: 'A', tier: 5, grantsAbilityId: 'titan_form' },

    // Path B: Enforcer (Damage)
    { id: 't_b1', name: 'Knuckle Sandwich', description: '+2 Melee Damage.', rank: 0, maxRank: 3, reqLevel: 1, icon: '👊', path: 'B', tier: 1 },
    { id: 't_b2', name: 'Dirty Fighting', description: 'Melee attacks have a 20% chance per rank to apply Slow.', rank: 0, maxRank: 3, reqLevel: 3, reqTalentId: 't_b1', icon: '👞', path: 'B', tier: 2 },
    { id: 't_b3', name: 'Haymaker', description: 'Unlocks [Haymaker] ability.', rank: 0, maxRank: 3, reqLevel: 5, reqTalentId: 't_b2', icon: '🥊', path: 'B', tier: 3, grantsAbilityId: 'haymaker' },
    { id: 't_b4', name: 'Blood Rage', description: 'Unlocks [Blood Rage] ability.', rank: 0, maxRank: 1, reqLevel: 7, reqTalentId: 't_b3', icon: '😡', path: 'B', tier: 4, grantsAbilityId: 'blood_rage' },
    { id: 't_b5', name: 'Bone Breaker', description: 'Critical hits stun enemies.', rank: 0, maxRank: 1, reqLevel: 10, reqTalentId: 't_b4', icon: '🦴', path: 'B', tier: 5 },

    // Path C: Utility
    { id: 't_c1', name: 'Intimidation', description: 'Unlocks [Intimidate].', rank: 0, maxRank: 1, reqLevel: 2, icon: '😠', path: 'C', tier: 1, grantsAbilityId: 'intimidate' },
    { id: 't_c2', name: 'Street Cred', description: '+10 Respect generation.', rank: 0, maxRank: 3, reqLevel: 4, icon: '🕶️', path: 'C', tier: 2 },
    { id: 't_c3', name: 'Bouncer', description: '+5 Defense in Nightclubs.', rank: 0, maxRank: 1, reqLevel: 6, icon: '🚫', path: 'C', tier: 3 }
];
