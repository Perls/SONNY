
import { Holding } from '../types';
import { isBeach } from './waterUtils';

// Updated Destinations with Grid Coordinates - Moved Docks to be safe from water
// PRICES MULTIPLIED BY 60x
export const MAP_DESTINATIONS = [
  { id: 'bronx_zoo', gridX: 8, gridY: 1, label: "The Zoo", icon: "🦁", faction: 'gangs', type: 'recruit' },
  { id: 'yankee', gridX: 4, gridY: 3, label: "The Stadium", icon: "⚾", faction: 'gangs', type: 'combat_hub' },
  { id: 'times_sq', gridX: 4, gridY: 6, label: "Neon District", icon: "💡", faction: 'mafia', type: 'entertainment' },
  { id: 'queens', gridX: 11, gridY: 2, label: "The Bridge", icon: "🌉", faction: 'gangs', type: 'recruit' },
  { id: 'hospital', gridX: 8, gridY: 7, label: "St. Jude's", icon: "🏥", faction: 'independent', type: 'hospital' },
  
  // Megablock Tower (Master Tile 0-5)
  { id: 'megablock_tower', gridX: 0, gridY: 5, label: "The Tower", icon: "🏢", faction: 'independent', type: 'landmark', landmarkId: 'megablock_tower' },

  // New Landmark: Gambling Den (Moved to Block 2-0)
  { id: 'gambling_den', gridX: 2, gridY: 0, label: "The High Roller", icon: "🎰", faction: 'independent', type: 'casino' },

  // New Landmark: Church (Block 0-2)
  { id: 'church', gridX: 0, gridY: 2, label: "St. Michael's", icon: "⛪", faction: 'independent', type: 'landmark' },

  // Parks (Added for Interactivity)
  { id: 'central_park', gridX: 3, gridY: 4, label: "Central Park", icon: "🌳", faction: 'independent', type: 'landmark', landmarkId: 'central_park' },
  { id: 'highland_park', gridX: 12, gridY: 3, label: "Highland Park", icon: "🌲", faction: 'independent', type: 'landmark', landmarkId: 'highland_park' },

  // Mafia HQ
  { id: 'mafia_hq', gridX: 11, gridY: 8, label: "Mafia Neighborhood HQ", icon: "🏰", faction: 'mafia', type: 'headquarters' },

  // Docks
  { id: 'dock_bk', gridX: 2, gridY: 7, label: "Red Hook Docks", icon: "⚓", faction: 'cartel', type: 'smuggler' },
  { id: 'dock_qn', gridX: 12, gridY: 8, label: "Hunters Point", icon: "⚓", faction: 'cartel', type: 'smuggler' },
  { id: 'dock_bx', gridX: 13, gridY: 4, label: "Port Morris", icon: "⚓", faction: 'cartel', type: 'smuggler' },

  // Transport
  { id: 'bus_station', gridX: 7, gridY: 4, label: "Bus Station", icon: "🚌", faction: 'independent', type: 'transport' },
  
  // NEW RAIL LANDMARKS
  { id: 'subway_station', gridX: 2, gridY: 2, label: "Franklin St Station", icon: "🚇", faction: 'independent', type: 'landmark', landmarkId: 'subway_station' },
  { id: 'train_depot', gridX: 8, gridY: 0, label: "RAIL DEPOT", icon: "🛤️", faction: 'independent', type: 'landmark', landmarkId: 'train_depot' },

  // Bars
  { id: 'dive_bar', gridX: 10, gridY: 4, label: "The Dive Bar", icon: "🍺", faction: 'independent', type: 'entertainment' },

  // KB Electronics
  { id: 'kb_electronics', gridX: 6, gridY: 0, label: "KB Electronics", icon: "📺", faction: 'independent', type: 'commercial', landmarkId: 'kb_electronics' },
];

