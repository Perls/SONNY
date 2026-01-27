
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GameState, Holding, CrewMember, InventoryItem, PawnRole, CombatPreferences, ActiveMission, Tag, TaggingOperation, MapTagData, GameEvent, EventOption, Officer, ClassType, Stats, Friend, PhoneMessage, PlayerHousing, GameNotification, NotificationType, NotificationSound } from '../types';
import { STARTING_MONEY, MAX_CREW_SIZE, ITEMS, TALENT_TREES, CONNECTION_OPTIONS, XP_TO_LEVEL_2, XP_TO_LEVEL_3, PAWN_JOBS, MAX_CREW_LEVEL } from '../constants';
import { CONNECTION_DATA } from '../data/connectionData';
import { PHONE_DIRECTORY } from '../data/phoneDirectory';
import { EVENTS } from '../data/events';
import { MAP_DESTINATIONS } from '../utils/mapUtils';
import { useMapMovement } from '../hooks/useMapMovement';
import { useMapCamera } from '../hooks/useMapCamera';
import { useItemSystem } from '../hooks/useItemSystem';
import { useBuffs } from '../hooks/useBuffs';
import { usePurchase } from '../hooks/usePurchase';
import { useCityTime } from '../utils/timeData';
import { playSound } from '../utils/audioUtils';
import { TEST_BOSS_SAVE, THUG_BOSS_SAVE, SMUGGLER_BOSS_SAVE, DEALER_BOSS_SAVE, ENTERTAINER_BOSS_SAVE } from '../data/initialData';

// Define Context Type
interface GameEngineContextType {
    // State
    gameState: GameState | null;
    saves: GameState[];
    activeSaveId: string | null;
    view: string;
    activeMenu: string | null;
    activeMapMode: string;
    isMapModesOpen: boolean;
    activeLocation: Holding | null;
    selectedGrid: { x: number, y: number } | null;
    missionTargeting: any;
    consigliereQueue: string[];
    consigliereOpen: boolean;
    notificationQueue: GameNotification[];
    activeMinigameId: string | null;
    isHousingOpen: boolean;
    setIsHousingOpen: (isOpen: boolean) => void;
    isIndustrialJobActive: boolean;
    inspectedUnitId: string | null;
    isRecruiting: boolean;
    
    // Derived/Hooks
    currentTime: Date;
    weather: any;
    locationLabel: string;
    
    // Map/Camera
    viewBox: string;
    zoomLevel: number;
    playerGridPos: { x: number, y: number };
    playerPos: { x: number, y: number };
    isMoving: boolean;
    isArriving: boolean;
    isMovementRejected: boolean;
    visitedPath: any[];
    movementQueue: { x: number, y: number }[];
    moveDuration: number;
    energyTransitionDuration: number;
    energyTransitionEasing: string;
    mapHandlers: any;
    isDraggingMap: boolean;
    cameraStyle: any;
    cameraRotation: any;
    zoomControls: any;
    cameraMode: 'cinematic' | 'default';
    setCameraMode: (mode: 'cinematic' | 'default') => void;
    
    // Actions
    updateSave: (newState: GameState) => void;
    handleSelectCharacter: (id: string) => void;
    handleCreateNew: () => void;
    handleRecruit: (classType: ClassType, stats: Stats, backstory: string[], name: string, nickname: string, phoneNumber: string, traits: {id: string, rank: number}[], borough: string, imageSeed: string) => void;
    handleDeleteCharacter: (id: string) => void;
    handleLogout: () => void;
    
    toggleMenu: (menu: string) => void;
    setActiveMenu: (menu: string | null) => void;
    setConsigliereOpen: (open: boolean) => void;
    handleNextConsigliere: () => void;
    triggerConsigliere: (msg: string) => void;
    addNotification: (params: { title: string, message?: string, type: NotificationType, icon?: string, sound?: NotificationSound, duration?: number }) => void;
    dismissNotification: (id: string) => void;
    triggerFeedback: (msg: string, type: 'success' | 'error') => void;
    feedback: any;
    
    handleGridClick: (x: number, y: number) => void;
    handleGridDoubleClick: (x: number, y: number) => void;
    setSelectedGrid: (grid: { x: number, y: number } | null) => void;
    setActiveLocation: (loc: any) => void;
    handleVisitLocation: (landmarkId: string) => void;
    handleEnterBuilding: (building: any, isOwned: boolean) => void;
    handlePurchaseHolding: (holding: Holding) => void;
    handleUpgradeHolding: (holdingId: string, cost: number) => void;
    handleBuildingCollection: () => void;
    handleUpdateCorner: (id: string, crew: string[], products: string[], config: any) => void;
    handleUpdateProtection: (id: string, crew: string[], config?: any) => void;
    handleSetupBrothel: (holdingId: string) => void;
    handleSetSafehouse: (holding: Holding) => void;
    handleClaimCorner: (x: number, y: number) => void;
    handleEstablishProtection: (x: number, y: number) => void;
    
