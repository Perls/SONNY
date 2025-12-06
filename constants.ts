
import { BackstoryCategory, CharacterClass, ClassType, Trait } from './types';

export const CLASSES: Record<ClassType, CharacterClass> = {
  [ClassType.Thug]: {
    type: ClassType.Thug,
    label: 'The Thug',
    description: 'The muscle. High durability and melee damage. Protects the crew.',
    role: 'Tank / Enforcer',
    color: 'bg-red-600',
    baseStats: { strength: 9, agility: 4, intelligence: 2, luck: 3, charisma: 2 }
  },
  [ClassType.Smuggler]: {
    type: ClassType.Smuggler,
    label: 'The Smuggler',
    description: 'Stealth and mobility specialist. Moves goods and avoids heat.',
    role: 'Rogue / Scout',
    color: 'bg-yellow-500',
    baseStats: { strength: 3, agility: 9, intelligence: 5, luck: 6, charisma: 2 }
  },
  [ClassType.Dealer]: {
    type: ClassType.Dealer,
    label: 'The Dealer',
    description: 'Intelligence based. Buffs crew with chems and generates income.',
    role: 'Support / Alchemist',
    color: 'bg-blue-500',
    baseStats: { strength: 2, agility: 4, intelligence: 9, luck: 4, charisma: 6 }
  },
  [ClassType.Entertainer]: {
    type: ClassType.Entertainer,
    label: 'The Entertainer',
    description: 'Crowd control and morale. Uses charisma to sway fights.',
    role: 'Warlock / Controller',
    color: 'bg-purple-500',
    baseStats: { strength: 2, agility: 5, intelligence: 4, luck: 5, charisma: 9 }
  },
  [ClassType.Hustler]: {
    type: ClassType.Hustler,
    label: 'The Hustler',
    description: 'High risk, high reward. Luck based gambler and business magnate.',
    role: 'Wildcard / Econ',
    color: 'bg-green-500',
    baseStats: { strength: 3, agility: 3, intelligence: 6, luck: 9, charisma: 4 }
  }
};

export const BACKSTORY_STEPS: BackstoryCategory[] = [
  {
    id: 'father',
    title: "Father's Legacy",
    description: "Who was your father in the old world?",
    options: [
      {
        id: 'don',
        label: 'The Don',
        description: 'He ran the block with an iron fist. You inherited his presence.',
        statModifiers: { charisma: 3, money: 500 } as any
      },
      {
        id: 'boxer',
        label: 'The Prizefighter',
        description: 'A heavyweight champion of the underground circuits.',
        statModifiers: { strength: 3, agility: 1 }
      },
      {
        id: 'rat',
        label: 'The Rat',
        description: 'He survived by knowing when to talk and when to run.',
        statModifiers: { agility: 2, luck: 2 }
      },
      {
        id: 'consigliere',
        label: 'The Advisor',
        description: 'Smart enough to stay out of jail, mostly.',
        statModifiers: { intelligence: 3, charisma: 1 }
      }
    ]
  },
  {
    id: 'early_life',
    title: "Early Life",
    description: "Where did you learn the ropes?",
    options: [
      {
        id: 'streets',
        label: 'The Gutters',
        description: 'You fought for scraps in the sewers of Old Brooklyn.',
        statModifiers: { strength: 1, agility: 2 }
      },
      {
        id: 'academy',
        label: 'Private School',
        description: 'Your tuition was paid in blood money. You learned the math.',
        statModifiers: { intelligence: 3 }
      },
      {
        id: 'market',
        label: 'Black Market',
        description: 'Running packages before you could read.',
        statModifiers: { luck: 2, charisma: 1 }
      },
      {
        id: 'gym',
        label: 'Boxing Gym',
        description: 'Discipline and pain were your teachers.',
        statModifiers: { strength: 2, agility: 1 }
      }
    ]
  },
  {
    id: 'adolescence',
    title: "Adolescence",
    description: "How did you spend your teenage years?",
    options: [
      {
        id: 'juvey',
        label: 'Juvenile Hall',
        description: 'Hard time made you harder.',
        statModifiers: { strength: 2, respect: 10 } as any
      },
      {
        id: 'hacker',
        label: 'Netrunner Collective',
        description: 'Cracking vaults from a basement in Queens.',
        statModifiers: { intelligence: 2, luck: 1 }
      },
      {
        id: 'dealer',
        label: 'Corner Boy',
        description: 'Moving product, dodging the law.',
        statModifiers: { agility: 2, charisma: 1 }
      },
      {
        id: 'hustler',
        label: 'Pool Shark',
        description: 'Playing the odds and the people.',
        statModifiers: { luck: 3 }
      }
    ]
  },
  {
    id: 'motivation',
    title: "Motivation",
    description: "Why are you stepping up today?",
    options: [
      {
        id: 'power',
        label: 'Absolute Power',
        description: 'You want the throne of New York.',
        statModifiers: { strength: 2, charisma: 2 }
      },
      {
        id: 'wealth',
        label: 'Filthy Rich',
        description: 'It\'s all about the N$.',
        statModifiers: { luck: 2, money: 1000 } as any
      },
      {
        id: 'revenge',
        label: 'Blood Revenge',
        description: 'Someone crossed your family. They will pay.',
        statModifiers: { strength: 1, agility: 3 }
      },
      {
        id: 'chaos',
        label: 'Anarchy',
        description: 'Watch the world burn.',
        statModifiers: { intelligence: 2, strength: 2 }
      }
    ]
  },
  {
    id: 'allegiance',
    title: "Allegiance",
    description: "Whose ring will you kiss? This defines your turf.",
    options: [
      {
        id: 'gangs',
        label: 'The Street Gangs',
        description: 'Brownsville Projects. Chaos, numbers, and raw violence.',
        statModifiers: { strength: 1, agility: 2, respect: 5 } as any,
        color: 'bg-red-900',
        textColor: 'text-red-100',
        icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=gang&backgroundColor=7f1d1d'
      },
      {
        id: 'cartel',
        label: 'The Cartels',
        description: 'Sunset Park Docks. International connections and heavy hardware.',
        statModifiers: { money: 1000, intelligence: 1 } as any,
        color: 'bg-emerald-900',
        textColor: 'text-emerald-100',
        icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=cartel&backgroundColor=064e3b'
      },
      {
        id: 'mafia',
        label: 'The Commission',
        description: 'Arthur Avenue. Old money, politics, and silence.',
        statModifiers: { charisma: 2, respect: 15 } as any,
        color: 'bg-slate-900',
        textColor: 'text-slate-100',
        icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=mafia&backgroundColor=0f172a'
      }
    ]
  }
];