export const PRIORITY_TILES = [
    { col: 2, row: 7 },
    { col: 12, row: 8 },
    { col: 13, row: 4 },
    { col: 8, row: 7 }, // Hospital
    { col: 7, row: 4 },  // Bus Station
    { col: 2, row: 0 },   // Casino
    { col: 11, row: 8 },   // Mafia HQ
    { col: 0, row: 2 },    // Church
    { col: 0, row: 5 },     // The Tower (Master Tile)
    { col: 6, row: 0 },      // KB Electronics
    { col: 2, row: 2 },    // Subway
    { col: 8, row: 0 }     // Train Depot
];

// Megablock Configuration
export const MEGABLOCK_TILES = [
    { col: 0, row: 5 }, 
    { col: 1, row: 5 },
    { col: 0, row: 6 }, 
    { col: 1, row: 6 }
];

// Central Park Configuration (3x2 Grid)
export const CENTRAL_PARK_TILES = [
    { col: 3, row: 4 }, { col: 4, row: 4 }, { col: 5, row: 4 },
    { col: 3, row: 5 }, { col: 4, row: 5 }, { col: 5, row: 5 }
];

// Highland Park Configuration (1x2 Grid)
export const HIGHLAND_PARK_TILES = [
    { col: 12, row: 3 }, { col: 12, row: 4 }
];

// Hidden Motel Locations
const MOTEL_LOCATIONS = [
    { col: 4, row: 5 },
    { col: 12, row: 7 },
    { col: 1, row: 4 },
    { col: 10, row: 0 },
    { col: 8, row: 4 }
];

// 12 New Medical Buildings
// Prices increased: 0 -> 90,000 (1500 * 60)
const MEDICAL_BUILDINGS = [
    // 4 Doctors
    { col: 1, row: 1, name: "Dr. Feelgood", type: 'medical', icon: '🩺', cost: 90000, income: 0, variant: 'doctor' },
    { col: 9, row: 2, name: "City Clinic", type: 'medical', icon: '🩺', cost: 90000, income: 0, variant: 'doctor' },
    { col: 5, row: 8, name: "Harbor Med", type: 'medical', icon: '🩺', cost: 90000, income: 0, variant: 'doctor' },
    { col: 14, row: 1, name: "Uptown Practice", type: 'medical', icon: '🩺', cost: 90000, income: 0, variant: 'doctor' },
    
    // 3 Vets
    { col: 3, row: 8, name: "Paw & Claw Vet", type: 'medical', icon: '🐾', cost: 90000, income: 0, variant: 'vet' },
    { col: 10, row: 1, name: "Urban Pet Care", type: 'medical', icon: '🐾', cost: 90000, income: 0, variant: 'vet' },
    { col: 6, row: 6, name: "The Stray Stop", type: 'medical', icon: '🐾', cost: 90000, income: 0, variant: 'vet' },

    // 4 Pharmacies
    // REMOVED CVS at 2-2 to make room for Subway
    { col: 9, row: 5, name: "Quick-Meds", type: 'medical', icon: '💊', cost: 90000, income: 0, variant: 'pharmacy' },
    { col: 13, row: 7, name: "Corner Pharma", type: 'medical', icon: '💊', cost: 90000, income: 0, variant: 'pharmacy' },
    { col: 0, row: 8, name: "Discount Drugs", type: 'medical', icon: '💊', cost: 90000, income: 0, variant: 'pharmacy' },

    // 1 Morgue
    { col: 14, row: 9, name: "City Morgue", type: 'medical', icon: '⚰️', cost: 90000, income: 0, variant: 'morgue' }
];

// Flavor Buildings Definitions
// PRICES MULTIPLIED BY 60x
const FLAVOR_BUILDINGS = [
    { name: "Pizzeria", type: 'commercial', icon: '🍕', cost: 24000, income: 15 },
    { name: "Laundromat", type: 'commercial', icon: '🧺', cost: 21000, income: 10 },
    { name: "Basement", type: 'residential', icon: '🔦', cost: 12000, income: 5 },
    { name: "Back Alley", type: 'industrial', icon: '🗑️', cost: 9000, income: 5 },
    { name: "Coffee Shop", type: 'commercial', icon: '☕', cost: 27000, income: 20 }
];