    handleTravel: (x: number, y: number) => void;
    handleCancelTravel: () => void;
    
    handleSelectMapMode: (mode: string) => void;
    handleToggleMapModes: () => void;
    handleClearAvoidedAreas: () => void;
    
    // Combat/Crew
    handleStartCombat: (enemyClass?: ClassType | null) => void;
    handleCombatEnd: (won: boolean, deadUnitIds: string[], survivorHealth: Record<string, number>) => void;
    activeEnemyClass: ClassType | null;
    handleHealCrew: (cost: number) => void;
    handleRecruitPawn: (details: any, cost: number) => void;
    handleBulkRecruit: (recruits: any[]) => void;
    handleRemove: (id: string) => void;
    handlePromote: (id: string) => void;
    handlePromoteToOfficer: (pawnId: string, officerSlotIdx: number) => void;
    handleUpdateOfficer: (index: number, officer: Officer) => void;
    handleAssignMission: (officerIndex: number, missionIndex: number) => void;
    handleInspectCharacter: (id: string) => void;
    setInspectedUnitId: (id: string | null) => void;
    
    handleUpdateTactic: (type: 'offensive' | 'defensive', tacticId: string) => void;
    handleUpdateTalents: (memberId: string, talentId: string, op?: 'add' | 'remove' | 'reset') => void;
    handleUpdateFormation: (formation: any) => void;
    handlePromotePawn: (id: string, role: PawnRole) => void;
    handleUpdateRetreatThreshold: (val: number) => void;
    handleToggleAbility: (abilityId: string) => void;
    handleUpdateLoadout: (memberId: string, abilities: string[]) => void;
    handleUpdateCombatPreferences: (prefs: CombatPreferences) => void;
    handleUpdateStatus: (id: string, status: string) => void;

    // Items/Crafting
    handleUseItem: (memberId: string, itemId: string) => void;
    handleEquipItem: (memberId: string, item: InventoryItem) => void;
    handleUnequipItem: (memberId: string, slot: any) => void;
    handleCraft: (ingredients: string[]) => boolean;
    handleBuyItem: (item: any) => void;
    
    // Ops/Minigames
    handleStartMission: (type: any, x: number, y: number, crewIds: string[], duration: number, desc: string) => void;
    startMinigame: (id: string) => void;
    closeMinigame: () => void;
    handleCompleteMinigame: (payout: number, msg: string) => void;
    setIsIndustrialJobActive: (active: boolean) => void;
    handleCompleteIndustrialJob: (payout: number, message: string) => void;
    handleNightclubAction: (action: string, cost: number) => void;
    handleStartTagging: (x: number, y: number, slotIndex: number, tagId: string) => void;
    handleStartErasing: (x: number, y: number, slotIndex: number) => void;
    handleSaveTag: (tag: Tag) => void;
    handleDeleteTag: (tagId: string) => void;
    
    // Comms
    handlePayphoneUse: (amount: number) => void;
    handleSendPlayerMessage: (recipient: string, body: string) => void;
    handleAddSpeedDial: (name: string, number: string) => void;
    handleDeleteMessage: (id: string) => void;
    handleMarkMessageRead: (id: string) => void;
    
    // Events/Buffs
    handleApplyBuff: (memberId: string, buffId: string) => void;
    triggerEvent: (eventId: string) => void;
    resolveEventOption: (option: EventOption) => void;
    
    // Misc
    handleAddXp: (amount: number) => void;
    handleRestoreEnergy: (amount: number) => void;
    handleRefillEnergy: () => void;
    handlePlaceBounty: (bounty: any) => void;
    handleRobbery: () => void;
    
    // UI Settings
    radioChannel: number;
    setRadioChannel: (n: number) => void;
    visualEffectsEnabled: boolean;
    setVisualEffectsEnabled: (b: boolean) => void;
    consigliereEnabled: boolean;
    setConsigliereEnabled: (b: boolean) => void;
    levelUpFlash: boolean;
    triggerLevelUpFlash: () => void;
    
    // Data
    activeOfficerTravels: any[];
    officers: Officer[];
    
    // Helpers (for snippet compat)
    mapMovement: any;
    setMissionTargeting: (t: any) => void;
}

const GameEngineContext = createContext<GameEngineContextType | undefined>(undefined);

export const useGameEngine = () => {
    const context = useContext(GameEngineContext);
    if (!context) throw new Error("useGameEngine must be used within a GameEngineProvider");
    return context;
};

