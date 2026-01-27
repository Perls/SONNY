
import React from 'react';
import { BOROUGHS } from '../../constants';
import { Stats } from '../../types';

interface BoroughStepProps {
    selectedBorough: string | null;
    onSelectBorough: (id: string) => void;
}

const BoroughStep: React.FC<BoroughStepProps> = ({ selectedBorough, onSelectBorough }) => {
    return (
        <div className="flex h-full w-full">
            <div className="w-5/12 overflow-y-auto custom-scrollbar p-6 space-y-3 bg-white border-r border-slate-200 z-10">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Choose Origin</h3>
                {BOROUGHS.map((b) => (
                    <button key={b.id} onClick={() => onSelectBorough(b.id)} className={`w-full text-left rounded-xl border-2 transition-all group relative overflow-hidden p-5 bg-white hover:border-amber-400 hover:shadow-md`}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 font-news text-6xl font-black text-slate-900 pointer-events-none">{b.abbreviation}</div>
                        <div className="relative z-10">
                            <div className="font-black font-news uppercase text-xl tracking-tight text-slate-800 group-hover:text-amber-600 transition-colors">{b.label}</div>
                            <div className="text-xs font-bold uppercase tracking-wide mb-3 text-slate-400">{b.description}</div>
                            <div className="flex gap-2 flex-wrap">{Object.keys(b.statModifiers).map(stat => (<span key={stat} className="text-[10px] px-2 py-1 rounded uppercase font-black tracking-wider border bg-slate-100 text-slate-600 border-slate-200">+{b.statModifiers[stat as keyof Stats]} {stat}</span>))}</div>
                        </div>
                    </button>
                ))}
            </div>
            <div className="w-7/12 bg-slate-200 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/concrete-wall.png")' }}></div>
                <svg viewBox="0 0 500 500" className="w-full h-full p-8 opacity-80 filter drop-shadow-xl">
                    <path d="M 250 50 L 350 50 L 320 150 L 220 150 Z" fill={selectedBorough === 'bronx' ? '#ef4444' : '#cbd5e1'} stroke="white" strokeWidth="4" className="hover:fill-red-400 transition-colors cursor-pointer" onClick={() => onSelectBorough('bronx')} />
                    <path d="M 180 150 L 220 150 L 200 350 L 160 350 Z" fill={selectedBorough === 'manhattan' ? '#3b82f6' : '#cbd5e1'} stroke="white" strokeWidth="4" className="hover:fill-blue-400 transition-colors cursor-pointer" onClick={() => onSelectBorough('manhattan')} />
                    <path d="M 320 150 L 450 120 L 450 300 L 250 250 Z" fill={selectedBorough === 'queens' ? '#a855f7' : '#cbd5e1'} stroke="white" strokeWidth="4" className="hover:fill-purple-400 transition-colors cursor-pointer" onClick={() => onSelectBorough('queens')} />
                    <path d="M 200 350 L 250 250 L 450 300 L 400 450 L 220 450 Z" fill={selectedBorough === 'brooklyn' ? '#eab308' : '#cbd5e1'} stroke="white" strokeWidth="4" className="hover:fill-yellow-400 transition-colors cursor-pointer" onClick={() => onSelectBorough('brooklyn')} />
                    <path d="M 50 350 L 120 320 L 140 450 L 80 480 Z" fill={selectedBorough === 'staten_island' ? '#10b981' : '#cbd5e1'} stroke="white" strokeWidth="4" className="hover:fill-emerald-400 transition-colors cursor-pointer" onClick={() => onSelectBorough('staten_island')} />
                </svg>
            </div>
        </div>
    );
};

export default BoroughStep;
