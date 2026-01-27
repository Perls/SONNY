
// Centralized logic for Water and Dock tiles to ensure consistency across pathing, rendering, and logic.

export const BEACH_TILES = [
    { x: 3, y: 7 },
    { x: 4, y: 8 },
    { x: 5, y: 9 },
    { x: 11, y: 9 }
];

export const isDock = (col: number, row: number) => {
    // Red Hook (2,7), Hunters Point (12,8), Port Morris (13,4)
    return (col === 2 && row === 7) || (col === 12 && row === 8) || (col === 13 && row === 4);
};

export const isBeach = (col: number, row: number) => {
    return BEACH_TILES.some(t => t.x === col && t.y === row);
};

export const isWater = (col: number, row: number) => {
    // 1. SAFE HAVENS (Always Land)
    if (isDock(col, row)) return false;
    if (col === 11 && row === 8) return false; // Mafia HQ (The Commission) is LAND
    
    // 1.5 BEACH ZONES (Littoral/Half Submerged - Traversable)
    if (isBeach(col, row)) return false;

    // 2. HUDSON RIVER / BAY (Bottom Left)
    if (col <= 1 && row >= 7) return true;
    if (col === 2 && row >= 8) return true;
    if (col === 3 && row >= 7) return true;
    if (col === 4 && row >= 8) return true;
    if (col === 5 && row >= 9) return true; 
    
    // 3. CENTRAL INLET (The Bay)
    if (col >= 9 && col <= 10 && row === 8) return true; 
    
    // 4. EAST RIVER MOUTH (Bottom Right)
    if (col >= 13 && row >= 8) return true;
    
    // 5. EAST RIVER CHANNEL (The Cut) - Col 11
    // Updated: Rows 0-8 are Land, only Row 9 is Water
    if (col === 11) {
        if (row === 9) return true; // Water south of HQ
        return false;
    }

    // NOTE: Cols 12+ are generally Land (Queens/Bronx) except for the mouth defined above.

    return false;
};
