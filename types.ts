
export enum ClassType {
  Thug = 'Thug',
  Smuggler = 'Smuggler',
  Dealer = 'Dealer',
  Entertainer = 'Entertainer',
  Hustler = 'Hustler'
}

export type PawnRole = 'pawn' | 'heavy' | 'hitter' | 'tank' | 'soldier' | 'shooter' | 'bruiser' | 'closer' | 'flanker';

export interface Stats {
  strength: number;
  agility: number;
  intelligence: number;
  luck: number;
  charisma: number;
  willpower: number;
  maxHp?: number;
  respect?: number;
  money?: number;
  heat?: number;
}

export interface CharacterClass {
  type: ClassType;
  label: string;
  description: string;
  baseStats: Stats;
  role: string;
  color: string;
}

export interface BoroughDef {
    id: string;
    label: string;
    description: string;
    statModifiers: Partial<Stats>;
    color: string;
    abbreviation: string;
}

export interface BackstoryOption {
  id: string;
  label: string;
  description: string;
  statModifiers: Partial<Stats>;
  // Visual styling for specific steps like Allegiance
  color?: string;
  textColor?: string;
  icon?: string;
}

export interface BackstoryCategory {
  id: string;
  title: string;
  description: string;
  options: BackstoryOption[];
}

export interface Trait {
  id: string;
  label: string;
  description: string;
  cost: number; // Positive for Perk, Negative for Flaw (gives points)
  maxRank: number;
  statModifiers: Partial<Stats>; // Per rank
  iconPath: string; // SVG path data
  type: 'trait' | 'buff' | 'debuff' | 'reputation';
  duration?: string;
}

export interface Talent {
    id: string;
    name: string;
    description: string;
    rank: number;
    maxRank: number;
    reqLevel: number; // 1, 5, 10, 15, 20
    reqTalentId?: string;
    icon: string;
    stats?: Partial<Stats>;
    path?: 'A' | 'B' | 'C'; // New: Path Identifier
    tier?: number; // New: Visual Tier (1-4)
    grantsAbilityId?: string; // New: Unlocks a specific card/spell
}

export interface Card {
    id: string;
    name: string;
    type: 'spell'; // Consolidated to spell system
    effectType: 'damage' | 'heal' | 'buff' | 'debuff' | 'summon' | 'teleport' | 'utility';
    cost: number; // In Auto-Battler context, this is Mana Cost
    range: number; // 0 = self/global(if any), 1 = melee, 99 = global
    aoeRadius: number; // 0 = single target, 1 = 3x3
    targetReq: 'enemy' | 'ally' | 'empty' | 'any' | 'self';
    value?: number; // Damage/Heal amount
    statBonus?: Partial<Stats>; // For buffs
    description: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    classReq?: ClassType;
    reqLevel?: number; // New: Level required to auto-unlock
    icon: string;
    
    // Legacy fields for compatibility if needed, but we will move away from them
    attack?: number; 
    health?: number; 
}

export interface Equipment {
    head?: string;
    body?: string;
    main_hand?: string;
    off_hand?: string;
    accessory?: string;
    gadget?: string;
    feet?: string;
}

export interface CrewMember {
  id: string;
  name: string;
  nickname: string;
  classType: ClassType;
  borough?: string; 
  stats: Stats;
  backstory: string;
  originPath?: string[]; // New: Stores the IDs of backstory choices
  traits: { id: string; rank: number }[];
  talents: Record<string, number>; // Talent ID -> Rank
  activeAbilities: string[]; // List of Card IDs (Max 5)
  level: number;
  xp?: number; // Current XP
  maxXp?: number; // XP needed for next level
  hp?: number; // Current HP (Persistent)
  isLeader: boolean;
  imageSeed: number | string;
  isPawn?: boolean; // Fodder flag
  pawnType?: PawnRole; // New pawn differentiation
  equipment?: Equipment;
  faction?: string;
  statusMessage?: string; // New: Messenger style status
  stress?: number;
  drugUsage?: number;
  phoneNumber?: string;
}

export interface FightRecord {
    id: string;
    date: number;
    enemyName: string;
    result: 'won' | 'lost' | 'draw';
    loot?: string;
    turns: number;
    casualties?: string[];
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  image: string;
  speakerName?: string;
  speakerSeed?: string;
  options: EventOption[];
}

export interface EventOption {
  label: string;
  flavorText: string;
  effects: {
    money?: number;
    heat?: number;
    respect?: number;
    stress?: number;
    combat?: boolean;
    item?: string;
    relationshipChange?: number;
  };
  nextEventId?: string; // New: Chain events
  completeEventId?: string; // New: ID of the event to mark as completed in state
}

