
import React, { useState, useRef, useEffect } from 'react';

interface SettingsWindowProps {
    radioChannel: number;
    setRadioChannel: (channel: number) => void;
    visualEffectsEnabled: boolean;
    onToggleVisualEffects: (enabled: boolean) => void;
    consigliereEnabled: boolean;
    onToggleConsigliere: (enabled: boolean) => void;
    cameraMode?: 'cinematic' | 'default';
    setCameraMode?: (mode: 'cinematic' | 'default') => void;
    onLogout: () => void;
    onClose: () => void;
}

const SettingsWindow: React.FC<SettingsWindowProps> = ({ 
    radioChannel, 
    setRadioChannel, 
    visualEffectsEnabled, 
    onToggleVisualEffects,
    consigliereEnabled,
    onToggleConsigliere,
    cameraMode,
    setCameraMode,
    onLogout, 
    onClose 
}) => {
    // Positioning State (Center default)
    const [position, setPosition] = useState(() => {
        const width = 320; // w-80
        const height = 400; // approx
        return { 
            x: Math.max(0, window.innerWidth / 2 - width / 2), 
            y: Math.max(0, window.innerHeight / 2 - height / 2) 
        };
    });
    
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<{ x: number, y: number } | null>(null);

    // Drag Logic
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging && dragStartRef.current) {
                const dx = e.clientX - dragStartRef.current.x;
                const dy = e.clientY - dragStartRef.current.y;
                setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
                dragStartRef.current = { x: e.clientX, y: e.clientY };
            }
        };
        const handleMouseUp = () => {
            setIsDragging(false);
            dragStartRef.current = null;
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
    };

    return (
        <div 
            className="fixed z-[60] w-80 font-waze select-none"
            style={{ left: position.x, top: position.y }}
            onMouseDown={(e) => e.stopPropagation()}
        >
            {/* Main Frame (Win 3.1 Gray with Bevels) */}
            <div className="bg-[#c0c0c0] p-1 border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black shadow-[10px_10px_0_rgba(0,0,0,0.5)]">
                
                {/* Title Bar */}
                <div 
                    className="bg-[#000080] px-1 py-1 flex justify-between items-center mb-1 cursor-move"
                    onMouseDown={handleMouseDown}
                >
                    <div className="flex items-center gap-2">
                        {/* System Menu / Close Box */}
                        <div 
                            className="w-4 h-4 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-black flex items-center justify-center shadow-sm cursor-pointer active:border-t-black active:border-l-black active:border-b-white active:border-r-white"
                            onClick={onClose}
                        >
                            <div className="w-2 h-0.5 bg-black shadow-[0_1px_0_white]"></div>
                        </div>
                        <span className="font-bold text-white text-[13px] uppercase tracking-wider shadow-black drop-shadow-md">
                            Control Panel
                        </span>
                    </div>
                    
                    {/* Window Controls */}
                    <div className="flex gap-0.5">
                        <div className="w-4 h-4 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-black flex items-center justify-center">
                            <span className="text-[8px] text-black font-black leading-none">▼</span>
                        </div>
                        <div className="w-4 h-4 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-black flex items-center justify-center">
                            <span className="text-[8px] text-black font-black leading-none">▲</span>
                        </div>
                    </div>
                </div>

                {/* Menu Bar */}
                <div className="flex gap-3 px-2 text-[11px] text-black font-bold mb-1 bg-[#c0c0c0]">
                    <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1"><span className="underline">S</span>ettings</span>
                    <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1"><span className="underline">H</span>elp</span>
                </div>

                {/* Content Area (Sunken) */}
                <div className="bg-white border-t border-l border-gray-600 border-b border-r border-white p-4">
                    
                    {/* Radio Section */}
                    <fieldset className="border border-gray-400 p-2 mb-4 relative group">
                        <legend className="text-[11px] text-black px-1 ml-1 bg-white">Audio Output</legend>
                        
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[11px] font-bold text-black">Frequency:</span>
                            <span className="bg-black text-[#00ff00] font-mono text-[10px] px-2 border border-gray-500">
                                {radioChannel === 0 ? "OFF" : `CH ${radioChannel}`}
                            </span>
                        </div>

                        <input 
                            type="range" 
                            min="0" 
                            max="4" 
                            step="1" 
                            value={radioChannel} 
                            onChange={(e) => setRadioChannel(parseInt(e.target.value))} 
                            className="w-full mb-3 accent-[#000080] h-4 bg-gray-200 border border-gray-400 cursor-pointer"
                        />

                        <div className="flex justify-between text-[9px] font-bold text-black uppercase tracking-tight mb-3">
                            <span>Off</span>
                            <span>Ita</span>
                            <span>Mex</span>
                            <span>Hip</span>
                            <span>News</span>
                        </div>

                        <div className="bg-[#c0c0c0] border-t border-l border-white border-b border-r border-black p-2 text-center h-8 flex items-center justify-center font-bold text-[10px] text-black shadow-inner overflow-hidden">
                            {radioChannel === 0 && <span className="opacity-50">(System Muted)</span>}
                            {radioChannel === 1 && <span>Playing: Tarantella.mid</span>}
                            {radioChannel === 2 && <span>Playing: Corrido.wav</span>}
                            {radioChannel === 3 && <span>Playing: BassLoop.mp3</span>}
                            {radioChannel === 4 && <span className="text-red-700 animate-pulse">⚠ EMERGENCY BROADCAST ⚠</span>}
                        </div>
                    </fieldset>

                    {/* Display Section */}
                    <fieldset className="border border-gray-400 p-2 mb-4 relative">
                        <legend className="text-[11px] text-black px-1 ml-1 bg-white">System Settings</legend>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="fxToggle"
                                    checked={visualEffectsEnabled}
                                    onChange={(e) => onToggleVisualEffects(e.target.checked)}
                                    className="w-4 h-4 accent-[#000080]"
                                />
                                <label htmlFor="fxToggle" className="text-[11px] font-bold text-black cursor-pointer">
                                    Enable Weather & Night FX
                                </label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="advisorToggle"
                                    checked={consigliereEnabled}
                                    onChange={(e) => onToggleConsigliere(e.target.checked)}
                                    className="w-4 h-4 accent-[#000080]"
                                />
                                <label htmlFor="advisorToggle" className="text-[11px] font-bold text-black cursor-pointer">
                                    Enable Advisor Popups
                                </label>
                            </div>
                            {/* Camera Toggle */}
                            {setCameraMode && (
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        id="cameraToggle"
                                        checked={cameraMode === 'cinematic'}
                                        onChange={(e) => setCameraMode(e.target.checked ? 'cinematic' : 'default')}
                                        className="w-4 h-4 accent-[#000080]"
                                    />
                                    <label htmlFor="cameraToggle" className="text-[11px] font-bold text-black cursor-pointer">
                                        Cinematic 3D Camera
                                    </label>
                                </div>
                            )}
                        </div>
                    </fieldset>

                    {/* Session Section */}
                    <fieldset className="border border-gray-400 p-2 relative">
                        <legend className="text-[11px] text-black px-1 ml-1 bg-white">Session</legend>
                        <button 
                            onClick={onLogout} 
                            className="w-full py-1.5 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black text-black font-bold text-[11px] uppercase active:border-t-black active:border-l-black active:border-b-white active:border-r-white active:bg-gray-400 mb-1"
                        >
                            Exit Windows
                        </button>
                    </fieldset>

                </div>
            </div>
        </div>
    );
};

export default SettingsWindow;
