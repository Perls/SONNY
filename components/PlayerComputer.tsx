
import React, { useState, useEffect } from 'react';
import OregonTrail from './OregonTrail';

interface PlayerComputerProps {
    onClose: () => void;
    hasComputer: boolean;
}

type AppId = 'trail' | 'notepad' | 'terminal' | 'fileman' | 'none';

const Win3Window: React.FC<{ 
    title: string; 
    onClose: () => void; 
    children: React.ReactNode; 
    isActive: boolean;
    onFocus: () => void;
    x: number;
    y: number;
}> = ({ title, onClose, children, isActive, onFocus, x, y }) => {
    return (
        <div 
            className={`absolute flex flex-col border shadow-xl ${isActive ? 'z-50' : 'z-10'}`}
            style={{ 
                left: x, top: y, width: '600px', height: '400px',
                borderWidth: '4px',
                borderStyle: 'solid',
                borderColor: '#c0c0c0',
                boxShadow: '4px 4px 0px rgba(0,0,0,0.5)'
            }}
            onMouseDown={onFocus}
        >
            {/* Title Bar */}
            <div className={`h-6 px-1 flex justify-between items-center select-none ${isActive ? 'bg-[#000080]' : 'bg-white border-b border-black'}`}>
                <button 
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="w-5 h-4 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-black flex items-center justify-center font-bold text-[10px] active:bg-gray-400"
                >
                    -
                </button>
                <span className={`font-bold text-sm tracking-wide ${isActive ? 'text-white' : 'text-black'}`}>{title}</span>
                <div className="flex gap-0.5">
                    <div className="w-4 h-4 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-black flex items-center justify-center text-[8px]">▼</div>
                    <div className="w-4 h-4 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-black flex items-center justify-center text-[8px]">▲</div>
                </div>
            </div>

            {/* Menu Bar */}
            <div className="bg-white border-b border-black px-2 py-0.5 flex gap-4 text-xs select-none">
                <span className="underline cursor-pointer">F</span>ile
                <span className="underline cursor-pointer">E</span>dit
                <span className="underline cursor-pointer">S</span>earch
                <span className="underline cursor-pointer">H</span>elp
            </div>

            {/* Content */}
            <div className="flex-grow bg-white relative overflow-hidden border-t border-black">
                {children}
            </div>
        </div>
    );
};

