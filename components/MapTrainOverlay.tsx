
import React, { useEffect, useState, useRef } from 'react';

interface MapTrainOverlayProps {
    viewBox?: string;
    playerPos?: { x: number, y: number };
    onRumble?: (intensity: number) => void;
}

const TRAIN_PATH = "M -50 200 Q 400 250 800 100 T 1600 200";
const DURATION = 28; // Seconds
const INTERVAL = 240; // 4 Minutes (in seconds)

const MapTrainOverlay: React.FC<MapTrainOverlayProps> = ({ viewBox = "0 0 1500 1000", playerPos, onRumble }) => {
    const [isTrainActive, setIsTrainActive] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);
    
    // Path Ref for calculations
    const pathRef = useRef<SVGPathElement>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const startTimeRef = useRef<number>(0);

    // Audio Setup
    const setupAudio = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        // Create Noise Buffer (Brownian-ish noise)
        const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer loop
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            // Integrate white noise to get brown noise (rumble)
            lastOut = (lastOut + (0.02 * white)) / 1.02;
            data[i] = lastOut * 3.5; 
            // Normalize roughly
            if (data[i] > 1) data[i] = 1;
            if (data[i] < -1) data[i] = -1;
        }

        // Nodes
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 120; // Deep rumble

        const gain = ctx.createGain();
        gain.gain.value = 0; // Start silent

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        noise.start();
        
        noiseNodeRef.current = noise;
        gainNodeRef.current = gain;
    };

    const stopAudio = () => {
        if (gainNodeRef.current) {
            // Ramp down to avoid click
            try {
                gainNodeRef.current.gain.linearRampToValueAtTime(0, audioCtxRef.current!.currentTime + 0.1);
            } catch (e) {}
        }
        setTimeout(() => {
            if (noiseNodeRef.current) {
                noiseNodeRef.current.stop();
                noiseNodeRef.current.disconnect();
                noiseNodeRef.current = null;
            }
        }, 150);
    };

    // Cycle Logic
    useEffect(() => {
        setIsTrainActive(true);
        startTimeRef.current = Date.now();

        const loop = setInterval(() => {
            setIsTrainActive(false);
            stopAudio();
            if (onRumble) onRumble(0);
            
            setTimeout(() => {
                setAnimationKey(prev => prev + 1);
                setIsTrainActive(true);
                startTimeRef.current = Date.now();
            }, 100);
        }, INTERVAL * 1000);

        return () => {
            clearInterval(loop);
            stopAudio();
            if (onRumble) onRumble(0);
        };
    }, []);

    // Proximity Loop (RAF)
    useEffect(() => {
        if (!isTrainActive || !playerPos || !pathRef.current) return;
        
        setupAudio();

        let rafId: number;
        const totalLen = pathRef.current.getTotalLength();
        const durationMs = DURATION * 1000;

        const checkProximity = () => {
            const elapsed = Date.now() - startTimeRef.current;
            
            // Train active window roughly DURATION seconds
            if (elapsed > durationMs + 2000) {
                stopAudio();
                if (onRumble) onRumble(0);
                return; 
            }

            // Estimate current train center (Lead car is at progress, assume center is slightly behind)
            // Or just track the lead car
            const progress = (elapsed / durationMs);
            
            if (progress >= 0 && progress <= 1) {
                const currentLen = totalLen * progress;
                const point = pathRef.current!.getPointAtLength(currentLen);
                
                // Calculate distance to player (SVG coords vs Player coords match)
                const dist = Math.hypot(point.x - playerPos.x, point.y - playerPos.y);
                
                // Range: 375 pixels (3.75 blocks). If closer, rumble increases.
                const range = 375;
                let intensity = 0;

                if (dist < range) {
                    // Linear falloff
                    intensity = 1 - (dist / range);
                    // Add some jitter to intensity for "shake" feel logic if needed, 
                    // but onRumble handles visual jitter. This is strictly magnitude.
                    intensity = Math.pow(intensity, 2); // Curve for impact
                }

                if (onRumble) onRumble(intensity);
                
                if (gainNodeRef.current && audioCtxRef.current) {
                    // Smooth audio transition
                    gainNodeRef.current.gain.setTargetAtTime(intensity * 0.5, audioCtxRef.current.currentTime, 0.1);
                }
            } else {
                if (onRumble) onRumble(0);
                if (gainNodeRef.current && audioCtxRef.current) {
                     gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.1);
                }
            }

            rafId = requestAnimationFrame(checkProximity);
        };

        rafId = requestAnimationFrame(checkProximity);

        return () => {
            cancelAnimationFrame(rafId);
            stopAudio();
        };
    }, [isTrainActive, playerPos]); // Re-run if train restarts or player moves

    if (!isTrainActive) return null;

    // Car Dimensions
    const carWidth = 38;
    const carHeight = 12;
    const cars = [0, 1, 2, 3, 4, 5];
    const delayPerCar = 0.68; 

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[21]">
            <svg className="absolute inset-0 w-full h-full" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id="headlight-beam" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                    
                    <mask id="tunnel-mask">
                        <rect x="-5000" y="-5000" width="10000" height="10000" fill="white" />
                        <path d="M 1200 -100 Q 1100 300 1400 500 L 1400 -100 Z" fill="black" />
                    </mask>
                    
                    <g id="train-car-body">
                        <rect x={-carWidth/2} y={-carHeight/2} width={carWidth} height={carHeight} rx="1" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
                        <rect x={-carWidth/2} y={2} width={carWidth} height={2} fill="#2563eb" />
                        <rect x={-carWidth/2 + 3} y={-carHeight/2 + 2} width={9} height={4} fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
                        <rect x={-carWidth/2 + 14.5} y={-carHeight/2 + 2} width={9} height={4} fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
                        <rect x={-carWidth/2 + 26} y={-carHeight/2 + 2} width={9} height={4} fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
                        <path d={`M ${-carWidth/2 + 5} ${-carHeight/2} L ${carWidth/2 - 5} ${-carHeight/2}`} stroke="#94a3b8" strokeWidth="2" />
                        <line x1={-carWidth/2 + 13} y1={-carHeight/2} x2={-carWidth/2 + 13} y2={carHeight/2} stroke="#94a3b8" strokeWidth="0.5" />
                        <line x1={carWidth/2 - 13} y1={-carHeight/2} x2={carWidth/2 - 13} y2={carHeight/2} stroke="#94a3b8" strokeWidth="0.5" />
                    </g>
                </defs>

                {/* The Track Path - With Ref */}
                <path ref={pathRef} id="motionPath" d={TRAIN_PATH} fill="none" stroke="none" />

                <g mask="url(#tunnel-mask)">
                    {cars.map((index) => {
                        const isLead = index === 0;
                        const isLast = index === cars.length - 1;
                        
                        return (
                            <g key={`${animationKey}-car-${index}`} opacity="0">
                                <g transform="rotate(0)"> 
                                    {!isLast && (
                                        <g>
                                            <line x1={-carWidth/2 - 4} y1={0} x2={-carWidth/2} y2={0} stroke="#334155" strokeWidth="2" />
                                            <circle cx={-carWidth/2 - 4} cy={0} r="1" fill="#1e293b" />
                                        </g>
                                    )}
                                    <use href="#train-car-body" />
                                    {isLead && (
                                        <g>
                                            <path d="M 18 0 L 100 -25 L 100 25 Z" fill="url(#headlight-beam)" opacity="0.5" />
                                            <circle cx={carWidth/2} cy={-3} r="1.5" fill="#fef08a" filter="drop-shadow(0 0 2px white)" />
                                            <circle cx={carWidth/2} cy={3} r="1.5" fill="#fef08a" filter="drop-shadow(0 0 2px white)" />
                                        </g>
                                    )}
                                    {isLast && (
                                        <g>
                                            <circle cx={-carWidth/2} cy={-3} r="1.5" fill="#ef4444" />
                                            <circle cx={-carWidth/2} cy={3} r="1.5" fill="#ef4444" />
                                        </g>
                                    )}
                                </g>

                                <animateMotion 
                                    dur={`${DURATION}s`}
                                    begin={`${index * delayPerCar}s`}
                                    repeatCount="1"
                                    rotate="auto"
                                    fill="freeze"
                                >
                                    <mpath href="#motionPath" />
                                </animateMotion>
                                
                                <animate 
                                    attributeName="opacity"
                                    from="0" to="1"
                                    begin={`${index * delayPerCar}s`}
                                    dur="0.1s"
                                    fill="freeze"
                                />
                                 <animate 
                                    attributeName="opacity"
                                    from="1" to="0"
                                    begin={`${index * delayPerCar + DURATION - 2}s`}
                                    dur="2s"
                                    fill="freeze"
                                />
                            </g>
                        );
                    })}
                </g>
            </svg>
        </div>
    );
};

export default MapTrainOverlay;
