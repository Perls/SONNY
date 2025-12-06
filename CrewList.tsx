import React from 'react';
import { CrewMember } from '../types';
import { CLASSES } from '../constants';

interface CrewListProps {
  crew: CrewMember[];
  onRemove: (id: string) => void;
  onPromote: (id: string) => void;
}

const CrewList: React.FC<CrewListProps> = ({ crew, onRemove, onPromote }) => {
  if (crew.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 font-bold text-sm text-center p-6 bg-white">
        <p>Organization Empty</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto h-full custom-scrollbar p-4 bg-white">
      {crew.map((member) => {
        const classDef = CLASSES[member.classType];
        return (
          <div key={member.id} className="relative group bg-slate-50 border-l-4 border-l-slate-300 border-y border-r border-slate-200 rounded-r-lg hover:border-l-amber-500 hover:bg-white hover:shadow-md transition-all p-3 flex gap-4 items-center">
            
            {/* Portrait */}
            <div className={`w-12 h-12 rounded-md bg-slate-200 overflow-hidden flex-shrink-0 border ${member.isLeader ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-300'} shadow-inner`}>
               <img 
                 src={`https://picsum.photos/seed/${member.imageSeed}/200/200`} 
                 alt={member.name}
                 className="w-full h-full object-cover filter contrast-110 grayscale group-hover:grayscale-0 transition-all duration-500"
               />
            </div>
            
            {/* Info */}
            <div className="flex-grow min-w-0">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                    <h4 className="text-slate-900 font-black text-sm truncate font-news tracking-tight">{member.name}</h4>
                    <span className="text-xs text-slate-500 font-bold italic truncate">"{member.nickname}"</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">
                    {classDef.label}
                  </span>
                  {member.isLeader && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-amber-200">Boss</span>
                  )}
                </div>
              </div>
            </div>

            {/* Level */}
             <div className="flex flex-col items-end justify-center px-2 border-l border-slate-200">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Rank</span>
                <span className="text-lg font-black text-slate-800 font-news leading-none">{member.level}</span>
             </div>

            {/* Controls (Hover only) */}
             <div className="opacity-0 group-hover:opacity-100 absolute right-2 top-2 flex gap-1 bg-white shadow-sm border border-slate-100 rounded p-0.5 transition-opacity z-10">
               {!member.isLeader && (
                <button 
                  onClick={() => onPromote(member.id)}
                  className="text-slate-400 hover:text-amber-500 p-1.5 transition-colors"
                  title="Promote to Boss"
                >
                  ★
                </button>
               )}
              <button 
                onClick={() => onRemove(member.id)}
                className="text-slate-400 hover:text-red-600 p-1.5 transition-colors"
                title="Dismiss"
              >
                ✕
              </button>
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default CrewList;