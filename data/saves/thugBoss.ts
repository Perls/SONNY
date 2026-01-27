
import { GameState, ClassType } from '../../types';
import { STARTING_MONEY } from '../../constants';

export const THUG_BOSS_SAVE: GameState = {
    id: 'thug-save-id',
    lastPlayed: Date.now(),
    money: 12000,
    heat: 80,
    respect: 1200,
    currentEnergy: 50,
    crew: [
        {
            id: 'boss-thug',
            name: 'Marcus "The Anvil"',
            nickname: 'Warlord',
            classType: ClassType.Thug,
            stats: { strength: 12, agility: 6, intelligence: 4, luck: 3, charisma: 5, willpower: 10, maxHp: 200 },
            backstory: 'Survived the riots of 2040. Now runs the block.',
            traits: [
                { id: 'iron_jaw', rank: 3 },
                { id: 'scarred', rank: 1 }
            ],
            talents: {}, // Reset Talents
            activeAbilities: ['skull_bash', 'blood_rage', 'titan_form', 'haymaker'],
            level: 15,
            isLeader: true,
            imageSeed: '22222', // Updated to string
            faction: 'The Street Gangs',
            hp: 200,
            xp: 6000,
            maxXp: 7000,
            equipment: {
                main_hand: 'bat',
                body: 'vest',
                head: 'sunglasses'
            }
        },
        {
            id: 'crew-t1',
            name: 'Tiny',
            nickname: 'Tank',
            classType: ClassType.Thug,
            stats: { strength: 6, agility: 2, intelligence: 1, luck: 2, charisma: 1, willpower: 7 },
            backstory: 'He is not tiny.',
            traits: [],
            talents: {},
            activeAbilities: ['skull_bash'],
            level: 1,
            isLeader: false,
            pawnType: 'pawn',
            imageSeed: '223',
            hp: 50,
            xp: 0,
            maxXp: 1000
        },
        {
            id: 'crew-t2',
            name: 'Viper',
            nickname: 'Shiv',
            classType: ClassType.Smuggler,
            stats: { strength: 3, agility: 5, intelligence: 3, luck: 5, charisma: 2, willpower: 4 },
            backstory: 'Fast with a knife.',
            traits: [],
            talents: {},
            activeAbilities: ['skull_bash'],
            level: 1,
            isLeader: false,
            pawnType: 'pawn',
            imageSeed: '224',
            hp: 30,
            xp: 0,
            maxXp: 1000
        },
        {
            id: 'crew-t3',
            name: 'Doc',
            nickname: 'Medic',
            classType: ClassType.Dealer,
            stats: { strength: 2, agility: 4, intelligence: 5, luck: 3, charisma: 4, willpower: 5 },
            backstory: 'Failed med school.',
            traits: [],
            talents: {},
            activeAbilities: ['skull_bash'],
            level: 1,
            isLeader: false,
            pawnType: 'pawn',
            imageSeed: '225',
            hp: 30,
            xp: 0,
            maxXp: 1000
        }
    ],
    officers: [
        { id: 'off-1', role: 'Consigliere', isEmpty: true, activeMissionIdx: 0, salary: 0 },
        { id: 'off-2', role: 'Underboss', isEmpty: true, activeMissionIdx: 0, salary: 0 },
        { id: 'off-3', role: 'Enforcer', isEmpty: true, activeMissionIdx: 0, salary: 0 },
        { id: 'off-4', role: 'Lawyer', isEmpty: true, activeMissionIdx: 0, salary: 0 }
    ],
    friends: [],
    journal: [],
    inventory: [
        { id: 'inv-t1', itemId: 'vest', quantity: 2 },
        { id: 'inv-t2', itemId: 'medkit', quantity: 5 },
        { id: 'inv-t3', itemId: 'brass_knuckles', quantity: 1 }
    ],
    holdings: [{
        id: 'holding-thug-home',
        x: 1,
        y: 3,
        slotIndex: 2,
        name: 'Tenement 13-2 - Apt 1B',
        type: 'residential',
        level: 2,
        maxLevel: 3,
        income: 20,
        cost: 0,
        ownerFaction: 'player',
        icon: '🏭',
        description: 'Fortified Loft',
        unitId: '1B'
    }],
    playerHousing: {
        id: 'housing-marcus',
        name: 'Tenement 13-2 - Apt 1B',
        type: 'tenement',
        upgrades: ['Reinforced Doors', 'Armory Rack'],
        location: { x: 1, y: 3 },
        storedMoney: 5000,
        stationedCrewIds: []
    },
    tags: [
        { id: 'tag-t1', name: 'Iron Fist', status: 'active', dataUri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mPk+M/AAgADQAIBs0/4CQAAAABJRU5ErkJggg==' }
    ],
    mapTags: {
        '13,4,1': { id: 'tag-t1', name: 'Iron Fist', status: 'active', dataUri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mPk+M/AAgADQAIBs0/4CQAAAABJRU5ErkJggg==' }
    },
    activeTaggingOps: [],
    activeMissions: [],
    activeBounties: [],
    offensiveTactic: 'aggressive',
    defensiveTactic: 'hold_center',
    formation: { 'boss-thug': { x: 4, y: 0 }, 'crew-t1': { x: 3, y: 0 }, 'crew-t2': { x: 5, y: 1 }, 'crew-t3': { x: 2, y: 2 } },
    retreatThreshold: 10,
    currentLocation: { x: 1.5, y: 3.5 }
};