// --- CONSTANTS FOR STREETS ---
export const AVENUE_NAMES = ["Riverside Dr", "11th Ave", "10th Ave", "9th Ave", "8th Ave", "7th Ave", "6th Ave", "5th Ave", "Madison Ave", "Park Ave", "Lexington", "3rd Ave", "2nd Ave", "1st Ave", "York Ave"];
export const STREET_NAMES = ["200th St", "181st St", "155th St", "125th St", "110th St", "96th St", "72nd St", "42nd St", "34th St", "14th St"];

export const generateAddress = (col: number, row: number, slotIndex: number) => {
    // 65-2 5th Ave style
    // Row+Col combined for block number style? Or just ColRow?
    // Let's do {col}{row}-{slot} {Avenue}
    const street = AVENUE_NAMES[col] || `${col}th Ave`;
    return `${col}${row}-${slotIndex} ${street}`;
};

// Helper for deterministic randomness
const hashCode = (str: string) => {
    if (!str) return 0;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
};

export const getBlockHeat = (col: number, row: number) => {
    // 5 Specific High Heat Zones (Red, Police Presence)
    const highZones = [
        {x: 4, y: 4},  // Central
        {x: 12, y: 2}, // Queens
        {x: 2, y: 8},  // Docks
        {x: 8, y: 0},  // Top
        {x: 6, y: 6}   // Mid
    ];

    if (highZones.some(h => h.x === col && h.y === row)) {
        return 90; // High Heat
    }

    // Deterministic low/medium heat for everywhere else
    // Formula guarantees range 0-50 (Low to Medium)
    const seedVal = (col * 3 + row * 7);
    return seedVal % 50; 
};

export interface BlockSubPlot {
    x: number; // Relative to block (0-100)
    y: number;
    w: number;
    h: number;
    slotIndex: number;
    type: Holding['type'];
    name: string;
    cost: number;
    income: number;
    icon: string;
    landmarkId?: string;
    isVisualMaster?: boolean;
    variant?: string; // New: For medical types etc
    isHidden?: boolean; // New: Hide from map visualization
}

