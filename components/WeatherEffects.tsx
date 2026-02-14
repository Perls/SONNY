
import React, { useMemo } from 'react';
import { WeatherCondition } from '../utils/timeData';

interface WeatherEffectsProps {
    weather: WeatherCondition;
    viewBox?: string;
}

const WeatherEffects: React.FC<WeatherEffectsProps> = React.memo(({ weather, viewBox = "0 0 1500 1000" }) => {

    // Determine Weather Type based on description
    const type = useMemo(() => {
        const d = weather.description.toLowerCase();
        if (d.includes('snow')) return 'snow';
        if (d.includes('drizzle') || d.includes('mist') || d.includes('light rain')) return 'light_rain';
        if (d.includes('rain') || d.includes('storm') || d.includes('cloudy')) return 'heavy_rain';
        if (d.includes('breeze') || d.includes('wind')) return 'windy';
        return 'clear';
    }, [weather.description]);

    // Pre-compute all particle positions once to avoid Math.random() flickering on re-render
    const heavyRainParticles = useMemo(() =>
        Array.from({ length: 350 }).map((_, i) => ({
            x: Math.random() * 2500 - 500,
            len: 80 + Math.random() * 60,
            opacity: 0.4 + Math.random() * 0.4,
            speed: 0.45 + Math.random() * 0.15,
            delay: Math.random() * -2,
        })), []);

    const drizzleParticles = useMemo(() =>
        Array.from({ length: 1000 }).map((_, i) => ({
            x: Math.random() * 2500 - 500,
            len: 15 + Math.random() * 20,
            opacity: 0.1 + Math.random() * 0.3,
            speed: 1.2 + Math.random() * 0.8,
            delay: Math.random() * -3,
        })), []);

    const snowParticles = useMemo(() =>
        Array.from({ length: 80 }).map((_, i) => ({
            cx: Math.random() * 1500,
            cy: Math.random() * 1000,
            r: 1.5 + Math.random(),
            opacity: 0.6 + Math.random() * 0.4,
            speed: 3 + Math.random() * 2,
            delay: Math.random() * -5,
        })), []);

    // --- CONFIGURATION ---

    const isLightRain = type === 'light_rain';
    const isHeavyRain = type === 'heavy_rain';
    const isSnow = type === 'snow';
    const isWindy = type === 'windy';

    // 1. Atmosphere Filters (CSS classes applied to container)
    let containerStyle: React.CSSProperties = {
        pointerEvents: 'none',
        position: 'absolute',
        inset: 0,
        zIndex: 35, // Between MapBackground and Player/UI
        transition: 'filter 2s ease-in-out',
    };

    if (isLightRain) {
        // Drizzle: Slightly grayer, less contrast, misty look
        containerStyle.filter = 'brightness(0.95) contrast(0.9) saturate(0.9)';
    } else if (isHeavyRain) {
        containerStyle.filter = 'brightness(0.8) contrast(1.1) saturate(0.8) blur(0.5px)';
    } else if (isSnow) {
        containerStyle.filter = 'hue-rotate(5deg) brightness(1.05)';
    } else {
        containerStyle.filter = 'none';
    }

    // 2. Wind Shake
    const shakeClass = isWindy ? 'animate-wind-shake' : '';

    return (
        <div style={containerStyle} className={shakeClass}>
            <svg className="absolute inset-0 w-full h-full" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
                <defs>
                    <filter id="wetRoadBlurLight">
                        <feGaussianBlur stdDeviation="2" />
                    </filter>
                    <filter id="wetRoadBlurHeavy">
                        <feGaussianBlur stdDeviation="4" />
                    </filter>

                    {/* Land Mask to prevent effects on water */}
                    <mask id="weatherLandMask">
                        <rect x="-5000" y="-5000" width="15000" height="15000" fill="white" />
                        {/* Water Paths (Black to hide) - Matches MapBackground geometry */}
                        <path d="M -100 700 Q 300 650 600 900 T 1400 700 V 1200 H -100 Z" fill="black" />
                        <path d="M 1200 0 Q 1100 300 1400 500 V 0 Z" fill="black" />
                    </mask>

                    {/* Heavy Rain Gradient */}
                    <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="white" stopOpacity="0" />
                        <stop offset="30%" stopColor="white" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </linearGradient>

                    {/* Light Drizzle Gradient (Softer, shorter fade, slightly gray) */}
                    <linearGradient id="drizzleGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0" />
                        <stop offset="50%" stopColor="#f8fafc" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0" />
                    </linearGradient>

                    <style>
                        {`
                            @keyframes rainDrop {
                                0% { transform: translateY(-100px); }
                                100% { transform: translateY(1100px); }
                            }
                            .rain-particle {
                                animation-name: rainDrop;
                                animation-timing-function: linear;
                                animation-iteration-count: infinite;
                            }
                        `}
                    </style>
                </defs>

                {/* --- SNOW GROUND TINT --- */}
                {isSnow && (
                    <rect
                        x="-5000" y="-5000" width="15000" height="15000"
                        fill="#FAFAFF"
                        style={{ mixBlendMode: 'multiply', opacity: 0.3 }}
                        mask="url(#weatherLandMask)"
                    />
                )}

                {/* --- WATER DEPTH (Heavy Rain) --- */}
                {isHeavyRain && (
                    <>
                        <path d="M -100 700 Q 300 650 600 900 T 1400 700 V 1200 H -100 Z" fill="#1e3a8a" opacity="0.3" style={{ mixBlendMode: 'multiply' }} />
                        <path d="M 1200 0 Q 1100 300 1400 500 V 0 Z" fill="#1e3a8a" opacity="0.3" style={{ mixBlendMode: 'multiply' }} />
                    </>
                )}

                {/* --- ROAD REFLECTIONS (Wet Slick) --- */}
                {(isLightRain || isHeavyRain) && (
                    <g
                        filter={isHeavyRain ? "url(#wetRoadBlurHeavy)" : "url(#wetRoadBlurLight)"}
                        opacity={isHeavyRain ? 0.3 : 0.15}
                        mask="url(#weatherLandMask)"
                    >
                        {/* Vertical Avenues */}
                        {Array.from({ length: 15 }).map((_, col) => (
                            <line
                                key={`r-ave-${col}`}
                                x1={col * 100} y1="0" x2={col * 100} y2="1000"
                                stroke="#fbbf24" strokeWidth="15"
                            />
                        ))}
                        {/* Horizontal Streets */}
                        {Array.from({ length: 10 }).map((_, row) => (
                            <line
                                key={`r-st-${row}`}
                                x1="0" y1={row * 100} x2="1500" y2={row * 100}
                                stroke="#fbbf24" strokeWidth="15"
                            />
                        ))}
                    </g>
                )}

                {/* --- PRECIPITATION ANIMATION --- */}

                {/* Heavy Rain */}
                {isHeavyRain && (
                    <g transform="rotate(15, 750, 500)">
                        {heavyRainParticles.map((p, i) => (
                            <rect
                                key={`hrain-${i}`}
                                x={p.x}
                                y={0}
                                width={2}
                                height={p.len}
                                fill="url(#rainGrad)"
                                opacity={p.opacity}
                                className="rain-particle"
                                style={{
                                    animationDuration: `${p.speed}s`,
                                    animationDelay: `${p.delay}s`
                                }}
                            />
                        ))}
                    </g>
                )}

                {/* Light Drizzle - Slower, denser, shorter, less opacity */}
                {isLightRain && (
                    <g transform="rotate(-5, 750, 500)">
                        {drizzleParticles.map((p, i) => (
                            <rect
                                key={`drizzle-${i}`}
                                x={p.x}
                                y={0}
                                width={1}
                                height={p.len}
                                fill="url(#drizzleGrad)"
                                opacity={p.opacity}
                                className="rain-particle"
                                style={{
                                    animationDuration: `${p.speed}s`,
                                    animationDelay: `${p.delay}s`
                                }}
                            />
                        ))}
                    </g>
                )}

                {/* Snow */}
                {isSnow && (
                    <g>
                        {snowParticles.map((p, i) => (
                            <circle
                                key={`snow-${i}`}
                                cx={p.cx} cy={p.cy} r={p.r}
                                fill="white"
                                opacity={p.opacity}
                                className="animate-snow-fall"
                                style={{
                                    animationDuration: `${p.speed}s`,
                                    animationDelay: `${p.delay}s`
                                }}
                            />
                        ))}
                    </g>
                )}

            </svg>
        </div>
    );
});

WeatherEffects.displayName = 'WeatherEffects';

export default WeatherEffects;
