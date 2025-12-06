import React from 'react';

interface StatBarProps {
  label: string;
  value: number;
  maxValue?: number;
  colorClass?: string;
}

const StatBar: React.FC<StatBarProps> = ({ label, value, maxValue = 20, colorClass = "bg-teal-600" }) => {
  // Max value increased to accommodate bonuses
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div className="flex items-center text-sm mb-3 group">
      <span className="w-10 font-black text-slate-600 text-[11px] tracking-widest uppercase text-right mr-3">{label}</span>
      <div className="flex-grow h-5 bg-slate-200 rounded overflow-hidden border border-slate-300 relative shadow-inner">
        {/* Background lines pattern */}
        <div className="absolute inset-0 w-full h-full opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '8px 8px' }}></div>
        
        {/* The Bar */}
        <div
          className={`h-full ${colorClass} transition-all duration-500 ease-out relative flex items-center`}
          style={{ width: `${percentage}%` }}
        >
           {/* Bevel/Shine effect */}
           <div className="absolute inset-x-0 top-0 h-[1px] bg-white/40"></div>
           <div className="absolute inset-x-0 bottom-0 h-[1px] bg-black/10"></div>
        </div>
        
        {/* Value Text Overlay (Inside or Outside?) Let's put it floating right inside the container if possible, or outside */}
      </div>
      <span className="w-8 text-left ml-3 font-black text-slate-800 text-sm font-news">{value}</span>
    </div>
  );
};

export default StatBar;