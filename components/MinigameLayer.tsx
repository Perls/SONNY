
import React from 'react';
import { useGameEngine } from '../contexts/GameEngineContext';
import JanitorMinigame from './JanitorMinigame';

// Definition of available jobs
const JOBS = [
    { id: 'janitor', label: 'Sanitation', icon: '🧹', desc: 'Clean up the mess.', wage: 50, diff: 'Easy' },
    { id: 'sorting', label: 'Mail Room', icon: '✉️', desc: 'Sort incoming intel.', wage: 60, diff: 'Medium', locked: true },
    { id: 'data_entry', label: 'Data Entry', icon: '💻', desc: 'Process numbers.', wage: 80, diff: 'Hard', locked: true },
    { id: 'security', label: 'Security', icon: '📹', desc: 'Monitor the feeds.', wage: 100, diff: 'Hard', locked: true },
    { id: 'delivery', label: 'Courier', icon: '📦', desc: 'Run packages.', wage: 70, diff: 'Medium', locked: true },
    { id: 'cooking', label: 'Cooking', icon: '🍳', desc: 'Feed the crew.', wage: 45, diff: 'Easy', locked: true },
    { id: 'mechanic', label: 'Repairs', icon: '🔧', desc: 'Fix the machinery.', wage: 90, diff: 'Hard', locked: true },
    { id: 'accounting', label: 'Auditing', icon: '🧮', desc: 'Cook the books.', wage: 120, diff: 'Expert', locked: true },
];

const MinigameLayer: React.FC = () => {
    const { activeMinigameId, startMinigame, closeMinigame, handleCompleteMinigame } = useGameEngine();

    if (!activeMinigameId) return null;

    // RENDER: Specific Game Logic
    if (activeMinigameId === 'janitor') {
        return (
            <JanitorMinigame 
                onClose={closeMinigame} 
                onComplete={handleCompleteMinigame} 
            />
        );
    }

    // RENDER: Job Board (Menu)
    if (activeMinigameId === 'office_job_board') {
        return (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center font-waze animate-fade-in p-6">
                <div className="bg-slate-900 w-full max-w-4xl h-[600px] rounded-2xl shadow-2xl border-4 border-slate-700 overflow-hidden flex flex-col relative">
                    
                    {/* Header */}
                    <div className="h-20 bg-slate-800 border-b-2 border-slate-600 flex items-center justify-between px-8">
                        <div className="flex items-center gap-4">
                            <div className="text-4xl">📋</div>
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-widest font-news">Job Assignments</h2>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select a Shift</div>
                            </div>
                        </div>
                        <button onClick={closeMinigame} className="text-slate-400 hover:text-white font-bold text-xl transition-colors">✕</button>
                    </div>

                    {/* Job Grid */}
                    <div className="flex-grow p-8 bg-slate-950 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {JOBS.map(job => (
                                <button
                                    key={job.id}
                                    onClick={() => !job.locked && startMinigame(job.id)}
                                    disabled={job.locked}
                                    className={`
                                        flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all relative overflow-hidden group
                                        ${job.locked 
                                            ? 'bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed' 
                                            : 'bg-slate-800 border-slate-600 hover:border-amber-500 hover:bg-slate-700 hover:shadow-lg active:translate-y-1'
                                        }
                                    `}
                                >
                                    <div className={`text-4xl mb-4 ${job.locked ? 'grayscale opacity-30' : 'group-hover:scale-110 transition-transform'}`}>
                                        {job.icon}
                                    </div>
                                    <div className="text-sm font-black text-white uppercase mb-1">{job.label}</div>
                                    <div className="text-[10px] text-slate-400 font-medium mb-3 text-center leading-tight h-8">{job.desc}</div>
                                    
                                    <div className="w-full flex justify-between items-center border-t border-slate-700 pt-3">
                                        <div className="text-[9px] font-bold text-slate-500 uppercase">{job.diff}</div>
                                        <div className="text-[10px] font-mono font-bold text-emerald-500">N$ {job.wage}</div>
                                    </div>

                                    {job.locked && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
                                            <div className="bg-slate-800 px-3 py-1 rounded border border-slate-600 text-[8px] font-bold uppercase text-slate-400">Locked</div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="h-12 bg-slate-900 border-t border-slate-800 flex items-center justify-center">
                        <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                            Official Business Only • Report Accidents to HR
                        </div>
                    </div>

                </div>
            </div>
        );
    }

    return null;
};

export default MinigameLayer;
