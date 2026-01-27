
import React, { useEffect } from 'react';

interface FeedbackToastProps {
    message: string;
    type: 'error' | 'success';
    onClose: () => void;
}

const FeedbackToast: React.FC<FeedbackToastProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 2000);
        return () => clearTimeout(timer);
    }, [message, onClose]);

    return (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[100] pointer-events-none animate-bounce-in">
             <div className={`
                flex items-center gap-3 px-6 py-3 rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.3)] border-4 transition-all transform backdrop-blur-sm
                ${type === 'error' 
                    ? 'bg-white/95 border-red-500 text-red-600 animate-shake' 
                    : 'bg-white/95 border-emerald-500 text-emerald-600'
                }
             `}>
                <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-2xl border-2 shadow-sm shrink-0
                    ${type === 'error' ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}
                `}>
                    {type === 'error' ? '🙅' : '🤑'}
                </div>
                <div className="flex flex-col min-w-[120px]">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-50 leading-none mb-0.5">
                        {type === 'error' ? 'Hold Up!' : 'Nice!'}
                    </span>
                    <span className="font-black uppercase tracking-wide text-sm leading-tight">
                        {message}
                    </span>
                </div>
             </div>
        </div>
    );
};

export default FeedbackToast;
