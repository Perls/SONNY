
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { GameState, ClassType, ReportData, InventoryItem } from '../types';
import { CLASSES } from '../constants';
import { useGameEngine } from '../contexts/GameEngineContext';

interface JournalScreenProps {
    gameState: GameState;
}

// Persist notes via local storage since we can't change GameState schema easily
const loadNotes = (saveId: string): string => localStorage.getItem(`notes_${saveId}`) || "";
const saveNotes = (saveId: string, text: string) => localStorage.setItem(`notes_${saveId}`, text);

// Persist drawing via local storage
const loadDrawing = (saveId: string): string | null => localStorage.getItem(`drawing_${saveId}`);
const saveDrawing = (saveId: string, data: string) => localStorage.setItem(`drawing_${saveId}`, data);

// Pencil Cursor SVG (Data URI) - Tip aligned to bottom-left (0, 32)
// Adjusted viewBox and rotation to make the tip hit 0, 24 (which maps to 0, 32)
const PENCIL_CURSOR = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23262626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>') 2 30, auto`;

const JournalScreen: React.FC<JournalScreenProps> = ({ gameState }) => {
    const { handleAddSpeedDial, updateSave, triggerFeedback } = useGameEngine();
    const [activeTab, setActiveTab] = useState<'log' | 'friends' | 'notes'>('log');
    const [selectedDate, setSelectedDate] = useState<string>('All');
    
    // Default friends list if none exists in save
    const friends = gameState.friends || [];
    const myNumber = gameState.playerPhoneNumber || '#917-UNK-NOWN';
    const leader = gameState.crew.find(c => c.isLeader) || gameState.crew[0];

    // --- NOTES STATE ---
    const [noteText, setNoteText] = useState(loadNotes(gameState.id));
    const [noteMode, setNoteMode] = useState<'write' | 'draw'>('write');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    
    // Initialize Canvas
    useEffect(() => {
        if (activeTab === 'notes' && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            const savedData = loadDrawing(gameState.id);
            
            if (ctx && savedData) {
                const img = new Image();
                img.onload = () => ctx.drawImage(img, 0, 0);
                img.src = savedData;
            }
        }
    }, [activeTab, gameState.id]);

    const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNoteText(e.target.value);
        saveNotes(gameState.id, e.target.value);
    };

    const getCanvasPoint = (e: React.MouseEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (noteMode !== 'draw') return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        setIsDrawing(true);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const point = getCanvasPoint(e, canvas);
        
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.strokeStyle = '#262626'; // Pen color
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing || noteMode !== 'draw') return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const point = getCanvasPoint(e, canvas);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
        if (canvasRef.current) {
            saveDrawing(gameState.id, canvasRef.current.toDataURL());
        }
    };

    const clearDrawing = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            saveDrawing(gameState.id, '');
        }
    };

    const handleSaveAsItem = () => {
        if (gameState.inventory.length >= 20) {
            triggerFeedback("Inventory Full!", 'error');
            return;
        }

        const drawingData = canvasRef.current ? canvasRef.current.toDataURL() : undefined;
        const isSmuggler = leader.classType === ClassType.Smuggler;
        
        // Create a new Report Item
        const reportData: ReportData = {
            bossName: leader.name,
            crewNames: [leader.name],
            location: isSmuggler ? "Classified" : "Personal Notes",
            body: noteText || "(Handwritten Note)",
            timestamp: Date.now(),
            quality: isSmuggler ? 'High' : 'Low', // Smuggler gets clean Intel, others get crumpled notes
            image: drawingData
        };

        const newItem: InventoryItem = {
            id: Math.random().toString(36).substr(2, 9),
            itemId: 'intel_report',
            quantity: 1,
            customName: isSmuggler ? 'Intel Report' : 'Crumpled Note',
            description: isSmuggler ? 'Official dossier.' : 'A scribbled note, possibly sweat-stained.',
            reportData: reportData
        };

        const newInventory = [...gameState.inventory, newItem];
        updateSave({ ...gameState, inventory: newInventory });
        triggerFeedback("Note Saved to Inventory!", 'success');
    };

    // --- MERGED LOGIC FOR LOGS & CALLS ---
    const { dates, filteredLogs } = useMemo(() => {
        const combatLogs = (gameState.journal || []).map(l => ({ ...l, entryType: 'combat', sortTime: l.date }));
        
        // Merge Calls into the log stream
        const calls = (gameState.playerHousing?.messages || []).map(m => ({
            id: m.id,
            date: m.timestamp,
            sortTime: m.timestamp,
            entryType: 'call',
            sender: m.sender,
            body: m.body
        }));

        const allEntries = [...combatLogs, ...calls].sort((a, b) => b.sortTime - a.sortTime);
        
        // Get unique dates
        const dateSet = new Set<string>();
        allEntries.forEach(log => {
            dateSet.add(new Date(log.sortTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
        });
        const uniqueDates = Array.from(dateSet); 

        // Filter
        let filtered = allEntries;
        if (selectedDate !== 'All') {
            filtered = allEntries.filter(log => 
                new Date(log.sortTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) === selectedDate
            );
        }

        return { dates: uniqueDates, filteredLogs: filtered };
    }, [gameState.journal, gameState.playerHousing?.messages, selectedDate]);

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Online': return 'text-emerald-500';
            case 'Busy': return 'text-red-500';
            default: return 'text-slate-400';
        }
    };

    const getClassIcon = (type: ClassType) => {
        switch(type) {
            case ClassType.Thug: return '🔨';
            case ClassType.Smuggler: return '👻';
            case ClassType.Dealer: return '🧪';
            case ClassType.Entertainer: return '🎤';
            case ClassType.Hustler: return '💰';
            default: return '♟️';
        }
    };

    // Helper to check if a name belongs to a buttonman
    const getButtonmanStatus = (name: string) => {
        // Simple fuzzy match or check against friends list
        const friend = friends.find(f => f.isButtonman && name.toLowerCase().includes(f.name.toLowerCase().split(' ')[0]));
        return !!friend;
    };

    return (
        <div className="h-full bg-slate-50 flex flex-col font-waze overflow-hidden">
            
            {/* Header Tabs */}
            <div className="bg-slate-900 px-6 pt-4 flex gap-4 shrink-0">
                <button 
                    onClick={() => setActiveTab('log')}
                    className={`px-6 py-3 rounded-t-lg font-black uppercase tracking-widest text-xs transition-colors
                        ${activeTab === 'log' ? 'bg-slate-50 text-slate-900' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}
                    `}
                >
                    Log
                </button>
                <button 
                    onClick={() => setActiveTab('friends')}
                    className={`px-6 py-3 rounded-t-lg font-black uppercase tracking-widest text-xs transition-colors flex items-center gap-2
                        ${activeTab === 'friends' ? 'bg-slate-50 text-slate-900' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}
                    `}
                >
                    <span>Contacts</span>
                    <span className="bg-amber-500 text-slate-900 px-1.5 rounded-full text-[9px]">{friends.length}</span>
                </button>
                <button 
                    onClick={() => setActiveTab('notes')}
                    className={`px-6 py-3 rounded-t-lg font-black uppercase tracking-widest text-xs transition-colors
                        ${activeTab === 'notes' ? 'bg-slate-50 text-slate-900' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}
                    `}
                >
                    Notes
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-grow overflow-hidden flex relative bg-slate-50">
                
                {/* LOG VIEW */}
                {activeTab === 'log' && (
                    <div className="flex w-full h-full">
                        {/* Calendar Sidebar */}
                        <div className="w-40 bg-slate-200 border-r border-slate-300 flex flex-col overflow-y-auto custom-scrollbar flex-shrink-0">
                            <div className="p-3 text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-300/50 sticky top-0">
                                Date
                            </div>
                            <button
                                onClick={() => setSelectedDate('All')}
                                className={`p-3 text-left text-xs font-bold uppercase transition-colors border-b border-slate-300
                                    ${selectedDate === 'All' ? 'bg-white text-slate-900 border-l-4 border-l-amber-500' : 'text-slate-500 hover:bg-slate-100'}
                                `}
                            >
                                All Entries
                            </button>
                            {dates.map(date => (
                                <button
                                    key={date}
                                    onClick={() => setSelectedDate(date)}
                                    className={`p-3 text-left text-xs font-bold uppercase transition-colors border-b border-slate-300
                                        ${selectedDate === date ? 'bg-white text-slate-900 border-l-4 border-l-amber-500' : 'text-slate-500 hover:bg-slate-100'}
                                    `}
                                >
                                    {date}
                                </button>
                            ))}
                        </div>

                        {/* Log Entries */}
                        <div className="flex-grow overflow-y-auto custom-scrollbar p-6 bg-slate-50">
                            <div className="space-y-4">
                                {filteredLogs.length === 0 && (
                                    <div className="text-center text-slate-400 py-12 italic border-2 border-dashed border-slate-200 rounded-xl">
                                        No activity recorded for this period.
                                    </div>
                                )}
                                {filteredLogs.map((entry: any) => {
                                    if (entry.entryType === 'call') {
                                        // CALL LOG ENTRY
                                        const isButtonman = getButtonmanStatus(entry.sender);
                                        
                                        return (
                                            <div key={entry.id} className={`rounded-lg p-4 shadow-sm animate-fade-in group transition-colors border-l-4 ${isButtonman ? 'bg-amber-50 border-amber-500' : 'bg-white border-slate-300'}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                            <span>{new Date(entry.date).toLocaleDateString()}</span>
                                                            <span className="text-slate-300">•</span>
                                                            <span>{new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                            {isButtonman && <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-[9px]">BUTTONMAN CALL</span>}
                                                        </div>
                                                        <div className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                            <span>📞</span>
                                                            <span>{entry.sender}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-white/50 p-2 rounded text-xs font-mono text-slate-600 border border-slate-200/50">
                                                    "{entry.body}"
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        // COMBAT LOG ENTRY
                                        return (
                                            <div key={entry.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm animate-fade-in group hover:border-slate-300 transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                            <span>{new Date(entry.date).toLocaleDateString()}</span>
                                                            <span className="text-slate-300">•</span>
                                                            <span>{new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                        </div>
                                                        <div className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                            <span className={entry.result === 'won' ? 'text-emerald-500' : 'text-red-500'}>
                                                                {entry.result === 'won' ? 'VICTORY' : entry.result === 'draw' ? 'DRAW' : 'DEFEAT'}
                                                            </span>
                                                            <span className="text-slate-300 text-sm">vs</span> 
                                                            <span>{entry.enemyName}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        {entry.loot && (
                                                            <div className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100 inline-block">
                                                                {entry.loot}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {entry.casualties && entry.casualties.length > 0 ? (
                                                    <div className="mt-3 pt-3 border-t border-slate-100 bg-red-50/50 -mx-4 -mb-4 p-3 px-4 rounded-b-lg">
                                                        <div className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Casualties</div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {entry.casualties.map((name: string, i: number) => (
                                                                <span key={i} className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200 font-bold">💀 {name}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                                                        Zero Casualties
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* FRIENDS LIST VIEW */}
                {activeTab === 'friends' && (
                    <div className="flex-grow overflow-y-auto custom-scrollbar p-6 w-full">
                        <div className="flex flex-col gap-6 animate-fade-in max-w-2xl mx-auto">
                            
                            {/* Player Card */}
                            <div className="bg-slate-900 rounded-xl p-4 shadow-lg flex items-center gap-4 border-2 border-slate-800">
                                <div className="w-16 h-16 rounded-full border-2 border-amber-500 bg-slate-800 overflow-hidden relative">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.imageSeed}`} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-grow">
                                    <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-0.5">My Contact Card</div>
                                    <div className="text-xl font-black text-white font-news uppercase leading-none">{leader.name}</div>
                                    <div className="text-xs text-slate-400 font-mono mt-1 font-bold tracking-wide">{myNumber}</div>
                                </div>
                                <div className="text-3xl grayscale opacity-20">📱</div>
                            </div>

                            {/* Search / Filter Placeholder */}
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Search contacts..." 
                                    className="w-full bg-white border border-slate-200 rounded-lg py-2 px-4 pl-10 text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:border-amber-400"
                                />
                                <span className="absolute left-3 top-1/2 -translate-x-1/2 text-slate-300">🔍</span>
                            </div>

                            {/* List */}
                            <div className="space-y-3">
                                {friends.length === 0 && (
                                    <div className="text-center text-slate-400 py-8 italic bg-white rounded-xl border border-dashed border-slate-200">
                                        No contacts found. It's lonely at the top.
                                    </div>
                                )}
                                {friends.map(friend => (
                                    <div key={friend.id} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-4 hover:shadow-md transition-all group relative overflow-hidden">
                                        {/* Buttonman Highlight Strip */}
                                        {friend.isButtonman && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-amber-600"></div>
                                        )}

                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative flex-shrink-0 ml-1">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.imageSeed}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            {/* Status Dot */}
                                            <div className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${friend.status === 'Online' ? 'bg-emerald-500' : friend.status === 'Busy' ? 'bg-red-500' : 'bg-slate-400'}`}></div>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-bold text-slate-800 text-sm truncate">{friend.name}</span>
                                                {/* Class Badge */}
                                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1`}>
                                                    <span>{getClassIcon(friend.classType)}</span>
                                                    {CLASSES[friend.classType]?.label.replace('The ', '') || friend.classType}
                                                </span>
                                                
                                                {/* Buttonman Badge */}
                                                {friend.isButtonman && (
                                                    <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1 animate-pulse">
                                                        ★ BUTTONMAN
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                                                <span>Lvl {friend.level}</span>
                                                <span className="text-slate-300">•</span>
                                                <span className={getStatusColor(friend.status)}>{friend.status}</span>
                                            </div>
                                        </div>

                                        {/* Number & Actions */}
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <div className="font-mono text-xs font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                                {friend.phoneNumber}
                                            </div>
                                            {/* Add to Speed Dial Button */}
                                            <button 
                                                onClick={() => handleAddSpeedDial(friend.name, friend.phoneNumber)}
                                                className="text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-amber-600 hover:bg-amber-50 px-2 py-0.5 rounded transition-colors flex items-center gap-1"
                                                title="Add to Speed Dial"
                                            >
                                                <span>+</span> Speed Dial
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                )}

                {/* NOTES VIEW */}
                {activeTab === 'notes' && (
                    <div className="flex w-full h-full bg-[#e5e7eb] p-8 justify-center">
                        <div className="w-full max-w-3xl bg-[#fdfbf7] shadow-2xl relative flex flex-col h-full border border-slate-300">
                            {/* Paper Texture */}
                            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}></div>
                            
                            {/* Header */}
                            <div className="p-8 pb-2 border-b-2 border-red-200/50 relative z-10">
                                <div className="text-center font-black uppercase text-slate-400 tracking-[0.3em] text-xs mb-2">From The Desk Of</div>
                                <div className="text-center font-hand text-4xl text-slate-900">{leader.name}</div>
                            </div>
                            
                            {/* Controls */}
                            <div className="absolute top-4 right-4 z-20 flex gap-2">
                                <button 
                                    onClick={() => setNoteMode('write')}
                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${noteMode === 'write' ? 'bg-slate-800 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'}`}
                                    title="Type Mode"
                                >
                                    T
                                </button>
                                <button 
                                    onClick={() => setNoteMode('draw')}
                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${noteMode === 'draw' ? 'bg-slate-800 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'}`}
                                    title="Draw Mode"
                                >
                                    ✎
                                </button>
                                <button 
                                    onClick={handleSaveAsItem}
                                    className="w-8 h-8 rounded-full border-2 bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all"
                                    title="Save as Item"
                                >
                                    💾
                                </button>
                                {noteMode === 'draw' && (
                                    <button 
                                        onClick={clearDrawing}
                                        className="w-8 h-8 rounded-full border-2 bg-red-100 text-red-500 border-red-200 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                                        title="Clear Drawing"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Main Body */}
                            <div className="flex-grow relative overflow-hidden cursor-text">
                                {/* Lined Paper CSS */}
                                <div className="absolute inset-0 pointer-events-none opacity-20" style={{ 
                                    backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px)', 
                                    backgroundSize: '100% 32px',
                                    marginTop: '31px'
                                }}></div>
                                <div className="absolute top-0 bottom-0 left-12 w-px bg-red-300/50"></div>

                                {/* Text Area Layer */}
                                <textarea
                                    value={noteText}
                                    onChange={handleNoteChange}
                                    className={`
                                        absolute inset-0 w-full h-full bg-transparent resize-none p-0 pl-16 pr-8 pt-8
                                        font-hand text-2xl text-slate-800 leading-[32px] outline-none border-none
                                        ${noteMode === 'draw' ? 'pointer-events-none' : ''}
                                    `}
                                    placeholder="Start writing..."
                                    spellCheck={false}
                                />

                                {/* Drawing Canvas Layer */}
                                <canvas
                                    ref={canvasRef}
                                    width={800} // Fixed width for simplicity, ideal would be dynamic
                                    height={1000}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                    className={`absolute inset-0 w-full h-full z-10 ${noteMode === 'draw' ? 'cursor-none' : 'pointer-events-none'}`}
                                    style={noteMode === 'draw' ? { cursor: PENCIL_CURSOR } : {}}
                                />
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default JournalScreen;
