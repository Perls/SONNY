
import React from 'react';
import { CrewMember, PawnRole } from '../types';
import { PAWN_JOBS, XP_TO_LEVEL_2, XP_TO_LEVEL_3 } from '../constants';

interface PawnLevelingTreeProps {
    member: CrewMember;
    onPromote: (memberId: string, newRole: PawnRole) => void;
}

// Helper to calculate smooth bezier path between two percentage points
const getPath = (x1: number, y1: number, x2: number, y2: number) => {
    // Control points for a nice "S" curve
    const cY = (y1 + y2) / 2;
    return `M ${x1} ${y1} C ${x1} ${cY}, ${x2} ${cY}, ${x2} ${y2}`;
};

interface JobNodeProps {
    roleId: string;
    isActive: boolean;
    isAvailable: boolean;
    isLocked: boolean;
    onClick?: () => void;
    isLeaf?: boolean;
    isPathTaken?: boolean;
    style?: React.CSSProperties;
}

const JobNode: React.FC<JobNodeProps> = ({ 
    roleId, 
    isActive, 
    isAvailable, 
    isLocked, 
    onClick,
    isLeaf = false,
    isPathTaken,
    style
}) => {
    const job = PAWN_JOBS[roleId];
    
    // "Cute" Visual Styles
    const borderColor = isActive 
        ? 'border-amber-400 ring-4 ring-amber-100 shadow-xl scale-110 z-20' 
        : isPathTaken
            ? 'border-amber-200 bg-amber-50/50 opacity-90'
            : isAvailable 
                ? 'border-emerald-400 hover:border-emerald-500 ring-4 ring-emerald-100 cursor-pointer hover:scale-105 hover:shadow-lg animate-pulse' 
                : 'border-slate-200 opacity-60 grayscale';
            
    const bgColor = isActive 
        ? 'bg-amber-50' 
        : isAvailable 
            ? 'bg-white' 
            : 'bg-slate-100';
            
    const textColor = isActive ? 'text-amber-900' : 'text-slate-800';

    return (
        <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-300"
            style={{ ...style, width: '180px' }}
        >
            <button
                onClick={isAvailable ? onClick : undefined}
                disabled={!isAvailable}
                className={`
                    relative p-4 rounded-3xl border-4 flex flex-col items-center gap-2 w-full transition-all duration-300
                    ${borderColor} ${bgColor}
                `}
            >
                {/* Status Badge */}
                {(isActive || isAvailable) && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm whitespace-nowrap z-30
                        ${isActive ? 'bg-amber-500 text-white border-amber-600' : 'bg-emerald-500 text-white border-emerald-600'}
                    `}>
                        {isActive ? "Current Class" : "Promote!"}
                    </div>
                )}

                {/* Icon Circle */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-inner border-2 ${isActive ? 'bg-amber-200 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                    {job.icon}
                </div>

                {/* Info */}
                <div className="text-center w-full">
                    <div className={`font-black uppercase text-sm ${textColor} font-news tracking-tight`}>{job.label}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide leading-tight mt-1 h-8 flex items-center justify-center">
                        {job.description}
                    </div>
                </div>

                {/* Stat Bonuses */}
                {!isLocked && (
                    <div className="flex gap-1 mt-1 justify-center flex-wrap pt-2 border-t-2 border-dashed border-slate-100 w-full">
                        {Object.entries(job.statBonus).length > 0 ? (
                            Object.entries(job.statBonus).map(([k,v]) => (
                                <span key={k} className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-black ${Number(v) > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                    {Number(v) > 0 ? '+' : ''}{v as number} {k.substring(0,3)}
                                </span>
                            ))
                        ) : (
                            <span className="text-[9px] text-slate-400 uppercase font-bold">Base Stats</span>
                        )}
                    </div>
                )}
            </button>
        </div>
    );
};

const PawnLevelingTree: React.FC<PawnLevelingTreeProps> = ({ member, onPromote }) => {
    const currentRole = member.pawnType || 'pawn';
    const xp = member.xp || 0;
    const maxXp = member.maxXp || (member.level === 1 ? XP_TO_LEVEL_2 : XP_TO_LEVEL_3);
    const xpPercent = Math.min(100, (xp/maxXp)*100);
    
    // Determine Tier
    let currentTier = 1;
    if (['heavy', 'hitter'].includes(currentRole)) currentTier = 2;
    if (['tank', 'bruiser', 'closer', 'flanker'].includes(currentRole)) currentTier = 3;

    // Helper to check if a node is active or past
    const isNodeActive = (r: string) => currentRole === r;
    const isNodePathTaken = (r: string) => {
        if (r === 'pawn') return currentTier > 1;
        if (r === 'heavy') return ['tank', 'bruiser'].includes(currentRole);
        if (r === 'hitter') return ['closer', 'flanker'].includes(currentRole);
        return false;
    };

    // Promotion Availability
    // Fixed Logic: Allow promotion if currentTier is correct and XP requirements met
    const isXpFull = xp >= maxXp;
    const canPromoteToT2 = currentTier === 1 && isXpFull; 
    const canPromoteToT3 = currentTier === 2 && isXpFull;

    // Node Positions (Percentages)
    const POS = {
        pawn: { x: 50, y: 15 },
        heavy: { x: 25, y: 50 },
        hitter: { x: 75, y: 50 },
        tank: { x: 12.5, y: 85 },
        bruiser: { x: 37.5, y: 85 },
        closer: { x: 62.5, y: 85 },
        flanker: { x: 87.5, y: 85 }
    };

    // Connection Color Logic
    const getLineColor = (startRole: string, endRole: string) => {
        // Active path (Gold)
        if (currentRole === endRole) return '#fbbf24'; // Amber-400
        if (isNodePathTaken(endRole)) return '#fbbf24'; // Part of history
        
        // Available path (Emerald)
        // Check specific connections
        let isAvailable = false;
        if (startRole === 'pawn' && (endRole === 'heavy' || endRole === 'hitter') && canPromoteToT2) isAvailable = true;
        if (startRole === 'heavy' && (endRole === 'tank' || endRole === 'bruiser') && canPromoteToT3 && currentRole === 'heavy') isAvailable = true;
        if (startRole === 'hitter' && (endRole === 'closer' || endRole === 'flanker') && canPromoteToT3 && currentRole === 'hitter') isAvailable = true;

        if (isAvailable) return '#34d399'; // Emerald-400
        
        // Locked (Slate)
        return '#e2e8f0'; // Slate-200
    };

    const getStrokeWidth = (startRole: string, endRole: string) => {
        if (currentRole === endRole || isNodePathTaken(endRole)) return 6;
        return 4;
    };

    // Define Connections
    const connections = [
        { start: 'pawn', end: 'heavy' },
        { start: 'pawn', end: 'hitter' },
        { start: 'heavy', end: 'tank' },
        { start: 'heavy', end: 'bruiser' },
        { start: 'hitter', end: 'closer' },
        { start: 'hitter', end: 'flanker' }
    ];

    return (
        <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
            
            {/* Header: XP & Status */}
            <div className="flex-shrink-0 flex justify-between items-center mb-4 p-6 bg-white border-b-2 border-slate-200 z-50 shadow-sm">
                <div>
                    <h2 className="text-3xl font-black font-news uppercase tracking-tighter text-slate-900 mb-1">{member.name}</h2>
                    <div className="flex items-center gap-2">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-slate-200">
                            Lvl {member.level}
                        </span>
                        <span className="text-amber-600 font-bold text-xs uppercase tracking-widest">
                            {PAWN_JOBS[currentRole].label}
                        </span>
                    </div>
                </div>
                <div className="text-right min-w-[240px]">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1 flex justify-between">
                       <span>Rank Up Progress</span>
                       {isXpFull && currentTier < 3 ? <span className="text-emerald-500 animate-pulse">Ready</span> : <span className="text-slate-300">Training...</span>}
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300 relative shadow-inner">
                        <div 
                            className={`h-full transition-all duration-1000 ${isXpFull && currentTier < 3 ? 'bg-amber-400 animate-pulse' : 'bg-blue-500'}`} 
                            style={{ width: `${xpPercent}%` }}
                        ></div>
                    </div>
                    <div className="text-[9px] font-mono font-bold text-slate-500 mt-1">{xp} / {maxXp} XP</div>
                </div>
            </div>

            {/* Tree Container */}
            <div className="flex-grow relative overflow-auto custom-scrollbar">
                <div className="min-w-[800px] min-h-[600px] w-full h-full relative">
                    
                    {/* SVG Connector Layer */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                        {connections.map((conn, idx) => {
                            const start = POS[conn.start as keyof typeof POS];
                            const end = POS[conn.end as keyof typeof POS];
                            
                            const color = getLineColor(conn.start, conn.end);
                            const width = getStrokeWidth(conn.start, conn.end);
                            const isDashed = color === '#34d399'; // Dashed for available paths

                            return (
                                <path
                                    key={idx}
                                    d={getPath(start.x, start.y, end.x, end.y)}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth={width / 8} // Adjust for 0-100 coordinate space
                                    strokeLinecap="round"
                                    strokeDasharray={isDashed ? '1 1' : 'none'}
                                    className="transition-all duration-500"
                                />
                            );
                        })}
                    </svg>

                    {/* Nodes Layer */}
                    {Object.entries(POS).map(([role, pos]) => {
                        const active = isNodeActive(role);
                        const taken = isNodePathTaken(role);
                        
                        // Check availability
                        let available = false;
                        if (role === 'heavy' || role === 'hitter') available = canPromoteToT2;
                        if (['tank', 'bruiser', 'closer', 'flanker'].includes(role)) {
                            // Must be connected to current role
                            if (role === 'tank' || role === 'bruiser') available = canPromoteToT3 && currentRole === 'heavy';
                            if (role === 'closer' || role === 'flanker') available = canPromoteToT3 && currentRole === 'hitter';
                        }
                        
                        // Always show pawn as active if tier 1
                        if (role === 'pawn' && currentTier === 1) available = false; // Already active (cannot promote to itself)

                        return (
                            <JobNode
                                key={role}
                                roleId={role}
                                isActive={active}
                                isPathTaken={taken}
                                isAvailable={available}
                                isLocked={!active && !taken && !available}
                                onClick={() => onPromote(member.id, role as PawnRole)}
                                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                            />
                        );
                    })}

                </div>
            </div>
            
            {/* Background Pattern */}
            <div className="absolute inset-0 pattern-deco opacity-10 pointer-events-none -z-10"></div>
        </div>
    );
};

export default PawnLevelingTree;
