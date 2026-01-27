
import { GameState, ClassType } from '../../types';
import { STARTING_MONEY } from '../../constants';

export const SMUGGLER_BOSS_SAVE: GameState = {
    id: 'smuggler-save-id',
    lastPlayed: Date.now(),
    money: 85000,
    heat: 10,
    respect: 600,
    currentEnergy: 50,
    crew: [
        {
            id: 'boss-smuggler',
            name: 'Elara "Ghost" Vance',
            nickname: 'The Phantom',
            classType: ClassType.Smuggler,
            stats: { strength: 5, agility: 12, intelligence: 8, luck: 8, charisma: 6, willpower: 6, maxHp: 120 },
            backstory: 'Controls the waterways. Seen by no one.',
            traits: [
                { id: 'cat_reflexes', rank: 3 },
                { id: 'connected', rank: 1 }
            ],
            talents: {}, // Reset Talents
            activeAbilities: ['glock_burst', 'smoke_bomb', 'getaway', 'assassinate', 'shadow_step'],
            level: 15,
            isLeader: true,
            imageSeed: '33333', // Updated to string
            faction: 'The Cartels',
            hp: 120,
            xp: 5500,
            maxXp: 6000,
            equipment: {
                main_hand: 'glock',
                gadget: 'burner',
                feet: 'loafers'
            }
        },
        {
            id: 'crew-s1',
            name: 'Sniper Wolf',
            nickname: 'Hawkeye',
            classType: ClassType.Smuggler,
            stats: { strength: 3, agility: 6, intelligence: 4, luck: 4, charisma: 2, willpower: 5 },
            backstory: 'Never misses.',
            traits: [],
            talents: {},
            activeAbilities: ['skull_bash'],
            level: 1,
            isLeader: false,
            pawnType: 'pawn',
            imageSeed: '334',
            hp: 35,
            xp: 0,
            maxXp: 1000
        },
        {
            id: 'crew-s2',
            name: 'The Mule',
            nickname: 'Carrier',
            classType: ClassType.Thug,
            stats: { strength: 5, agility: 3, intelligence: 2, luck: 5, charisma: 1, willpower: 6 },
            backstory: 'Carries the load.',
            traits: [],
            talents: {},
            activeAbilities: ['skull_bash'],
            level: 1,
            isLeader: false,
            pawnType: 'pawn',
            imageSeed: '335',
            hp: 45,
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
        { id: 'inv-s1', itemId: 'burner', quantity: 5 },
        { id: 'inv-s2', itemId: 'coke', quantity: 20 },
        { id: 'inv-s3', itemId: 'glock', quantity: 2 }
    ],
    holdings: [{
        id: 'holding-smuggler-home',
        x: 1,
        y: 3,
        slotIndex: 2,
        name: 'Tenement 13-2 - Apt C4',
        type: 'residential',
        level: 1,
        maxLevel: 2,
        income: 10,
        cost: 0,
        ownerFaction: 'player',
        icon: '🚢',
        description: 'Hidden Safehouse',
        unitId: 'C4'
    }],
    playerHousing: {
        id: 'housing-elara',
        name: 'Tenement 13-2 - Apt C4',
        type: 'tenement',
        upgrades: ['Hidden Compartments', 'Scanner'],
        location: { x: 1, y: 3 },
        storedMoney: 100000,
        stationedCrewIds: []
    },
    tags: [
        { id: 'tag-s1', name: 'Ghost Mark', status: 'active', dataUri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCb5mQAAAABJRU5ErkJggg==' }
    ],
    mapTags: {
        '12,8,0': { id: 'tag-s1', name: 'Ghost Mark', status: 'active', dataUri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCb5mQAAAABJRU5ErkJggg==' }
    },
    activeTaggingOps: [],
    activeMissions: [],
    activeBounties: [],
    offensiveTactic: 'flank',
    defensiveTactic: 'kite',
    formation: { 'boss-smuggler': { x: 1, y: 2 }, 'crew-s1': { x: 0, y: 2 }, 'crew-s2': { x: 3, y: 1 } },
    retreatThreshold: 40,
    currentLocation: { x: 1.5, y: 3.5 }
};
