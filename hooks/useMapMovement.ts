
import { useState, useEffect, useRef } from 'react';
import { GameState } from '../types';
import { findStreetPath } from '../utils/streetPathing';

interface UseMapMovementProps {
    gameState: GameState | null;
    updateSave: (newState: GameState) => void;
    onArrival: (target: { x: number, y: number }) => void;
    setCameraPos: (pos: { x: number, y: number }) => void;
    onError: (message: string) => void;
}

export const useMapMovement = ({ gameState, updateSave, onArrival, setCameraPos, onError }: UseMapMovementProps) => {
    const [playerGridPos, setPlayerGridPos] = useState({ x: 0, y: 0 }); // Logical Grid Position
    const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 }); // Visual Pixel Position
    const [isMoving, setIsMoving] = useState(false);
    const [isArriving, setIsArriving] = useState(false);
    const [isMovementRejected, setIsMovementRejected] = useState(false);
    
    // UI State for Path Visualization
    const [movementQueue, setMovementQueue] = useState<{ x: number, y: number }[]>([]);
    const [visitedPath, setVisitedPath] = useState<{ x: number, y: number, id: string }[]>([]);
    
    // Animation Refs
    const requestRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);
    const pathPointsRef = useRef<{x: number, y: number}[]>([]);
    const pathDistancesRef = useRef<number[]>([]);
    const totalPathDistanceRef = useRef<number>(0);
    const startEnergyRef = useRef<number>(0);
    const currentSegmentIndexRef = useRef<number>(0);

    // Energy Animation Helpers (kept for API compatibility)
    const [energyTransitionDuration, setEnergyTransitionDuration] = useState(0);
    const [energyTransitionEasing, setEnergyTransitionEasing] = useState('linear');

    // Initialize position from save
    useEffect(() => {
        if (!gameState) return;
        // Only sync if not moving to prevent jitter
        if (!isMoving && gameState.currentLocation) {
            setPlayerGridPos(gameState.currentLocation);
            setPlayerPos({ x: gameState.currentLocation.x * 100, y: gameState.currentLocation.y * 100 });
        }
    }, [gameState?.id]); // Only on save load/change

    const updateEnergyState = (targetEnergy: number, duration: number, easing: string) => {
        setEnergyTransitionDuration(duration);
        setEnergyTransitionEasing(easing);
    };

    const triggerRejection = () => {
        setIsMovementRejected(true);
        setTimeout(() => setIsMovementRejected(false), 500);
    };

    const getSpeed = () => {
        // Units (blocks) per millisecond
        // 0.001 = 1 block (100px) per 1000ms
        const baseSpeed = 0.0005; 
        if (gameState && gameState.currentEnergy < 15) return baseSpeed * 0.5; // Exhaustion
        return baseSpeed;
    };

    const startMovement = (targetBlockX: number, targetBlockY: number) => {
        if (!gameState) return;

        // 0. Check Avoided Areas
        if (gameState.avoidedAreas?.some(a => a.x === targetBlockX && a.y === targetBlockY)) {
            onError("That's a No-Go Zone, Boss!");
            triggerRejection();
            return;
        }

        // 1. Calculate Path
        const start = playerGridPos;
        const end = { x: targetBlockX + 0.5, y: targetBlockY + 0.5 };
        const path = findStreetPath(start, end, gameState.avoidedAreas); // Pass Avoided Areas

        if (path.length === 0) {
            triggerRejection();
            return;
        }

        // Prepend start to make full polyline
        const fullPath = [start, ...path];

        // 2. Calculate Distances
        const distances = [0];
        let totalDist = 0;
        for (let i = 0; i < fullPath.length - 1; i++) {
            const p1 = fullPath[i];
            const p2 = fullPath[i+1];
            const d = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
            totalDist += d;
            distances.push(totalDist);
        }

        // Energy Check
        if (gameState.currentEnergy < totalDist) {
            onError(`Need more Energy! (${totalDist.toFixed(1)})`);
            triggerRejection();
            return;
        }

        // 3. Setup Animation
        pathPointsRef.current = fullPath;
        pathDistancesRef.current = distances;
        totalPathDistanceRef.current = totalDist;
        startEnergyRef.current = gameState.currentEnergy;
        currentSegmentIndexRef.current = 0;

        setMovementQueue(path); // For UI
        setVisitedPath([{ x: start.x * 100, y: start.y * 100, id: 'start' }]);
        
        setIsMoving(true);
        setIsArriving(false);
        startTimeRef.current = performance.now();

        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(animate);
    };

    const animate = (time: number) => {
        const elapsed = time - startTimeRef.current;
        const speed = getSpeed();
        const distCovered = elapsed * speed;

        // CHECK ARRIVAL
        if (distCovered >= totalPathDistanceRef.current) {
            const endPos = pathPointsRef.current[pathPointsRef.current.length - 1];
            
            setPlayerPos({ x: endPos.x * 100, y: endPos.y * 100 });
            setPlayerGridPos(endPos);
            setIsMoving(false);
            setIsArriving(true);
            setMovementQueue([]);
            
            // Deduct Energy
            if (gameState) {
                updateSave({ ...gameState, currentEnergy: Math.max(0, startEnergyRef.current - totalPathDistanceRef.current) });
            }
            
            onArrival(endPos);
            
            setTimeout(() => setIsArriving(false), 500);
            return;
        }

        // FIND CURRENT SEGMENT
        // distances: [0, d1, d2...]
        let segmentIndex = 0;
        for (let i = 0; i < pathDistancesRef.current.length - 1; i++) {
            if (distCovered >= pathDistancesRef.current[i] && distCovered < pathDistancesRef.current[i+1]) {
                segmentIndex = i;
                break;
            }
        }

        // INTERPOLATE POSITION
        const segmentStartDist = pathDistancesRef.current[segmentIndex];
        const segmentEndDist = pathDistancesRef.current[segmentIndex + 1];
        const segmentLength = segmentEndDist - segmentStartDist;
        const segmentProgress = (distCovered - segmentStartDist) / segmentLength;

        const p1 = pathPointsRef.current[segmentIndex];
        const p2 = pathPointsRef.current[segmentIndex + 1];

        const currentX = p1.x + (p2.x - p1.x) * segmentProgress;
        const currentY = p1.y + (p2.y - p1.y) * segmentProgress;

        setPlayerPos({ x: currentX * 100, y: currentY * 100 });
        
        // Update logical pos roughly for HUD/Map modes
        setPlayerGridPos({ x: currentX, y: currentY });

        // UPDATE UI QUEUES
        if (segmentIndex > currentSegmentIndexRef.current) {
            currentSegmentIndexRef.current = segmentIndex;
            // Update movement queue for UI (remove passed nodes)
            setMovementQueue(prev => prev.slice(1));
            
            // Add breadcrumb
            const passedNode = pathPointsRef.current[segmentIndex];
            setVisitedPath(prev => [...prev, { x: passedNode.x * 100, y: passedNode.y * 100, id: `node-${segmentIndex}` }]);
        }

        requestRef.current = requestAnimationFrame(animate);
    };

    const cancelMovement = () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        setIsMoving(false);
        setMovementQueue([]);
        
        // Calculate energy used so far
        if (gameState && isMoving) {
            const now = performance.now();
            const elapsed = now - startTimeRef.current;
            const dist = Math.min(totalPathDistanceRef.current, elapsed * getSpeed());
            updateSave({ ...gameState, currentEnergy: Math.max(0, startEnergyRef.current - dist) });
        }
    };

    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return {
        playerGridPos,
        playerPos,
        isMoving,
        isArriving,
        isMovementRejected,
        movementQueue,
        visitedPath,
        moveDuration: 0, // Disable CSS transition for smooth RAF updates
        setPlayerPos,
        setPlayerGridPos,
        setVisitedPath,
        startMovement,
        cancelMovement,
        updateEnergyState,
        energyTransitionDuration,
        energyTransitionEasing
    };
};
