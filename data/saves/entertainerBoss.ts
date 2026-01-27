
import { GameState, ClassType } from '../../types';
import { STARTING_MONEY } from '../../constants';

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
        stationedCrewIds: []
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