export interface Holding {
  id: string;
  x: number;
  y: number;
  slotIndex?: number; // 0-4 within the block
  name: string;
  type: 'corner' | 'front' | 'block' | 'headquarters' | 'residential' | 'commercial' | 'industrial' | 'office' | 'landmark' | 'payphone' | 'medical' | 'protection_racket' | 'casino' | 'smuggler' | 'transport' | 'recruit' | 'combat_hub' | 'entertainment' | 'hospital' | 'event';
  level: number;
  maxLevel: number;
  income: number;
  cost: number;
  ownerFaction?: string; // If 'player', it's yours.
  icon?: string;
  description?: string;
  landmarkId?: string; // Links to MAP_DESTINATIONS
  cornerData?: any; // Avoiding circular dependency with full type if needed, or define CornerData
  brothelData?: any;
  protectionData?: any;
  labData?: any;
  unitId?: string;
  eventData?: GameEvent; // New: For event-based locations
}

export interface Tag {
    id: string;
    name: string; // e.g. "Tag #1"
    dataUri: string; // Base64 image data
    status: 'active' | 'vandalized' | 'erased';
    location?: string; // e.g. "Block 4-2"
}

export interface TaggingOperation {
    id: string;
    x: number;
    y: number;
    slotIndex: number;
    startTime: number;
    duration: number; // ms
    crewId: string;
    tagId: string;
}

export interface Bounty {
    id: string;
    targetName: string;
    targetFaction: string;
    targetRole: string; // e.g. 'Snitch', 'Capo'
    cost: number; // Cost to place bounty
    reward: string; // e.g. "Respect +10"
    difficulty: 'Low' | 'Medium' | 'High' | 'Suicide';
    status: 'active' | 'completed' | 'failed';
    location?: string;
    description: string;
}

export interface ActiveMission {
    id: string;
    type: 'intel' | 'smuggling' | 'raid' | 'heist' | 'transport';
    crewIds: string[];
    targetX: number;
    targetY: number;
    startX: number;
    startY: number;
    startTime: number;
    duration: number;
    travelDuration: number;
    description: string;
}

// Map key "x,y,slotIndex" -> Tag
export type MapTagData = Record<string, Tag>;

export interface CombatPreferences {
    fleeBossOnGun: boolean;
    fleePawnsOnGun: boolean;
}

export interface GameState {
  id: string;
  lastPlayed: number; // Timestamp
  money: number;
  heat: number; // 0-100
  respect: number; // 0-100
  currentEnergy: number; // Action Points (0-50)
  crew: CrewMember[];
  officers?: Officer[];
  inventory: InventoryItem[];
  holdings: Holding[]; // NEW: Owned properties
  playerHousing?: PlayerHousing; 
  tags?: Tag[]; // NEW: Graffiti Tags
  mapTags?: MapTagData; // Placed tags on map
  activeTaggingOps?: TaggingOperation[]; // Ongoing tagging
  activeMissions?: ActiveMission[];
  activeBounties?: Bounty[]; // New: Active Hit Contracts
  offensiveTactic: string;
  defensiveTactic: string;
  formation: Record<string, {x: number, y: number}>; // Map Member ID to relative coords (0-7, 0-2)
  journal: FightRecord[];
  retreatThreshold?: number; // 0-80% HP to retreat
  currentLocation?: { x: number, y: number };
  playerPhoneNumber?: string;
  friends?: Friend[];
  combatPreferences?: CombatPreferences;
  avoidedAreas?: { x: number, y: number }[]; // NEW: Pathfinding blacklisted blocks
  completedEvents?: string[]; // NEW: Track completed quest events
}

export interface Friend {
    id: string;
    name: string;
    classType: ClassType;
    level: number;
    imageSeed: number | string;
    phoneNumber: string;
    status: 'Online' | 'Offline' | 'Away' | 'Busy';
    isButtonman?: boolean; // New: NPC/Quest Giver Tag
}

export interface NPC {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
  avatarSeed: string;
  dialogue: string;
}

export interface ReportData {
    bossName: string;
    crewNames: string[];
    location: string;
    body: string;
    timestamp: number;
    quality: 'Low' | 'Medium' | 'High';
    image?: string; // NEW: Supports drawings
}

export interface InventoryItem {
  id: string;
  itemId: string;
  quantity: number;
  customName?: string; 
  description?: string;
  reportData?: ReportData;
}

