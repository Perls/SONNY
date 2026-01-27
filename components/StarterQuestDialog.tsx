
import React from 'react';
import { ConnectionProfile } from '../data/connectionData';

interface StarterQuestDialogProps {
    connection: ConnectionProfile;
    onClose: () => void;
    onAccept: () => void;
}

const StarterQuestDialog: React.FC<StarterQuestDialogProps> = ({ connection, onClose, onAccept }) => {
    return (
        <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in font-waze">
            <div className="bg-slate-900 border-4 border-amber-500 rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col">
                
                {/* Background Texture */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 20px)' }}></div>

                {/* Header */}
                <div className="bg-black p-6 border-b-2 border-slate-700 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full border-4 border-amber-500 overflow-hidden shadow-lg bg-slate-800">
                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${connection.avatarSeed}`} className="w-full h-full object-cover scale-110 translate-y-2" />
                        </div>
                        <div>
                            <div className="text-amber-500 font-black uppercase text-xs tracking-widest mb-1">{connection.role}</div>
                            <h2 className="text-3xl text-white font-news font-black uppercase leading-none">{connection.name}</h2>
                            <div className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-wide">{connection.faction} Connection</div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 bg-slate-800 relative">
                     <div className="absolute top-0 left-8 w-px h-full bg-slate-700"></div>
                     
                     <div className="relative pl-12">
                         <div className="text-4xl absolute -left-6 top-0 text-amber-600">“</div>
                         <p className="text-slate-200 font-serif italic text-lg leading-relaxed mb-6">
                            {connection.introMessage}
                         </p>
                         <div className="text-4xl absolute right-0 bottom-0 text-amber-600 rotate-180">“</div>
                     </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-black border-t-2 border-slate-700 flex justify-end gap-4">
                    <button 
                        onClick={onClose}
                        className="px-6 py-3 rounded-lg border-2 border-slate-600 text-slate-400 font-bold uppercase text-xs hover:text-white hover:border-slate-400 transition-colors"
                    >
                        Not Now
                    </button>
                    <button 
                        onClick={onAccept}
                        className="px-8 py-3 rounded-lg bg-amber-600 text-white font-black uppercase text-xs tracking-widest hover:bg-amber-500 shadow-lg transition-all transform hover:-translate-y-1"
                    >
                        Accept Mission
                    </button>
                </div>

            </div>
        </div>
    );
};

export default StarterQuestDialog;