export const generateBlockBuildings = (col: number, row: number): BlockSubPlot[] => {
    
    // --- BEACH ZONE LOGIC ---
    if (isBeach(col, row)) {
        return [{
            x: 25, 
            y: 25, 
            w: 50, 
            h: 50, 
            slotIndex: 0,
            type: 'landmark',
            name: 'Coastal Ruins',
            cost: 0,
            income: 0,
            icon: '🦀',
            isVisualMaster: true
        }];
    }

    // --- MEGABLOCK LOGIC (THE TOWER) ---
    if (MEGABLOCK_TILES.some(t => t.col === col && t.row === row)) {
        const isMaster = col === 0 && row === 5;
        return [{
            x: 5, 
            y: 5, 
            w: 190, 
            h: 190, 
            slotIndex: 0,
            type: 'landmark',
            name: 'The Tower',
            cost: 0,
            income: 0,
            icon: '🏢',
            landmarkId: 'megablock_tower',
            isVisualMaster: isMaster
        }];
    }

    // --- CENTRAL PARK OVERRIDE (3x2 Grid: 3-5 X, 4-5 Y) ---
    if (CENTRAL_PARK_TILES.some(t => t.col === col && t.row === row)) {
        const isMaster = col === 3 && row === 4;
        return [{
            x: 0, 
            y: 0, 
            w: 300, // Spans 3 blocks wide
            h: 200, // Spans 2 blocks high
            slotIndex: 0,
            type: 'landmark',
            name: 'Central Park',
            cost: 0,
            income: 0,
            icon: '🌳',
            landmarkId: 'central_park',
            isVisualMaster: isMaster
        }];
    }

    // --- HIGHLAND PARK OVERRIDE (12-3, 12-4) ---
    if (HIGHLAND_PARK_TILES.some(t => t.col === col && t.row === row)) {
        const isMaster = col === 12 && row === 3;
        return [{
            x: 0, 
            y: 0, 
            w: 100, // 1 block wide
            h: 200, // 2 blocks high
            slotIndex: 0,
            type: 'landmark',
            name: 'Highland Park',
            cost: 0,
            income: 0,
            icon: '🌲',
            landmarkId: 'highland_park',
            isVisualMaster: isMaster
        }];
    }

    // TRAIN DEPOT OVERRIDE (Block 8-0)
    if (col === 8 && row === 0) {
        return [{
            x: 5, 
            y: 5, 
            w: 90, 
            h: 90, 
            slotIndex: 0,
            type: 'landmark',
            name: 'RAIL DEPOT',
            cost: 0,
            income: 0,
            icon: '🛤️',
            landmarkId: 'train_depot'
        }];
    }
    
    // SUBWAY STATION OVERRIDE (Block 2-2) - Updated to Quarter Block + Neighbors
    if (col === 2 && row === 2) {
        return [
            {
                x: 10, 
                y: 10, 
                w: 40, 
                h: 40, 
                slotIndex: 0,
                type: 'landmark',
                name: 'Franklin St Station',
                cost: 0,
                income: 0,
                icon: '🚇',
                landmarkId: 'subway_station'
            },
            {
                x: 55, y: 10, w: 35, h: 40,
                slotIndex: 1,
                type: 'commercial',
                name: 'Corner Bodega',
                cost: 36000, income: 25, icon: '🏪'
            },
            {
                x: 10, y: 55, w: 40, h: 35,
                slotIndex: 2,
                type: 'residential',
                name: 'Tenement 22-A', 
                cost: 500000, 
                income: 0, 
                icon: '🏠'
            },
            {
                x: 55, y: 55, w: 35, h: 35,
                slotIndex: 3,
                type: 'commercial',
                name: 'Hardware Store',
                cost: 42000, income: 30, icon: '🔨'
            }
        ];
    }

    // PLAYER START BLOCK OVERRIDE (Block 1-3) - Force Tenement at Slot 2
    // Asset value for start
    if (col === 1 && row === 3) {
        return [
            {
                x: 10, y: 10, w: 40, h: 40,
                slotIndex: 0,
                type: 'commercial',
                name: 'Bodega 1-3',
                cost: 36000, income: 25, icon: '🏪'
            },
            {
                x: 55, y: 10, w: 35, h: 40,
                slotIndex: 1,
                type: 'commercial',
                name: 'Laundromat',
                cost: 48000, income: 15, icon: '🧺'
            },
            {
                x: 10, y: 55, w: 80, h: 35,
                slotIndex: 2,
                type: 'residential',
                name: 'Tenement 13-2', 
                cost: 500000, // Small Tenement Value
                income: 0, 
                icon: '🏠'
            }
        ];
    }
    
    // Legacy Start Block override (5-4) - Keep for compatibility if any logic relies on it
    if (col === 5 && row === 4) {
        return [
             { x: 10, y: 10, w: 40, h: 40, slotIndex: 0, type: 'commercial', name: 'Bodega', cost: 36000, income: 25, icon: '🏪' },
             { x: 55, y: 10, w: 35, h: 40, slotIndex: 1, type: 'residential', name: 'Tenement 54-1', cost: 500000, income: 0, icon: '🏠' },
             { x: 10, y: 55, w: 80, h: 35, slotIndex: 2, type: 'industrial', name: 'Old Factory', cost: 60000, income: 40, icon: '🏭' }
        ];
    }

    // CHURCH OVERRIDE (Block 0-2)
    if (col === 0 && row === 2) {
        return [{
            x: 5, y: 5, w: 90, h: 90, slotIndex: 0, type: 'landmark', name: "St. Michael's Cathedral", cost: 0, income: 0, icon: '⛪', landmarkId: 'church'
        }];
    }

    // NEON DISTRICT (4-6) - 10000 * 60 = 600000
    if (col === 4 && row === 6) {
        return [{
            x: 5, y: 5, w: 90, h: 90, slotIndex: 0, type: 'landmark', name: 'The Neon Stage', cost: 600000, income: 500, icon: '💃', landmarkId: 'times_sq'
        }];
    }

    // HOSPITAL (8-7)
    if (col === 8 && row === 7) {
        return [{
            x: 5, y: 5, w: 90, h: 90, slotIndex: 0, type: 'landmark', name: 'St. Jude\'s Hospital', cost: 0, income: 0, icon: '🏥', landmarkId: 'hospital'
        }];
    }

    // MAFIA HQ (11-8)
    if (col === 11 && row === 8) {
        return [{
            x: 5, y: 5, w: 90, h: 90, slotIndex: 0, type: 'landmark', name: 'Mafia Neighborhood HQ', cost: 0, income: 0, icon: '🏰', landmarkId: 'mafia_hq'
        }];
    }

    // KB ELECTRONICS (6-0)
    if (col === 6 && row === 0) {
        return [
            { x: 10, y: 10, w: 40, h: 80, slotIndex: 0, type: 'commercial', name: 'Pawn Shop', cost: 42000, income: 30, icon: '💍' },
            { x: 60, y: 10, w: 30, h: 80, slotIndex: 2, type: 'commercial', name: 'KB Electronics', cost: 0, income: 0, icon: '📺', landmarkId: 'kb_electronics' }
        ];
    }

    // BUS STATION (7-4)
    if (col === 7 && row === 4) {
        return [
            { x: 10, y: 10, w: 45, h: 35, slotIndex: 0, type: 'commercial', name: 'Diner 74', cost: 36000, income: 25, icon: '🍔' },
            { x: 10, y: 55, w: 45, h: 35, slotIndex: 1, type: 'residential', name: 'Tenement', cost: 1500000, income: 1500, icon: '🏠' },
            { x: 65, y: 10, w: 25, h: 80, slotIndex: 2, type: 'landmark', name: 'Bus Station', cost: 0, income: 0, icon: '🚌', landmarkId: 'bus_station' }
        ];
    }

    // WATERFRONT DOCKS - 5000 * 60 = 300000
    if (col === 2 && row === 7) return [{ x: 20, y: 20, w: 60, h: 60, slotIndex: 0, type: 'landmark', name: 'Red Hook Docks', cost: 300000, income: 350, icon: '⚓', landmarkId: 'dock_bk' }];
    if (col === 12 && row === 8) return [{ x: 20, y: 20, w: 50, h: 50, slotIndex: 0, type: 'landmark', name: 'Hunters Point', cost: 300000, income: 300, icon: '⚓', landmarkId: 'dock_qn' }];
    if (col === 13 && row === 4) return [{ x: 25, y: 25, w: 50, h: 50, slotIndex: 0, type: 'landmark', name: 'Port Morris', cost: 300000, income: 300, icon: '⚓', landmarkId: 'dock_bx' }];

    // Check for landmark (Generic fallback for MAP_DESTINATIONS not handled above)
    const landmark = MAP_DESTINATIONS.find(d => d.gridX === col && d.gridY === row);

    // Deterministic random
    const seed = col * 37 + row * 13 + 1234;
    let localSeed = seed;
    const rand = () => {
        localSeed = (localSeed * 9301 + 49297) % 233280;
        return localSeed / 233280;
    };

    const slots: BlockSubPlot[] = [];
    const layoutType = Math.floor(rand() * 4); 
    const margin = 10;
    const availableSize = 100 - (margin * 2);
    
    const addSlot = (relX: number, relY: number, relW: number, relH: number, index: number) => {
        let type: Holding['type'] = 'commercial';
        let name = 'Shop';
        let icon = '🛒';
        let baseCost = 30000; // 500 * 60
        let baseIncome = 20;
        let landmarkId = undefined;

        if (landmark && index === 0 && !(col === 2 && row === 0)) {
            type = 'landmark';
            name = landmark.label;
            icon = landmark.icon;
            baseCost = 300000; // 5000 * 60
            baseIncome = 200;
            landmarkId = landmark.id;
        } else {
            const typeRoll = rand();
            if (typeRoll < 0.3) {
                // RESIDENTIAL TIER LOGIC
                type = 'residential'; 
                name = 'Tenement'; 
                icon = '🏠'; 
                
                // Determine Tier based on deterministic hash of the would-be ID
                const tempName = `${name} ${col}${row}-${index}`;
                const seedStr = `${col}-${row}-${index}-${tempName}`;
                const hash = hashCode(seedStr);
                const roll = hash % 100;
                
                if (roll < 50) {
                    // Small Tenement
                    baseCost = 500000;
                    baseIncome = 500;
                } else if (roll < 85) {
                    // Medium Tenement
                    baseCost = 1500000;
                    baseIncome = 1500;
                } else {
                    // Large Tenement (5m - 8m)
                    const variance = (hash % 3000000); // 0 to 3m
                    baseCost = 5000000 + variance;
                    baseIncome = Math.floor(baseCost * 0.001); // ~0.1% daily
                }

            } else if (typeRoll < 0.6) {
                // 600 * 60 = 36000
                type = 'commercial'; name = rand() > 0.5 ? 'Bodega' : 'Diner'; icon = name === 'Bodega' ? '🏪' : '🍔'; baseCost = 36000; baseIncome = 25;
            } else if (typeRoll < 0.8) {
                // 1200 * 60 = 72000
                type = 'office'; name = 'Office'; icon = '💼'; baseCost = 72000; baseIncome = 50;
            } else {
                // 1000 * 60 = 60000
                type = 'industrial'; name = 'Warehouse'; icon = '🏭'; baseCost = 60000; baseIncome = 40;
            }
            name = `${name} ${col}${row}-${index}`;
        }

        const jitterW = relW - 4;
        const jitterH = relH - 4;

        // Apply slight random variance to cost/income for non-residential to keep flavor
        const costMultiplier = type === 'residential' ? 1 : (0.8 + rand() * 0.4);
        const incomeMultiplier = type === 'residential' ? 1 : (0.8 + rand() * 0.4);

        slots.push({
            x: margin + relX + (relW - jitterW)/2,
            y: margin + relY + (relH - jitterH)/2,
            w: jitterW, h: jitterH, slotIndex: index, 
            type, 
            name, 
            cost: Math.floor(baseCost * costMultiplier), 
            income: Math.floor(baseIncome * incomeMultiplier), 
            icon, 
            landmarkId
        });
    };

    if (layoutType === 0) { // 4 Quadrants
        const half = availableSize / 2;
        addSlot(0, 0, half, half, 0); addSlot(half, 0, half, half, 1);
        addSlot(0, half, half, half, 2); addSlot(half, half, half, half, 3);
    } else if (layoutType === 1) { // 1 Big Left, 2 Small Right
        const leftW = availableSize * 0.6; const rightW = availableSize * 0.4; const halfH = availableSize / 2;
        addSlot(0, 0, leftW, availableSize, 0);
        addSlot(leftW, 0, rightW, halfH, 1); addSlot(leftW, halfH, rightW, halfH, 2);
    } else if (layoutType === 2) { // Top Strip, Bottom Split
        const topH = availableSize * 0.4; const botH = availableSize * 0.6; const halfW = availableSize / 2;
        addSlot(0, 0, availableSize, topH, 0);
        addSlot(0, topH, halfW, botH, 1); addSlot(halfW, topH, halfW, botH, 2);
    } else { // 3 Vertical Strips
        const w = availableSize / 3;
        addSlot(0, 0, w, availableSize, 0); addSlot(w, 0, w, availableSize, 1); addSlot(w * 2, 0, w, availableSize, 2);
    }
    
    // Inject Casino (2-0, Slot 1)
    if (col === 2 && row === 0) {
       const targetSlot = slots.find(s => s.slotIndex === 1);
       if (targetSlot) {
           targetSlot.type = 'landmark'; targetSlot.name = 'The High Roller'; targetSlot.icon = '🎰'; targetSlot.landmarkId = 'gambling_den'; targetSlot.cost = 0; targetSlot.income = 0;
       }
    }

    // Inject Hidden Motels
    if (MOTEL_LOCATIONS.some(m => m.col === col && m.row === row)) {
        if (slots.length > 0) {
            const targetSlot = slots[slots.length - 1];
            // 2000 * 60 = 120000
            targetSlot.name = "No-Tell Motel"; targetSlot.type = 'commercial'; targetSlot.icon = '🏩'; targetSlot.cost = 120000; targetSlot.income = 150;
        }
    }

    // INJECT MEDICAL BUILDINGS
    const medicalSpot = MEDICAL_BUILDINGS.find(m => m.col === col && m.row === row);
    if (medicalSpot) {
        // Replace Slot 1 or 2 (whatever exists)
        const targetIndex = slots.length > 1 ? 1 : 0; 
        const targetSlot = slots[targetIndex];
        
        if (targetSlot) {
            targetSlot.name = medicalSpot.name;
            targetSlot.type = 'medical';
            targetSlot.icon = medicalSpot.icon;
            targetSlot.cost = medicalSpot.cost;
            targetSlot.variant = medicalSpot.variant;
        }
    }

    // --- EXTRA FLAVOR BUILDING (Pizzeria, Laundromat, etc.) ---
    const flavorSeed = (col * 17 + row * 23) % FLAVOR_BUILDINGS.length;
    const flavorB = FLAVOR_BUILDINGS[flavorSeed];
    const flavorNamePref = ["Ray's", "Joe's", "Sal's", "City", "Mama's", "Quick", "Lucky", "Night", "Corner"];
    const flavorName = `${flavorNamePref[(col + row) % flavorNamePref.length]} ${flavorB.name}`;

    slots.push({
        x: 65, y: 65, w: 25, h: 25, slotIndex: 5,
        type: flavorB.type as any, name: flavorName, cost: flavorB.cost, income: flavorB.income, icon: flavorB.icon, landmarkId: undefined,
        isHidden: true
    });

    // --- PAYPHONE LOGIC ---
    const forcedPayphones = [{ col: 3, row: 6 }, { col: 6, row: 0 }, { col: 13, row: 5 }, { col: 10, row: 0 }];
    const excludedPayphones = [{ col: 3, row: 0 }, { col: 6, row: 3 }, { col: 10, row: 7 }, { col: 11, row: 8 }, { col: 0, row: 2 }];

    if (MEGABLOCK_TILES.some(m => m.col === col && m.row === row)) return slots;
    if (CENTRAL_PARK_TILES.some(t => t.col === col && t.row === row)) return slots; // Don't spawn random stuff in Central Park logic
    if (HIGHLAND_PARK_TILES.some(t => t.col === col && t.row === row)) return slots; // Exclude from Highland Park
    if (col === 8 && row === 0) return slots; // Exclude payphone from depot tile

    const isExcluded = excludedPayphones.some(p => p.col === col && p.row === row);
    const isForced = forcedPayphones.some(p => p.col === col && p.row === row);
    const payphoneSeed = (col * 7 + row * 13 + 999) % 10;
    
    if (((payphoneSeed === 0 && !isExcluded) || isForced) && !landmark) {
        slots.push({
            x: 35, y: 35, w: 30, h: 30, slotIndex: 99,
            type: 'payphone', name: 'Public Phone', icon: '📞', cost: 0, income: 0, landmarkId: undefined
        });
    }

    return slots;
};
