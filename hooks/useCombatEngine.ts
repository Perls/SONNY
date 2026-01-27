import { useState, useEffect, useRef, useCallback } from 'react';
import { CombatUnit, VisualEffect, Projectile, CombatLogEntry, Obstacle, ClassType, Officer } from '../types';

interface CombatEngineProps {
    initialUnits: CombatUnit[];
    initialObstacles: Obstacle[];
    activeTactic: string;
    enemyTactic: string;
    onCombatEnd: (won: boolean, deadUnitIds: string[], survivorHealth: Record<string, number>) => void;
    retreatThreshold: number;
    bodyguardData?: Officer;
}

export const useCombatEngine = ({
    initialUnits,
    initialObstacles,
    activeTactic,
    enemyTactic,
    onCombatEnd,
    retreatThreshold,
    bodyguardData
}: CombatEngineProps) => {
    const [units, setUnits] = useState<CombatUnit[]>(initialUnits);
    const [visualEffects, setVisualEffects] = useState<VisualEffect[]>([]);
    const [projectiles, setProjectiles] = useState<Projectile[]>([]);
    const [combatLog, setCombatLog] = useState<CombatLogEntry[]>([]);
    const [battleResult, setBattleResult] = useState<'won' | 'lost' | null>(null);
    const [turn, setTurn] = useState(0);
    const [isPaused, setIsPaused] = useState(true);
    const [retreatShout, setRetreatShout] = useState<string | null>(null);
    const [endGameStats, setEndGameStats] = useState<{ deadIds: string[], survivorHealth: Record<string, number> } | null>(null);
    
    // Bodyguard State
    const [hasBodyguardSpawned, setHasBodyguardSpawned] = useState(false);

    const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const addLog = (text: string, type: CombatLogEntry['type']) => {
        setCombatLog(prev => [...prev, { id: Math.random().toString(), text, type }].slice(-50));
    };

    const spawnEffect = (x: number, y: number, type: VisualEffect['type'], text?: string, color?: string) => {
        const id = Math.random().toString();
        setVisualEffects(prev => [...prev, { id, x, y, type, duration: 1000, text, color }]);
        setTimeout(() => {
            setVisualEffects(prev => prev.filter(e => e.id !== id));
        }, 1000);
    };

    // Calculate Damage
    const calculateDamage = (attacker: CombatUnit, defender: CombatUnit) => {
        // Base Dmg logic
        let dmg = Math.max(1, attacker.stats.strength);
        
        // Crit Chance (Luck)
        if (Math.random() * 100 < attacker.stats.luck * 2) {
            dmg = Math.floor(dmg * 1.5);
            return { dmg, isCrit: true };
        }
        
        // Defense reduction (Simple Agility dodge chance)
        if (Math.random() * 100 < defender.stats.agility) {
            return { dmg: 0, isCrit: false, isMiss: true };
        }

        return { dmg, isCrit: false };
    };

    const processTurn = useCallback(() => {
        if (battleResult) return;

        setUnits(prevUnits => {
            const nextUnits = prevUnits.map(u => ({ ...u })); // Deepish copy
            const livingUnits = nextUnits.filter(u => !u.isDead);
            const playerLeader = livingUnits.find(u => u.team === 'player' && u.isLeader);
            const enemyLeader = livingUnits.find(u => u.team === 'enemy' && u.isLeader);

            // 1. CHECK WIN/LOSS CONDITIONS
            if (!playerLeader) {
                setBattleResult('lost');
                setIsPaused(true);
                return nextUnits;
            }
            if (!enemyLeader && livingUnits.filter(u => u.team === 'enemy').length === 0) {
                setBattleResult('won');
                setIsPaused(true);
                
                // Calculate survival stats
                const stats = {
                    deadIds: prevUnits.filter(u => u.isDead).map(u => u.id),
                    survivorHealth: {} as Record<string, number>
                };
                livingUnits.forEach(u => stats.survivorHealth[u.id] = u.hp);
                setEndGameStats(stats);
                
                return nextUnits;
            }

            // 2. CHECK RETREAT
            if (playerLeader && retreatThreshold > 0) {
                const hpPct = (playerLeader.hp / playerLeader.maxHp) * 100;
                if (hpPct <= retreatThreshold && !battleResult) {
                    setRetreatShout("Fall back! We're done here!");
                    setIsPaused(true);
                    setBattleResult('lost'); // Treated as loss but maybe saves lives in future logic
                    return nextUnits;
                }
            }

            // 3. UNIT ACTIONS
            livingUnits.forEach(unit => {
                // Skip if already acted or dead in this frame (simulated)
                if (unit.isDead) return;

                // Simple AI: Find nearest enemy
                const enemies = livingUnits.filter(u => u.team !== unit.team && !u.isDead);
                if (enemies.length === 0) return;

                // Sort by distance
                enemies.sort((a, b) => {
                    const distA = Math.abs(a.x - unit.x) + Math.abs(a.y - unit.y);
                    const distB = Math.abs(b.x - unit.x) + Math.abs(b.y - unit.y);
                    return distA - distB;
                });

                const target = enemies[0];
                const dist = Math.abs(target.x - unit.x) + Math.abs(target.y - unit.y);
                const range = unit.pawnType === 'shooter' || unit.classType === 'Smuggler' ? 4 : 1.5; // 1.5 allows diagonals

                if (dist <= range) {
                    // ATTACK
                    const { dmg, isCrit, isMiss } = calculateDamage(unit, target);
                    
                    if (isMiss) {
                        spawnEffect(target.x, target.y, 'buff', "MISS", "text-slate-400");
                        addLog(`${unit.name} missed ${target.name}`, 'attack');
                    } else {
                        const previousHp = target.hp;
                        target.hp -= dmg;
                        spawnEffect(target.x, target.y, isCrit ? 'explosion' : 'explosion', `-${dmg}`, isCrit ? "text-red-500" : "text-white");
                        
                        // BODYGUARD SPAWN LOGIC
                        // If target is player leader AND bodyguard active AND not spawned AND damage dealt
                        if (
                            target.team === 'player' && 
                            target.isLeader && 
                            bodyguardData && 
                            !hasBodyguardSpawned && 
                            dmg > 0
                        ) {
                            // Find spawn position (adjacent to leader)
                            const neighbors = [
                                { x: target.x + 1, y: target.y },
                                { x: target.x - 1, y: target.y },
                                { x: target.x, y: target.y + 1 },
                                { x: target.x, y: target.y - 1 },
                            ];
                            // Find a free spot (no unit, no obstacle)
                            const freeSpot = neighbors.find(n => 
                                !nextUnits.some(u => !u.isDead && u.x === n.x && u.y === n.y) &&
                                !initialObstacles.some(o => o.x === n.x && o.y === n.y) &&
                                n.x >= 0 && n.x < 8 && n.y >= 0 && n.y < 10
                            ) || neighbors[0]; // Fallback to overlap if crowded

                            // Spawn Bodyguard
                            const level = bodyguardData.level || 3;
                            const maxHp = 30 + (level * 5);
                            const bodyguard: CombatUnit = {
                                id: `bodyguard-${Date.now()}`,
                                name: bodyguardData.name || 'Bodyguard',
                                team: 'player',
                                x: freeSpot.x,
                                y: freeSpot.y,
                                hp: maxHp,
                                maxHp: maxHp,
                                mana: 50, // Full mana to start
                                maxMana: 50,
                                stats: { strength: 4 + level, agility: 2, intelligence: 2, luck: 2, charisma: 1, willpower: 4 },
                                classType: ClassType.Thug,
                                imageSeed: bodyguardData.seed || 'guard',
                                actionPoints: 2,
                                isDead: false,
                                isLeader: false,
                                pawnType: 'tank',
                                abilityId: 'riot_shield', // Specific skill
                                activeAbilities: ['riot_shield', 'skull_bash'],
                                cooldowns: {},
                                isSummon: true
                            };
                            
                            nextUnits.push(bodyguard);
                            setHasBodyguardSpawned(true);
                            addLog(`${bodyguard.name} arrived to protect the Boss!`, 'info');
                            spawnEffect(freeSpot.x, freeSpot.y, 'teleport', "BACKUP!", "text-blue-400");
                        }

                        // Mana Gen
                        unit.mana = Math.min(unit.maxMana, unit.mana + 10);

                        if (target.hp <= 0) {
                            target.isDead = true;
                            target.hp = 0;
                            addLog(`${target.name} was eliminated by ${unit.name}`, 'death');
                            spawnEffect(target.x, target.y, 'explosion', "☠️");
                        }
                    }
                } else {
                    // MOVE
                    const dx = target.x - unit.x;
                    const dy = target.y - unit.y;
                    
                    // Simple pathing towards target
                    let moveX = unit.x + (dx !== 0 ? Math.sign(dx) : 0);
                    let moveY = unit.y + (dy !== 0 ? Math.sign(dy) : 0);

                    // Collision Check (very basic)
                    const isBlocked = nextUnits.some(u => !u.isDead && u.x === moveX && u.y === moveY) || 
                                      initialObstacles.some(o => o.x === moveX && o.y === moveY);
                    
                    if (!isBlocked) {
                        unit.x = moveX;
                        unit.y = moveY;
                    }
                }
            });

            return nextUnits;
        });

        setTurn(t => t + 1);

    }, [battleResult, retreatThreshold, initialObstacles, bodyguardData, hasBodyguardSpawned]);

    // Start/Stop Loop
    useEffect(() => {
        if (!isPaused) {
            gameLoopRef.current = setInterval(processTurn, 1000); // 1 Second turns
        } else {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        }
        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [isPaused, processTurn]);

    const startBattle = () => setIsPaused(false);

    return {
        units,
        visualEffects,
        projectiles,
        combatLog,
        startBattle,
        isPaused,
        battleResult,
        turn,
        endGameStats,
        retreatShout
    };
};