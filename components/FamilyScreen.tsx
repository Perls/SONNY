
import React, { useState } from 'react';

interface FamilyScreenProps {
  playerFaction: string;
  playerName: string;
}

interface FamilyMock {
  id: string;
  name: string;
  faction: string; // 'The Commission', 'The Cartels', 'The Street Gangs'
  reputation: number;
  motto: string;
  publicHQ: string;
  recruiterName: string;
  isRecruiting: boolean;
}

// Mock Database of Families
const FAMILY_DB: FamilyMock[] = [
  // MAFIA (The Commission)
  { 
    id: 'm1', 
    name: 'The Valenti Crime Family', 
    faction: 'The Commission', 
    reputation: 3200, 
    motto: "Omertà is forever.", 
    publicHQ: "Valenti's Steakhouse, Bronx", 
    recruiterName: "Frankie 'Lips' Forelli",
    isRecruiting: true
  },
  { 
    id: 'm2', 
    name: 'Gambino Associates', 
    faction: 'The Commission', 
    reputation: 1500, 
    motto: "We run the water.", 
    publicHQ: "Dock 42 Union Office, Brooklyn", 
    recruiterName: "Sal The Foreman",
    isRecruiting: true 
  },
  { 
    id: 'm3', 
    name: 'Sinatra Club', 
    faction: 'The Commission', 
    reputation: 800, 
    motto: "Excellence in leisure.", 
    publicHQ: "The Blue Note Jazz Bar, Manhattan", 
    recruiterName: "Mr. Blue",
    isRecruiting: false 
  },
  
  // CARTEL (The Cartels)
  { 
    id: 'c1', 
    name: 'Veracruz Cartel', 
    faction: 'The Cartels', 
    reputation: 4500, 
    motto: "Plata o Plomo.", 
    publicHQ: "El Paraiso Nightclub, Queens", 
    recruiterName: "Diego 'El Santo'",
    isRecruiting: true 
  },
  { 
    id: 'c2', 
    name: 'Los Santos', 
    faction: 'The Cartels', 
    reputation: 2000, 
    motto: "Family above all.", 
    publicHQ: "AutoBody Shop #4, Bronx", 
    recruiterName: "Mama Rosa",
    isRecruiting: true 
  },
  
  // GANGS (The Street Gangs)
  { 
    id: 'g1', 
    name: 'Neon Demons', 
    faction: 'The Street Gangs', 
    reputation: 1800, 
    motto: "Chaos reigns.", 
    publicHQ: "Abandoned Arcade, Times Square", 
    recruiterName: "Jinx",
    isRecruiting: true 
  },
  { 
    id: 'g2', 
    name: 'Brick City Kings', 
    faction: 'The Street Gangs', 
    reputation: 1200, 
    motto: "Our block, our rules.", 
    publicHQ: "Basketball Courts, Brownsville", 
    recruiterName: "King T",
    isRecruiting: true 
  },
];

const FACTION_STATS = {
    'The Commission': { 
        label: 'MAFIA', 
        control: 42, 
        kills: 8420, 
        income: 14200000, 
        hq: 'Mafia Neighborhood HQ',
        color: 'bg-red-700', 
        text: 'text-red-900', 
        border: 'border-red-400',
        textColorHeader: 'text-white' 
    },
    'The Cartels': { 
        label: 'CARTELS', 
        control: 35, 
        kills: 12150, 
        income: 18500000, 
        hq: 'Hunters Point, Queens',
        color: 'bg-[#ffb300]', 
        text: 'text-amber-900', 
        border: 'border-[#ffb300]',
        textColorHeader: 'text-black' 
    },
    'The Street Gangs': { 
        label: 'GANGS', 
        control: 23, 
        kills: 15400, 
        income: 4100000, 
        hq: 'Brownsville, Brooklyn',
        color: 'bg-purple-600', 
        text: 'text-purple-900', 
        border: 'border-purple-400',
        textColorHeader: 'text-white' 
    }
};

