
import React, { useState } from 'react';
import { useGameEngine } from '../contexts/GameEngineContext';

interface PayphoneInterfaceProps {
    onClose: () => void;
    money: number;
    onCharge: (amount: number) => void;
}

const PayphoneInterface: React.FC<PayphoneInterfaceProps> = ({ onClose, money, onCharge }) => {
    const { handleSendPlayerMessage } = useGameEngine();
    const [step, setStep] = useState<'input' | 'sending' | 'success'>('input');
    const [recipient, setRecipient] = useState('');
    const [message, setMessage] = useState('');

    const COST = 1;

    const handleSend = () => {
        if (!recipient || !message) return;
        
        if (money < COST) {
            alert("Insufficient funds. You need $1 to make a call.");
            return;
        }

        onCharge(COST);
        setStep('sending');
        
        // Actually send message logic
        handleSendPlayerMessage(recipient, message);

        // Simulate network delay
        setTimeout(() => {
            setStep('success');
            // Auto close after success
            setTimeout(() => {
                onClose();
            }, 2000);
        }, 1500);
    };

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6 font-mono animate-fade-in">
            <div className="bg-[#f3f4f6] border-4 border-black rounded-3xl w-full max-w-md shadow-[10px_10px_0px_rgba(0,0,0,0.2)] relative overflow-hidden flex flex-col">
                
                {/* Header / Brand Plate */}
                <div className="bg-white p-4 border-b-4 border-black flex justify-between items-center relative">
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-widest text-black">BELL ATLANTIC</span>
                        <span className="text-[10px] font-bold text-slate-500">PUBLIC COMMUNICATIONS</span>
                    </div>
                    <div className="flex gap-2">
                        {/* Coin Slot */}
                        <div className="w-8 h-12 bg-slate-300 border-2 border-slate-500 rounded-full flex flex-col items-center justify-start pt-2 shadow-inner">
                            <div className="w-1 h-6 bg-black rounded-full"></div>
                        </div>
                    </div>
                    
                    {/* Close Button */}
                    <button 
                        onClick={onClose} 
                        className="absolute -top-1 -right-1 w-10 h-10 bg-red-600 text-white font-bold hover:bg-red-500 transition-colors flex items-center justify-center border-l-4 border-b-4 border-black"
                    >
                        ✕
                    </button>
                </div>

                {/* Main Body */}
                <div className="p-6 bg-[#e5e5e5] flex flex-col gap-6 relative">
                    {/* Grit Texture */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/dust.png")' }}></div>

                    {/* LCD Screen - Old Gameboy Style */}
                    <div className="bg-[#9ca04b] border-4 border-black rounded-sm p-4 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2)] relative overflow-hidden h-40 flex flex-col justify-between font-mono">
                        {/* Pixel Grid Overlay */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '3px 3px' }}></div>
                        
                        {step === 'input' && (
                            <div className="relative z-10 text-black/80">
                                <div className="text-[10px] uppercase font-bold mb-2">System Ready_</div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex border-b border-black/20 pb-1">
                                        <span className="mr-2 text-xs font-bold">{'>'} TO:</span>
                                        <span className="font-black text-sm tracking-wider uppercase">{recipient || '_'}</span>
                                    </div>
                                    <div className="flex mt-1">
                                        <span className="mr-2 text-xs font-bold">{'>'} MSG:</span>
                                    </div>
                                    <span className="font-bold text-sm tracking-wide uppercase leading-tight break-words w-full h-12 overflow-hidden block">
                                        {message || '_'}
                                    </span>
                                </div>
                                <div className="text-[10px] text-right mt-1 font-bold flex justify-between">
                                    <span>CREDIT: ${money}</span>
                                    <span>$1.00 INSERTED</span>
                                </div>
                            </div>
                        )}

                        {step === 'sending' && (
                            <div className="flex flex-col items-center justify-center h-full gap-2 relative z-10 text-black/80">
                                <div className="text-sm font-black uppercase animate-pulse">DIALING...</div>
                                <div className="w-full h-4 bg-[#8b8f43] border-2 border-black/30 p-0.5">
                                    <div className="h-full bg-black animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
                                </div>
                                <div className="text-[10px] font-mono mt-1">
                                    {Math.floor(Math.random() * 999)}-{Math.floor(Math.random() * 999)}
                                </div>
                            </div>
                        )}

                        {step === 'success' && (
                            <div className="flex flex-col items-center justify-center h-full relative z-10 text-black/80">
                                <div className="text-4xl mb-2">✉️</div>
                                <div className="text-lg font-black uppercase tracking-widest">SENT OK</div>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    {step === 'input' && (
                        <div className="flex flex-col gap-4 relative z-10">
                            <input 
                                type="text" 
                                placeholder="NUMBER / NICKNAME"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                className="bg-white border-2 border-slate-400 text-black p-3 rounded font-mono text-sm uppercase placeholder:text-slate-400 focus:border-black outline-none shadow-sm"
                                maxLength={20}
                            />
                            <textarea 
                                placeholder="MESSAGE..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="bg-white border-2 border-slate-400 text-black p-3 rounded font-mono text-sm uppercase placeholder:text-slate-400 focus:border-black outline-none shadow-sm h-24 resize-none"
                                maxLength={140}
                            />
                            
                            <button 
                                onClick={handleSend}
                                disabled={!recipient || !message}
                                className={`
                                    w-full py-4 rounded-lg font-black uppercase tracking-[0.2em] text-sm shadow-[4px_4px_0px_#000] border-2 border-black transition-all active:translate-y-1 active:shadow-none
                                    ${recipient && message 
                                        ? 'bg-slate-200 text-black hover:bg-white' 
                                        : 'bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed shadow-none'
                                    }
                                `}
                            >
                                SEND MSG ($1)
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer / Instructions sticker */}
                <div className="bg-white p-3 border-t-4 border-black flex justify-center items-center">
                    <div className="border border-black px-4 py-1 text-[10px] font-black uppercase tracking-widest bg-yellow-100 transform -rotate-1 shadow-sm">
                        NO REFUNDS • CALLS MONITORED
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayphoneInterface;
