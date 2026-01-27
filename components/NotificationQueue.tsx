
import React, { useEffect } from 'react';
import { useGameEngine } from '../contexts/GameEngineContext';
import { GameNotification } from '../types';
import { playSound } from '../utils/audioUtils';

const NotificationQueue: React.FC = () => {
    const { notificationQueue, dismissNotification } = useGameEngine();

    // Sound Trigger Logic
    useEffect(() => {
        if (notificationQueue.length > 0) {
            // Get the most recent notification
            const latest = notificationQueue[notificationQueue.length - 1];
            
            // Only play sound if it's "fresh" (within last 100ms to prevent re-renders triggering sound)
            if (Date.now() - latest.timestamp < 500 && latest.sound && latest.sound !== 'none') {
                playSound(latest.sound);
            }
        }
    }, [notificationQueue.length]); // Depend on length change to catch additions

    // Type styling helpers
    const getStyles = (type: GameNotification['type']) => {
        switch (type) {
            case 'item':
                return {
                    bg: 'bg-slate-900',
                    border: 'border-slate-700',
                    iconBg: 'bg-amber-500',
                    iconBorder: 'border-amber-300',
                    iconColor: 'text-slate-900',
                    textColor: 'text-white',
                    subTextColor: 'text-red-400', // e.g. Cost
                    defaultIcon: '📦'
                };
            case 'levelup':
                return {
                    bg: 'bg-amber-100',
                    border: 'border-amber-300',
                    iconBg: 'bg-amber-500',
                    iconBorder: 'border-white',
                    iconColor: 'text-white',
                    textColor: 'text-amber-900',
                    subTextColor: 'text-amber-700',
                    defaultIcon: '⭐'
                };
            case 'success':
                return {
                    bg: 'bg-white',
                    border: 'border-emerald-500',
                    iconBg: 'bg-emerald-100',
                    iconBorder: 'border-emerald-200',
                    iconColor: 'text-emerald-600',
                    textColor: 'text-emerald-900',
                    subTextColor: 'text-emerald-700',
                    defaultIcon: '✅'
                };
            case 'error':
                return {
                    bg: 'bg-white',
                    border: 'border-red-500',
                    iconBg: 'bg-red-50',
                    iconBorder: 'border-red-200',
                    iconColor: 'text-red-600',
                    textColor: 'text-red-900',
                    subTextColor: 'text-red-700',
                    defaultIcon: '⚠️'
                };
            default: // info
                return {
                    bg: 'bg-slate-900',
                    border: 'border-slate-600',
                    iconBg: 'bg-indigo-600',
                    iconBorder: 'border-indigo-400',
                    iconColor: 'text-white',
                    textColor: 'text-white',
                    subTextColor: 'text-indigo-300',
                    defaultIcon: '🔔'
                };
        }
    };

    return (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center pointer-events-none w-full max-w-sm">
            <style>{`
                @keyframes notif-pop-unified {
                    0% { opacity: 0; transform: translateY(20px) scale(0.9); }
                    10% { opacity: 1; transform: translateY(0) scale(1); }
                    85% { opacity: 1; transform: translateY(0) scale(1); }
                    100% { opacity: 0; transform: translateY(-20px) scale(0.9); }
                }
                .notif-anim {
                    animation: notif-pop-unified 3s cubic-bezier(0.2, 0, 0.2, 1) forwards;
                }
            `}</style>
            
            {notificationQueue.map((notif) => {
                const styles = getStyles(notif.type);
                
                return (
                    <div 
                        key={notif.id}
                        onAnimationEnd={() => dismissNotification(notif.id)}
                        className={`notif-anim ${styles.bg} border-2 ${styles.border} pl-1 pr-6 py-1 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex items-center gap-3 backdrop-blur-sm min-w-[220px] pointer-events-auto relative overflow-hidden`}
                    >
                        {/* Shimmer effect for Level Up */}
                        {notif.type === 'levelup' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full h-full animate-[sheen_1s_infinite]"></div>
                        )}

                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-inner border-2 shrink-0 ${styles.iconBg} ${styles.iconBorder} ${styles.iconColor}`}>
                            {notif.icon || styles.defaultIcon}
                        </div>
                        
                        <div className="flex flex-col min-w-0">
                            <span className={`text-[8px] font-black uppercase tracking-widest leading-none mb-0.5 opacity-70 ${styles.textColor}`}>
                                {notif.title}
                            </span>
                            <div className="flex justify-between items-baseline gap-2">
                                {notif.message && (
                                    <span className={`text-xs font-black leading-none uppercase ${styles.subTextColor || styles.textColor}`}>
                                        {notif.message}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default NotificationQueue;
