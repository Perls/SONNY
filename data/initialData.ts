
import { GameState, ClassType } from '../types';
import { STARTING_MONEY } from '../constants';

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
        { id: 'inv-3', itemId: 'lucky_coin', quantity: 1 },
        { id: 'inv-4', itemId: 'mattress', quantity: 1 }
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
        stationedCrewIds: [],
        inventory: [], // Safe
        storage: [], // Apartment Storage
        furniture: { tv: null, computer: 'wang_3000', bed: null, music: null, coffee: null }
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
        stationedCrewIds: [],
        inventory: [],
        storage: [],
        furniture: { tv: null, computer: null, bed: null, music: null, coffee: null }
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
        stationedCrewIds: [],
        inventory: [],
        storage: [],
        furniture: { tv: null, computer: null, bed: null, music: null, coffee: null }
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
        stationedCrewIds: [],
        inventory: [],
        storage: [],
        furniture: { tv: null, computer: null, bed: null, music: null, coffee: null }
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

export const ENTERTAINER_BOSS_SAVE: GameState = {
    id: 'entertainer-save-id',
    lastPlayed: Date.now(),
    money: 200000,
    heat: 20,
    respect: 2000,
    currentEnergy: 50,
    crew: [
        {
            id: 'boss-ent',
            name: 'Roxy "Diva" Star',
            nickname: 'The Icon',
            classType: ClassType.Entertainer,
            stats: { strength: 3, agility: 7, intelligence: 6, luck: 8, charisma: 12, willpower: 5, maxHp: 140 },
            backstory: 'Sold out arenas, now selling out the city.',
            traits: [
                { id: 'silver_tongue', rank: 3 },
                { id: 'entertained', rank: 1 }
            ],
            talents: {}, // Reset Talents
            activeAbilities: ['siren_song', 'spotlight', 'encore', 'summon_fan'],
            level: 15,
            isLeader: true,
            imageSeed: '55555', // Updated to string
            faction: 'The Commission',
            hp: 140,
            xp: 7000,
            maxXp: 8000,
            equipment: {
                main_hand: 'glock',
                accessory: 'boombox',
                head: 'sunglasses'
            }
        },
        {
            id: 'crew-e1',
            name: 'Bounce',
            nickname: 'Security',
            classType: ClassType.Thug,
            stats: { strength: 6, agility: 3, intelligence: 2, luck: 3, charisma: 4, willpower: 6 },
            backstory: 'Head of security.',
            traits: [],
            talents: {},
            activeAbilities: ['skull_bash'],
            level: 1,
            isLeader: false,
            pawnType: 'pawn',
            imageSeed: '556',
            hp: 50,
            xp: 0,
            maxXp: 1000
        },
        {
            id: 'crew-e2',
            name: 'Flash',
            nickname: 'Paparazzi',
            classType: ClassType.Smuggler,
            stats: { strength: 2, agility: 5, intelligence: 6, luck: 8, charisma: 5, willpower: 3 },
            backstory: 'Always gets the shot.',
            traits: [],
            talents: {},
            activeAbilities: ['skull_bash'],
            level: 1,
            isLeader: false,
            pawnType: 'pawn',
            imageSeed: '557',
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
        { id: 'inv-e1', itemId: 'boombox', quantity: 1 },
        { id: 'inv-e2', itemId: 'vodka_coke', quantity: 20 },
        { id: 'inv-e3', itemId: 'sunglasses', quantity: 3 }
    ],
    holdings: [{
        id: 'holding-ent-home',
        x: 1,
        y: 3,
        slotIndex: 2,
        name: 'Tenement 13-2 - Apt PH',
        type: 'residential',
        level: 3,
        maxLevel: 3,
        income: 80,
        cost: 0,
        ownerFaction: 'player',
        icon: '💃',
        description: 'Party Pad',
        unitId: 'PH'
    }],
    playerHousing: {
        id: 'housing-roxy',
        name: 'Tenement 13-2 - Apt PH',
        type: 'tenement',
        upgrades: ['Soundproofing', 'Jacuzzi'],
        location: { x: 1, y: 3 },
        storedMoney: 50000,
        stationedCrewIds: [],
        inventory: [],
        storage: [],
        furniture: { tv: null, computer: null, bed: null, music: 'boombox', coffee: null }
    },
    tags: [
        { id: 'tag-e1', name: 'Star Power', status: 'active', dataUri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' }
    ],
    mapTags: {
        '10,5,0': { id: 'tag-e1', name: 'Star Power', status: 'active', dataUri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' }
    },
    activeTaggingOps: [],
    activeMissions: [],
    activeBounties: [],
    offensiveTactic: 'aggressive',
    defensiveTactic: 'hold_center',
    formation: { 'boss-ent': { x: 3, y: 2 }, 'crew-e1': { x: 3, y: 0 }, 'crew-e2': { x: 4, y: 1 } },
    retreatThreshold: 20,
    currentLocation: { x: 1.5, y: 3.5 }
};
export const gameConfig = {};
