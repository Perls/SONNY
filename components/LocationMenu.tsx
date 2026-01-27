
import React, { useState, useEffect } from 'react';
import { ITEMS, RECRUIT_COST, CLASSES, MAX_CREW_SIZE } from '../constants';
import { ClassType, CrewMember, Bounty } from '../types';
import Bounties from './Bounties';
import { useGameEngine } from '../contexts/GameEngineContext';
import SafeImage from './SafeImage';
import AvatarDisplay from './AvatarDisplay';

interface LocationMenuProps {
    location: any;
    onClose: () => void;
    onShop: (item: any) => void;
    onRecruit: (pawnDetails: Partial<CrewMember>, cost: number) => void;
    onBulkRecruit: (recruits: { details: Partial<CrewMember>, cost: number }[]) => void;
    onStartCombat?: (enemyClass: ClassType | null) => void;
    onAddXp?: (amount: number) => void;
    onHeal?: (cost: number) => void;
    onRest?: () => void;
    overrideStyle?: React.CSSProperties;
    playerFaction?: string;
    playerMoney?: number;
    onPlaceBounty?: (bounty: Bounty) => void;
    currentCrewSize?: number;
}

interface RecruitCandidate {
    id: string;
    name: string;
    role: string;
    cost: number;
    classType: ClassType;
    stats: any;
    imageSeed: string;
    pawnType: 'pawn';
}

