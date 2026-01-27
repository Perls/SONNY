
import React, { useState, useRef, useEffect } from 'react';
import { PhoneMessage } from '../types';
import { useGameEngine } from '../contexts/GameEngineContext';
import AnsweringMachine from './AnsweringMachine';
import { CONNECTION_DATA } from '../data/connectionData';
import { PHONE_DIRECTORY } from '../data/phoneDirectory';

interface PhoneInterfaceProps {
    messages: PhoneMessage[];
    speedDials: { name: string, number: string }[];
    onBack?: () => void;
    onSaveSpeedDial: (index: number, name: string, number: string) => void;
    onClearSpeedDial: (index: number) => void;
}

// Corrected Keypad Mapping (Standard ITU E.161)
const KEYPAD_MAPPING = [
    { val: '1', letters: '' },
    { val: '2', letters: 'ABC' },
    { val: '3', letters: 'DEF' },
    { val: '4', letters: 'GHI' },
    { val: '5', letters: 'JKL' },
    { val: '6', letters: 'MNO' },
    { val: '7', letters: 'PQRS' },
    { val: '8', letters: 'TUV' },
    { val: '9', letters: 'WXYZ' },
    { val: '*', letters: '' },
    { val: '0', letters: 'OPER' },
    { val: '#', letters: '' },
];