const PlayerComputer: React.FC<PlayerComputerProps> = ({ onClose, hasComputer }) => {
    const [bootStep, setBootStep] = useState(0);
    const [bootLog, setBootLog] = useState<string[]>([]);
    const [openApps, setOpenApps] = useState<AppId[]>([]);
    const [activeApp, setActiveApp] = useState<AppId | null>(null);

    // Boot Sequence
    useEffect(() => {
        if (hasComputer) {
            const sequence = [
                { t: 0, txt: "AMIBIOS (C) 1991 American Megatrends Inc." },
                { t: 800, txt: "386DX-33MHz CPU Detected" },
                { t: 1600, txt: "Checking NVRAM..." },
                { t: 2400, txt: "640KB Base Memory OK" },
                { t: 3200, txt: "3072KB Extended Memory OK" },
                { t: 4000, txt: "" },
                { t: 4500, txt: "C:\\> HIMEM.SYS" },
                { t: 4800, txt: "HIMEM: DOS XMS Driver, Version 2.77" },
                { t: 5500, txt: "C:\\> SMARTDRV.EXE" },
                { t: 6000, txt: "C:\\> WIN" },
            ];

            sequence.forEach(step => {
                setTimeout(() => {
                    setBootLog(prev => [...prev, step.txt]);
                }, step.t);
            });

            setTimeout(() => setBootStep(1), 7500); // Launch GUI
        }
    }, [hasComputer]);

    const launchApp = (app: AppId) => {
        if (!openApps.includes(app)) {
            setOpenApps([...openApps, app]);
        }
        setActiveApp(app);
    };

    const closeApp = (app: AppId) => {
        setOpenApps(prev => prev.filter(a => a !== app));
        if (activeApp === app) setActiveApp(null);
    };

    return (
        <div className="absolute inset-0 z-[60] bg-black/70 backdrop-blur-md flex items-center justify-center font-sans animate-fade-in p-6">
            
            {/* MATCHING CONTAINER STYLE FROM PLAYER HOUSING */}
            <div className="bg-[#d4d4d0] w-full max-w-7xl rounded-2xl shadow-2xl border-4 border-[#888] overflow-hidden flex flex-col relative h-[850px]">
                
                {/* HEADER / BEZEL (h-24 matches PlayerHousing header) */}
                <div className="h-24 bg-[#c0c0c0] border-b-4 border-[#808080] flex items-center justify-between px-8 relative overflow-hidden shrink-0 shadow-md z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#e0e0e0] border-2 border-[#a0a0a0] inset-shadow rounded-sm flex items-center justify-center">
                            <div className="w-10 h-10 border border-black/10 bg-gradient-to-br from-blue-300 to-blue-500 rounded-sm shadow-inner relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/20 skew-x-12 transform -translate-x-2"></div>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-[#404040] font-serif tracking-tight italic drop-shadow-sm">WANG 3000</h1>
                            <div className="flex gap-2 mt-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e] animate-pulse"></div>
                                <span className="text-[10px] font-bold text-[#606060] uppercase tracking-widest">33MHz Turbo</span>
                            </div>
                        </div>
                    </div>

                    {/* CLOSE BUTTON - EXACT MATCH TO SAFEHOUSE */}
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 bg-[#e0e0e0] hover:bg-red-600 hover:text-white text-[#404040] rounded-full flex items-center justify-center font-bold transition-all shadow-md text-lg border-2 border-[#a0a0a0]"
                    >
                        ✕
                    </button>
                </div>

                {/* SCREEN CONTENT AREA */}
                <div className="flex-grow bg-black relative overflow-hidden p-6">
                    
                    {/* CRT Bezel Inner Shadow */}
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] z-50 rounded-lg"></div>
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-40 opacity-10"></div>

                    {/* SCREEN DISPLAY */}
                    <div className="w-full h-full bg-black relative overflow-hidden font-mono text-sm">
                        
                        {!hasComputer ? (
                            <div className="w-full h-full flex items-center justify-center flex-col text-amber-500 animate-pulse">
                                <div className="border-2 border-amber-500 p-4 text-center">
                                    <h2 className="text-2xl font-bold mb-2">NO SIGNAL</h2>
                                    <p>CHECK VIDEO CABLE</p>
                                </div>
                            </div>
                        ) : bootStep === 0 ? (
                            <div className="p-8 text-[#cccccc]">
                                {bootLog.map((line, i) => (
                                    <div key={i} className="mb-1 whitespace-pre-wrap">{line}</div>
                                ))}
                                <div className="animate-pulse">_</div>
                            </div>
                        ) : (
                            /* WINDOWS 3.0 DESKTOP */
                            <div className="w-full h-full bg-[#008080] relative font-sans cursor-default select-none">
                                
                                {/* Program Manager (Main Shell) */}
                                <Win3Window title="Program Manager" onClose={() => {}} isActive={activeApp === null} onFocus={() => setActiveApp(null)} x={40} y={40}>
                                    <div className="w-full h-full bg-white p-2">
                                        <div className="border border-black h-full flex flex-col">
                                            <div className="bg-white border-b border-black px-1 flex justify-between items-center h-5">
                                                <button className="text-[10px] font-bold">-</button>
                                                <span className="text-[10px] font-bold mx-auto">Main</span>
                                                <button className="text-[10px] font-bold">▲</button>
                                            </div>
                                            <div className="p-4 grid grid-cols-4 gap-6 content-start">
                                                <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => launchApp('fileman')}>
                                                    <div className="w-8 h-8 bg-yellow-200 border border-black flex items-center justify-center text-lg">📁</div>
                                                    <span className="text-[10px] font-bold">File Manager</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => launchApp('terminal')}>
                                                    <div className="w-8 h-8 bg-gray-300 border border-black flex items-center justify-center text-lg">☎️</div>
                                                    <span className="text-[10px] font-bold">Terminal</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => launchApp('notepad')}>
                                                    <div className="w-8 h-8 bg-white border border-black flex items-center justify-center text-lg">📝</div>
                                                    <span className="text-[10px] font-bold">Notepad</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => launchApp('trail')}>
                                                    <div className="w-8 h-8 bg-green-700 border border-black flex items-center justify-center text-lg text-white">🐂</div>
                                                    <span className="text-[10px] font-bold">Oregon Trail</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Win3Window>

                                {/* Applications */}
                                {openApps.includes('trail') && (
                                    <Win3Window title="The Oregon Trail" onClose={() => closeApp('trail')} isActive={activeApp === 'trail'} onFocus={() => setActiveApp('trail')} x={100} y={80}>
                                        <OregonTrail onClose={() => closeApp('trail')} />
                                    </Win3Window>
                                )}

                                {openApps.includes('notepad') && (
                                    <Win3Window title="Notepad - README.TXT" onClose={() => closeApp('notepad')} isActive={activeApp === 'notepad'} onFocus={() => setActiveApp('notepad')} x={150} y={150}>
                                        <div className="p-2 font-mono text-sm h-full overflow-y-auto whitespace-pre">
{`
TODO LIST:
[x] Install new RAM
[ ] Call Mikey about the shipment
[ ] Beat high score on Trail
[ ] Find boot disk for DOOM

                         (__)
                         (oo)
                   /------\\/
                  / |    ||
                 *  ||----||
                    ~~    ~~
             "Have you hugged your cow today?"
`}
                                        </div>
                                    </Win3Window>
                                )}

                                {openApps.includes('terminal') && (
                                    <Win3Window title="Terminal - COM1" onClose={() => closeApp('terminal')} isActive={activeApp === 'terminal'} onFocus={() => setActiveApp('terminal')} x={200} y={200}>
                                        <div className="bg-black text-green-500 font-mono p-2 h-full text-xs">
                                            <p>ATDT 555-1024</p>
                                            <p>CONNECT 2400</p>
                                            <p>Welcome to UNDERGROUND BBS v2.1</p>
                                            <br/>
                                            <p>{'>'} LOGIN: ADMIN</p>
                                            <p>ACCESS GRANTED.</p>
                                            <br/>
                                            <p>--- MESSAGE BOARD ---</p>
                                            <p>[1] New shipment at Docks (User: SmugglerJoe)</p>
                                            <p>[2] Heat is high in Bronx (User: Watcher)</p>
                                            <br/>
                                            <span className="animate-pulse">_</span>
                                        </div>
                                    </Win3Window>
                                )}

                                {/* Minimized Icons */}
                                <div className="absolute bottom-2 left-2 flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-6 h-6 bg-gray-300 border border-black flex items-center justify-center text-xs">🖨️</div>
                                        <span className="text-[9px] text-white bg-[#008080] px-1">PrintMan</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-6 h-6 bg-gray-300 border border-black flex items-center justify-center text-xs">📋</div>
                                        <span className="text-[9px] text-white bg-[#008080] px-1">ClipBrd</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerComputer;
