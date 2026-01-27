
import React from 'react';
import { GameEvent } from '../types';
import SafeImage from './SafeImage';

interface EventModalProps {
    event: GameEvent;
    onOptionSelect: (index: number) => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onOptionSelect }) => {
    return (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center font-waze p-4 animate-fade-in">
            <div className="w-full max-w-4xl bg-[#fdfbf7] rounded-xl shadow-2xl border-[6px] border-[#2c241b] overflow-hidden flex flex-col relative max-h-[90vh]">
                
                {/* Decorative Frame Elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-[#b45309] z-20"></div>
                <div className="absolute bottom-0 left-0 w-full h-2 bg-[#b45309] z-20"></div>
                
                {/* Top: Scene Image & Portrait */}
                <div className="h-64 relative bg-slate-900 border-b-4 border-[#2c241b] shrink-0">
                    <SafeImage 
                        src={event.image} 
                        alt="Event Scene" 
                        className="w-full h-full object-cover opacity-90"
                        fallbackColorClass="bg-[#2c241b]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2c241b] via-transparent to-transparent"></div>
                    
                    {/* Character Portrait (Right Aligned Overlay) */}
                    {event.speakerName && (
                        <div className="absolute bottom-0 right-8 w-40 h-40 transform translate-y-4">
                            <div className="absolute inset-0 bg-[#2c241b] rounded-full blur-xl opacity-50"></div>
                            <div className="relative w-full h-full rounded-full border-4 border-[#b45309] bg-[#fdfbf7] overflow-hidden shadow-2xl z-10">
                                <img 
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${event.speakerSeed || 'event'}`}
                                    className="w-full h-full object-cover scale-110 translate-y-2"
                                    alt="Speaker"
                                />
                            </div>
                            <div className="absolute bottom-2 -left-12 right-0 bg-[#2c241b] text-[#fdfbf7] text-center py-1 px-4 border-2 border-[#b45309] shadow-lg transform rotate-[-2deg] z-20">
                                <span className="font-news font-black uppercase tracking-widest text-sm">{event.speakerName}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Middle: Text Content */}
                <div className="flex-grow p-10 overflow-y-auto custom-scrollbar bg-[#fdfbf7] relative">
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}></div>
                    
                    <h2 className="text-4xl font-black font-news text-[#2c241b] uppercase tracking-tight mb-6 border-b-2 border-[#b45309]/30 pb-4 relative z-10">
                        {event.title}
                    </h2>
                    
                    <p className="text-lg text-slate-800 font-serif leading-relaxed whitespace-pre-line relative z-10">
                        {event.description}
                    </p>
                </div>

                {/* Bottom: Choices */}
                <div className="bg-[#e5e5e5] p-6 border-t-4 border-[#2c241b] relative z-20 shrink-0">
                    <div className="flex flex-col gap-3">
                        {event.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => onOptionSelect(index)}
                                className="w-full text-left bg-white border-2 border-[#a8a29e] hover:border-[#b45309] p-4 rounded shadow-sm hover:shadow-md hover:bg-[#fff7ed] transition-all group relative overflow-hidden"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#b45309] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="flex justify-between items-center relative z-10 pl-2">
                                    <div>
                                        <div className="font-bold text-slate-900 text-sm font-news uppercase tracking-wide group-hover:text-[#b45309] transition-colors">
                                            {option.label}
                                        </div>
                                        <div className="text-xs text-slate-500 font-serif italic mt-0.5">
                                            "{option.flavorText}"
                                        </div>
                                    </div>
                                    
                                    {/* Effects Tooltip (Inline for simplicity) */}
                                    <div className="text-[10px] font-mono text-slate-400 opacity-60 group-hover:opacity-100 uppercase text-right">
                                        {option.effects.combat && <div className="text-red-600 font-bold">⚠️ Combat</div>}
                                        {option.effects.money && <div className={option.effects.money > 0 ? 'text-emerald-600' : 'text-red-600'}>{option.effects.money > 0 ? '+' : ''}{option.effects.money} Cash</div>}
                                        {option.effects.heat && <div className={option.effects.heat < 0 ? 'text-emerald-600' : 'text-red-600'}>{option.effects.heat > 0 ? '+' : ''}{option.effects.heat} Heat</div>}
                                        {option.effects.item && <div className="text-amber-600">Item Gained</div>}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EventModal;
