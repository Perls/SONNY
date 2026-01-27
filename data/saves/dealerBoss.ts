
import { GameState, ClassType } from '../../types';
import { STARTING_MONEY } from '../../constants';

export const DEALER_BOSS_SAVE: GameState = {
    id: 'dealer-save-id',
    lastPlayed: Date.now(),
    money: 35000,
    heat: 65,
    respect: 900,
    currentEnergy: 50,
    crew: [
        {
            id: 'boss-dealer',
            name: 'Simon "Heisenberg" Cook',
            nickname: 'The Chemist',
            classType: ClassType.Dealer,
            stats: { strength: 3, agility: 5, intelligence: 12, luck: 6, charisma: 8, willpower: 7, maxHp: 130 },
            backstory: 'The product is 99.1% pure.',
            traits: [
                { id: 'bookworm', rank: 3 },
                { id: 'high_meth', rank: 1 }
            ],
            talents: {}, // Reset Talents
            activeAbilities: ['bad_batch', 'blue_magic', 'experimental_drug', 'summon_pusher'],
            level: 15,
            isLeader: true,
            imageSeed: '44444', // Updated to string
            faction: 'Independent',
            hp: 130,
            xp: 5000,
            maxXp: 6000,
            equipment: {
                main_hand: 'glock',
                gadget: 'pager',
                accessory: 'sunglasses'
            }
        },
        {
            id: 'crew-d1',
            name: 'Skinny Pete',
            nickname: 'Runner',
            classType: ClassType.Smuggler,
            stats: { strength: 2, agility: 4, intelligence: 3, luck: 7, charisma: 4, willpower: 3 },
            backstory: 'Fast feet.',
            traits: [],
            talents: {},
            activeAbilities: ['skull_bash'],
            level: 1,
            isLeader: false,
            pawnType: 'pawn',
            imageSeed: '445',
            hp: 30,
            xp: 0,
            maxXp: 1000
        },
        {
            id: 'crew-d2',
            name: 'Badger',
            nickname: 'Lookout',
            classType: ClassType.Hustler,
            stats: { strength: 4, agility: 3, intelligence: 3, luck: 8, charisma: 5, willpower: 4 },
            backstory: 'Lucky guesser.',
            traits: [],
            talents: {},
            activeAbilities: ['pocket_sand'],
            level: 1,
            isLeader: false,
            pawnType: 'pawn',
            imageSeed: '446',
            hp: 35,
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
        { id: 'inv-d1', itemId: 'meth', quantity: 50 },
        { id: 'inv-d2', itemId: 'medkit', quantity: 3 },
        { id: 'inv-d3', itemId: 'pager', quantity: 1 }
    ],
    holdings: [{
        id: 'holding-dealer-home',
        x: 1,
        y: 3,
        slotIndex: 2,
        name: 'Tenement 13-2 - Apt 2F',
        type: 'residential',
        level: 2,
        maxLevel: 3,
        income: 30,
        cost: 0,
        ownerFaction: 'player',
        icon: '💊',
        description: 'Lab Apartment',
        unitId: '2F'
    }],
    playerHousing: {
        id: 'housing-simon',
        name: 'Tenement 13-2 - Apt 2F',
        type: 'tenement',
        upgrades: ['Ventilation System', 'Chemistry Set'],
        location: { x: 1, y: 3 },
        storedMoney: 15000,
        stationedCrewIds: []
    },
    tags: [
        { id: 'tag-d1', name: 'Blue Magic', status: 'active', dataUri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/AAAADQAIB00966AAAAABJRU5ErkJggg==' }
    ],
    mapTags: {
        '4,6,0': { id: 'tag-d1', name: 'Blue Magic', status: 'active', dataUri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/AAAADQAIB00966AAAAABJRU5ErkJggg==' }
    },
    activeTaggingOps: [],
    activeMissions: [],
    activeBounties: [],
    offensiveTactic: 'focus',
    defensiveTactic: 'bunker',
    formation: { 'boss-dealer': { x: 3, y: 2 }, 'crew-d1': { x: 2, y: 1 }, 'crew-d2': { x: 4, y: 1 } },
    retreatThreshold: 50,
    currentLocation: { x: 1.5, y: 3.5 }
};
