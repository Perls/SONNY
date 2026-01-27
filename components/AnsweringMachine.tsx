
import React, { useState, useRef, useEffect } from 'react';
import { PhoneMessage } from '../types';
import { useGameEngine } from '../contexts/GameEngineContext';

interface AnsweringMachineProps {
    messages: PhoneMessage[];
    onBack: () => void;
    currentMemo?: string;
    onSaveMemo?: (memo: string) => void;
}

type MachineState = 'idle' | 'prompt_delete' | 'rewind' | 'countdown' | 'recording_input';

const AnsweringMachine: React.FC<AnsweringMachineProps> = ({ messages, onBack, currentMemo, onSaveMemo }) => {
    const { handleDeleteMessage, handleMarkMessageRead } = useGameEngine();
    const [viewingMessageId, setViewingMessageId] = useState<string | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    const [machineState, setMachineState] = useState<MachineState>('idle');
    const [lcdText, setLcdText] = useState<string | null>(null);
    const [customMemo, setCustomMemo] = useState("");
    const [recordingTime, setRecordingTime] = useState(15);
    const [saveIndicator, setSaveIndicator] = useState(false);

    const activeMessage = messages.find(m => m.id === viewingMessageId);
    
    // Sort by timestamp descending (newest first)
    const sortedMessages = [...messages].sort((a, b) => b.timestamp - a.timestamp);
    
    // Count unread messages for the display
    const unreadCount = messages.filter(m => !m.isRead).length;

    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            // Stop speaking when unmounting/closing
            window.speechSynthesis.cancel();
        };
    }, []);

    // KEY LISTENER FOR PROMPT STATE
    useEffect(() => {
        if (machineState !== 'prompt_delete') return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toUpperCase();
            if (key === 'Y') {
                startRewindSequence();
            } else if (key === 'N') {
                setMachineState('idle');
                setLcdText(null);
                playTone(200, 'square', 0.1); // Cancel beep
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [machineState]);

    // RECORDING TIMER
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (machineState === 'recording_input') {
            setRecordingTime(15);
            timer = setInterval(() => {
                setRecordingTime(prev => Math.max(0, prev - 1));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [machineState]);

    // AUTO-STOP ON TIMER END
    useEffect(() => {
        if (machineState === 'recording_input' && recordingTime === 0) {
            // Save logic
            if (onSaveMemo && customMemo.trim()) {
                onSaveMemo(customMemo);
            }
            finishRecording();
        }
    }, [recordingTime, machineState]);

    const playTone = (freq: number, type: OscillatorType, duration: number) => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') ctx.resume();
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    };

    const handlePlay = (id: string, text: string) => {
        // Stop any current speech
        window.speechSynthesis.cancel();

        // 1. Play mechanical beep
        playTone(800, 'sine', 0.15); 
        
        setViewingMessageId(id);
        handleMarkMessageRead(id);

        // 2. TTS Logic
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Attempt to find a gritty voice, fallback to default
        const voices = window.speechSynthesis.getVoices();
        // Prefer a deeper/male voice for noir feel if available, else default
        const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;
        
        utterance.rate = 0.9; // Slightly slower/more deliberate
        utterance.pitch = 0.8; // Lower pitch
        utterance.volume = 0.8;

        // Small delay to let the beep finish
        setTimeout(() => {
            window.speechSynthesis.speak(utterance);
        }, 200);
    };

    const handleRewind = () => {
        if (activeMessage) {
            handlePlay(activeMessage.id, activeMessage.body);
        }
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        playTone(200, 'square', 0.1); // Clunk sound
        setViewingMessageId(null);
        setMachineState('idle');
        setLcdText(null);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (viewingMessageId === id) {
            window.speechSynthesis.cancel();
            setViewingMessageId(null);
        }
        playTone(400, 'sawtooth', 0.1); // Click
        handleDeleteMessage(id);
    };

    // --- RECORD MEMO LOGIC ---
    const finishRecording = () => {
        playTone(800, 'sine', 0.2);
        setLcdText("MESSAGE\nRECORDED");
        setSaveIndicator(true);
        setTimeout(() => {
            setMachineState('idle');
            setLcdText(null);
            setSaveIndicator(false);
        }, 1500);
    };

    const handleRecClick = () => {
        if (machineState === 'idle') {
            setMachineState('prompt_delete');
            setLcdText("DO YOU WANT TO\nDELETE YOUR PREVIOUS\nRECORDED MEMO?\n\nTYPE Y/N");
            playTone(600, 'sine', 0.1);
        } else if (machineState === 'recording_input') {
            // Save logic
            if (onSaveMemo && customMemo.trim()) {
                onSaveMemo(customMemo);
            }
            finishRecording();
        }
    };

    const startRewindSequence = () => {
        setMachineState('rewind');
        setLcdText("REWINDING...");
        
        // Aggressive Rewind Sound Simulation
        playTone(150, 'sawtooth', 0.1);
        setTimeout(() => playTone(200, 'sawtooth', 0.1), 100);
        setTimeout(() => playTone(300, 'sawtooth', 0.8), 200); // Whirring up
        
        setTimeout(() => {
            startCountdown();
        }, 1500); // 1.5s Rewind
    };

    const startCountdown = () => {
        setMachineState('countdown');
        let count = 3;
        
        const tick = () => {
            if (count > 0) {
                setLcdText(`RECORD YOUR\nMEMO NOW\n\n${count}...`);
                playTone(800, 'square', 0.1);
                count--;
                setTimeout(tick, 1000);
            } else {
                setMachineState('recording_input');
                setCustomMemo(""); // Reset for new input
                setLcdText(null); // Clear prompt so input shows
                playTone(1200, 'sine', 0.5); // Long beep
            }
        };
        
        tick();
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#111] p-4 font-waze">
            {/* Nav */}
            <button onClick={() => { handleStop(); onBack(); }} className="self-start text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white mb-2 flex items-center gap-2">
                <span>←</span> Back to Phone
            </button>

            <div className="flex-grow bg-[#222] rounded-lg shadow-2xl border-t-8 border-gray-700 border-b-[16px] border-black p-6 relative flex flex-col">
                
                {/* Branding & Counter Header */}
                <div className="flex justify-between items-start mb-6">
                     <div className="flex flex-col">
                         <div className="text-gray-400 font-black italic tracking-widest text-lg uppercase">
                            KB Electronics <span className="text-white not-italic font-mono">VS-300</span>
                        </div>
                        {/* Grille Texture */}
                        <div className="w-32 h-6 bg-gray-800 rounded border border-gray-600 mt-2" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 2px, #000 2px 4px)' }}></div>
                    </div>

                    {/* Digital Counter (Unread Count) - Integrated into header area */}
                    <div className="bg-black p-2 rounded border-4 border-gray-600 shadow-[inset_0_0_10px_black] w-24 flex flex-col items-center justify-center shrink-0">
                        <div className="text-[8px] text-gray-500 uppercase font-bold mb-1">Messages</div>
                        <div className={`font-mono text-4xl font-black tracking-widest ${unreadCount > 0 ? 'text-red-600 animate-pulse text-shadow-red' : 'text-red-900'}`}>
                            {String(unreadCount).padStart(2, '0')}
                        </div>
                    </div>
                </div>

                {/* Main Deck Area - Centered Cassette */}
                <div className="flex justify-center mb-6">
                    {/* Fixed Aspect Ratio Container for Cassette */}
                    <div className="bg-[#1a1a1a] rounded border-2 border-gray-600 relative overflow-hidden shadow-inner p-4 w-[300px] h-[190px] flex items-center justify-center">
                        <div className="w-full h-full border-2 border-gray-500 rounded flex items-center justify-between px-4 bg-[#2a2a2a] shadow-inner relative">
                            {/* Tape Spool Left */}
                            <div className={`w-20 h-20 rounded-full border-4 border-white/20 border-dashed 
                                ${viewingMessageId || machineState === 'recording_input' ? 'animate-[spin_4s_linear_infinite]' : ''} 
                                ${machineState === 'rewind' ? 'animate-[spin_0.2s_linear_infinite_reverse]' : ''}
                                flex items-center justify-center relative bg-black`}>
                                <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                                {/* Spool teeth */}
                                <div className="absolute inset-0 border-[6px] border-transparent border-t-white/10 rounded-full"></div>
                            </div>
                            
                            {/* Tape Window / Middle */}
                            <div className="flex-grow h-24 mx-2 relative flex flex-col items-center justify-center">
                                 <div className="w-full h-12 bg-white/10 border-x border-white/20 relative overflow-hidden mb-2 rounded-sm">
                                     {(viewingMessageId || machineState === 'recording_input') && <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-black/50 animate-pulse"></div>}
                                 </div>
                                 <div className="text-[6px] text-white/30 uppercase font-black tracking-widest">Hi-Fidelity</div>
                            </div>

                            {/* Tape Spool Right */}
                            <div className={`w-20 h-20 rounded-full border-4 border-white/20 border-dashed 
                                ${viewingMessageId || machineState === 'recording_input' ? 'animate-[spin_4s_linear_infinite]' : ''}
                                ${machineState === 'rewind' ? 'animate-[spin_0.2s_linear_infinite_reverse]' : ''}
                                flex items-center justify-center relative bg-black`}>
                                <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                                <div className="absolute inset-0 border-[6px] border-transparent border-t-white/10 rounded-full rotate-90"></div>
                            </div>
                        </div>
                        {/* Glass Reflection */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
                    </div>
                </div>

                {/* LCD Screen (Message Content) */}
                <div className="bg-[#9ca04b] border-4 border-gray-500 rounded-sm p-3 shadow-[inset_0_0_15px_rgba(0,0,0,0.2)] flex-grow font-mono relative overflow-hidden mb-6 mx-4">
                    <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/pixel-weave.png')]"></div>
                    
                    {saveIndicator && (
                        <div className="absolute top-2 right-2 border-2 border-black/20 px-2 py-1 rounded bg-black/5 animate-pulse z-20">
                            <span className="text-[10px] font-black text-black/50 uppercase tracking-widest">● SAVED</span>
                        </div>
                    )}

                    {machineState === 'recording_input' ? (
                        // RECORDING INPUT STATE
                        <div className="relative z-10 h-full flex flex-col items-center text-center">
                            <div className="text-[10px] font-black animate-pulse text-red-900 mb-1 w-full flex justify-between">
                                <span>** RECORDING **</span>
                                <span>REC</span>
                            </div>
                            <textarea 
                                autoFocus
                                value={customMemo}
                                onChange={(e) => setCustomMemo(e.target.value.toUpperCase())}
                                placeholder="SPEAK AFTER THE BEEP..."
                                className="w-full h-full bg-transparent border-none outline-none font-mono text-sm font-bold text-black/90 uppercase resize-none placeholder:text-black/30 leading-relaxed"
                                maxLength={140}
                            />
                            {/* LED Countdown */}
                            <div className="absolute bottom-2 right-2 text-2xl font-black text-black/20 font-digital tracking-widest z-0 pointer-events-none select-none">
                                00:{String(recordingTime).padStart(2, '0')}
                            </div>
                            <div className="text-[9px] text-black/50 mt-1">PRESS REC TO SAVE / STOP TO CANCEL</div>
                        </div>
                    ) : lcdText ? (
                        // Custom System Message (Prompt / Countdown / Save Confirm)
                        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
                            <pre className="font-black text-black/80 text-sm whitespace-pre-wrap font-mono uppercase leading-relaxed">
                                {lcdText}
                            </pre>
                            {(machineState === 'prompt_delete') && (
                                <div className="absolute bottom-2 w-full text-[10px] animate-pulse text-black/50">WAITING FOR INPUT...</div>
                            )}
                        </div>
                    ) : activeMessage ? (
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="flex justify-between border-b-2 border-black/20 pb-2 mb-2 text-black/70 text-xs font-bold uppercase">
                                <span>FROM: {activeMessage.sender}</span>
                                <span>{new Date(activeMessage.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div className="flex-grow text-black text-sm font-bold uppercase leading-relaxed overflow-y-auto custom-scrollbar pr-2">
                                "{activeMessage.body}"
                            </div>
                            <div className="mt-2 text-[10px] text-black/50 text-right animate-pulse">PLAYING...</div>
                        </div>
                    ) : (
                        <div className="relative z-10 h-full overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-black/20 scrollbar-track-transparent">
                            {sortedMessages.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-black/40 font-bold uppercase text-sm animate-pulse">
                                    NO MESSAGES
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {sortedMessages.map((msg, i) => (
                                        <div 
                                            key={msg.id}
                                            onClick={() => handlePlay(msg.id, msg.body)}
                                            className={`flex justify-between items-center p-2 cursor-pointer border-b border-black/10 transition-colors group h-12
                                                ${!msg.isRead ? 'bg-black/10 font-black' : 'bg-transparent hover:bg-black/5'}
                                            `}
                                        >
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-black text-xs uppercase truncate max-w-[200px]">{msg.sender || "Unknown"}</span>
                                                <span className="text-black/60 text-[9px]">{new Date(msg.timestamp).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {!msg.isRead && <span className="text-[8px] font-black text-white bg-red-600 px-1 rounded animate-pulse">NEW</span>}
                                                <button 
                                                    onClick={(e) => handleDelete(e, msg.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-red-600 font-bold px-2 hover:bg-black/10 rounded text-[9px]"
                                                >
                                                    DEL
                                                </button>
                                                <span className="text-black/60 text-lg">▶</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Physical Buttons */}
                <div className="flex justify-center gap-4 mt-auto border-t border-gray-700 pt-6">
                    <button 
                        onClick={handleStop}
                        className="w-20 h-12 bg-gray-300 border-b-4 border-gray-500 rounded active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center shadow-lg active:shadow-none group"
                    >
                        <div className="w-4 h-4 bg-black mb-1 group-active:bg-gray-800"></div>
                        <span className="text-[8px] font-black uppercase text-gray-600">Stop/Eject</span>
                    </button>
                    
                    <button 
                        disabled={messages.length === 0}
                        onClick={() => sortedMessages.length > 0 && handlePlay(sortedMessages[0].id, sortedMessages[0].body)}
                        className="w-20 h-12 bg-gray-300 border-b-4 border-gray-500 rounded active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center shadow-lg active:shadow-none"
                    >
                        <div className="w-0 h-0 border-l-[12px] border-l-black border-y-[8px] border-y-transparent mb-1 ml-1"></div>
                        <span className="text-[8px] font-black uppercase text-gray-600">Play All</span>
                    </button>
                    
                    <button 
                        onClick={handleRewind}
                        className="w-20 h-12 bg-gray-300 border-b-4 border-gray-500 rounded active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center shadow-lg active:shadow-none"
                    >
                        <div className="flex gap-1 mb-1">
                            <div className="w-0 h-0 border-r-[8px] border-r-black border-y-[5px] border-y-transparent"></div>
                            <div className="w-0 h-0 border-r-[8px] border-r-black border-y-[5px] border-y-transparent"></div>
                        </div>
                        <span className="text-[8px] font-black uppercase text-gray-600">Rewind</span>
                    </button>
                    
                    <button 
                        onClick={handleRecClick}
                        className={`w-20 h-12 bg-red-800 border-b-4 border-red-950 rounded active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center shadow-lg active:shadow-none group
                            ${machineState !== 'idle' && machineState !== 'recording_input' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'}
                        `}
                        disabled={machineState !== 'idle' && machineState !== 'recording_input'}
                    >
                        <div className={`w-3 h-3 rounded-full bg-red-500 group-hover:bg-red-400 mb-1 shadow-[0_0_5px_red] group-active:bg-red-600 ${machineState === 'recording_input' ? 'animate-pulse bg-white' : ''}`}></div>
                        <span className="text-[8px] font-black uppercase text-red-200">Rec Memo</span>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AnsweringMachine;
