
import React, { useMemo } from 'react';
import { isWater, isDock } from '../utils/waterUtils';

interface NightEffectsProps {
    viewBox?: string;
    playerPos: { x: number, y: number };
    isMoving: boolean;
    moveDuration: number;
    isNight: boolean;
}

const NightEffects: React.FC<NightEffectsProps> = React.memo(({
    viewBox = "0 0 1500 1000",
    playerPos,
    isMoving,
    moveDuration,
    isNight
}) => {
    // Generate static random seeds for twinkling to prevent re-renders causing chaotic flashing
    const { lights, particles } = useMemo(() => {
        const generatedLights = [];
        const generatedParticles = [];

        // Building definitions (matches MapBackground visual logic)
        const MARGIN = 10; // The visual gap between grid line and building face
        const BLOCK_SIZE = 100;

        for (let col = 0; col < 15; col++) {
            for (let row = 0; row < 10; row++) {
                // SKIP: Water Blocks
                if (isWater(col, row)) continue;

                // SKIP: Central Park Tiles (3-5 X, 4-5 Y)
                if ((col >= 3 && col <= 5) && (row >= 4 && row <= 5)) continue;

                // SKIP: Highland Park Tiles (12 X, 3-4 Y)
                if (col === 12 && (row === 3 || row === 4)) continue;

                // DENSITY CONTROL
                const isDockZone = isDock(col, row);
                // Docks have 0% skip chance (always spawn) and more lights
                // Normal blocks have 20% skip chance
                if (!isDockZone && Math.random() < 0.2) continue;

                const blockX = col * BLOCK_SIZE;
                const blockY = row * BLOCK_SIZE;

                const possibleMounts = [];

                // 1. WEST WALL
                if (col > 0 && !isWater(col - 1, row)) {
                    possibleMounts.push({
                        side: 'west',
                        anchorX: blockX + MARGIN,
                        anchorYStart: blockY + MARGIN + 5,
                        anchorYEnd: blockY + BLOCK_SIZE - MARGIN - 5,
                        bulbOffsetX: -6,
                        bulbOffsetY: 0
                    });
                }

                // 2. EAST WALL
                if (col < 14 && !isWater(col + 1, row)) {
                    possibleMounts.push({
                        side: 'east',
                        anchorX: blockX + BLOCK_SIZE - MARGIN,
                        anchorYStart: blockY + MARGIN + 5,
                        anchorYEnd: blockY + BLOCK_SIZE - MARGIN - 5,
                        bulbOffsetX: 6,
                        bulbOffsetY: 0
                    });
                }

                // 3. NORTH WALL
                if (row > 0 && !isWater(col, row - 1)) {
                    possibleMounts.push({
                        side: 'north',
                        anchorY: blockY + MARGIN,
                        anchorXStart: blockX + MARGIN + 5,
                        anchorXEnd: blockX + BLOCK_SIZE - MARGIN - 5,
                        bulbOffsetX: 0,
                        bulbOffsetY: -6
                    });
                }

                // 4. SOUTH WALL
                if (row < 9 && !isWater(col, row + 1)) {
                    possibleMounts.push({
                        side: 'south',
                        anchorY: blockY + BLOCK_SIZE - MARGIN,
                        anchorXStart: blockX + MARGIN + 5,
                        anchorXEnd: blockX + BLOCK_SIZE - MARGIN - 5,
                        bulbOffsetX: 0,
                        bulbOffsetY: 6
                    });
                }

                // Light Spawn Logic
                // Docks get up to 4 lights, regular blocks get up to 2
                const maxLights = isDockZone ? 4 : 2;
                const numLights = Math.floor(Math.random() * maxLights) + 1;

                const shuffled = possibleMounts.sort(() => 0.5 - Math.random());
                const selectedMounts = shuffled.slice(0, numLights);

                selectedMounts.forEach((mount, i) => {
                    const lightId = `light-${col}-${row}-${i}`;

                    let ax, bx, by, ay;

                    if (mount.side === 'west' || mount.side === 'east') {
                        const range = mount.anchorYEnd! - mount.anchorYStart!;
                        const offset = Math.random() * range;
                        ax = mount.anchorX!;
                        ay = mount.anchorYStart! + offset;
                        bx = ax + mount.bulbOffsetX;
                        by = ay + mount.bulbOffsetY;
                    } else {
                        const range = mount.anchorXEnd! - mount.anchorXStart!;
                        const offset = Math.random() * range;
                        ax = mount.anchorXStart! + offset;
                        ay = mount.anchorY!;
                        bx = ax + mount.bulbOffsetX;
                        by = ay + mount.bulbOffsetY;
                    }

                    generatedLights.push({
                        id: lightId,
                        ax, ay,
                        bx, by,
                        delay: Math.random() * 5,
                        // Static duration for consistent memoization
                        pulseDuration: 30 + Math.random() * 15,
                        radiusScale: 0.7 + Math.random() * 0.5
                    });

                    // Add Motes - Docks get more particles (industrial smog)
                    const moteBase = isDockZone ? 3 : 1;
                    const moteCount = Math.floor(Math.random() * 2) + moteBase;

                    for (let m = 0; m < moteCount; m++) {
                        const angle = Math.random() * Math.PI * 2;
                        const dist = Math.random() * 12;
                        generatedParticles.push({
                            id: `mote-${lightId}-${m}`,
                            cx: bx + Math.cos(angle) * dist,
                            cy: by + Math.sin(angle) * dist,
                            r: 0.5 + Math.random() * 0.5,
                            opacity: 0.2 + Math.random() * 0.3,
                        });
                    }
                });
            }
        }
        return { lights: generatedLights, particles: generatedParticles };
    }, []);

    return (
        <>
            {/* Darkness Overlay with Spotlight */}
            <svg
                className={`absolute inset-0 pointer-events-none z-30 transition-opacity duration-1000 ${isNight ? 'opacity-100' : 'opacity-0'}`}
                viewBox={viewBox}
                preserveAspectRatio="xMidYMid meet"
                width="100%"
                height="100%"
            >
                <defs>
                    <radialGradient id="spotlightGrad" gradientUnits="objectBoundingBox" cx="0.5" cy="0.5" r="0.5">
                        <stop offset="0%" stopColor="black" stopOpacity="1" />
                        <stop offset="40%" stopColor="black" stopOpacity="1" />
                        <stop offset="100%" stopColor="white" stopOpacity="1" />
                    </radialGradient>
                    <mask id="spotlightMask">
                        <rect x="-5000" y="-5000" width="15000" height="15000" fill="white" />
                        <circle
                            cx="0"
                            cy="0"
                            r="200"
                            fill="url(#spotlightGrad)"
                            style={{
                                transform: `translate(${playerPos.x}px, ${playerPos.y}px)`,
                                transition: isMoving ? `transform ${moveDuration}ms linear` : 'none'
                            }}
                        />
                    </mask>
                </defs>
                <rect x="-5000" y="-5000" width="15000" height="15000" fill="rgba(2, 6, 23, 0.75)" mask="url(#spotlightMask)" />
            </svg>

            {/* Lights Layer */}
            <div className={`absolute inset-0 overflow-hidden pointer-events-none z-[35] mix-blend-screen transition-opacity duration-1000 ${isNight ? 'opacity-100' : 'opacity-0'}`}>
                <svg className="absolute inset-0 w-full h-full transition-all duration-500 ease-in-out" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
                    <defs>
                        <radialGradient id="lampGradient" cx="0.5" cy="0.5" r="0.5">
                            <stop offset="0%" stopColor="#fffbeb" stopOpacity="1" />
                            <stop offset="30%" stopColor="#fbbf24" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
                        </radialGradient>

                        <filter id="bulbBlur">
                            <feGaussianBlur stdDeviation="1.5" />
                        </filter>

                        <style>
                            {`
                                @keyframes pulseGlow {
                                    0%, 100% { opacity: 0.7; transform: scale(1); }
                                    50% { opacity: 0.4; transform: scale(0.9); }
                                }
                            `}
                        </style>
                    </defs>

                    {/* 1. Fixtures (The Arms) */}
                    {lights.map(light => (
                        <line
                            key={`arm-${light.id}`}
                            x1={light.ax} y1={light.ay}
                            x2={light.bx} y2={light.by}
                            stroke="#020617"
                            strokeWidth="2"
                            strokeLinecap="square"
                            opacity="0.8"
                        />
                    ))}

                    {/* 2. The Glow Pools */}
                    {lights.map(light => (
                        <g key={`glow-${light.id}`} transform={`translate(${light.bx}, ${light.by})`}>
                            <circle
                                r={40 * light.radiusScale}
                                fill="url(#lampGradient)"
                                style={{
                                    animation: `pulseGlow ${light.pulseDuration}s ease-in-out infinite`,
                                    animationDelay: `${light.delay}s`,
                                    transformOrigin: 'center'
                                }}
                            />
                        </g>
                    ))}

                    {/* 3. The Bulbs */}
                    {lights.map(light => (
                        <circle
                            key={`bulb-${light.id}`}
                            cx={light.bx} cy={light.by}
                            r="2.5"
                            fill="#fff"
                            filter="url(#bulbBlur)"
                            opacity="0.9"
                        />
                    ))}

                    {/* 4. Sodium Motes (Pink) */}
                    {particles.map(p => (
                        <circle
                            key={p.id}
                            cx={p.cx}
                            cy={p.cy}
                            r={p.r}
                            fill="#ff77e9"
                            style={{
                                opacity: p.opacity,
                            }}
                        />
                    ))}
                </svg>
            </div>
        </>
    );
});

NightEffects.displayName = 'NightEffects';

export default NightEffects;
