
import React, { useState, useEffect } from 'react';
import { GameState, CrewMember, ClassType, Stats } from './types';
import { CLASSES, STARTING_MONEY, RECRUIT_COST, MAX_CREW_SIZE, MAX_SAVES } from './constants';
import RecruitPanel from './components/RecruitPanel';
import CrewList from './components/CrewList';
import CharacterSelectScreen from './components/CharacterSelectScreen';
import { generateCharacterLore } from './services/geminiService';

// Mock Data for Map
const MAP_DESTINATIONS = [
  { id: 'bronx_zoo', x: 800, y: 150, label: "The Zoo", icon: "🦁" },
  { id: 'yankee', x: 400, y: 300, label: "The Stadium", icon: "⚾" },
  { id: 'times_sq', x: 400, y: 600, label: "Neon District", icon: "💡" },
  { id: 'docks', x: 100, y: 800, label: "Sunset Docks", icon: "⚓" },
  { id: 'queens', x: 1000, y: 500, label: "Queensbridge", icon: "bridge" },
];

const App: React.FC = () => {
  // Persistence State
  const [saves, setSaves] = useState<GameState[]>([]);
  const [activeSaveId, setActiveSaveId] = useState<string | null>(null);
  
  // View State
  const [view, setView] = useState<'splash' | 'create' | 'game'>('splash');
  
  // Game Interface State
  const [isRecruiting, setIsRecruiting] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [bossMessage, setBossMessage] = useState("Word on the street is opportunity. But opportunity ain't free. You gotta take it.");

  // Map Movement State
  // Coordinates based on the SVG viewBox 0 0 1500 1000
  const [playerPos, setPlayerPos] = useState({ x: 750, y: 500 });
  const [isMoving, setIsMoving] = useState(false);

  // Derived State
  const gameState = saves.find(s => s.id === activeSaveId) || null;

  // Load initial data
  useEffect(() => {
    console.log("System initialized. Welcome to NYC.");
  }, []);

  // Update a specific save in the saves array
  const updateSave = (updatedState: GameState) => {
    setSaves(prev => prev.map(s => s.id === updatedState.id ? updatedState : s));
  };

  // --- Character Selection / Splash Screen Handlers ---

  const handleSelectCharacter = (saveId: string) => {
      setActiveSaveId(saveId);
      // Update last played timestamp
      const save = saves.find(s => s.id === saveId);
      if (save) {
          updateSave({ ...save, lastPlayed: Date.now() });
      }
      setView('game');
  };

  const handleCreateNew = () => {
      if (saves.length >= MAX_SAVES) return;
      setView('create');
  };

  const handleDeleteCharacter = (saveId: string) => {
      setSaves(prev => prev.filter(s => s.id !== saveId));
  };

  // --- Recruitment & Creation Handlers ---

  const handleRecruit = async (classType: ClassType, finalStats: Stats, backstoryChoices: string[], name: string, traits: {id: string, rank: number}[]) => {
    if (view === 'create') {
        // START NEW GAME (Create Boss)
        await createNewBoss(classType, finalStats, backstoryChoices, name, traits);
    } else if (view === 'game' && gameState) {
        // RECRUIT PAWN (In-game)
        console.log("Recruitment handled elsewhere in game loop");
    }
  };

  const createNewBoss = async (classType: ClassType, finalStats: Stats, backstoryChoices: string[], customName: string, traits: {id: string, rank: number}[]) => {
    setIsRecruiting(true);
    
    const lore = await generateCharacterLore(classType);
    
    const newBoss: CrewMember = {
      id: Math.random().toString(36).substr(2, 9),
      name: customName || lore.name,
      nickname: lore.nickname,
      classType,
      stats: finalStats,
      backstory: lore.backstory + ` [Path: ${backstoryChoices.join(' > ')}]`,
      traits: traits,
      level: 1,
      isLeader: true,
      imageSeed: Math.floor(Math.random() * 1000)
    };

    const newSave: GameState = {
        id: Math.random().toString(36).substr(2, 9),
        lastPlayed: Date.now(),
        money: STARTING_MONEY,
        heat: 15,
        respect: 5,
        crew: [newBoss]
    };

    setSaves(prev => [...prev, newSave]);
    setActiveSaveId(newSave.id);
    setIsRecruiting(false);
    setView('game');
  };

  // --- Game Actions ---

  const handleRemove = (id: string) => {
    if (!gameState) return;
    const updatedState = {
        ...gameState,
        crew: gameState.crew.filter(c => c.id !== id),
        money: gameState.money + 250
    };
    updateSave(updatedState);
  };

  const handlePromote = (id: string) => {
     if (!gameState) return;
     const updatedState = {
        ...gameState,
        crew: gameState.crew.map(c => ({
            ...c,
            isLeader: c.id === id
        }))
     };
     updateSave(updatedState);
  };

  const handleLogout = () => {
    setActiveSaveId(null);
    setView('splash');
    setActiveMenu(null);
    setBossMessage("Word on the street is opportunity. But opportunity ain't free. You gotta take it.");
  };

  const toggleMenu = (menu: string) => {
      if (activeMenu === menu) {
          setActiveMenu(null);
      } else {
          setActiveMenu(menu);
      }
  };

  // --- Map Interaction ---

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (view !== 'game') return;

      // Calculate SVG coordinates from click event
      const svg = e.currentTarget.querySelector('svg');
      if (!svg) return;
      
      const rect = svg.getBoundingClientRect();
      // SVG ViewBox is 1500 x 1000
      const scaleX = 1500 / rect.width;
      const scaleY = 1000 / rect.height;

      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      setIsMoving(true);
      setPlayerPos({ x, y });

      // Simulate travel time
      setTimeout(() => setIsMoving(false), 1000);
  };

  // --- Map Component for Waze Style ---
  const WazeMapBackground = () => (
    <div 
        className={`absolute inset-0 bg-[#E8EAED] overflow-hidden select-none ${view === 'game' ? 'cursor-crosshair' : ''}`}
        onClick={handleMapClick}
    >
        {/* Water */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1500 1000" preserveAspectRatio="xMidYMid slice">
            <defs>
                <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                    <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* River / Water */}
            <path d="M -100 600 Q 300 550 600 800 T 1400 600 V 1200 H -100 Z" fill="#A8D8FF" />
            <path d="M 1200 0 Q 1100 300 1400 500 V 0 Z" fill="#A8D8FF" />

             {/* Roads - Major Highways (Yellow) */}
            <path d="M -50 200 Q 400 250 800 100 T 1600 200" fill="none" stroke="#FCE883" strokeWidth="24" strokeLinecap="round" />
            <path d="M 800 0 Q 750 400 800 1000" fill="none" stroke="#FCE883" strokeWidth="24" strokeLinecap="round" />
            <path d="M 200 1000 L 1400 -100" fill="none" stroke="#FCE883" strokeWidth="20" strokeLinecap="round" />

            {/* Roads - Arterials (White) */}
             {/* Grid-like streets */}
             <path d="M 0 150 L 1500 150" fill="none" stroke="white" strokeWidth="12" />
             <path d="M 0 350 L 1500 350" fill="none" stroke="white" strokeWidth="12" />
             <path d="M 0 550 L 1500 550" fill="none" stroke="white" strokeWidth="12" />
             <path d="M 0 750 L 1500 750" fill="none" stroke="white" strokeWidth="12" />
             
             <path d="M 200 0 L 200 1000" fill="none" stroke="white" strokeWidth="12" />
             <path d="M 400 0 L 400 1000" fill="none" stroke="white" strokeWidth="12" />
             <path d="M 600 0 L 600 1000" fill="none" stroke="white" strokeWidth="12" />
             <path d="M 1000 0 L 1000 1000" fill="none" stroke="white" strokeWidth="12" />
             <path d="M 1200 0 L 1200 1000" fill="none" stroke="white" strokeWidth="12" />

             {/* Traffic - Red segments */}
             <path d="M 200 350 L 200 550" fill="none" stroke="#FF6B6B" strokeWidth="8" opacity="0.7" />
             <path d="M 400 150 L 800 150" fill="none" stroke="#FF6B6B" strokeWidth="8" opacity="0.7" />
             <path d="M 800 100 Q 790 180 785 250" fill="none" stroke="#FFA502" strokeWidth="10" opacity="0.8" />
        </svg>

        {/* Parks (HTML overlays for blur effect) */}
        <div className="absolute top-[10%] left-[15%] w-64 h-64 bg-[#C7EBC6] rounded-full opacity-80 mix-blend-multiply filter blur-xl pointer-events-none"></div>
        <div className="absolute bottom-[20%] right-[20%] w-96 h-80 bg-[#C7EBC6] rounded-[3rem] opacity-80 pointer-events-none"></div>

        {/* Destinations */}
        {MAP_DESTINATIONS.map(dest => (
            <div 
                key={dest.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                style={{ left: `${(dest.x / 1500) * 100}%`, top: `${(dest.y / 1000) * 100}%` }}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsMoving(true);
                    setPlayerPos({ x: dest.x, y: dest.y });
                    setTimeout(() => setIsMoving(false), 1000);
                }}
            >
                <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-lg hover:scale-125 transition-transform border-2 border-slate-200 group-hover:border-amber-400">
                    {dest.icon}
                </div>
                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-wider font-waze pointer-events-none">
                    {dest.label}
                </div>
            </div>
        ))}

        {/* Player Marker */}
        <div 
            className="absolute z-20 transition-all duration-1000 ease-in-out"
            style={{ 
                left: `${(playerPos.x / 1500) * 100}%`, 
                top: `${(playerPos.y / 1000) * 100}%`,
                transform: 'translate(-50%, -50%)' 
            }}
        >
            <div className="relative">
                 {/* Avatar Circle */}
                 <div className="w-14 h-14 rounded-full bg-white border-[3px] border-white shadow-2xl overflow-hidden relative z-10 ring-2 ring-slate-900/10">
                     <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeSaveId || 'player'}&accessories=sunglasses&clothing=hoodie&clothingColor=3c4f5c&hair=shortFlat&hairColor=2c1b18&skinColor=edb98a`} 
                        alt="Player" 
                        className="w-full h-full object-cover transform scale-110 translate-y-1"
                     />
                 </div>
                 
                 {/* Pointer Triangle */}
                 <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white transform rotate-45 z-0 shadow-lg"></div>

                 {/* Shadow/Ripples */}
                 <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full bg-amber-400 opacity-30 -z-10 animate-ping ${isMoving ? 'block' : 'hidden'}`}></div>
            </div>
            
            {/* Speech Bubble if moving */}
            {isMoving && (
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-xl whitespace-nowrap">
                    On the move...
                </div>
            )}
        </div>
    </div>
  );

  // --- Render ---

  // Splash Screen
  if (view === 'splash') {
      return (
          <CharacterSelectScreen 
            saves={saves}
            onSelectCharacter={handleSelectCharacter}
            onCreateNew={handleCreateNew}
            onDeleteCharacter={handleDeleteCharacter}
          />
      );
  }

  return (
    <div className="fixed inset-0 bg-slate-100 font-waze overflow-hidden flex flex-col text-slate-900">
      
      {/* Header - Art Deco Masthead Style */}
      <header className="bg-white z-50 shadow-sm border-b-4 border-double border-slate-200 h-20 flex-shrink-0 relative">
        <div className="absolute inset-0 pattern-deco opacity-30 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between relative">
          
          {/* Brand */}
          <div className="flex flex-col items-start">
             <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-slate-900"></div>
                <div className="h-8 w-1 bg-amber-500"></div>
                <h1 className="text-4xl font-black font-news text-slate-900 tracking-tighter leading-none uppercase" style={{ textShadow: '2px 2px 0 #f1f5f9' }}>
                  Streets of New York
                </h1>
             </div>
             <span className="text-[9px] font-bold tracking-[0.4em] text-slate-400 uppercase w-full text-left ml-5 mt-1">
                The City That Never Sleeps
             </span>
          </div>
          
          {/* Top Stats (Game Started) */}
          {view === 'game' && gameState && (
              <div className="flex gap-8 items-center bg-slate-50 px-6 py-2 rounded-lg border border-slate-200 shadow-inner">
                 <div className="flex flex-col items-center">
                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Funds</span>
                     <span className="font-mono font-bold text-emerald-600">N${gameState.money.toLocaleString()}</span>
                 </div>
                 <div className="w-px h-8 bg-slate-200"></div>
                 <div className="flex flex-col items-center">
                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Influence</span>
                     <span className="font-mono font-bold text-amber-600">{gameState.respect}</span>
                 </div>
                 <div className="w-px h-8 bg-slate-200"></div>
                 <div className="flex flex-col items-center">
                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Heat</span>
                     <span className="font-mono font-bold text-red-600">{gameState.heat}%</span>
                 </div>
              </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-grow flex relative overflow-hidden">
        
        {/* Left Panel: Recruit Panel (Create Mode) */}
        {view === 'create' && (
            <div className="w-full md:w-[650px] lg:w-[800px] bg-slate-50 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.15)] flex flex-col relative border-r border-slate-200">
               <RecruitPanel 
                  onRecruit={handleRecruit}
                  onCancel={handleLogout}
                  canAfford={true}
                  isFull={false}
                  isRecruiting={isRecruiting}
                  gameStarted={false}
               />
               {/* Bottom decorative bar */}
               <div className="h-3 bg-slate-900 w-full flex-shrink-0 border-t-2 border-amber-500"></div>
            </div>
        )}

        {/* Map View (Full width when game started) */}
        <div className="flex-grow relative bg-slate-200 overflow-hidden">
           
           {/* Map Mockup with Interactivity */}
           <WazeMapBackground />
           
           {/* Map Overlay Vignette */}
           <div className="absolute inset-0 bg-gradient-to-r from-slate-100/80 via-transparent to-transparent w-64 pointer-events-none"></div>

           {/* Map UI Overlays - Top Right Info */}
           <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm pl-8 pr-10 py-4 rounded-l-xl shadow-2xl border-l-4 border-slate-900 text-right pointer-events-auto">
              <div className="text-5xl font-black font-news text-slate-900">10:44 <span className="text-lg text-slate-400 font-waze align-top ml-1">AM</span></div>
              <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mt-1">
                 Raining • 55°F • Throg's Neck
              </div>
           </div>

           {/* The Boss Bubble (Visible in Create Mode for context) */}
           {view === 'create' && (
                <div className="absolute bottom-12 left-12 right-12 flex items-end justify-center pointer-events-none">
                    <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 flex items-center gap-8 max-w-2xl border-2 border-slate-200 relative animate-bounce-slow pointer-events-auto ring-8 ring-slate-100/50">
                        <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-amber-400 shadow-lg flex-shrink-0 overflow-hidden -ml-16 -mt-12 absolute top-1/2 transform -translate-y-1/2 left-0">
                            {/* Updated Boss Avatar for Cool Factor */}
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=CoolBoss&hairColor=2c1b18&skinColor=edb98a&clotheType=BlazerShirt&eyeType=Wink&eyebrowType=DefaultNatural&mouthType=Serious&facialHairType=BeardMedium&accessoriesType=Sunglasses" alt="Boss" />
                        </div>
                        <div className="pl-12">
                            <div className="text-amber-600 font-black text-xl uppercase tracking-widest mb-2 font-news border-b-2 border-amber-100 pb-1 inline-block">
                            Secure Line
                            </div>
                            <p className="text-slate-800 font-bold text-lg leading-relaxed font-waze">
                            "{bossMessage}"
                            </p>
                        </div>
                    </div>
                </div>
           )}
           
           {/* Crew List Drawer (Game Mode) */}
           {view === 'game' && activeMenu === 'crew' && gameState && (
              <div className="absolute bottom-24 left-4 w-96 bg-white shadow-2xl border border-slate-300 rounded-lg overflow-hidden flex flex-col animate-slide-up z-30" style={{height: '70vh'}}>
                 <div className="p-4 bg-slate-900 text-white flex justify-between items-center flex-shrink-0 border-b-4 border-amber-500">
                    <div className="flex flex-col">
                        <span className="font-news text-xl font-black uppercase tracking-wider">Organization</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Active Roster</span>
                    </div>
                    <button onClick={() => setActiveMenu(null)} className="text-slate-400 hover:text-white text-xl">×</button>
                 </div>
                 <div className="flex-grow overflow-hidden">
                    <CrewList 
                        crew={gameState.crew} 
                        onRemove={handleRemove}
                        onPromote={handlePromote}
                    />
                 </div>
              </div>
           )}

           {/* Settings Drawer (Game Mode) */}
           {view === 'game' && activeMenu === 'settings' && (
              <div className="absolute bottom-24 left-4 w-96 bg-white shadow-2xl border border-slate-300 rounded-lg overflow-hidden flex flex-col animate-slide-up z-30">
                 <div className="p-4 bg-slate-900 text-white flex justify-between items-center flex-shrink-0 border-b-4 border-amber-500">
                    <div className="flex flex-col">
                        <span className="font-news text-xl font-black uppercase tracking-wider">Settings</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">System Control</span>
                    </div>
                    <button onClick={() => setActiveMenu(null)} className="text-slate-400 hover:text-white text-xl">×</button>
                 </div>
                 <div className="p-6 flex flex-col gap-6 bg-slate-50 h-full">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Game Session</label>
                        <button 
                            onClick={handleLogout}
                            className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-bold uppercase tracking-widest rounded shadow-sm border border-red-800 transition-all"
                        >
                            Logout to Menu
                        </button>
                    </div>
                 </div>
              </div>
           )}
           
        </div>
      </div>

      {/* Paradox Style Bottom Bar (Only visible when game started) */}
      {view === 'game' && (
        <div className="h-20 bg-slate-900 border-t-4 border-slate-800 z-50 flex items-center justify-between px-6 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] relative">
            
            {/* Section 1: Map Tools */}
            <div className="flex items-center gap-2 h-full mr-8">
                 <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Map Mode</span>
                    <div className="flex bg-slate-800 p-1 rounded gap-1">
                        <button className="w-8 h-8 rounded bg-amber-600 text-slate-900 flex items-center justify-center hover:bg-amber-500 font-bold text-xs shadow-lg" title="Territory">T</button>
                        <button className="w-8 h-8 rounded hover:bg-slate-700 text-slate-400 flex items-center justify-center font-bold text-xs transition-colors" title="Political">P</button>
                        <button className="w-8 h-8 rounded hover:bg-slate-700 text-slate-400 flex items-center justify-center font-bold text-xs transition-colors" title="Economic">E</button>
                        <button className="w-8 h-8 rounded hover:bg-slate-700 text-slate-400 flex items-center justify-center font-bold text-xs transition-colors" title="Heat Map">H</button>
                    </div>
                 </div>
            </div>

            {/* Section 2: Main Management Buttons (Paradox Style) */}
            <div className="flex items-center justify-center gap-3 h-full flex-grow">
                {[
                    { id: 'crew', label: 'Crew', icon: '♟️' },
                    { id: 'finances', label: 'Finances', icon: '⚖️' },
                    { id: 'diplomacy', label: 'Diplomacy', icon: '🤝' },
                    { id: 'turf', label: 'Turf', icon: '🏙️' },
                    { id: 'market', label: 'Market', icon: '📦' },
                    { id: 'journal', label: 'Journal', icon: '📓' },
                    { id: 'settings', label: 'Settings', icon: '⚙️' },
                ].map(btn => (
                    <button 
                        key={btn.id}
                        onClick={() => toggleMenu(btn.id)}
                        className={`
                            h-14 min-w-[80px] px-4 bg-gradient-to-b from-slate-800 to-slate-900 border-2 rounded flex flex-col items-center justify-center gap-0.5 transition-all
                            group hover:-translate-y-1 hover:shadow-lg hover:border-amber-500
                            ${activeMenu === btn.id ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] from-slate-800 to-slate-800 translate-y-0' : 'border-slate-700'}
                        `}
                    >
                        <span className="text-xl filter grayscale group-hover:grayscale-0 transition-all">{btn.icon}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${activeMenu === btn.id ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                            {btn.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Right Side: Date or Status */}
            <div className="flex flex-col items-end ml-8">
                 <span className="text-2xl font-black text-slate-200 font-news">Mar 9, 1997</span>
                 <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    Live
                 </span>
            </div>
        </div>
      )}

    </div>
  );
};

export default App;
