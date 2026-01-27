import React from 'react';

interface ZoomControlsProps {
    zoomLevel: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ zoomLevel, onZoomIn, onZoomOut }) => {
    return (
        <div className="absolute bottom-24 right-6 flex flex-col gap-2 z-40 animate-slide-in-right">
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg p-1.5 shadow-xl flex flex-col gap-1">
                <button 
                    onClick={onZoomIn}
                    disabled={zoomLevel >= 3}
                    className={`w-8 h-8 flex items-center justify-center rounded transition-all ${zoomLevel >= 3 ? 'text-slate-600 cursor-not-allowed' : 'bg-slate-800 text-amber-500 hover:bg-slate-700 hover:text-white'}`}
                    title="Zoom In"
                >
                    <span className="text-xl font-bold leading-none">+</span>
                </button>
                <div className="h-px bg-slate-700 w-full"></div>
                <button 
                    onClick={onZoomOut}
                    disabled={zoomLevel <= 1}
                    className={`w-8 h-8 flex items-center justify-center rounded transition-all ${zoomLevel <= 1 ? 'text-slate-600 cursor-not-allowed' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                    title="Zoom Out"
                >
                    <span className="text-xl font-bold leading-none">-</span>
                </button>
            </div>
            <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest text-center bg-slate-900/50 rounded py-0.5 backdrop-blur-sm border border-slate-700/50 shadow-sm">
                {zoomLevel}x
            </div>
        </div>
    );
};

export default ZoomControls;