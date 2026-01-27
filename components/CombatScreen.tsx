import React, { useEffect, useState } from 'react';
import { CrewMember, CombatUnit, ClassType, FightRecord, Obstacle, Card, Officer } from '../types';
import { ENEMY_NAMES, OBSTACLES, CARDS, BOROUGHS } from '../constants';
import { getPreBattleDialogue } from '../data/taunts';
import { useCombatEngine } from '../hooks/useCombatEngine';
import BattleGrid from './combat/BattleGrid';
import BattleIntro from './combat/BattleIntro';
import BattleOutcome from './combat/BattleOutcome';

interface CombatScreenProps {
  playerCrew: CrewMember[];
  enemyLevel: number;
  activeTactic: string;
  onCombatEnd: (won: boolean, deadUnitIds: string[], survivorHealth: Record<string, number>) => void;
  forcedEnemyClass?: ClassType | null;
  lastBattleRecord?: FightRecord;
  formation?: Record<string, {x: number, y: number}>;
  retreatThreshold?: number;
  officers: Officer[];
}

const GRID_W = 8;
const GRID_H = 10;

const CombatScreen: React.FC<CombatScreenProps> = ({ 
    playerCrew, 
    enemyLevel, 
    activeTactic, 
    onCombatEnd, 
    forcedEnemyClass, 
    lastBattleRecord, 
    formation,
    retreatThreshold = 0,
    officers
}) => {
    // --- 1. INITIALIZATION LOGIC ---
    const [initialSetup] = useState(() => {
        const units: CombatUnit[] = [];
        const usedPositions = new Set<string>();

        // -- PLAYER UNITS --
        let spawnIndex = 0;
        playerCrew.forEach((member) => {
            let x, y;
            const savedPos = formation ? formation[member.id] : null;

            if (savedPos) {
                x = savedPos.x;
                y = 7 + savedPos.y; // Bottom 3 rows
            } else {
                do {
                    x = spawnIndex % GRID_W;
                    y = GRID_H - 1 - Math.floor(spawnIndex / GRID_W);
                    spawnIndex++;
                } while (usedPositions.has(`${x},${y}`) && spawnIndex < 24);
            }

            // Ability Setup
            const abilityId = member.activeAbilities?.[0] || 'skull_bash';
            let maxHp = member.isPawn ? 15 : 20 + (member.stats.strength * 3);
            if (member.stats.maxHp) maxHp += member.stats.maxHp;
            
            // Auto-Battler: Pass full ability list
            const activeAbilities = member.activeAbilities || [abilityId];

            units.push({
                id: member.id,
                name: member.name,
                team: 'player',
                x, y,
                hp: member.hp || maxHp,
                maxHp: maxHp,
                mana: 0,
                maxMana: 50, // Standard max mana pool for logic scaling
                stats: { ...member.stats },
                classType: member.classType,
                imageSeed: member.imageSeed,
                actionPoints: 2,
                isDead: false,
                isLeader: member.isLeader,
                pawnType: member.pawnType || 'pawn',
                equipment: member.equipment,
                abilityId: abilityId,
                activeAbilities: activeAbilities,
                cooldowns: {}
            });
            usedPositions.add(`${x},${y}`);
        });

        // -- ENEMY UNITS --
        const enemyCount = Math.min(playerCrew.length + 2, 10);
        const classes = Object.values(ClassType);
        const bossClass = forcedEnemyClass || classes[Math.floor(Math.random() * classes.length)];

        for (let i = 0; i < enemyCount; i++) {
            let x = GRID_W - 1 - (i % GRID_W);
            let y = Math.floor(i / GRID_W);
            
            const hp = 15 + (enemyLevel * 5);
            const isBoss = i === 0;
            const currentClass = isBoss ? bossClass : classes[Math.floor(Math.random() * classes.length)];
            const randomName = ENEMY_NAMES[Math.floor(Math.random() * ENEMY_NAMES.length)];
            
            // Give Enemy Boss some abilities
            const enemyAbilities = isBoss ? ['skull_bash', 'intimidate'] : ['skull_bash'];

            units.push({
                id: `enemy-${i}`,
                name: isBoss ? `Don ${randomName.split(' ')[0]}` : randomName,
                team: 'enemy',
                x, y,
                hp: isBoss ? hp * 2 : hp,
                maxHp: isBoss ? hp * 2 : hp,
                mana: 0,
                maxMana: 50,
                stats: { strength: 3 + enemyLevel, agility: 3, intelligence: 2, luck: 2, charisma: 1, willpower: 3 },
                classType: currentClass, 
                imageSeed: (9000 + i).toString(), // Updated to string
                actionPoints: 2,
                isDead: false,
                isLeader: isBoss,
                pawnType: isBoss ? undefined : 'pawn',
                abilityId: 'skull_bash',
                activeAbilities: enemyAbilities,
                cooldowns: {}
            });
            usedPositions.add(`${x},${y}`);
        }

        const obstacles: Obstacle[] = [];
        for(let i=0; i<3; i++) {
            const cx = Math.floor(Math.random() * GRID_W);
            const cy = Math.floor(Math.random() * (GRID_H - 4)) + 2;
            if(!usedPositions.has(`${cx},${cy}`)) {
                obstacles.push({ ...OBSTACLES[0], id: `obs-${i}`, x: cx, y: cy });
            }
        }

        return { units, obstacles, enemyBossClass: bossClass };
    });

    const [playerQuote, setPlayerQuote] = useState({ 
        playerTrashTalk: "...", 
        enemyTrashTalk: "You're dead meat!",
        playerCommand: "Engage!",
        enemyCommand: "Kill them all!" 
    });
    const [introDone, setIntroDone] = useState(false);
    
    // Tooltip State for Fixed Layer
    const [hoveredAbility, setHoveredAbility] = useState<{ card: Card, rect: DOMRect } | null>(null);

    // Find Active Bodyguard Enforcer
    // Mission 2 is Bodyguard
    const bodyguardOfficer = officers.find(o => o.role === 'Enforcer' && !o.isEmpty && o.activeMissionIdx === 2);

    // --- 2. ENGINE HOOK ---
    const { 
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
    } = useCombatEngine({
        initialUnits: initialSetup.units,
        initialObstacles: initialSetup.obstacles,
        activeTactic: activeTactic,
        enemyTactic: 'aggressive',
        onCombatEnd,
        retreatThreshold,
        bodyguardData: bodyguardOfficer
    });

    // --- 3. INTRO SEQUENCE ---
    useEffect(() => {
        const runIntro = async () => {
            const playerLeader = playerCrew.find(c => c.isLeader) || playerCrew[0];
            const enemyLeader = initialSetup.units.find(u => u.team === 'enemy' && u.isLeader);
            
            // Use local taunt generation
            const quotes = getPreBattleDialogue(
                playerLeader,
                enemyLeader?.name || "Rival",
                lastBattleRecord
            );
            setPlayerQuote(quotes);
        };
        runIntro();
    }, []);

    const playerLeader = playerCrew.find(c => c.isLeader) || playerCrew[0];
    const playerUnit = units.find(u => u.id === playerLeader.id);
    const enemyLeader = initialSetup.units.find(u => u.team === 'enemy' && u.isLeader);
    
    const getCasualties = () => {
        return units.filter(u => u.isDead && u.team === 'player').map(u => u.name);
    };

    const getEnemyCasualties = () => {
        return units.filter(u => u.isDead && u.team === 'enemy').map(u => u.name);
    };
    
    const getLoot = () => {
        if (battleResult === 'won') return ['N$ 500', 'Street Cred', 'Enemy Intel'];
        return [];
    };

    const handleManualExit = () => {
        if (endGameStats) {
            onCombatEnd(battleResult === 'won', endGameStats.deadIds, endGameStats.survivorHealth);
        }
    };

    return (
        <div className="absolute inset-0 bg-slate-950 z-[100] flex flex-col font-waze overflow-hidden">
            
            {/* INTRO OVERLAY */}
            {!introDone && (
                <BattleIntro 
                    playerLeader={playerLeader}
                    enemyName={enemyLeader?.name || "Rival Boss"}
                    enemyClass={initialSetup.enemyBossClass}
                    playerQuote={playerQuote.playerTrashTalk}
                    enemyQuote={playerQuote.enemyTrashTalk}
                    onComplete={() => { setIntroDone(true); startBattle(); }}
                />
            )}

            {/* RETREAT SHOUT OVERLAY */}
            {retreatShout && (
                <div className="absolute inset-0 z-[150] flex items-center justify-center animate-pop-in pointer-events-none">
                    <div className="bg-white border-4 border-slate-900 shadow-[0_0_50px_rgba(217,119,6,0.3)] p-8 max-w-2xl transform rotate-2">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full border-4 border-slate-900 overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${playerLeader.imageSeed}`} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-3xl font-black font-news uppercase text-slate-900 leading-none">
                                {playerLeader.name}
                            </div>
                        </div>
                        <p className="text-4xl font-black font-news text-amber-600 uppercase leading-tight drop-shadow-sm">
                            "{retreatShout}"
                        </p>
                    </div>
                </div>
            )}

            {/* OUTCOME OVERLAY - Manual Exit */}
            {battleResult && (
                <BattleOutcome 
                    result={battleResult} 
                    loot={getLoot()} 
                    playerCasualties={getCasualties()}
                    enemyCasualties={getEnemyCasualties()}
                    opponentName={enemyLeader?.name || "Rival Gang"}
                    onClose={handleManualExit} 
                />
            )}

            {/* TOP BAR */}
            <div className="h-20 bg-slate-900 border-b-4 border-slate-800 flex items-center justify-between px-8 z-30 shadow-2xl relative">
                {/* Player Name */}
                <div className="flex flex-col items-start">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Player Command</span>
                    <span className="text-2xl font-black text-white font-news uppercase tracking-wide leading-none">{playerLeader.name}</span>
                </div>

                {/* Turn Counter */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full flex flex-col items-center justify-center bg-slate-800 px-8 border-x-2 border-slate-700 clip-path-polygon">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Turn Count</span>
                    <span className="text-4xl font-black font-mono text-white leading-none">{turn} <span className="text-xl text-slate-500">/ 30</span></span>
                </div>

                {/* Enemy Name */}
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Enemy Leader</span>
                    <span className="text-2xl font-black text-white font-news uppercase tracking-wide leading-none">{enemyLeader?.name}</span>
                </div>
            </div>

            {/* MAIN AREA */}
            <div className="flex-grow flex relative">
                
                {/* LEFT: COMMANDER ABILITIES (PASSIVE DISPLAY) */}
                <div className="w-32 bg-slate-900 border-r border-slate-700 flex flex-col items-center py-6 gap-4 z-20 shadow-2xl overflow-y-auto custom-scrollbar relative">
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center border-b border-slate-700 pb-2 w-full mb-2">
                        Active Abilities
                    </div>
                    {playerLeader.activeAbilities.slice(0, 5).map(id => {
                        const card = CARDS[id];
                        // Get cooldown from player unit
                        const cooldown = playerUnit?.cooldowns[id] || 0;
                        if (!card) return null;

                        // Check mana availability visual
                        const manaCost = card.cost * 10;
                        const canCast = (playerUnit?.mana || 0) >= manaCost;

                        return (
                            <div
                                key={id}
                                onMouseEnter={(e) => setHoveredAbility({ card, rect: e.currentTarget.getBoundingClientRect() })}
                                onMouseLeave={() => setHoveredAbility(null)}
                                className={`
                                    w-20 h-20 rounded-2xl border-2 relative flex items-center justify-center flex-shrink-0 transition-all
                                    ${cooldown > 0 
                                        ? 'bg-slate-800 border-slate-600 opacity-50' 
                                        : canCast 
                                            ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                                            : 'bg-slate-800 border-slate-600 grayscale'
                                    }
                                `}
                            >
                                <div className="text-3xl filter drop-shadow-md">{card.icon}</div>
                                
                                {cooldown > 0 && (
                                    <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center backdrop-blur-[1px] z-10">
                                        <span className="text-white font-black text-2xl font-mono">{cooldown}</span>
                                    </div>
                                )}
                                
                                {!canCast && cooldown === 0 && (
                                    <div className="absolute bottom-1 right-1 text-[8px] font-bold text-blue-300">
                                        {manaCost} MP
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* CENTER: BATTLEFIELD */}
                <div className="flex-grow relative bg-slate-950 flex items-center justify-center p-8">
                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    
                    <BattleGrid 
                        units={units}
                        obstacles={initialSetup.obstacles}
                        visualEffects={visualEffects}
                        projectiles={projectiles}
                    />
                </div>

                {/* RIGHT: LOG */}
                <div className="w-64 bg-slate-900 border-l border-slate-700 flex flex-col z-20">
                    <div className="p-3 border-b border-slate-700 bg-slate-800/50">
                        <div className="font-black text-slate-400 text-[10px] uppercase tracking-widest text-center">
                            Battle Log
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto custom-scrollbar p-3 space-y-2 font-mono text-[10px]">
                        {combatLog.slice().reverse().map(log => (
                            <div key={log.id} className={`
                                border-l-2 pl-2 py-1 leading-tight
                                ${log.type === 'death' ? 'border-red-500 text-red-400 bg-red-900/10' : 
                                  log.type === 'card' ? 'border-amber-500 text-amber-300 bg-amber-900/10' : 
                                  log.type === 'enemy_card' ? 'border-purple-500 text-purple-300 bg-purple-900/10' :
                                  'border-slate-600 text-slate-400'}
                            `}>
                                {log.text}
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* FIXED ABILITY TOOLTIP LAYER */}
            {hoveredAbility && (
                <div 
                    className="fixed z-[9999] pointer-events-none w-64 animate-fade-in"
                    style={{ 
                        left: hoveredAbility.rect.right + 16, 
                        top: hoveredAbility.rect.top,
                    }}
                >
                    <div className="bg-slate-900 border-2 border-amber-500 text-white p-4 rounded-xl shadow-2xl relative">
                        {/* Arrow Pointer */}
                        <div className="absolute top-6 -left-2 w-4 h-4 bg-slate-900 border-b border-l border-amber-500 transform rotate-45"></div>
                        
                        <div className="flex justify-between items-start mb-2">
                            <div className="font-black uppercase text-amber-400 text-sm leading-none font-news tracking-wide">{hoveredAbility.card.name}</div>
                            <div className="w-6 h-6 bg-blue-600 rounded-full border border-white flex items-center justify-center font-bold text-xs">{hoveredAbility.card.cost}</div>
                        </div>
                        
                        <div className="text-[10px] bg-slate-800 px-2 py-1 rounded inline-block mb-2 text-slate-300 uppercase font-bold tracking-wider border border-slate-700">
                            {hoveredAbility.card.effectType}
                        </div>

                        <div className="text-xs text-slate-200 leading-relaxed italic mb-3 font-serif">
                            "{hoveredAbility.card.description}"
                        </div>
                        
                        <div className="flex gap-4 border-t border-slate-700 pt-2 text-[10px] uppercase font-bold text-slate-400">
                             <span>Auto-Cast</span>
                             <span>Rng {hoveredAbility.card.range === 99 ? 'Global' : hoveredAbility.card.range}</span>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CombatScreen;