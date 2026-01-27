
import React, { useEffect, useState, useRef } from 'react';
import { MAP_DESTINATIONS } from '../utils/mapUtils';

interface GameActionStatusProps {
    isMoving: boolean;
    movementQueue: { x: number, y: number }[];
    onCancel: () => void;
    currentLocationLabel: string;
}

const GameActionStatus: React.FC<GameActionStatusProps> = ({ isMoving, movementQueue, onCancel, currentLocationLabel }) => {
    const [initialDistance, setInitialDistance] = useState(0);
    const prevMoving = useRef(false);

    useEffect(() => {
        if (isMoving && !prevMoving.current) {
            setInitialDistance(movementQueue.length);
        }
        prevMoving.current = isMoving;
    }, [isMoving, movementQueue.length]);

    // Destination Label Logic
    const getDestinationLabel = () => {
        if (movementQueue.length === 0) return "Unknown";
        const dest = movementQueue[movementQueue.length - 1];
        const x = dest.x;
        const y = dest.y;
        
        // Check Landmarks
        const landmark = MAP_DESTINATIONS.find(d => d.gridX === Math.floor(x) && d.gridY === Math.floor(y));
        if (landmark) return landmark.label;

        // Fallback to Block
        const col = Math.floor(x);
        const row = Math.floor(y);
        return `Block ${col}-${row}`;
    };

    const destinationLabel = isMoving ? getDestinationLabel() : "";
    
    // Progress (0 to 100)
    const progress = initialDistance > 0 ? Math.max(0, Math.min(100, ((initialDistance - movementQueue.length) / initialDistance) * 100)) : 0;

    return (
        <div className="flex flex-col items-end justify-center ml-8 flex-shrink-0 animate-fade-in select-none group relative z-50">
            <div className="flex items-center gap-3 mb-0.5">
                 
                 <div className="flex flex-col items-end">
                    <h1 className="text-xl font-black font-news text-white tracking-tighter uppercase leading-none drop-shadow-lg italic flex items-center gap-2">
                        {isMoving ? (
                            <>
                                <span className="text-amber-500 animate-pulse text-sm">▶</span>
                                <span>EN ROUTE</span>
                            </>
                        ) : (
                            <span className="text-slate-500">STANDING BY</span>
                        )}
                    </h1>
                    <div className="text-[9px] font-bold tracking-[0.2em] text-slate-400 uppercase w-full text-right mt-0.5 max-w-[150px] truncate">
                        {isMoving ? `To: ${destinationLabel}` : currentLocationLabel}
                    </div>
                 </div>

                 {/* The "II" Logo Mirrored */}
                 <div className="flex h-8 gap-1.5 transform skew-x-[-10deg]">
                     <div className={`w-2 ${isMoving ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)] animate-pulse' : 'bg-slate-700'}`}></div>
                     <div className="w-2 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
                 </div>
            </div>

            {/* Sexy Loading Bar & Stop Button */}
            {isMoving && (
                <div className="flex items-center gap-3 mt-1 w-full justify-end animate-slide-in-right">
                    {/* Bar Container */}
                    <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative shadow-inner">
                        {/* Animated Striped Gradient */}
                        <div 
                            className="h-full bg-[linear-gradient(45deg,#f59e0b_25%,#fbbf24_25%,#fbbf24_50%,#f59e0b_50%,#f59e0b_75%,#fbbf24_75%,#fbbf24_100%)] bg-[length:10px_10px] animate-[progress-stripes_1s_linear_infinite]"
                            style={{ width: `${progress}%`, transition: 'width 0.5s linear' }}
                        ></div>
                    </div>

                    {/* Stop Button */}
                    <button 
                        onClick={onCancel}
                        className="bg-red-600 hover:bg-red-500 text-white text-[9px] font-black uppercase px-3 py-0.5 rounded shadow-lg transition-all active:translate-y-0.5 border-b-2 border-red-800 active:border-b-0"
                    >
                        STOP
                    </button>
                </div>
            )}
            
            {/* Inline Style for keyframes to ensure availability */}
            <style>{`
                @keyframes progress-stripes {
                    from { background-position: 10px 0; }
                    to { background-position: 0 0; }
                }
            `}</style>
        </div>
    );
};

export default GameActionStatus;