export interface ItemDefinition {
  id: string;
  name: string;
  type: 'weapon' | 'consumable' | 'gear' | 'intel';
  description: string;
  cost: number;
  icon: string;
  equipSlot?: 'head' | 'body' | 'main_hand' | 'off_hand' | 'accessory' | 'gadget' | 'feet';
  furnitureSlot?: 'tv' | 'computer' | 'bed' | 'music' | 'coffee';
}

export interface Building {
    id: string;
    type: 'shop' | 'recruit' | 'intel' | 'none';
    ownerFaction?: 'gangs' | 'cartel' | 'mafia';
}

// --- NOTIFICATIONS ---
export type NotificationType = 'success' | 'error' | 'info' | 'item' | 'levelup' | 'combat';
export type NotificationSound = 'level_up' | 'cash' | 'error' | 'success' | 'none';

export interface GameNotification {
    id: string;
    title: string;
    message?: string;
    type: NotificationType;
    icon?: string;
    sound?: NotificationSound;
    duration?: number;
    timestamp: number;
}

// --- COMBAT TYPES ---

export enum CombatTacticType {
    Aggressive = 'Aggressive', 
    Flank = 'Flank', 
    Focus = 'Focus',
    Bunker = 'Bunker',
    Kite = 'Kite',
    Counter = 'Counter'
}

export interface TacticDef {
    id: string;
    type: 'attack' | 'defense';
    name: string;
    description: string;
    icon: string;
    statBonus?: Partial<Stats>; // Tactic might give bonus stats?
    reqLevel?: number;
    advantages?: string[];
    disadvantages?: string[];
}

export interface StatusEffect {
    id: string;
    type: 'stun' | 'buff' | 'debuff' | 'pyramid_scheme';
    label: string;
    duration: number; // Turns remaining
    val?: number; // Magnitude
}

export interface CombatUnit {
    id: string;
    name: string;
    team: 'player' | 'enemy';
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    mana: number; // New: Current Mana
    maxMana: number; // New: Mana required to cast
    stats: Stats;
    classType: ClassType;
    imageSeed: number | string;
    actionPoints: number; // Kept for movement speed calculation (Agility)
    isDead: boolean;
    isLeader?: boolean; 
    pawnType?: PawnRole;
    statusEffects?: StatusEffect[];
    equipment?: Equipment;
    isSummon?: boolean;
    abilityId?: string; // The ID of the ability this unit casts
    activeAbilities?: string[]; // Auto-battler: List of abilities to use
    cooldowns: Record<string, number>; // Auto-battler: Map of Ability ID to cooldown ticks
    isRetreating?: boolean; // New: Unit is running away
    hasEscaped?: boolean; // New: Unit successfully left the board
}

export interface DelayedEffect {
    id: string;
    name: string;
    turnsRemaining: number;
    type: 'long_con';
    targetRow?: number; // For Long Con
    ownerId: string;
}

export interface VisualEffect {
    id: string;
    x: number;
    y: number;
    type: 'explosion' | 'heart' | 'shield' | 'poison' | 'teleport' | 'buff' | 'long_con_marker' | 'cast_ring' | 'cast_spark' | 'movement_trail' | 'mana_gain';
    duration: number;
    text?: string;
    color?: string;
}

export interface Projectile {
    id: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

export interface Obstacle {
    id: string;
    name: string;
    x: number;
    y: number;
    icon: string;
}

export interface CombatLogEntry {
    id: string;
    text: string;
    type: 'attack' | 'move' | 'info' | 'death' | 'card' | 'enemy_card' | 'chat';
}

export interface Officer {
    id: string;
    role: string;
    name?: string;
    seed?: string;
    activeMissionIdx: number;
    isEmpty: boolean;
    salary: number;
    level?: number;
    target?: string;
}

export interface PhoneMessage {
    id: string;
    sender: string;
    body: string;
    timestamp: number;
    isRead: boolean;
}

export interface PlayerHousing {
    id: string;
    name: string;
    type: 'tenement' | 'studio' | 'apartment' | 'penthouse';
    upgrades: string[];
    location: { x: number, y: number };
    storedMoney: number;
    stationedCrewIds: string[];
    messages?: PhoneMessage[];
    speedDials?: { name: string, number: string }[];
    answeringMachineMemo?: string;
    
    // Inventory Overhaul
    inventory?: InventoryItem[]; // Kept for type compatibility, acts as "Safe" storage
    storage?: InventoryItem[]; // New: Apartment general storage
    furniture?: Record<string, string | null>; // New: Specific Slots (tv, computer, etc)
}

export interface OfficerTravel {
    id: string;
    officerName: string;
    seed: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    startTime: number;
    duration: number;
    role: string;
}