const PhoneInterface: React.FC<PhoneInterfaceProps> = ({ messages, speedDials, onBack, onSaveSpeedDial, onClearSpeedDial }) => {
    const { handleSendPlayerMessage, gameState, updateSave } = useGameEngine();
    
    const hasUnread = messages.some(m => !m.isRead);

    // Comms State
    const [phoneMode, setPhoneMode] = useState<'dialer' | 'machine'>('dialer');
    const [dialInput, setDialInput] = useState(""); // Raw input string
    const [msgInput, setMsgInput] = useState(""); // Message body
    const [inputMode, setInputMode] = useState<'number' | 'message'>('number');
    const [connectionStatus, setConnectionStatus] = useState("PRESS SP-PHONE");
    
    // Dial Tone State
    const [isDialToneActive, setIsDialToneActive] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const dialToneOscillators = useRef<(OscillatorNode | null)[]>([]);
    const dialTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // T9/Multi-tap Logic State
    const [lastKeystrokeTime, setLastKeystrokeTime] = useState(0);
    const [lastKeyIndex, setLastKeyIndex] = useState<number | null>(null);

    const msgInputRef = useRef<HTMLTextAreaElement>(null);
    const friends = gameState?.friends || [];
    
    // --- AUDIO & INIT ---

    useEffect(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return () => {
            stopDialTone();
            if (audioContextRef.current) audioContextRef.current.close();
            window.speechSynthesis.cancel();
        };
    }, []);
    
    useEffect(() => {
        if (inputMode === 'message' && msgInputRef.current) {
            msgInputRef.current.focus();
        }
    }, [inputMode]);

    // TTS Helper - Only called explicitly for voice content
    const speakText = (text: string, rate: number = 1.1, pitch: number = 0.9) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;
        
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = 0.9;
        
        window.speechSynthesis.speak(utterance);
    };

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

    const playDialSequence = (input: string, onComplete: () => void) => {
        if (!input) {
            onComplete();
            return;
        }

        let i = 0;
        const interval = setInterval(() => {
            if (i >= input.length) {
                clearInterval(interval);
                onComplete();
                return;
            }
            
            // DTMF-ish tones
            const charCode = input.charCodeAt(i);
            const freq1 = 600 + (charCode % 5) * 50;
            const freq2 = 1200 + (charCode % 4) * 100;
            
            if (audioContextRef.current) {
                const ctx = audioContextRef.current;
                const osc1 = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc1.frequency.setValueAtTime(freq1, ctx.currentTime);
                osc2.frequency.setValueAtTime(freq2, ctx.currentTime);
                
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
                
                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(ctx.destination);
                
                osc1.start();
                osc2.start();
                osc1.stop(ctx.currentTime + 0.08);
                osc2.stop(ctx.currentTime + 0.08);
            }

            i++;
        }, 100); 
    };

    const startDialTone = () => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        if (isDialToneActive) return;

        // Standard US Dial Tone: 350Hz + 440Hz
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.frequency.setValueAtTime(350, ctx.currentTime);
        osc2.frequency.setValueAtTime(440, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.1, ctx.currentTime);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();

        dialToneOscillators.current = [osc1, osc2];
        setIsDialToneActive(true);
        setConnectionStatus("DIAL TONE ACTIVE");
        
        setDialInput("");

        if (dialTimeoutRef.current) clearTimeout(dialTimeoutRef.current);
        dialTimeoutRef.current = setTimeout(() => {
            stopDialTone();
            setConnectionStatus("LOST DIALTONE\nSIGNAL...");
            playTone(150, 'sawtooth', 0.5);
            playTone(150, 'sawtooth', 0.5);
            setTimeout(() => playTone(150, 'sawtooth', 0.5), 600);
        }, 20000);
    };

    const stopDialTone = () => {
        if (dialTimeoutRef.current) {
            clearTimeout(dialTimeoutRef.current);
            dialTimeoutRef.current = null;
        }

        dialToneOscillators.current.forEach(osc => {
            if (osc) {
                try { osc.stop(); osc.disconnect(); } catch (e) {}
            }
        });
        dialToneOscillators.current = [];
        setIsDialToneActive(false);
    };

    const toggleSpeakerPhone = () => {
        if (isDialToneActive) {
            stopDialTone();
            setDialInput("");
            setMsgInput("");
            setInputMode('number');
            setConnectionStatus("PRESS SP-PHONE");
            playTone(200, 'square', 0.1); 
            window.speechSynthesis.cancel();
        } else {
            startDialTone();
            playTone(800, 'square', 0.05); 
        }
    };

    const playKeyTone = () => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.type = 'square';
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    };

    const playOperatorTTS = () => {
        const OPERATOR_PHRASES = [
            "We're sorry, your call cannot be completed as dialed.",
            "Please check the number and try your call again.",
            "All circuits are busy. Please try again later.",
            "Operator. What city, please?",
            "For directory assistance, please hang up and dial 411."
        ];
        const phrase = OPERATOR_PHRASES[Math.floor(Math.random() * OPERATOR_PHRASES.length)];
        speakText(phrase, 1.1, 1.1);
        setConnectionStatus("OPERATOR...");
    };
    
    const handleSaveMemo = (newMemo: string) => {
        if (gameState && gameState.playerHousing) {
            const updatedHousing = { 
                ...gameState.playerHousing, 
                answeringMachineMemo: newMemo 
            };
            updateSave({ ...gameState, playerHousing: updatedHousing });
        }
    };

    const playStatusSequence = (msgs: string[]) => {
        let delay = 0;
        msgs.forEach((msg, index) => {
            const readingTime = Math.max(1500, msg.split(' ').length * 350); 
            
            setTimeout(() => {
                setConnectionStatus(msg);
                if (msg !== "CONNECTING..." && msg !== "RINGING..." && msg !== "BEEP..." && msg !== "PLAYING OGM...") {
                    speakText(msg.replace(/\n/g, ' '));
                } else if (msg === "BEEP...") {
                    playTone(1000, 'sine', 0.5);
                }
                
                if (index === msgs.length - 1) {
                    setInputMode('message');
                }
            }, delay);
            
            delay += readingTime;
        });
    };

    // --- LOGIC ---

    const startDialingSequence = (targetNumber: string) => {
        if (targetNumber === "0") {
            playOperatorTTS();
            return;
        }

        if (targetNumber.length !== 12) {
            setConnectionStatus("NUMBER INVALID\n10 DIGITS + 2 CHARS");
            playTone(150, 'sawtooth', 0.5); 
            return;
        }

        setConnectionStatus("DIALING...");
        playDialSequence(targetNumber, () => {
             performConnection(targetNumber);
        });
    };

    const performConnection = (targetNumber: string) => {
        
        // 1. CONNECTION_DATA (Starter Quest Contacts) Logic
        const connectionMatch = Object.values(CONNECTION_DATA).find(c => c.phoneNumberDial === targetNumber);
        if (connectionMatch) {
            playStatusSequence(connectionMatch.ogm);
            return;
        }

        // 2. PHONE_DIRECTORY (90s Easter Eggs) Logic
        const directoryMatch = PHONE_DIRECTORY.find(d => d.number === targetNumber);
        if (directoryMatch) {
            playStatusSequence(directoryMatch.ogm);
            return;
        }
        
        // 3. Player calling themselves
        const playerNum = gameState?.playerPhoneNumber ? gameState.playerPhoneNumber.replace(/[^a-zA-Z0-9]/g, '') : '';
        if (targetNumber === playerNum) {
            const memo = gameState?.playerHousing?.answeringMachineMemo || "NO MEMO RECORDED";
            playStatusSequence([
                "CONNECTING...",
                "RINGING...",
                "** MY VOICEMAIL **",
                "PLAYING OGM...",
                memo,
                "BEEP..."
            ]);
            return;
        }

        // 4. Friend/Unknown Logic
        const friend = friends.find(f => f.phoneNumber.replace(/[^a-zA-Z0-9]/g, '') === targetNumber);
        const contactName = friend ? friend.name.toUpperCase() : formatDisplayNumber(targetNumber);
        
        const introMsg = friend 
            ? `HI, YOU'VE REACHED\n${contactName}` 
            : `YOU HAVE REACHED\n${contactName}`;
            
        const unavailableMsg = "I CAN'T COME TO THE\nPHONE RIGHT NOW.";
        const actionMsg = "LEAVE A MESSAGE\nAFTER THE BEEP.";

        playStatusSequence([
            "CONNECTING...",
            "RINGING...",
            introMsg,
            unavailableMsg,
            actionMsg,
            "BEEP..."
        ]);
    };

    const handleKeypadClick = (key: typeof KEYPAD_MAPPING[0]) => {
        if (inputMode !== 'number') return;
        
        playKeyTone();
        
        if (isDialToneActive) {
             stopDialTone();
        } else if (dialInput === "") {
             setConnectionStatus("PICK UP PHONE");
             return;
        }

        const now = Date.now();
        const currentLen = dialInput.length;
        const keyIndex = KEYPAD_MAPPING.indexOf(key);

        if (currentLen < 10) {
            if (/[0-9]/.test(key.val)) {
                setDialInput(prev => prev + key.val);
            }
        } 
        else {
             if (key.letters.length > 0) {
                 const isSameKey = lastKeyIndex === keyIndex;
                 const isQuick = (now - lastKeystrokeTime < 1500);

                 if (currentLen === 10) {
                     setDialInput(prev => prev + key.letters[0]);
                     setLastKeystrokeTime(now);
                     setLastKeyIndex(keyIndex);
                 } else if (currentLen === 11) {
                     if (isSameKey && isQuick) {
                         const currentStr = dialInput;
                         const lastChar = currentStr.slice(-1);
                         const charIdx = key.letters.indexOf(lastChar);
                         if (charIdx !== -1) {
                             const nextChar = key.letters[(charIdx + 1) % key.letters.length];
                             setDialInput(prev => prev.slice(0, -1) + nextChar);
                             setLastKeystrokeTime(now);
                         }
                     } else {
                         setDialInput(prev => prev + key.letters[0]);
                         setLastKeystrokeTime(now);
                         setLastKeyIndex(keyIndex);
                     }
                 } else if (currentLen === 12) {
                     if (isSameKey && isQuick) {
                         const currentStr = dialInput;
                         const lastChar = currentStr.slice(-1);
                         const charIdx = key.letters.indexOf(lastChar);
                         if (charIdx !== -1) {
                             const nextChar = key.letters[(charIdx + 1) % key.letters.length];
                             setDialInput(prev => prev.slice(0, -1) + nextChar);
                             setLastKeystrokeTime(now);
                         }
                     } else {
                         setConnectionStatus("LIMIT REACHED");
                     }
                 }
             } else {
                 if (currentLen < 12) {
                    setConnectionStatus("NEED LETTER (2-9)");
                 }
             }
        }
    };

    const handleClear = () => {
        if (inputMode === 'number') {
            setDialInput("");
            setLastKeyIndex(null);
            setConnectionStatus("LINE RESET");
            setTimeout(() => {
                startDialTone();
            }, 500);
        } else {
            setMsgInput("");
            setInputMode('number');
            setConnectionStatus("READY");
        }
    };

    const handleMainAction = () => {
        if (inputMode === 'number') {
            startDialingSequence(dialInput);
        } else {
            if (!msgInput) return;
            const formatted = formatDisplayNumber(dialInput);
            handleSendPlayerMessage(formatted, msgInput);
            setConnectionStatus("TRANSMITTING...");
            setTimeout(() => {
                setConnectionStatus("SENT OK");
                setTimeout(() => {
                    setDialInput("");
                    setMsgInput("");
                    setInputMode('number');
                    startDialTone(); 
                }, 1500);
            }, 1000);
        }
    };

    const handleSpeedDial = (index: number) => {
        const slot = speedDials[index];
        if (slot.number) {
            stopDialTone();
            setIsDialToneActive(true); 
            const cleanNum = slot.number.replace(/[^a-zA-Z0-9]/g, '');
            setDialInput(cleanNum);
            setConnectionStatus("AUTO-DIALING...");
            playDialSequence(cleanNum, () => {
                 performConnection(cleanNum);
            });

        } else {
            if (dialInput.length === 12) {
                let name = `MEM ${index + 1}`;
                const friend = friends.find(f => f.phoneNumber.replace(/[^a-zA-Z0-9]/g, '') === dialInput);
                const connectionMatch = Object.values(CONNECTION_DATA).find(c => c.phoneNumberDial === dialInput);
                const directoryMatch = PHONE_DIRECTORY.find(d => d.number === dialInput);
                
                if (dialInput === '9175012222PZ') name = 'PIZZA'; 
                else if (friend) name = friend.name.split(' ')[0].toUpperCase();
                else if (connectionMatch) name = connectionMatch.name.split(' ')[0].toUpperCase();
                else if (directoryMatch) name = directoryMatch.name.toUpperCase();

                onSaveSpeedDial(index, name, dialInput);

                setConnectionStatus("SPEED DIAL SAVED");
                setTimeout(() => startDialTone(), 1500);
            } else {
                setConnectionStatus("DIAL NUMBER\n& HIT BUTTON");
            }
        }
    };

    const handleDeleteSpeedDial = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        onClearSpeedDial(index);
        setConnectionStatus("ENTRY CLEARED");
    };

    const formatDisplayNumber = (raw: string) => {
        if (raw.length <= 3) return raw;
        if (raw.length <= 6) return `${raw.slice(0,3)}-${raw.slice(3)}`;
        if (raw.length <= 10) return `${raw.slice(0,3)}-${raw.slice(3,6)}-${raw.slice(6)}`;
        return `${raw.slice(0,3)}-${raw.slice(3,6)}-${raw.slice(6,10)}-${raw.slice(10)}`;
    };
    
    const renderLCD = () => {
        if (dialInput) return formatDisplayNumber(dialInput);
        if (isDialToneActive) {
            return (
                 <span className="flex gap-[2px]">
                     <span className="animate-[pulse_1s_infinite]">█</span>
                     <span className="animate-[pulse_1s_infinite] delay-100 opacity-90">█</span>
                 </span>
            );
        }
        return "READY";
    };

    if (phoneMode === 'machine') {
        return (
            <AnsweringMachine 
                messages={messages} 
                onBack={() => { setPhoneMode('dialer'); window.speechSynthesis.cancel(); }}
                currentMemo={gameState?.playerHousing?.answeringMachineMemo}
                onSaveMemo={handleSaveMemo}
            />
        );
    }

    return (
        <div className="h-full flex items-center justify-center p-4 relative">
             <div className="bg-[#c2beb5] p-8 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] border-b-[16px] border-r-8 border-[#9a9486] w-[750px] relative font-mono flex gap-8">
                 
                 <div className="absolute -top-4 -left-[140px] bg-[#fef08a] w-56 p-5 shadow-lg transform -rotate-6 border border-[#fde047] font-serif text-slate-900 z-50 scale-110">
                     <div className="text-center font-black uppercase text-xs mb-2 border-b border-yellow-500/30 pb-1">PHONE RULES</div>
                     <ul className="text-[10px] leading-relaxed space-y-1 list-disc pl-3 font-bold">
                         <li>Routing Required: <span className="font-bold text-red-600">917-501</span></li>
                         <li>Enter 4 Digits</li>
                         <li>Enter 2 Letters (Extension)</li>
                         <li className="text-red-600 border-t border-red-200 pt-1 mt-1">NO INTERNATIONAL CALLS!</li>
                     </ul>
                     <div className="absolute -bottom-2 right-0 w-8 h-8 bg-[#fef08a] opacity-50 transform rotate-45"></div>
                 </div>

                 <div className="flex-grow">
                     
                     <div className="flex justify-center mb-1">
                          <span className="text-[9px] font-black text-[#8e8776] uppercase tracking-[0.2em] bg-[#b0ab9f] px-2 py-0.5 rounded-sm border border-[#a39d91] shadow-sm inset-shadow">SPEED DIALER</span>
                     </div>
                     
                     <div className="bg-[#a8a293] h-20 rounded-t-xl mb-6 relative border-4 border-[#8e8776] shadow-inner flex items-center justify-evenly px-4 gap-2">
                         {speedDials.map((slot, i) => (
                             <div key={i} className="flex flex-col items-center group relative">
                                 <button 
                                     onClick={() => handleSpeedDial(i)}
                                     className={`w-24 h-12 rounded bg-[#d1cdc5] border-b-4 border-[#9a9486] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center shadow-md relative
                                         ${!slot.number ? 'opacity-50 border-dashed' : ''}
                                     `}
                                 >
                                     <div className="w-[80%] h-6 bg-white border border-gray-300 flex items-center justify-center text-[9px] font-black uppercase text-slate-600 truncate px-1">
                                         {slot.name}
                                     </div>
                                 </button>
                                 {slot.number && (
                                     <button 
                                         onClick={(e) => handleDeleteSpeedDial(e, i)}
                                         className="absolute -top-2 -right-2 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
                                     >
                                         ✕
                                     </button>
                                 )}
                                 <span className="text-[7px] font-bold text-[#5c574f] uppercase mt-1">M{i+1}</span>
                             </div>
                         ))}
                     </div>

                     <div className="bg-[#839c76] border-8 border-[#5c574f] h-24 mb-6 rounded shadow-[inset_0_0_15px_rgba(0,0,0,0.3)] flex items-center justify-end px-4 relative overflow-hidden">
                         <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[length:4px_4px]"></div>
                         
                         {inputMode === 'number' ? (
                             <span className="font-mono text-4xl text-[#1a2e12] tracking-widest font-bold opacity-90 drop-shadow-sm font-digital w-full flex items-center justify-end">
                                 {renderLCD()}
                             </span>
                         ) : (
                             <div className="w-full h-full relative flex flex-col">
                                 <div className="text-[8px] font-black text-[#1a2e12] opacity-70 animate-pulse mb-1 mt-1">** ENTER YOUR MESSAGE NOW **</div>
                                 <textarea 
                                     ref={msgInputRef}
                                     value={msgInput}
                                     onChange={(e) => setMsgInput(e.target.value.toUpperCase())}
                                     className="w-full h-full bg-transparent border-none outline-none font-mono text-lg text-[#1a2e12] font-bold uppercase tracking-widest placeholder:text-[#1a2e12]/30 resize-none leading-tight"
                                     placeholder="TYPE MSG..."
                                     maxLength={240}
                                 />
                             </div>
                         )}
                     </div>

                     <div className="flex gap-6">
                         <div className="grid grid-cols-3 gap-3 w-3/4 bg-[#b5b0a3] p-4 rounded-xl border border-[#9a9486] shadow-inner">
                             {KEYPAD_MAPPING.map(key => {
                                 const currentLen = dialInput.length;
                                 const isNumberPhase = currentLen < 10;
                                 const isLetterPhase = currentLen >= 10 && currentLen < 12;

                                 let isDisabled = false;
                                 if (inputMode === 'message') isDisabled = true;
                                 else if (isNumberPhase && !/[0-9]/.test(key.val)) isDisabled = true; 
                                 else if (isLetterPhase && (!key.letters || key.letters.length === 0)) isDisabled = true;
                                 
                                 return (
                                     <button 
                                         key={key.val} 
                                         onClick={() => handleKeypadClick(key)}
                                         className={`h-14 rounded text-white shadow-[0_4px_0_#1a1a1a] active:shadow-none active:translate-y-1 transition-all border-t border-gray-600 flex flex-col items-center justify-center group
                                             ${isDisabled ? 'bg-[#444] opacity-50 cursor-not-allowed' : 'bg-[#333] active:bg-[#222]'}
                                         `}
                                         disabled={isDisabled}
                                     >
                                         <span className="text-xl font-bold leading-none">{key.val}</span>
                                         <span className="text-[8px] font-bold text-gray-400 tracking-widest leading-none mt-0.5 group-hover:text-white transition-colors">{key.letters}</span>
                                     </button>
                                 );
                             })}
                         </div>

                         <div className="w-1/4 flex flex-col justify-between gap-2">
                             <div className="space-y-2">
                                 <button onClick={handleClear} className="w-full py-3 bg-[#a0a0a0] rounded shadow-[0_3px_0_#666] active:shadow-none active:translate-y-0.5 text-[9px] font-black uppercase text-[#333] border border-[#8e8776]">
                                     {inputMode === 'message' ? 'CANCEL' : 'CLEAR'}
                                 </button>
                                 
                                 <button 
                                     onClick={handleMainAction} 
                                     className={`w-full py-4 rounded shadow-[0_3px_0_#064e3b] active:shadow-none active:translate-y-0.5 font-bold uppercase tracking-wider text-xs border-t border-emerald-500
                                         ${inputMode === 'message' ? 'bg-amber-600 text-white shadow-[0_3px_0_#92400e]' : 'bg-emerald-700 text-white'}
                                     `}
                                 >
                                     {inputMode === 'message' ? 'SEND' : 'DIAL'}
                                 </button>
                             </div>
                             
                             <div className="bg-[#839c76] border-4 border-[#5c574f] h-24 shadow-[inset_0_0_15px_rgba(0,0,0,0.3)] mt-2 flex flex-col items-center justify-center text-center relative overflow-hidden">
                                 <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[length:4px_4px] opacity-10 pointer-events-none"></div>
                                 
                                 {isDialToneActive && (
                                     <div className="w-full h-8 flex items-center justify-center gap-1 mb-1">
                                         {[...Array(8)].map((_, i) => (
                                             <div 
                                                 key={i} 
                                                 className="w-1 bg-[#1a2e12] animate-[soundwave_0.5s_ease-in-out_infinite]"
                                                 style={{ height: '50%', animationDelay: `${i * 0.05}s` }}
                                             ></div>
                                         ))}
                                         <style>{`@keyframes soundwave { 0%, 100% { height: 20%; } 50% { height: 80%; } }`}</style>
                                     </div>
                                 )}

                                 <div className="font-mono text-[10px] font-bold text-[#1a2e12] opacity-90 uppercase leading-tight whitespace-pre-wrap px-1">
                                     {connectionStatus}
                                 </div>
                             </div>
                             
                             <button
                                 onClick={toggleSpeakerPhone}
                                 className={`w-full py-2 mt-2 rounded border-b-4 transition-all flex items-center justify-center gap-2 text-[9px] font-black uppercase shadow-sm
                                     bg-red-800 border-red-950 text-red-100
                                     ${isDialToneActive 
                                         ? 'border-b-0 translate-y-1 brightness-110 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]' 
                                         : 'hover:bg-red-700 active:border-b-0 active:translate-y-1'
                                     }
                                 `}
                             >
                                 <span className="text-sm">🔊</span>
                                 <span>SP-PHONE</span>
                             </button>
                             
                             <button 
                                 onClick={() => setPhoneMode('machine')}
                                 className="mt-auto w-full bg-[#222] border-b-4 border-black rounded-lg p-2 flex items-center justify-between group hover:bg-[#333] transition-colors relative shadow-lg active:border-b-0 active:translate-y-1"
                             >
                                 <div className="flex flex-col items-start pl-1">
                                     <span className="text-[8px] font-bold text-gray-400 uppercase leading-none">Ans Sys</span>
                                     <span className="text-[6px] text-gray-500 uppercase leading-none mt-1">Playback</span>
                                 </div>
                                 <div className={`w-3 h-3 rounded-full border border-black mr-1 ${hasUnread ? 'bg-red-500 animate-[pulse_0.2s_infinite] shadow-[0_0_15px_rgba(255,0,0,1)]' : 'bg-red-950'}`}></div>
                             </button>

                         </div>
                     </div>

                 </div>

                 <div className="absolute -left-16 bottom-24 w-16 h-48 border-l-[12px] border-t-[12px] border-b-[12px] border-black rounded-l-[40px] transform -skew-y-6 opacity-90 pointer-events-none z-0 shadow-xl"></div>
                 
                 <div className="absolute bottom-3 right-6 text-[10px] font-black text-[#8e8776] italic opacity-70 pointer-events-none">
                     BELL ATLANTIC
                 </div>
             </div>
        </div>
    );
};

export default PhoneInterface;
