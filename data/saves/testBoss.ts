
import { GameState, ClassType } from '../../types';
import { STARTING_MONEY } from '../../constants';

export const TEST_BOSS_SAVE: GameState = {
    id: 'hustler-save-id',
    lastPlayed: Date.now(),
    money: 50000,
    heat: 45,
    respect: 850,
    currentEnergy: 50,
    crew: [
        {
            id: 'boss-hustler',
            name: 'Johnny "Dice" Moretti',
            nickname: 'The Whale',
            classType: ClassType.Hustler,
            stats: { strength: 4, agility: 5, intelligence: 7, luck: 10, charisma: 9, willpower: 8, maxHp: 150 },
            backstory: 'Owner of three illegal casinos and a legitimate laundromat.',
            traits: [
                { id: 'lucky_charm', rank: 3 },
                { id: 'silver_tongue', rank: 2 },
                { id: 'big_shot', rank: 1 }
            ],
            talents: {}, // Reset Talents
            activeAbilities: ['make_it_rain', 'bribe', 'pocket_sand', 'payoff'],
            level: 15,
            isLeader: true,
            imageSeed: '777', // Updated to string
            faction: 'Independent',
            hp: 150,
            xp: 4500,
            maxXp: 5000,
            equipment: {
                main_hand: 'glock',
                accessory: 'gold_watch',
                gadget: 'brick_phone',
                feet: 'loafers'
            }
        },
        {
            id: 'crew-h1',
            name: 'Knuckles',
            nickname: 'Collector',
            classType: ClassType.Thug,
            stats: { strength: 6, agility: 3, intelligence: 2, luck: 4, charisma: 1, willpower: 6 },
            backstory: 'Collects debts.',
            traits: [],
            talents: {},
            activeAbilities: ['skull_bash'],
            level: 1,
            isLeader: false,
            pawnType: 'pawn',
            imageSeed: '778',
            hp: 40,
            xp: 0,
            maxXp: 1000
        },
        {
            id: 'crew-h2',
            name: 'Slick',
            nickname: 'Dealer',
            classType: ClassType.Smuggler,
            stats: { strength: 3, agility: 5, intelligence: 4, luck: 6, charisma: 5, willpower: 4 },
            backstory: 'Card sharp.',
            traits: [],
            talents: {},
            activeAbilities: ['skull_bash'],
            level: 1,
            isLeader: false,
            pawnType: 'pawn',
            imageSeed: '779',
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
        { id: 'inv-1', itemId: 'glock', quantity: 1 },
        { id: 'inv-2', itemId: 'vodka_coke', quantity: 10 },
        { id: 'inv-3', itemId: 'lucky_coin', quantity: 1 }
    ],
    holdings: [{
        id: 'holding-hustler-home',
        x: 1,
        y: 3,
        slotIndex: 2,
        name: 'Tenement 13-2 - Apt 3A',
        type: 'residential',
        level: 3,
        maxLevel: 3,
        income: 50,
        cost: 0,
        ownerFaction: 'player',
        icon: '🏠',
        description: 'Luxury Safehouse',
        unitId: '3A'
    }],
    playerHousing: {
        id: 'housing-johnny',
        name: 'Tenement 13-2 - Apt 3A',
        type: 'tenement',
        upgrades: ['Wall Safe', 'Marble Floors'],
        location: { x: 1, y: 3 },
        storedMoney: 25000,
        stationedCrewIds: []
    },
    tags: [
        { id: 'tag-h1', name: 'High Roller', status: 'active', dataUri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' }
    ],
    mapTags: {
        '2,0,1': { id: 'tag-h1', name: 'High Roller', status: 'active', dataUri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' }
    },
    activeTaggingOps: [],
    activeMissions: [],
    activeBounties: [],
    offensiveTactic: 'focus',
    defensiveTactic: 'kite',
    formation: { 'boss-hustler': { x: 3, y: 1 }, 'crew-h1': { x: 4, y: 0 }, 'crew-h2': { x: 2, y: 2 } },
    retreatThreshold: 50,
    currentLocation: { x: 1.5, y: 3.5 }
};
