
import { isWater } from './waterUtils';

interface Point {
    x: number;
    y: number;
}

interface Node {
    x: number;
    y: number;
    g: number;
    h: number;
    f: number;
    parent: Node | null;
}

// Updated to match CENTRAL_PARK_TILES and HIGHLAND_PARK_TILES in mapUtils
const PARKS = [
    { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 },
    { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 },
    // Highland Park
    { x: 12, y: 3 }, { x: 12, y: 4 }
];

// Explicit Bridge Edges (Mid-points of street segments crossing water)
const BRIDGE_EDGES = [
    // Queens Bridge Span: The horizontal edge between (11, 1) and (11, 2)
    // Coordinates: x=11.5, y=2.0 (155th St)
    { x: 11.5, y: 2.0 }
];

// Explicitly BLOCKED segments (Mid-points of street segments that are WATER)
const BLOCKED_SEGMENTS: Point[] = [
    // Previously blocked Col 11 segments removed as Col 11 is now Land
];

const isBridge = (p: Point) => {
    return BRIDGE_EDGES.some(b => Math.abs(b.x - p.x) < 0.001 && Math.abs(b.y - p.y) < 0.001);
};

const isBlockedSegment = (p: Point) => {
    return BLOCKED_SEGMENTS.some(b => Math.abs(b.x - p.x) < 0.001 && Math.abs(b.y - p.y) < 0.001);
};

const isLand = (col: number, row: number) => {
    if (col < 0 || col >= 15 || row < 0 || row >= 10) return false;
    return !isWater(col, row);
};

const isInt = (n: number) => Math.abs(n % 1) < 0.001;

// NEW: Check if a block is explicitly avoided
const isAvoided = (col: number, row: number, avoidedAreas?: {x: number, y: number}[]) => {
    if (!avoidedAreas) return false;
    return avoidedAreas.some(area => area.x === col && area.y === row);
};

const isValidNode = (p: Point, avoidedAreas?: {x: number, y: number}[]) => {
    // 0. Explicit Blacklist (Must come first)
    if (isBlockedSegment(p)) return false;

    // 0.5. Check for Bridge Exception (Allows crossing water on specific edges)
    if (isBridge(p)) return true;

    const xInt = isInt(p.x);
    const yInt = isInt(p.y);

    // 1. Center (Block)
    if (!xInt && !yInt) {
        const cx = Math.floor(p.x);
        const cy = Math.floor(p.y);
        // If this specific block is avoided, center is invalid
        if (isAvoided(cx, cy, avoidedAreas)) return false;
        return isLand(cx, cy);
    }

    // 2. Intersection (Corner)
    if (xInt && yInt) {
        // If surrounding blocks are ALL avoided, maybe intersection is blocked?
        // Let's stick to simple: Valid if any neighbor is land and NOT strictly avoided?
        // Actually, intersections are public streets. We only block them if it's water.
        // Or if the user wants to avoid the AREA, maybe we assume they don't walk ON the blocks.
        // Let's keep intersections open unless all 4 quadrants are invalid.
        const tl = isLand(p.x - 1, p.y - 1);
        const tr = isLand(p.x, p.y - 1);
        const bl = isLand(p.x - 1, p.y);
        const br = isLand(p.x, p.y);
        return tl || tr || bl || br;
    }

    // 3. Mid-Vertical (Street)
    if (xInt && !yInt) {
        const leftX = p.x - 1;
        const rightX = p.x;
        const row = Math.floor(p.y);
        
        // If user marked BOTH adjacent blocks as avoided, treat street as blocked?
        // Let's say yes for "Area Avoidance" logic.
        if (isAvoided(leftX, row, avoidedAreas) && isAvoided(rightX, row, avoidedAreas)) return false;

        const left = isLand(leftX, row);
        const right = isLand(rightX, row);
        return left || right;
    }

    // 4. Mid-Horizontal (Street)
    if (!xInt && yInt) {
        const topY = p.y - 1;
        const bottomY = p.y;
        const col = Math.floor(p.x);

        if (isAvoided(col, topY, avoidedAreas) && isAvoided(col, bottomY, avoidedAreas)) return false;

        const top = isLand(col, topY);
        const bottom = isLand(col, bottomY);
        return top || bottom;
    }
    
    return false;
};

const isPark = (x: number, y: number) => {
    // Check if a point (center) falls within a park block
    const blockX = Math.floor(x);
    const blockY = Math.floor(y);
    return PARKS.some(p => p.x === blockX && p.y === blockY);
};

const isWalkableBuilding = (c: Point, start: Point, end: Point, avoidedAreas?: {x: number, y: number}[]) => {
    // Cannot walk through avoided buildings
    if (isAvoided(Math.floor(c.x), Math.floor(c.y), avoidedAreas)) return false;

    // Can enter if it's the destination
    if (Math.abs(c.x - end.x) < 0.001 && Math.abs(c.y - end.y) < 0.001) return true;
    // Can enter if it's the start (e.g. retreating)
    if (Math.abs(c.x - start.x) < 0.001 && Math.abs(c.y - start.y) < 0.001) return true;
    // Can enter if it's a park (Parks are permeable)
    if (isPark(c.x, c.y)) return true;
    
    return false;
};