export const TRAIT_POINT_BUDGET = 5;

export const TRAITS: Trait[] = [
  // PERKS (Positive Cost)
  {
    id: 'iron_jaw',
    label: 'Iron Jaw',
    description: 'Can take a punch. Increases Strength.',
    cost: 1,
    maxRank: 3,
    statModifiers: { strength: 1 },
    iconPath: 'M9 3c.55 0 1 .45 1 1v2h4V4c0-.55.45-1 1-1s1 .45 1 1v3h2c1.1 0 2 .9 2 2v1h-2v-1h-2v2h2v2h-2v2h2v1c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2h2V4c0-.55.45-1 1-1z'
  },
  {
    id: 'silver_tongue',
    label: 'Silver Tongue',
    description: 'Can talk their way out of anything. Increases Charisma.',
    cost: 1,
    maxRank: 3,
    statModifiers: { charisma: 1 },
    iconPath: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z'
  },
  {
    id: 'cat_reflexes',
    label: 'Cat Reflexes',
    description: 'Always lands on feet. Increases Agility.',
    cost: 1,
    maxRank: 3,
    statModifiers: { agility: 1 },
    iconPath: 'M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z'
  },
  {
    id: 'bookworm',
    label: 'Mastermind',
    description: 'Knows the angles. Increases Intelligence.',
    cost: 1,
    maxRank: 3,
    statModifiers: { intelligence: 1 },
    iconPath: 'M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z'
  },
  {
    id: 'lucky_charm',
    label: 'Lucky Charm',
    description: 'Fate favors the bold. Increases Luck.',
    cost: 1,
    maxRank: 3,
    statModifiers: { luck: 1 },
    iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z' // Simple !
  },
  // FLAWS (Negative Cost - Give Points)
  {
    id: 'frail',
    label: 'Glass Jaw',
    description: 'Goes down easy. Decreases Strength.',
    cost: -1,
    maxRank: 2,
    statModifiers: { strength: -1 },
    iconPath: 'M13 13h-2V7h2m0 10h-2v-2h2M12 2A10 10 0 002 12a10 10 0 0010 10 10 10 0 0010-10A10 10 0 0012 2z'
  },
  {
    id: 'clumsy',
    label: 'Butterfingers',
    description: 'Drops the goods. Decreases Agility.',
    cost: -1,
    maxRank: 2,
    statModifiers: { agility: -1 },
    iconPath: 'M12 2C9.24 2 7 4.24 7 7l5 7 5-7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3l-3 4.2L9 7c0-1.66 1.34-3 3-3zM3 21h18v2H3z' 
  },
  {
    id: 'hothead',
    label: 'Hot Head',
    description: 'Acts before thinking. Decreases Intelligence.',
    cost: -1,
    maxRank: 2,
    statModifiers: { intelligence: -1 },
    iconPath: 'M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z'
  },
  {
    id: 'ugly',
    label: 'Face for Radio',
    description: 'Hard to look at. Decreases Charisma.',
    cost: -1,
    maxRank: 2,
    statModifiers: { charisma: -1 },
    iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21 7.17-5.29 12.85-12.22 10.26-.14-.87.49-2.44 2.13-2.74.34 2.28 2.48 2.74 2.42 2.74z'
  }
];

export const MAX_CREW_SIZE = 6;
export const MAX_SAVES = 6;
export const STARTING_MONEY = 2000;
export const RECRUIT_COST = 500;
