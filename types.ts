
export enum ClassType {
  Thug = 'Thug',
  Smuggler = 'Smuggler',
  Dealer = 'Dealer',
  Entertainer = 'Entertainer',
  Hustler = 'Hustler'
}

export interface Stats {
  strength: number;
  agility: number;
  intelligence: number;
  luck: number;
  charisma: number;
}

export interface CharacterClass {
  type: ClassType;
  label: string;
  description: string;
  baseStats: Stats;
  role: string;
  color: string;
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
}

export interface CrewMember {
  id: string;
  name: string;
  nickname: string;
  classType: ClassType;
  stats: Stats;
  backstory: string;
  traits: { id: string; rank: number }[];
  level: number;
  isLeader: boolean;
  imageSeed: number;
}

export interface GameState {
  id: string;
  lastPlayed: number; // Timestamp
  money: number;
  heat: number; // 0-100
  respect: number; // 0-100
  crew: CrewMember[];
}
