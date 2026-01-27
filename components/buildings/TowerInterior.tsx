
import React, { useState } from 'react';

interface TowerInteriorProps {
    onClose: () => void;
    // Add interactions if needed (e.g. for Law Firm)
    onReduceHeat?: (amount: number, cost: number) => void;
}

const TowerInterior: React.FC<TowerInteriorProps> = ({ onClose, onReduceHeat }) => {
    const [activeLevel, setActiveLevel] = useState<number | null>(null);
    const [elevatorFloor, setElevatorFloor] = useState(1);

    const LEVELS = [
        { id: 10, name: "Penthouse Suites", type: "restricted", desc: "Private Residence" },
        { id: 9, name: "Executive Offices", type: "restricted", desc: "Leased" },
        { id: 8, name: "Trading Floor", type: "restricted", desc: "Vacant" },
        { id: 7, name: "Server Farm", type: "restricted", desc: "Maintenance Only" },
        { id: 6, name: "Archive Storage", type: "restricted", desc: "Classified" },
        { id: 5, name: "Conference Center", type: "restricted", desc: "Booked" },
        { id: 4, name: "Overflow Workspace", type: "restricted", desc: "Vacant" },
        { id: 3, name: "Start-up Incubator", type: "restricted", desc: "Renovations" },
        { id: 2, name: "NetLink Hub", type: "communication", desc: "Public Access Terminal" },
        { id: 1, name: "Dewey, Cheatham & Howe", type: "law", desc: "Attorneys at Law" },
    ];

    const handleFloorSelect = (level: number) => {
        setElevatorFloor(level);
        setActiveLevel(level);
    };

    return (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center font-waze animate-fade-in p-6">
            <div className="bg-slate-50 w-full max-w-4xl rounded-2xl shadow-2xl border-4 border-slate-300 overflow-hidden flex h-[700px] relative">
                
                {/* Left: Elevator Panel */}
                <div className="w-1/3 bg-slate-200 border-r border-slate-300 flex flex-col p-6 relative">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-black font-news uppercase text-slate-800 tracking-tight">The Tower</h2>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Directory</div>
                    </div>

                    <div className="flex-grow flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2">
                        {LEVELS.map(lvl => (
                            <button
                                key={lvl.id}
                                onClick={() => handleFloorSelect(lvl.id)}
                                className={`
                                    flex items-center gap-4 p-3 rounded-lg border-2 transition-all group relative
                                    ${elevatorFloor === lvl.id 
                                        ? 'bg-white border-amber-400 shadow-md z-10' 
                                        : 'bg-slate-100 border-slate-200 hover:border-slate-400'
                                    }
                                `}
                            >
                                <div className={`
                                    w-8 h-8 rounded flex items-center justify-center font-mono font-black text-sm border
                                    ${elevatorFloor === lvl.id ? 'bg-amber-500 text-white border-amber-600' : 'bg-slate-300 text-slate-500 border-slate-400'}
                                `}>
                                    {lvl.id}
                                </div>
                                <div className="text-left min-w-0">
                                    <div className={`text-xs font-black uppercase truncate ${elevatorFloor === lvl.id ? 'text-slate-900' : 'text-slate-600'}`}>
                                        {lvl.name}
                                    </div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide truncate">
                                        {lvl.desc}
                                    </div>
                                </div>
                                {lvl.type !== 'restricted' && (
                                    <div className="absolute right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={onClose} 
                        className="mt-6 w-full py-3 bg-slate-800 text-white font-black uppercase text-xs rounded-lg hover:bg-slate-700 transition-colors shadow-lg"
                    >
                        Exit Building
                    </button>
                </div>

                {/* Right: Floor View */}
                <div className="w-2/3 bg-white relative flex flex-col">
                    {/* Floor Indicator Overlay */}
                    <div className="absolute top-6 right-6 font-mono text-6xl font-black text-slate-100 select-none pointer-events-none">
                        {elevatorFloor < 10 ? `0${elevatorFloor}` : elevatorFloor}
                    </div>

                    <div className="flex-grow flex items-center justify-center p-12">
                        {activeLevel === 1 && (
                            <div className="text-center w-full max-w-md animate-slide-up">
                                <div className="text-6xl mb-4">⚖️</div>
                                <h3 className="text-3xl font-black font-news text-slate-800 uppercase mb-2">Dewey, Cheatham & Howe</h3>
                                <p className="text-slate-500 text-sm mb-8 italic">"We fight for your rights, so you can fight in the streets."</p>
                                
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Legal Services</div>
                                    <button 
                                        className="w-full py-4 bg-slate-900 text-amber-500 font-black uppercase rounded-lg hover:bg-slate-800 shadow-md flex justify-between px-6 items-center group disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => onReduceHeat && onReduceHeat(20, 1000)}
                                    >
                                        <span>File Injunction</span>
                                        <span className="text-white group-hover:text-amber-200 font-mono">N$ 1,000</span>
                                    </button>
                                    <p className="text-[10px] text-slate-400 mt-2 text-center">Reduces Heat by 20 points.</p>
                                </div>
                            </div>
                        )}

                        {activeLevel === 2 && (
                            <div className="text-center w-full max-w-md animate-slide-up">
                                <div className="text-6xl mb-4">📡</div>
                                <h3 className="text-3xl font-black font-news text-slate-800 uppercase mb-2">NetLink Hub</h3>
                                <p className="text-slate-500 text-sm mb-8 italic">"Global connection. Local prices."</p>
                                
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Terminal Access</div>
                                    <button className="w-full py-4 bg-blue-600 text-white font-black uppercase rounded-lg hover:bg-blue-50 shadow-md mb-2">
                                        Check Dark Web Markets
                                    </button>
                                    <button className="w-full py-4 bg-slate-200 text-slate-500 font-black uppercase rounded-lg cursor-not-allowed">
                                        Hack Police Frequency (Locked)
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeLevel && activeLevel > 2 && (
                            <div className="text-center opacity-50 animate-fade-in">
                                <div className="text-6xl mb-4 grayscale">🚪</div>
                                <h3 className="text-2xl font-black text-slate-400 uppercase">Restricted Access</h3>
                                <p className="text-slate-400 text-xs mt-2 font-mono">Keycard Required for Entry</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TowerInterior;
