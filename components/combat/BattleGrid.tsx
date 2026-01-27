
import React from 'react';
import { CombatUnit, VisualEffect, Obstacle, Projectile } from '../../types';
import CombatUnitEntity from './CombatUnitEntity';

const GRID_W = 8;
const GRID_H = 10;

// Simple Bullet Component
const Bullet: React.FC<Projectile> = ({ startX, startY, endX, endY }) => {
    // Basic CSS animation would go here or reuse from CombatScreen
    // Simplified for brevity - assumes parent container positioning
    const left = (startX / GRID_W) * 100 + (50 / GRID_W); 
    const top = (startY / GRID_H) * 100 + (50 / GRID_H);
    // In a real implementation, this would interpolate over time
    // For now, render static at start to indicate shot
    return (
        <div 
            className="absolute z-[150] w-2 h-2 bg-yellow-300 rounded-full animate-ping"
            style={{ left: `${left}%`, top: `${top}%` }}
        />
    );
};

interface BattleGridProps {
    units: CombatUnit[];
    obstacles: Obstacle[];
    visualEffects: VisualEffect[];
    projectiles: Projectile[];
}

const BattleGrid: React.FC<BattleGridProps> = ({ units, obstacles, visualEffects, projectiles }) => {
    
    const renderCell = (x: number, y: number) => {
        const unitsHere = units.filter(u => u.x === x && u.y === y);
        const obstacle = obstacles.find(o => o.x === x && o.y === y);
        const effectsHere = visualEffects.filter(e => e.x === x && e.y === y);

        return (
            <div 
                key={`${x}-${y}`}
                className={`
                    border border-slate-800/20 relative flex items-center justify-center overflow-visible
                    ${(x + y) % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-900/40'}
                    ${obstacle ? 'bg-white/10' : ''} 
                `}
            >
                {/* Obstacle */}
                {obstacle && <div className="text-3xl drop-shadow-lg opacity-80 z-10">{obstacle.icon}</div>}

                {/* Units */}
                <div className={`absolute inset-0 z-10 p-0.5 ${unitsHere.length > 1 ? 'grid grid-cols-2 grid-rows-2 gap-0.5' : 'flex items-center justify-center'}`}>
                    {unitsHere.map(unit => (
                        <div key={unit.id} className={`${unitsHere.length > 1 ? 'w-full h-full' : 'w-16 h-16'} transition-all`}>
                            <CombatUnitEntity unit={unit} />
                        </div>
                    ))}
                </div>

                {/* Effects */}
                {effectsHere.map(ef => (
                    <div key={ef.id} className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
                        {ef.type === 'explosion' && <div className="text-4xl animate-bounce">💥</div>}
                        {ef.type === 'heart' && <div className="text-4xl animate-bounce">💖</div>}
                        {ef.type === 'cast_ring' && <div className="w-full h-full border-4 border-blue-400 rounded-full animate-ping"></div>}
                        {ef.type === 'buff' && <div className="text-4xl animate-float-up">💪</div>}
                        
                        {/* Floating Text */}
                        {ef.text && (
                            <div className={`absolute -top-8 whitespace-nowrap text-xl font-black animate-float-up ${ef.color || 'text-white'}`} style={{ textShadow: '0 2px 4px black' }}>
                                {ef.text}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const cells = [];
    for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
            cells.push(renderCell(x, y));
        }
    }

    return (
        <div className="relative w-full h-full bg-slate-900 rounded-xl border-8 border-slate-800 shadow-2xl p-2">
            <div className="absolute inset-0 pointer-events-none z-[150]">
                {projectiles.map(p => <Bullet key={p.id} {...p} />)}
            </div>
            
            <div className="grid gap-1 w-full h-full" style={{ gridTemplateColumns: `repeat(${GRID_W}, 1fr)`, gridTemplateRows: `repeat(${GRID_H}, 1fr)` }}>
                {cells}
            </div>
        </div>
    );
};

export default BattleGrid;
