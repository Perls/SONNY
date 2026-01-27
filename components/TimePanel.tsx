
import React, { useState } from 'react';
import { WeatherCondition } from '../utils/timeData';

interface TimePanelProps {
  currentTime: Date;
  location: string;
  weather: WeatherCondition;
  playerFaction?: string;
}

const TimePanel: React.FC<TimePanelProps> = ({ currentTime, location, weather, playerFaction }) => {
  const [isHovered, setIsHovered] = useState(false);
  const year = "90";

  const getFactionColors = (faction: string | undefined) => {
    const f = (faction || '').toLowerCase();
    if (f.includes('mafia') || f.includes('commission')) {
        return {
            bg: 'bg-red-700',
            gradient: 'from-red-700 to-red-300/50',
            fillPrimary: '#b91c1c',
            fillSecondary: '#ef4444',
            textContrast: 'text-white',
        };
    }
    if (f.includes('cartel')) {
        return {
            bg: 'bg-[#ffb300]',
            gradient: 'from-[#ffb300] to-amber-300/50',
            fillPrimary: '#b37d00',
            fillSecondary: '#ffb300',
            textContrast: 'text-black',
        };
    }
    if (f.includes('gang') || f.includes('street')) {
        return {
            bg: 'bg-purple-700',
            gradient: 'from-purple-700 to-purple-300/50',
            fillPrimary: '#7e22ce',
            fillSecondary: '#a855f7',
            textContrast: 'text-white',
        };
    }
    return {
        bg: 'bg-slate-700',
        gradient: 'from-slate-700 to-slate-300/50',
        fillPrimary: '#334155',
        fillSecondary: '#64748b',
        textContrast: 'text-white',
    };
  };

  const colors = getFactionColors(playerFaction);
  const nextEventLabel = weather.isNight ? 'Sunrise' : 'Sunset';

  return (
    <div className="fixed top-0 right-0 z-50 h-20 flex items-start font-waze pointer-events-none select-none">
        
        {/* Interaction Wrapper - Not Clipped */}
        <div 
            className="relative h-full group pointer-events-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Main Panel Body - Clipped for styling */}
            <div className="bg-white/95 backdrop-blur-md h-full pl-8 pr-6 flex items-center justify-end gap-5 rounded-bl-3xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] relative overflow-hidden w-auto min-w-[280px] transition-colors hover:bg-white">
                
                {/* Subtle Texture */}
                <div className="absolute inset-0 pattern-deco opacity-30 pointer-events-none"></div>
                
                {/* Top Accent Line - Faction Colored */}
                <div className={`absolute top-0 right-0 w-full h-[3px] bg-gradient-to-l ${colors.gradient}`}></div>

                {/* Info Section */}
                <div className="flex flex-col items-end flex-grow min-w-0">
                    {/* Time with Indicator */}
                    <div className="flex items-center gap-3 relative">
                        {/* Day/Night Indicator */}
                        <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] animate-pulse ${weather.isNight ? 'bg-indigo-500 text-indigo-400' : 'bg-red-500 text-red-400'}`}></div>
                        
                        <div className="text-3xl font-black font-news text-[#1b1b1b] leading-none tracking-tighter mb-1">
                            {currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1b1b1b] w-full justify-end">
                        <span className="whitespace-nowrap">{currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} '{year}</span>
                    </div>
                </div>

                {/* Weather & Temp Icon */}
                <div className="relative flex-shrink-0 group-hover:scale-110 transition-transform duration-500 pl-2">
                    <div className="flex items-center justify-center relative">
                        <div className="text-6xl leading-none filter drop-shadow-md transform translate-y-1">
                            {weather.icon}
                        </div>
                    </div>
                    {/* Temp Badge - Faction Background */}
                    <div className={`absolute -bottom-1 -left-1 ${colors.textContrast} text-[11px] font-black px-1.5 py-0.5 rounded border border-white shadow-sm ${colors.bg}`}>
                        {weather.temp}°
                    </div>
                </div>

                {/* Faction Filigree Arrow - Bottom Left (Mirrored) */}
                <div className="absolute bottom-0 left-0 pointer-events-none transform -scale-x-100">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M24 24H0L24 0V24Z" fill={colors.fillPrimary} opacity="0.8"/>
                        <path d="M20 20H8L20 8V20Z" fill={colors.fillSecondary}/>
                    </svg>
                </div>
            </div>

            {/* Tooltip - Outside clipping container */}
            {isHovered && (
                <div className="absolute top-full right-0 mt-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded shadow-lg whitespace-nowrap border border-slate-700 animate-fade-in z-[60]">
                    {weather.description} • Next {nextEventLabel} in {weather.nextEvent.timeUntil}
                </div>
            )}
        </div>
    </div>
  );
};

export default TimePanel;