export const LocationMenu: React.FC<LocationMenuProps> = ({
    location, onClose, onShop, onRecruit, onBulkRecruit, onStartCombat,
    onAddXp, onHeal, onRest, overrideStyle, playerFaction, playerMoney, onPlaceBounty,
    currentCrewSize = 0
}) => {
    const { setIsIndustrialJobActive, triggerFeedback } = useGameEngine();
    const [candidates, setCandidates] = useState<RecruitCandidate[]>([]);
    const [showBounties, setShowBounties] = useState(false);
    const [message, setMessage] = useState<string>("");

    const handleActionMsg = (msg: string) => {
        setMessage(msg);
        setTimeout(() => setMessage(""), 3000);
    };

    // Generate candidates on mount
    useEffect(() => {
        if (location.type === 'recruit') {
            const newCandidates: RecruitCandidate[] = [];
            const firstNames = ['Vinny', 'Rocco', 'Tony', 'Silvio', 'Paulie', 'Chris', 'Bobby', 'Sal', 'Vito', 'Enzo', 'Mickey', 'Jimmy', 'Deshawn', 'Marcus', 'Tyrone', 'Jules', 'Marsellus', 'Butch'];
            const classTypes = Object.values(ClassType);

            for (let i = 0; i < 5; i++) {
                const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${Math.floor(Math.random() * 100)}`;
                const randomClass = classTypes[Math.floor(Math.random() * classTypes.length)];

                // Stats varied by class slightly
                const baseStr = randomClass === ClassType.Thug ? 4 : 2;
                const baseInt = randomClass === ClassType.Dealer ? 4 : 1;
                const baseAgi = randomClass === ClassType.Smuggler ? 4 : 2;

                const stats = {
                    strength: baseStr + Math.floor(Math.random() * 3),
                    agility: baseAgi + Math.floor(Math.random() * 3),
                    intelligence: baseInt + Math.floor(Math.random() * 3),
                    luck: 1 + Math.floor(Math.random() * 3),
                    charisma: 1 + Math.floor(Math.random() * 2),
                    willpower: 1 + Math.floor(Math.random() * 4) // Random willpower
                };

                newCandidates.push({
                    id: `recruit-${i}-${Date.now()}`,
                    name: name,
                    role: `Buttonman (Lvl 1)`, // Use Buttonman label
                    cost: RECRUIT_COST,
                    classType: randomClass,
                    stats: stats,
                    imageSeed: Math.floor(Math.random() * 10000).toString(),
                    pawnType: 'pawn'
                });
            }
            setCandidates(newCandidates);
        }
    }, [location]);

    // Calculate max soldiers (Total - 1 for leader)
    const maxSoldiers = MAX_CREW_SIZE - 1;

    const handleRecruitOne = (candidate: RecruitCandidate) => {
        if ((playerMoney || 0) < candidate.cost) {
            triggerFeedback("Insufficient Funds!", 'error');
            return;
        }
        if (currentCrewSize >= maxSoldiers) {
            triggerFeedback("Crew Full!", 'error');
            return;
        }

        onRecruit({
            name: candidate.name,
            nickname: 'Fresh Meat',
            classType: candidate.classType,
            stats: candidate.stats,
            imageSeed: candidate.imageSeed,
            pawnType: candidate.pawnType
        }, candidate.cost);

        // Success: Remove from list
        setCandidates(prev => prev.filter(c => c.id !== candidate.id));
        handleActionMsg(`${candidate.name} recruited!`);
    };

    const handleRecruitAll = () => {
        const cost = candidates.reduce((sum, c) => sum + c.cost, 0);
        if ((playerMoney || 0) < cost) {
            triggerFeedback("Insufficient Funds for All!", 'error');
            return;
        }
        if (currentCrewSize + candidates.length > maxSoldiers) {
            triggerFeedback("Not enough space for all!", 'error');
            return;
        }

        const recruits = candidates.map(c => ({
            details: {
                name: c.name,
                nickname: 'Fresh Meat',
                classType: c.classType,
                stats: c.stats,
                imageSeed: c.imageSeed,
                pawnType: c.pawnType
            },
            cost: c.cost
        }));
        onBulkRecruit(recruits);
        setCandidates([]);
        handleActionMsg("All prospects recruited!");
    };

    // RENDER BOUNTY SCREEN IF ACTIVE
    if (showBounties && onPlaceBounty) {
        return (
            <Bounties
                locationType={location.type === 'headquarters' ? 'hq' : 'bar'}
                playerFaction={playerFaction || 'The Street Gangs'}
                money={playerMoney || 0}
                onPlaceBounty={onPlaceBounty}
                onClose={() => setShowBounties(false)}
            />
        );
    }

    // CONFIG BASED ON LOCATION TYPE
    let headerImage = "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop"; // Shop Default
    let title = location.label;
    let subtitle = "Location";
    let icon = location.icon;
    let themeColor = "bg-slate-900";
    let accentColor = "border-slate-700";

    if (location.type === 'recruit') {
        if (location.id === 'bronx_zoo') {
            headerImage = "https://images.unsplash.com/photo-1554463529-e27854014799?q=80&w=1000&auto=format&fit=crop";
            title = "The Zoo";
            subtitle = "Recruitment Ground";
            themeColor = "bg-amber-900";
            accentColor = "border-amber-700";
        } else if (location.id === 'queens') {
            headerImage = "https://images.unsplash.com/photo-1549643276-fbc2bd874326?q=80&w=1000&auto=format&fit=crop";
            title = "Queens Bridge";
            subtitle = "Meeting Point";
            themeColor = "bg-indigo-900";
            accentColor = "border-indigo-700";
        }
    } else if (location.type === 'combat_hub') {
        headerImage = "https://images.unsplash.com/photo-1516223725307-6f76b9ec8742?q=80&w=1000&auto=format&fit=crop";
        title = "The Stadium";
        subtitle = "Combat Arena";
        themeColor = "bg-red-900";
        accentColor = "border-red-700";
    } else if (location.type === 'entertainment') {
        headerImage = "https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=1000&auto=format&fit=crop";
        title = "Dive Bar";
        subtitle = "Local Watering Hole";
        themeColor = "bg-purple-900";
        accentColor = "border-purple-700";
    } else if (location.type === 'hospital') {
        headerImage = "https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=1000&auto=format&fit=crop";
        title = "St. Jude's";
        subtitle = "Emergency Care";
        themeColor = "bg-sky-900";
        accentColor = "border-sky-700";
    }

    return (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center font-waze animate-fade-in p-6">
            <div className={`bg-white w-full max-w-4xl rounded-2xl shadow-2xl border-4 ${accentColor} overflow-hidden flex flex-col relative h-[650px]`}>

                {/* HEADER */}
                <div className={`h-48 relative flex-shrink-0 ${themeColor} border-b-4 ${accentColor} group`}>
                    <SafeImage
                        src={headerImage}
                        alt={title}
                        className="w-full h-full object-cover opacity-60 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000"
                        fallbackColorClass={themeColor}
                    />

                    <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent`}></div>

                    <div className="absolute bottom-6 left-8 text-white">
                        <div className="flex items-center gap-4">
                            <div className="text-5xl filter drop-shadow-lg">{icon}</div>
                            <div>
                                <h1 className="text-5xl font-black font-news uppercase tracking-tighter leading-none shadow-black drop-shadow-sm">
                                    {title}
                                </h1>
                                <div className="flex items-center gap-2 mt-1 font-bold text-xs uppercase tracking-widest text-slate-300">
                                    <span>{subtitle}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all shadow-lg text-lg bg-black/50 text-white hover:bg-white hover:text-red-600 border-2 border-white/20"
                    >
                        ✕
                    </button>
                </div>

                {/* BODY */}
                <div className="flex flex-grow bg-slate-100">

                    {/* LEFT: INFO & FLAVOR */}
                    <div className="w-1/3 relative bg-slate-900 overflow-hidden border-r-4 border-slate-700 flex flex-col">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                            {message ? (
                                <div className="bg-white/90 border-2 border-slate-200 p-6 rounded-xl shadow-xl animate-pop-in relative z-20">
                                    <div className="text-2xl mb-2">💬</div>
                                    <div className="font-black uppercase text-slate-900 text-lg leading-tight">{message}</div>
                                </div>
                            ) : (
                                <div className="font-mono text-xs uppercase tracking-widest px-4 py-2 rounded text-slate-400 bg-black/50 border border-slate-700">
                                    {location.type === 'recruit' && "Looking for muscle? You came to the right place."}
                                    {location.type === 'combat_hub' && "Step into the ring. Win glory or leave in a bag."}
                                    {location.type === 'hospital' && "We fix what's broken. For a price."}
                                    {location.type === 'entertainment' && "Relax. Have a drink. Forget the heat."}
                                </div>
                            )}
                        </div>

                        {/* Stats or Info at bottom */}
                        {location.type === 'recruit' && (
                            <div className="mt-auto p-6 text-center z-10">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Your Crew</div>
                                <div className="text-3xl font-black text-white">{currentCrewSize} <span className="text-lg text-slate-600">/ {maxSoldiers}</span></div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: INTERACTION LIST */}
                    <div className="w-2/3 p-8 flex flex-col gap-4 overflow-y-auto custom-scrollbar bg-slate-50">

                        {/* --- RECRUITMENT --- */}
                        {location.type === 'recruit' && (
                            <>
                                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-2">
                                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">Prospects</div>
                                    {candidates.length > 1 && (
                                        <button onClick={handleRecruitAll} className="text-[9px] font-bold bg-slate-200 hover:bg-emerald-500 hover:text-white px-3 py-1 rounded transition-colors uppercase">
                                            Recruit All (N$ {candidates.reduce((a, b) => a + b.cost, 0)})
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {candidates.map(candidate => (
                                        <button
                                            key={candidate.id}
                                            onClick={() => handleRecruitOne(candidate)}
                                            className="flex items-start gap-3 p-3 bg-white rounded-xl border-2 border-slate-200 hover:border-amber-400 hover:shadow-md transition-all group text-left relative overflow-hidden"
                                        >
                                            <div className="w-12 h-12 rounded bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                                <AvatarDisplay
                                                    seed={candidate.imageSeed}
                                                    role={candidate.classType}
                                                    className="w-full h-full"
                                                />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <div className="font-bold text-slate-800 text-sm truncate">{candidate.name}</div>
                                                <div className="text-[10px] font-bold text-slate-500 uppercase">{candidate.role}</div>
                                                <div className="flex gap-1 mt-1">
                                                    {candidate.stats.strength > 3 && <span className="text-[8px] bg-red-50 text-red-600 px-1 rounded border border-red-100 font-bold">STR {candidate.stats.strength}</span>}
                                                    {candidate.stats.agility > 3 && <span className="text-[8px] bg-amber-50 text-amber-600 px-1 rounded border border-amber-100 font-bold">AGI {candidate.stats.agility}</span>}
                                                </div>
                                            </div>
                                            <div className="absolute top-2 right-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                                N$ {candidate.cost}
                                            </div>
                                        </button>
                                    ))}
                                    {candidates.length === 0 && (
                                        <div className="col-span-2 text-center text-slate-400 text-xs italic py-8 border-2 border-dashed border-slate-200 rounded-xl">
                                            No more recruits available at this time.
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* --- COMBAT HUB --- */}
                        {location.type === 'combat_hub' && onStartCombat && (
                            <div className="space-y-3">
                                <div className="text-xs font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-2 text-slate-400">Select Challenge</div>
                                {Object.values(CLASSES).map(cls => (
                                    <button
                                        key={cls.type}
                                        onClick={() => onStartCombat(cls.type)}
                                        className="w-full flex items-center justify-between p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-red-500 hover:shadow-md transition-all group"
                                    >
                                        <span className="font-bold text-slate-600 group-hover:text-slate-900 uppercase text-xs">
                                            VS {cls.label}s
                                        </span>
                                        <span className="text-xl group-hover:scale-110 transition-transform">⚔️</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* --- HOSPITAL --- */}
                        {location.type === 'hospital' && (
                            <div className="space-y-4">
                                <div className="text-xs font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-2 text-slate-400">Triage</div>
                                <button
                                    onClick={() => handleActionMsg("Treatment complete. The crew is healthy.")}
                                    className="w-full py-6 bg-white border-2 border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all flex items-center justify-between px-6 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl grayscale group-hover:grayscale-0 transition-all text-red-500">🚑</div>
                                        <div className="text-left">
                                            <div className="font-black text-slate-800 uppercase text-sm">Full Recovery</div>
                                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Heal All Crew</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono font-bold text-emerald-600 text-lg">N$ 500</div>
                                        <div className="text-[9px] text-slate-400 uppercase font-bold">Flat Rate</div>
                                    </div>
                                </button>
                            </div>
                        )}

                        {/* --- ENTERTAINMENT --- */}
                        {location.type === 'entertainment' && (
                            <div className="space-y-4">
                                <div className="text-xs font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-2 text-slate-400">Menu</div>
                                <button
                                    onClick={() => { onRest && onRest(); handleActionMsg("You feel refreshed."); }}
                                    className="w-full py-5 bg-white border-2 border-slate-200 rounded-xl hover:border-purple-500 hover:shadow-md transition-all flex items-center justify-between px-6 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl grayscale group-hover:grayscale-0 transition-all">🍻</div>
                                        <div className="text-left">
                                            <div className="font-black text-slate-800 uppercase text-sm">Round of Drinks</div>
                                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Restore Action Points</div>
                                        </div>
                                    </div>
                                </button>

                                {onPlaceBounty && (
                                    <button
                                        onClick={() => setShowBounties(true)}
                                        className="w-full py-5 bg-slate-900 border-2 border-slate-950 rounded-xl hover:bg-slate-800 hover:shadow-lg transition-all flex items-center justify-between px-6 group text-white"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="text-4xl">🕵️</div>
                                            <div className="text-left">
                                                <div className="font-black uppercase text-sm">The Suspicious Man</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Place a Hit</div>
                                            </div>
                                        </div>
                                        <div className="text-amber-500 text-xl font-black">➜</div>
                                    </button>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};