export const GameEngineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // --- STATE ---
    const [view, setView] = useState<string>('splash');
    const [saves, setSaves] = useState<GameState[]>([TEST_BOSS_SAVE, THUG_BOSS_SAVE, SMUGGLER_BOSS_SAVE, DEALER_BOSS_SAVE, ENTERTAINER_BOSS_SAVE]);
    const [activeSaveId, setActiveSaveId] = useState<string | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    
    // UI State
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [activeMapMode, setActiveMapMode] = useState('holdings');
    const [isMapModesOpen, setIsMapModesOpen] = useState(false);
    const [activeLocation, setActiveLocation] = useState<any | null>(null);
    const [selectedGrid, setSelectedGrid] = useState<{ x: number, y: number } | null>(null);
    const [missionTargeting, setMissionTargeting] = useState<any>(null);
    const [consigliereQueue, setConsigliereQueue] = useState<string[]>([]);
    const [consigliereOpen, setConsigliereOpen] = useState(false);
    const [notificationQueue, setNotificationQueue] = useState<GameNotification[]>([]);
    const [activeMinigameId, setActiveMinigameId] = useState<string | null>(null);
    const [isHousingOpen, setIsHousingOpen] = useState(false);
    const [isIndustrialJobActive, setIsIndustrialJobActive] = useState(false);
    const [inspectedUnitId, setInspectedUnitId] = useState<string | null>(null);
    const [isRecruiting, setIsRecruiting] = useState(false);
    const [feedback, setFeedback] = useState<any>(null);
    const [levelUpFlash, setLevelUpFlash] = useState(false);
    const [activeEnemyClass, setActiveEnemyClass] = useState<ClassType | null>(null);
    const [officers, setOfficers] = useState<Officer[]>([]);

    // Settings
    const [radioChannel, setRadioChannel] = useState(0);
    const [visualEffectsEnabled, setVisualEffectsEnabled] = useState(true);
    const [consigliereEnabled, setConsigliereEnabled] = useState(true);
    const [cameraMode, setCameraMode] = useState<'cinematic' | 'default'>('cinematic');

    // Time & Audio
    const { currentTime, weather } = useCityTime();

    // Map Hooks
    const mapCamera = useMapCamera({ x: 750, y: 500 }, cameraMode);
    const mapMovement = useMapMovement({
        gameState,
        updateSave: (ns) => setGameState(ns),
        onArrival: (target) => { 
             // Check connection quest arrival
             if (!gameState) return;
             const friend = gameState.friends?.find(f => CONNECTION_DATA[f.id]);
             const profile = friend ? CONNECTION_DATA[friend.id] : null;
             
             if (profile && profile.meetingLocation.x === target.x && profile.meetingLocation.y === target.y) {
                 triggerConsigliere(`Arrived at ${profile.meetingLocation.label}. Contact found.`);
                 setSelectedGrid({ x: target.x, y: target.y });
             }
        },
        setCameraPos: mapCamera.setCameraPos,
        onError: (msg) => triggerFeedback(msg, 'error')
    });

    // Actions Wrapper
    const updateSave = (newState: GameState) => {
        setGameState(newState);
        setSaves(prev => prev.map(s => s.id === newState.id ? newState : s));
    };

    const triggerConsigliere = (message: string) => {
        if (!consigliereEnabled) return;
        setConsigliereQueue(prev => [...prev, message]);
        setConsigliereOpen(true);
    };

    // Sub-Systems
    const itemSystem = useItemSystem({ gameState, updateSave, triggerConsigliere });
    const buffSystem = useBuffs({ gameState, updateSave, triggerConsigliere });
    const purchaseSystem = usePurchase({ gameState, updateSave });

    const handleNextConsigliere = () => {
        setConsigliereQueue(prev => prev.slice(1));
        if (consigliereQueue.length <= 1) setConsigliereOpen(false);
    };

    const addNotification = (params: { title: string, message?: string, type: NotificationType, icon?: string, sound?: NotificationSound, duration?: number }) => {
        setNotificationQueue(prev => [...prev, { 
            id: Math.random().toString(), 
            title: params.title,
            message: params.message,
            type: params.type,
            icon: params.icon,
            sound: params.sound,
            duration: params.duration,
            timestamp: Date.now() 
        }]);
    };

    const dismissNotification = (id: string) => {
        setNotificationQueue(prev => prev.filter(n => n.id !== id));
    };

    const triggerFeedback = (message: string, type: 'success' | 'error') => {
        setFeedback({ message, type });
        if (type === 'error') playSound('error');
    };
    
    // --- EVENT SYSTEM LOGIC ---
    const triggerEvent = (eventId: string) => {
        const eventData = EVENTS[eventId];
        if (eventData) {
            setSelectedGrid(null);
            
            // Dynamic Text Replacement
            let dynamicDescription = eventData.description;
            
            // Inject Highest Stat
            if (dynamicDescription.includes('{{HIGHEST_STAT}}')) {
                const leader = gameState?.crew.find(c => c.isLeader) || gameState?.crew[0];
                let highestStat = 'Strength';
                
                if (leader) {
                    const stats = leader.stats;
                    const maxEntry = Object.entries(stats).reduce((max, [key, val]) => {
                         if (typeof val === 'number' && ['strength', 'agility', 'intelligence', 'luck', 'charisma'].includes(key)) {
                             if (val > max.val) return { key, val: val as number };
                         }
                         return max;
                    }, { key: 'strength', val: -1 });
                    
                    highestStat = maxEntry.key.charAt(0).toUpperCase() + maxEntry.key.slice(1);
                }
                dynamicDescription = dynamicDescription.replace('{{HIGHEST_STAT}}', highestStat);
            }

            setActiveLocation({
                id: `event-${eventId}`,
                x: mapMovement.playerGridPos.x,
                y: mapMovement.playerGridPos.y,
                name: eventData.title,
                type: 'event',
                level: 1,
                maxLevel: 1,
                income: 0,
                cost: 0,
                eventData: { ...eventData, description: dynamicDescription } 
            });
        } else {
            console.error(`Event ${eventId} not found.`);
        }
    };

    const resolveEventOption = (option: EventOption) => {
        if (!gameState) return;
        
        let newMoney = gameState.money + (option.effects.money || 0);
        let newHeat = Math.max(0, gameState.heat + (option.effects.heat || 0));
        let newRespect = gameState.respect + (option.effects.respect || 0);
        
        let newInventory = [...gameState.inventory];
        if (option.effects.item) {
             newInventory.push({ id: Math.random().toString(), itemId: option.effects.item, quantity: 1 });
        }
        
        const newState = { ...gameState, money: newMoney, heat: newHeat, respect: newRespect, inventory: newInventory };
        
        if (option.completeEventId) {
             const completed = new Set(gameState.completedEvents || []);
             completed.add(option.completeEventId);
             newState.completedEvents = Array.from(completed);
        }

        updateSave(newState);

        if (option.nextEventId) {
            triggerEvent(option.nextEventId);
        } else {
            setActiveLocation(null);
        }

        if (option.effects.combat) {
            handleStartCombat();
        }
    };

    // --- OTHER HANDLERS ---
    const handleGridClick = (x: number, y: number) => {
        if (missionTargeting) {
            missionTargeting.callback(x, y);
            setMissionTargeting(null);
            return;
        }
        if (selectedGrid?.x === x && selectedGrid?.y === y) {
            setSelectedGrid(null);
        } else {
            setSelectedGrid({ x, y });
            setActiveLocation(null);
        }
    };

    const handleGridDoubleClick = (x: number, y: number) => {
        mapMovement.startMovement(x, y);
    };

    const handleStartCombat = (enemyClass: ClassType | null = null) => {
        setActiveEnemyClass(enemyClass);
        setView('combat');
    };
    
    const handleRecruit = (classType: ClassType, stats: Stats, backstory: string[], name: string, nickname: string, phoneNumber: string, traits: {id: string, rank: number}[], borough: string, imageSeed: string) => {
        const starterHolding: Holding = {
            id: Math.random().toString(36).substr(2, 9),
            x: 1, y: 3, slotIndex: 2,
            name: 'Tenement 13-2 - Apt 1A',
            type: 'residential',
            level: 1, maxLevel: 3, income: 0, cost: 0,
            ownerFaction: 'player', icon: '🏠', description: 'Starter Safehouse', unitId: '1A'
        };
        
        const connectionId = backstory.find(id => CONNECTION_DATA[id]);
        const initialMessages: PhoneMessage[] = [];
        const speedDials: { name: string, number: string }[] = Array(4).fill({ name: 'EMPTY', number: '' });
        const initialFriends: Friend[] = [];

        if (connectionId) {
            const connection = CONNECTION_DATA[connectionId];
            initialMessages.push({
                id: `msg-init-${Date.now()}`,
                sender: connection.name,
                body: connection.introMessage,
                timestamp: Date.now(),
                isRead: false
            });
            speedDials[0] = { name: connection.name.split(' ')[0].toUpperCase(), number: connection.phoneNumberDial };
            initialFriends.push({
                id: connection.id,
                name: connection.name,
                classType: connection.classType,
                level: 5,
                imageSeed: connection.avatarSeed,
                phoneNumber: connection.phoneNumberDisplay,
                status: 'Online',
                isButtonman: true
            });
        }

        const newSave: GameState = {
            id: Math.random().toString(36).substr(2, 9),
            lastPlayed: Date.now(),
            money: STARTING_MONEY,
            heat: 0, respect: 0, currentEnergy: 50,
            crew: [{
                id: Math.random().toString(36).substr(2, 9),
                name, nickname, classType, stats: { ...stats, maxHp: 20 + stats.strength * 3 },
                backstory: backstory.join(' '), originPath: backstory,
                traits, talents: {}, activeAbilities: ['skull_bash'],
                level: 1, xp: 0, maxXp: 1000, hp: 20 + stats.strength * 3,
                isLeader: true, imageSeed, faction: 'Independent', phoneNumber
            }],
            officers: [
                { id: 'off-1', role: 'Consigliere', isEmpty: true, activeMissionIdx: 0, salary: 0 },
                { id: 'off-2', role: 'Underboss', isEmpty: true, activeMissionIdx: 0, salary: 0 },
                { id: 'off-3', role: 'Enforcer', isEmpty: true, activeMissionIdx: 0, salary: 0 },
                { id: 'off-4', role: 'Lawyer', isEmpty: true, activeMissionIdx: 0, salary: 0 }
            ],
            inventory: [],
            holdings: [starterHolding],
            playerHousing: {
                id: `housing-${starterHolding.id}`,
                name: starterHolding.name,
                type: 'tenement', upgrades: [],
                location: { x: 1, y: 3 },
                storedMoney: 0, stationedCrewIds: [],
                messages: initialMessages, speedDials: speedDials,
                inventory: [],
                storage: [],
                furniture: { tv: null, computer: null, bed: null, music: null, coffee: null }
            },
            tags: [], mapTags: {}, activeTaggingOps: [], activeMissions: [], activeBounties: [],
            offensiveTactic: 'aggressive', defensiveTactic: 'hold_center', formation: {}, journal: [],
            friends: initialFriends, playerPhoneNumber: phoneNumber,
            currentLocation: { x: 1, y: 3 }
        };
        
        setSaves(prev => [...prev, newSave]);
        setGameState(newSave);
        setActiveSaveId(newSave.id);
        setOfficers(newSave.officers || []);
        
        mapMovement.setPlayerGridPos({ x: 1, y: 3 });
        mapMovement.setPlayerPos({ x: 100, y: 300 });

        setView('game');
    };

    const handleRecruitPawn = (details: any, cost: number) => {
        if (!gameState) return;
        const newCrew = {
            ...details,
            id: Math.random().toString(36).substr(2, 9),
            level: 1, xp: 0, maxXp: 1000,
            hp: 20 + details.stats.strength * 3,
            isLeader: false, traits: [], talents: {},
            activeAbilities: ['skull_bash'],
            faction: gameState.crew[0].faction
        };
        updateSave({ ...gameState, money: gameState.money - cost, crew: [...gameState.crew, newCrew] });
        triggerFeedback("New soldier recruited!", 'success');
    };

    const handleUpgradeHolding = (id: string, cost: number) => {
        if (!gameState) return;
        const newHoldings = gameState.holdings.map(h => {
            if (h.id === id) {
                return { ...h, level: h.level + 1, income: Math.floor(h.income * 1.5) };
            }
            return h;
        });
        updateSave({ ...gameState, money: gameState.money - cost, holdings: newHoldings });
        triggerFeedback("Property Upgraded!", 'success');
    };

    const handleUpdateStatus = (id: string, status: string) => {
         if (!gameState) return;
         const newCrew = gameState.crew.map(c => c.id === id ? { ...c, statusMessage: status } : c);
         updateSave({ ...gameState, crew: newCrew });
    };

    const handleClaimCorner = (x: number, y: number) => { 
        if(gameState) { 
            const newHolding: Holding = { 
                id: Math.random().toString(36).substr(2, 9), 
                x, y, slotIndex: 800, 
                name: `Corner ${x}-${y}`, type: 'corner', 
                level: 1, maxLevel: 5, income: 100, cost: 0, 
                ownerFaction: 'player', icon: '🏙️', 
                cornerData: { assignedCrewIds: [], activeProducts: [], productionConfig: { cut: 50, price: 50 } } 
            }; 
            updateSave({ ...gameState, holdings: [...gameState.holdings, newHolding] }); 
            triggerFeedback("Corner claimed!", 'success'); 
        } 
    };

    const handleEstablishProtection = (x: number, y: number) => { 
        if(gameState) { 
            const newHolding: Holding = { 
                id: Math.random().toString(36).substr(2, 9), 
                x, y, slotIndex: 801, 
                name: `Protection Racket ${x}-${y}`, type: 'protection_racket', 
                level: 1, maxLevel: 3, income: 150, cost: 0, 
                ownerFaction: 'player', icon: '🛡️', 
                protectionData: { assignedCrewIds: [], patrolLevel: 1 } 
            }; 
            updateSave({ ...gameState, holdings: [...gameState.holdings, newHolding] }); 
            triggerFeedback("Protection established!", 'success'); 
        } 
    };
    
    // --- Context Value ---
    const value: GameEngineContextType = {
        gameState, saves, activeSaveId, view, activeMenu, activeMapMode, isMapModesOpen, activeLocation, selectedGrid, missionTargeting, consigliereQueue, consigliereOpen, notificationQueue, activeMinigameId, isHousingOpen, setIsHousingOpen, isIndustrialJobActive, inspectedUnitId, isRecruiting, feedback,
        currentTime, weather, locationLabel: "NYC",
        viewBox: mapCamera.viewBox, zoomLevel: mapCamera.zoomLevel,
        playerGridPos: mapMovement.playerGridPos, playerPos: mapMovement.playerPos, isMoving: mapMovement.isMoving, isArriving: mapMovement.isArriving, isMovementRejected: mapMovement.isMovementRejected, visitedPath: mapMovement.visitedPath, movementQueue: mapMovement.movementQueue, moveDuration: mapMovement.moveDuration, energyTransitionDuration: mapMovement.energyTransitionDuration, energyTransitionEasing: mapMovement.energyTransitionEasing,
        mapHandlers: mapCamera.handlers, isDraggingMap: mapCamera.isDraggingMap, cameraStyle: mapCamera.cameraStyle, cameraRotation: mapCamera.rotation, zoomControls: mapCamera.controls,
        cameraMode, setCameraMode,
        updateSave, handleSelectCharacter: (id) => { 
            const save = saves.find(s => s.id === id);
            if (save) {
                setActiveSaveId(id); setGameState(save); setView('game');
                setOfficers(save.officers || []);
                if (save.currentLocation) {
                    mapMovement.setPlayerGridPos(save.currentLocation);
                    mapMovement.setPlayerPos({ x: save.currentLocation.x * 100, y: save.currentLocation.y * 100 });
                }
            }
        },
        handleCreateNew: () => setView('create'),
        handleRecruit,
        handleDeleteCharacter: (id) => setSaves(prev => prev.filter(s => s.id !== id)),
        handleLogout: () => setView('splash'),
        toggleMenu: (m) => setActiveMenu(prev => prev === m ? null : m),
        setActiveMenu, setConsigliereOpen, handleNextConsigliere, triggerConsigliere, addNotification, dismissNotification, triggerFeedback,
        handleGridClick, handleGridDoubleClick, setSelectedGrid, setActiveLocation, 
        handleVisitLocation: (id) => { const loc = MAP_DESTINATIONS.find(d => d.id === id); if (loc) { setActiveLocation({ ...loc, x: loc.gridX, y: loc.gridY } as any); setSelectedGrid(null); } },
        handleEnterBuilding: (b, owned) => { setActiveLocation({ ...b, ownerFaction: owned ? 'player' : undefined }); setSelectedGrid(null); },
        handlePurchaseHolding: (h) => { if (gameState) { updateSave({ ...gameState, money: gameState.money - h.cost, holdings: [...gameState.holdings, h] }); triggerFeedback(`${h.name} acquired!`, 'success'); setSelectedGrid(null); } },
        handleUpgradeHolding,
        handleBuildingCollection: () => { if (gameState && activeLocation) { const h = gameState.holdings.find(x => x.id === activeLocation.id); if(h) { updateSave({ ...gameState, money: gameState.money + h.income }); triggerFeedback(`Collected N$ ${h.income}`, 'success'); } } },
        handleUpdateCorner: (id, crew, prod, conf) => { if(gameState) { const nh = gameState.holdings.map(h => h.id === id ? { ...h, cornerData: { ...h.cornerData, assignedCrewIds: crew, activeProducts: prod, productionConfig: conf } } : h); updateSave({ ...gameState, holdings: nh }); } },
        handleUpdateProtection: (id, crew, conf) => { if(gameState) { const nh = gameState.holdings.map(h => h.id === id ? { ...h, protectionData: { ...h.protectionData, assignedCrewIds: crew, ...conf } } : h); updateSave({ ...gameState, holdings: nh }); } },
        handleSetupBrothel: (id) => { if(gameState) { if(gameState.money < 1000) return alert("Need N$ 1000"); const nh = gameState.holdings.map(h => h.id === id ? { ...h, brothelData: { activeWorkers: 2, securityCrewIds: [] }, income: h.income + 200 } : h); updateSave({ ...gameState, money: gameState.money - 1000, holdings: nh }); } },
        handleSetSafehouse: (h) => { if (gameState) { updateSave({ ...gameState, playerHousing: { ...gameState.playerHousing!, location: { x: h.x, y: h.y }, name: h.name } }); triggerConsigliere("Safehouse moved."); } },
        handleClaimCorner,
        handleEstablishProtection,
        handleTravel: mapMovement.startMovement,
        handleCancelTravel: mapMovement.cancelMovement,
        handleSelectMapMode: setActiveMapMode, handleToggleMapModes: () => setIsMapModesOpen(p => !p), handleClearAvoidedAreas: () => { if (gameState) updateSave({ ...gameState, avoidedAreas: [] }); },
        handleStartCombat, handleCombatEnd: (won, deadIds, survivorHealth) => { 
             if (!gameState) { setView('game'); return; }
             let newCrew = gameState.crew.map(c => survivorHealth[c.id] !== undefined ? { ...c, hp: survivorHealth[c.id] } : c);
             if (deadIds.length > 0) newCrew = newCrew.filter(c => c.isLeader || !deadIds.includes(c.id));
             updateSave({ ...gameState, crew: newCrew });
             setView('game'); setActiveEnemyClass(null);
        }, activeEnemyClass,
        handleHealCrew: (cost) => { if(gameState && gameState.money >= cost) { const nc = gameState.crew.map(c => ({...c, hp: c.stats.maxHp || (20 + c.stats.strength * 3)})); updateSave({...gameState, money: gameState.money - cost, crew: nc}); triggerFeedback("Crew Healed", 'success'); } },
        handleRecruitPawn,
        handleBulkRecruit: (arr) => { if(gameState) { 
            const newMembers = arr.map(r => ({ ...r.details, id: Math.random().toString(), level: 1, xp: 0, maxXp: 1000, hp: 20 + r.details.stats.strength * 3, isLeader: false, traits: [], talents: {}, activeAbilities: ['skull_bash'], faction: gameState.crew[0].faction }));
            const cost = arr.reduce((acc, r) => acc + r.cost, 0);
            updateSave({ ...gameState, money: gameState.money - cost, crew: [...gameState.crew, ...newMembers] });
            triggerFeedback(`${newMembers.length} recruited!`, 'success');
        }},
        handleRemove: (id) => { if(gameState) updateSave({ ...gameState, crew: gameState.crew.filter(c => c.id !== id) }); setInspectedUnitId(null); },
        handlePromote: (id) => {},
        handlePromoteToOfficer: (id, idx) => { if(gameState) { const p = gameState.crew.find(c => c.id === id); if(p) { const no = [...(gameState.officers || [])]; no[idx] = { ...no[idx], isEmpty: false, name: p.name, seed: p.imageSeed.toString(), level: p.level, salary: 200 }; updateSave({ ...gameState, officers: no, crew: gameState.crew.filter(c => c.id !== id) }); } } },
        handleUpdateOfficer: (i, o) => { if(gameState) { const no = [...(gameState.officers || [])]; no[i] = o; updateSave({ ...gameState, officers: no }); } },
        handleAssignMission: (i, m) => { if(gameState) { const no = [...(gameState.officers || [])]; no[i] = { ...no[i], activeMissionIdx: m }; updateSave({ ...gameState, officers: no }); } },
        handleInspectCharacter: setInspectedUnitId, setInspectedUnitId,
        handleUpdateTactic: (t, id) => { if(gameState) updateSave({ ...gameState, [t === 'offensive' ? 'offensiveTactic' : 'defensiveTactic']: id }); },
        handleUpdateTalents: (mid, tid, op) => { if(gameState) { const cIdx = gameState.crew.findIndex(c => c.id === mid); if(cIdx > -1) { const m = gameState.crew[cIdx]; const nt = { ...m.talents }; if(op === 'reset') { /* clear */ } else if(op === 'remove') { if(nt[tid]) nt[tid]--; } else { nt[tid] = (nt[tid]||0) + 1; } const nc = [...gameState.crew]; nc[cIdx] = { ...m, talents: nt }; updateSave({ ...gameState, crew: nc }); } } },
        handleUpdateFormation: (f) => { if(gameState) updateSave({ ...gameState, formation: f }); },
        handlePromotePawn: (id, r) => { if(gameState) { const nc = gameState.crew.map(c => c.id === id ? { ...c, pawnType: r } : c); updateSave({ ...gameState, crew: nc }); } },
        handleUpdateRetreatThreshold: (v) => { if(gameState) updateSave({ ...gameState, retreatThreshold: v }); },
        handleToggleAbility: (id) => { if(gameState) { const l = gameState.crew.find(c => c.isLeader); if(l) { let na = [...(l.activeAbilities || [])]; if(na.includes(id)) na = na.filter(x => x !== id); else if(na.length < 5) na.push(id); const nc = gameState.crew.map(c => c.id === l.id ? { ...c, activeAbilities: na } : c); updateSave({ ...gameState, crew: nc }); } } },
        handleUpdateLoadout: (mid, abs) => { if(gameState) { const nc = gameState.crew.map(c => c.id === mid ? { ...c, activeAbilities: abs } : c); updateSave({ ...gameState, crew: nc }); } },
        handleUpdateCombatPreferences: (p) => { if(gameState) updateSave({ ...gameState, combatPreferences: p }); },
        handleUpdateStatus,
        handleUseItem: itemSystem.handleUseItem,
        handleEquipItem: itemSystem.handleEquipItem,
        handleUnequipItem: itemSystem.handleUnequipItem,
        handleCraft: itemSystem.handleCraft,
        handleBuyItem: (i) => { if(gameState && gameState.money >= i.cost) { 
            let newInv = [...gameState.inventory]; 
            const ex = newInv.find(x => x.itemId === i.id); 
            if(ex) ex.quantity++; else newInv.push({ id: Math.random().toString(), itemId: i.id, quantity: 1 }); 
            updateSave({ ...gameState, money: gameState.money - i.cost, inventory: newInv }); 
            addNotification({ title: 'Item Acquired', message: i.name, type: 'item', icon: i.icon });
        }},
        handleStartMission: (t, x, y, c, d, desc) => { if(gameState) updateSave({ ...gameState, activeMissions: [...(gameState.activeMissions||[]), { id: Math.random().toString(), type: t, targetX: x, targetY: y, startX: gameState.currentLocation?.x||0, startY: gameState.currentLocation?.y||0, startTime: Date.now(), duration: d * 1000, travelDuration: 2000, crewIds: c, description: desc }] }); },
        startMinigame: setActiveMinigameId, closeMinigame: () => setActiveMinigameId(null), 
        handleCompleteMinigame: (p, m) => { if(gameState) { updateSave({ ...gameState, money: gameState.money + p }); setActiveMinigameId(null); triggerFeedback(m, p > 0 ? 'success' : 'error'); } },
        setIsIndustrialJobActive, 
        handleCompleteIndustrialJob: (p, m) => { if(gameState) { updateSave({ ...gameState, money: gameState.money + p }); setIsIndustrialJobActive(false); triggerFeedback(m, p > 0 ? 'success' : 'error'); } },
        handleNightclubAction: purchaseSystem.handleNightclubAction,
        handleStartTagging: (x, y, s, t) => { if(gameState) { updateSave({ ...gameState, activeTaggingOps: [...(gameState.activeTaggingOps||[]), { id: Math.random().toString(), x, y, slotIndex: s, startTime: Date.now(), duration: 10000, crewId: gameState.crew[1]?.id || gameState.crew[0].id, tagId: t }] }); setSelectedGrid(null); triggerConsigliere("Tagging started."); } },
        handleStartErasing: (x, y, s) => { if(gameState) { updateSave({ ...gameState, activeTaggingOps: [...(gameState.activeTaggingOps||[]), { id: Math.random().toString(), x, y, slotIndex: s, startTime: Date.now(), duration: 10000, crewId: gameState.crew[1]?.id || gameState.crew[0].id, tagId: 'erase' }] }); setSelectedGrid(null); } },
        handleSaveTag: (t) => { if(gameState) updateSave({ ...gameState, tags: [...(gameState.tags||[]), t] }); },
        handleDeleteTag: (t) => { if(gameState) updateSave({ ...gameState, tags: (gameState.tags||[]).filter(x => x.id !== t) }); },
        handlePayphoneUse: (c) => { if(gameState) updateSave({ ...gameState, money: gameState.money - c }); },
        handleSendPlayerMessage: (r, b) => { console.log(`Msg to ${r}: ${b}`); },
        handleAddSpeedDial: (n, num) => { if(gameState?.playerHousing) { const d = [...(gameState.playerHousing.speedDials||[])]; const idx = d.findIndex(x => !x.number); if(idx > -1) { d[idx] = { name: n.toUpperCase().substring(0,8), number: num.replace(/[^a-zA-Z0-9]/g, '') }; updateSave({ ...gameState, playerHousing: { ...gameState.playerHousing, speedDials: d } }); triggerFeedback("Speed Dial Added", 'success'); } else triggerFeedback("Speed Dial Full", 'error'); } },
        handleDeleteMessage: (id) => { if(gameState?.playerHousing) { const nm = (gameState.playerHousing.messages||[]).filter(m => m.id !== id); updateSave({ ...gameState, playerHousing: { ...gameState.playerHousing, messages: nm } }); } },
        handleMarkMessageRead: (id) => { if(gameState?.playerHousing) { const nm = (gameState.playerHousing.messages||[]).map(m => m.id === id ? { ...m, isRead: true } : m); updateSave({ ...gameState, playerHousing: { ...gameState.playerHousing, messages: nm } }); } },
        handleApplyBuff: buffSystem.handleApplyBuff,
        triggerEvent, resolveEventOption,
        handleAddXp: (a) => { if(gameState) { const nc = gameState.crew.map(c => ({ ...c, xp: (c.xp||0) + a })); updateSave({ ...gameState, crew: nc }); } },
        handleRestoreEnergy: (a) => { if(gameState) { updateSave({ ...gameState, currentEnergy: Math.min(50, gameState.currentEnergy + a) }); } },
        handleRefillEnergy: () => { if(gameState) { updateSave({ ...gameState, currentEnergy: 50 }); triggerFeedback("Energy Restored", 'success'); } },
        handlePlaceBounty: (b) => { if(gameState) { updateSave({ ...gameState, money: gameState.money - b.cost, activeBounties: [...(gameState.activeBounties||[]), b] }); triggerFeedback("Contract Posted", 'success'); } },
        handleRobbery: () => { if (gameState) { const gain = Math.floor(Math.random() * 200) + 50; updateSave({ ...gameState, money: gameState.money + gain, heat: gameState.heat + 15 }); triggerFeedback(`Robbery successful! +N$${gain}`, 'success'); } },
        radioChannel, setRadioChannel, visualEffectsEnabled, setVisualEffectsEnabled, consigliereEnabled, setConsigliereEnabled, levelUpFlash, triggerLevelUpFlash: () => { setLevelUpFlash(true); setTimeout(() => setLevelUpFlash(false), 2000); },
        activeOfficerTravels: [], officers: gameState?.officers || [],
        mapMovement, setMissionTargeting
    };

    return (
        <GameEngineContext.Provider value={value}>
            {children}
        </GameEngineContext.Provider>
    );
};