const getNeighbors = (p: Point, start: Point, end: Point, avoidedAreas?: {x: number, y: number}[]): Point[] => {
    const xInt = isInt(p.x);
    const yInt = isInt(p.y);
    const neighbors: Point[] = [];

    // 1. INTERSECTION (e.g., 1, 1) -> Connects to Mid-Points along streets
    if (xInt && yInt) {
        if (p.x < 15) neighbors.push({ x: p.x + 0.5, y: p.y }); // Right
        if (p.x > 0) neighbors.push({ x: p.x - 0.5, y: p.y });  // Left
        if (p.y < 10) neighbors.push({ x: p.x, y: p.y + 0.5 }); // Down
        if (p.y > 0) neighbors.push({ x: p.x, y: p.y - 0.5 });  // Up
    } 
    // 2. CENTER (e.g., 1.5, 1.5) -> Connects to Mid-Points (Exits) or Park Neighbors
    else if (!xInt && !yInt) {
        // Park traversal logic (Center to Center)
        if (isPark(p.x, p.y)) {
            const blockX = Math.floor(p.x);
            const blockY = Math.floor(p.y);
            PARKS.forEach(park => {
                // Allow moving to any adjacent park block IF not avoided
                if (Math.abs(park.x - blockX) + Math.abs(park.y - blockY) === 1) {
                    if (!isAvoided(park.x, park.y, avoidedAreas)) {
                        neighbors.push({ x: park.x + 0.5, y: park.y + 0.5 });
                    }
                }
            });
        }
        
        // Exits to street midpoints (Straight lines out)
        // Mid-Verticals (Left/Right)
        if (p.x > 0.5) neighbors.push({ x: Math.floor(p.x), y: p.y });
        if (p.x < 14.5) neighbors.push({ x: Math.ceil(p.x), y: p.y });
        
        // Mid-Horizontals (Top/Bottom)
        if (p.y > 0.5) neighbors.push({ x: p.x, y: Math.floor(p.y) });
        if (p.y < 9.5) neighbors.push({ x: p.x, y: Math.ceil(p.y) });
    }
    // 3. MID-VERTICAL (e.g., 1, 1.5) -> Vertical Street or Enter Left/Right Building
    else if (xInt && !yInt) {
        // Move along street to Intersections
        neighbors.push({ x: p.x, y: Math.floor(p.y) }); // Top Int
        neighbors.push({ x: p.x, y: Math.ceil(p.y) }); // Bottom Int
        
        // Enter Buildings (Left/Right) - Only if allowed
        const leftCenter = { x: p.x - 0.5, y: p.y };
        const rightCenter = { x: p.x + 0.5, y: p.y };
        
        if (p.x > 0 && isWalkableBuilding(leftCenter, start, end, avoidedAreas)) neighbors.push(leftCenter);
        if (p.x < 15 && isWalkableBuilding(rightCenter, start, end, avoidedAreas)) neighbors.push(rightCenter);
    }
    // 4. MID-HORIZONTAL (e.g., 1.5, 1) -> Horizontal Street or Enter Top/Bottom Building
    else if (!xInt && yInt) {
        // Move along street to Intersections
        neighbors.push({ x: Math.floor(p.x), y: p.y }); // Left Int
        neighbors.push({ x: Math.ceil(p.x), y: p.y }); // Right Int
        
        // Enter Buildings (Top/Bottom) - Only if allowed
        const topCenter = { x: p.x, y: p.y - 0.5 };
        const bottomCenter = { x: p.x, y: p.y + 0.5 };
        
        if (p.y > 0 && isWalkableBuilding(topCenter, start, end, avoidedAreas)) neighbors.push(topCenter);
        if (p.y < 10 && isWalkableBuilding(bottomCenter, start, end, avoidedAreas)) neighbors.push(bottomCenter);
    }
    
    return neighbors;
};

const heuristic = (a: Point, b: Point) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

const pointKey = (p: Point) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`;

export const findStreetPath = (start: Point, end: Point, avoidedAreas?: {x: number, y: number}[]): Point[] => {
    // If start and end are the same, return empty
    if (Math.abs(start.x - end.x) < 0.001 && Math.abs(start.y - end.y) < 0.001) return [];

    const openSet: Node[] = [];
    const closedSet = new Set<string>();
    const nodeMap = new Map<string, Node>();

    const startNode: Node = { ...start, g: 0, h: heuristic(start, end), f: heuristic(start, end), parent: null };
    openSet.push(startNode);
    nodeMap.set(pointKey(start), startNode);

    while (openSet.length > 0) {
        // Sort by lowest F
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift()!;
        const currentKey = pointKey(current);

        // Check completion (with float tolerance)
        if (Math.abs(current.x - end.x) < 0.001 && Math.abs(current.y - end.y) < 0.001) {
            // Reconstruct path
            const path: Point[] = [];
            let curr: Node | null = current;
            while (curr) {
                path.unshift({ x: curr.x, y: curr.y });
                curr = curr.parent;
            }
            // Remove start point as it's the current position
            return path.slice(1); 
        }

        closedSet.add(currentKey);

        const neighbors = getNeighbors(current, start, end, avoidedAreas);

        for (const neighborPos of neighbors) {
            // Check if this neighbor is valid land (not water) OR a valid bridge AND NOT AVOIDED
            if (!isValidNode(neighborPos, avoidedAreas)) continue;

            const neighborKey = pointKey(neighborPos);
            if (closedSet.has(neighborKey)) continue;

            // Calculate dynamic move cost (Euclidean/Manhattan distance)
            const moveCost = Math.sqrt(Math.pow(neighborPos.x - current.x, 2) + Math.pow(neighborPos.y - current.y, 2));
            const tentativeG = current.g + moveCost;

            let neighbor = nodeMap.get(neighborKey);

            if (!neighbor) {
                neighbor = { ...neighborPos, g: tentativeG, h: heuristic(neighborPos, end), f: 0, parent: current };
                neighbor.f = neighbor.g + neighbor.h;
                nodeMap.set(neighborKey, neighbor);
                openSet.push(neighbor);
            } else if (tentativeG < neighbor.g) {
                neighbor.g = tentativeG;
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = current;
            }
        }
    }

    return []; // No path found
};