const FamilyScreen: React.FC<FamilyScreenProps> = ({ playerFaction, playerName }) => {
  const [mainTab, setMainTab] = useState<'family' | 'faction'>('family');
  const [subTab, setSubTab] = useState<'overview' | 'roster' | 'chat'>('overview');
  
  // Mock State for Demo
  const [hasFamily, setHasFamily] = useState(false);
  const [joinedFamily, setJoinedFamily] = useState<FamilyMock | null>(null);

  // Filter families based on player faction logic
  const availableFamilies = FAMILY_DB.filter(f => {
      if (playerFaction.includes('Commission') || playerFaction.includes('Mafia')) return f.faction === 'The Commission';
      if (playerFaction.includes('Cartel')) return f.faction === 'The Cartels';
      if (playerFaction.includes('Gang')) return f.faction === 'The Street Gangs';
      return true; // Independent sees all
  });

  const sortedFamilies = [...availableFamilies].sort((a, b) => b.reputation - a.reputation);

  const handleJoin = (family: FamilyMock) => {
      setJoinedFamily(family);
      setHasFamily(true);
  };

  const handleLeave = () => {
      setHasFamily(false);
      setJoinedFamily(null);
      setMainTab('family'); // Reset to recruitment view
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-waze text-slate-900">
        
        {/* Top Navigation Bar */}
        <div className="flex bg-slate-900 border-b border-slate-800 flex-shrink-0 px-4 pt-2">
             <button
                onClick={() => setMainTab('family')}
                className={`
                    px-8 py-4 text-sm font-black uppercase tracking-widest transition-all rounded-t-lg flex items-center gap-2
                    ${mainTab === 'family' 
                        ? 'bg-slate-50 text-slate-900 translate-y-0.5 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]' 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                    }
                `}
             >
                 <span className="text-lg opacity-80">🦁</span>
                 My Family
             </button>
             <button
                onClick={() => setMainTab('faction')}
                className={`
                    px-8 py-4 text-sm font-black uppercase tracking-widest transition-all rounded-t-lg flex items-center gap-2
                    ${mainTab === 'faction' 
                        ? 'bg-slate-50 text-slate-900 translate-y-0.5 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]' 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                    }
                `}
             >
                 <span className="text-lg opacity-80">⚔️</span>
                 Faction War
             </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-hidden relative flex">
            
            {/* --- TAB 1: FAMILY --- */}
            {mainTab === 'family' && (
                !hasFamily ? (
                    // RECRUITMENT VIEW
                    <div className="flex-grow flex flex-col p-8 bg-slate-100 w-full">
                        <div className="mb-6 flex justify-between items-end border-b border-slate-300 pb-4">
                            <div>
                                <h2 className="text-3xl font-black font-news text-slate-800 uppercase tracking-tight">Family Recruitment</h2>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                                    Faction: <span className="text-amber-600">{playerFaction}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Available Families</div>
                                <div className="text-2xl font-mono font-bold text-slate-700">{sortedFamilies.length}</div>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto custom-scrollbar space-y-4">
                            {sortedFamilies.map((fam, index) => (
                                <div key={fam.id} className="bg-white border-2 border-slate-200 rounded-xl p-6 flex items-center gap-6 shadow-sm hover:border-amber-400 hover:shadow-lg transition-all group">
                                    <div className="flex flex-col items-center justify-center w-16 text-slate-300 group-hover:text-amber-500 transition-colors">
                                        <div className="text-xs font-black uppercase tracking-widest">Rank</div>
                                        <div className="text-3xl font-black font-mono">{index + 1}</div>
                                    </div>
                                    
                                    <div className="w-px h-24 bg-slate-200"></div>

                                    <div className="flex-grow pl-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-black text-slate-800 uppercase font-news group-hover:text-amber-700 transition-colors">{fam.name}</h3>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border tracking-wider ${fam.isRecruiting ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                                {fam.isRecruiting ? 'Open Recruitment' : 'Closed'}
                                            </span>
                                        </div>
                                        
                                        <p className="text-sm text-slate-500 italic font-serif font-medium mb-4">"{fam.motto}"</p>
                                        
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div>
                                                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-widest block mb-0.5">Public HQ</span>
                                                <span className="font-bold text-slate-700 flex items-center gap-1">
                                                    <span>📍</span> {fam.publicHQ}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-widest block mb-0.5">Contact</span>
                                                <span className="font-bold text-slate-700 flex items-center gap-1">
                                                    <span>☎️</span> {fam.recruiterName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => handleJoin(fam)}
                                        disabled={!fam.isRecruiting}
                                        className={`px-6 py-3 rounded-lg font-black uppercase tracking-widest text-xs transition-all shadow-md whitespace-nowrap 
                                            ${fam.isRecruiting 
                                                ? 'bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-900' 
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'}
                                        `}
                                    >
                                        {fam.isRecruiting ? 'Pledge Loyalty' : 'Invite Only'}
                                    </button>
                                </div>
                            ))}
                            {sortedFamilies.length === 0 && (
                                <div className="text-center py-12 text-slate-400 italic">No families currently recruiting in this sector.</div>
                            )}
                        </div>
                    </div>
                ) : (
                    // JOINED DASHBOARD
                    <div className="flex w-full h-full bg-slate-50">
                        {/* Sidebar */}
                        <div className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
                            <div className="p-6 border-b border-slate-100">
                                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-4xl mb-3 shadow-inner">
                                    🦁
                                </div>
                                <h3 className="font-black font-news text-slate-800 uppercase text-lg leading-tight">{joinedFamily?.name}</h3>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Rep: {joinedFamily?.reputation.toLocaleString()}</div>
                            </div>
                            
                            <div className="flex-grow py-4 space-y-1">
                                <button 
                                    onClick={() => setSubTab('overview')}
                                    className={`w-full text-left px-6 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all ${subTab === 'overview' ? 'bg-slate-100 text-amber-600 border-r-4 border-amber-500' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                                >
                                    <span>🏰</span> Overview
                                </button>
                                <button 
                                    onClick={() => setSubTab('roster')}
                                    className={`w-full text-left px-6 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all ${subTab === 'roster' ? 'bg-slate-100 text-amber-600 border-r-4 border-amber-500' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                                >
                                    <span>👥</span> Roster
                                </button>
                                <button 
                                    onClick={() => setSubTab('chat')}
                                    className={`w-full text-left px-6 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all ${subTab === 'chat' ? 'bg-slate-100 text-amber-600 border-r-4 border-amber-500' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                                >
                                    <span>💬</span> Secure Comms
                                </button>
                            </div>

                            <div className="p-4 border-t border-slate-200">
                                <button onClick={handleLeave} className="w-full py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded font-bold uppercase text-[10px] tracking-widest transition-colors">
                                    Leave Family
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-grow p-8 overflow-y-auto custom-scrollbar">
                            {subTab === 'overview' && (
                                <div className="space-y-6 animate-fade-in">
                                    {/* Boss Message */}
                                    <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-black text-amber-800 uppercase tracking-widest">Word from the Don</span>
                                            <span className="text-[10px] font-bold text-amber-600/60 uppercase">Today at 9:00 AM</span>
                                        </div>
                                        <p className="font-serif italic text-slate-700 leading-relaxed text-sm">
                                            "Respect the truce in Queens. We focus on the docks shipment tonight. Anyone caught starting fights in neutral territory pays the tax."
                                        </p>
                                    </div>

                                    {/* Active Rackets */}
                                    <div>
                                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span>⚡</span> Active Rackets
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm flex items-center gap-4">
                                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-2xl">💰</div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-sm">Protection Money</div>
                                                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">+10% Passive Income</div>
                                                </div>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm flex items-center gap-4">
                                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">🔫</div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-sm">Arms Deal</div>
                                                    <div className="text-[10px] font-bold text-red-600 uppercase tracking-wide">-15% Ammo Cost</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {subTab === 'roster' && (
                                <div className="animate-fade-in bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-100 border-b border-slate-200">
                                            <tr>
                                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Rank</th>
                                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Name</th>
                                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {[
                                                { rank: 'Don', name: 'Vinnie "The Chin"', status: 'Online', online: true },
                                                { rank: 'Underboss', name: 'Salvatore G.', status: 'Away', online: true },
                                                { rank: 'Consigliere', name: 'Tommaso', status: 'Online', online: true },
                                                { rank: 'Capo', name: 'Paulie Walnuts', status: 'In Combat', online: true },
                                                { rank: 'Soldier', name: playerName, status: 'Online (You)', online: true },
                                                { rank: 'Soldier', name: 'Chris M.', status: 'Offline', online: false },
                                            ].map((member, i) => (
                                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-4 text-xs font-bold text-amber-700 uppercase">{member.rank}</td>
                                                    <td className="p-4 text-sm font-bold text-slate-800">{member.name}</td>
                                                    <td className="p-4 text-xs font-bold text-right">
                                                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${member.online ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                                        <span className={member.online ? 'text-emerald-700' : 'text-slate-400'}>{member.status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {subTab === 'chat' && (
                                <div className="flex flex-col h-full animate-fade-in bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                                    <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-slate-50/50">
                                        <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest my-2">Today</div>
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-300 flex-shrink-0"></div>
                                            <div>
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className="text-xs font-black text-slate-700">Vinnie</span>
                                                    <span className="text-[9px] font-bold text-slate-400">10:42 AM</span>
                                                </div>
                                                <div className="bg-white border border-slate-200 p-2 rounded-r-lg rounded-bl-lg text-xs text-slate-600 shadow-sm">
                                                    Make sure you hit the gym today. We need muscle for the sit-down tomorrow.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 flex-row-reverse">
                                            <div className="w-8 h-8 rounded-full bg-amber-200 flex-shrink-0"></div>
                                            <div className="text-right">
                                                <div className="flex items-baseline gap-2 mb-1 justify-end">
                                                    <span className="text-[9px] font-bold text-slate-400">10:45 AM</span>
                                                    <span className="text-xs font-black text-slate-700">You</span>
                                                </div>
                                                <div className="bg-amber-100 border border-amber-200 p-2 rounded-l-lg rounded-br-lg text-xs text-slate-800 shadow-sm text-left">
                                                    Understood, boss. I'm on it.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 border-t border-slate-200 bg-white flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Type a message..."
                                            className="flex-grow bg-slate-100 border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                                        />
                                        <button className="bg-slate-900 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wide">
                                            Send
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            )}

            {/* --- TAB 2: FACTION WAR --- */}
            {mainTab === 'faction' && (
                <div className="flex-grow p-8 overflow-y-auto custom-scrollbar bg-slate-100 w-full">
                    {/* Placeholder Implementation */}
                    <div className="grid grid-cols-3 gap-6">
                        {Object.entries(FACTION_STATS).map(([name, stats]) => (
                            <div key={name} className={`bg-white rounded-xl overflow-hidden border-t-4 shadow-sm ${stats.border}`}>
                                <div className={`${stats.color} p-4 ${stats.textColorHeader || 'text-white'} text-center`}>
                                    <h3 className="text-2xl font-black font-news uppercase tracking-tighter">{stats.label}</h3>
                                    <div className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{name}</div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Control</span>
                                        <span className={`text-2xl font-black ${stats.text}`}>{stats.control}%</span>
                                    </div>
                                    <div className="space-y-3 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 font-bold uppercase">Income</span>
                                            <span className="font-mono font-bold text-slate-700">N$ {stats.income.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 font-bold uppercase">Casualties</span>
                                            <span className="font-mono font-bold text-slate-700">{stats.kills.toLocaleString()}</span>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Stronghold</span>
                                            <div className="font-bold text-slate-800">{stats.hq}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    </div>
  );
};

export default FamilyScreen;