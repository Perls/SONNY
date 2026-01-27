
import { Trait, Card, BoroughDef, BackstoryCategory, TacticDef, Stats, BackstoryOption, ClassType } from '../../types';

// Re-export Items and Classes
export * from './items';
export * from './classes/index';

// --- GAME CONSTANTS ---
export const MAX_SAVES = 6;
export const MAX_CREW_SIZE = 10;
export const STARTING_MONEY = 1000;
export const RECRUIT_COST = 500;
export const XP_TO_LEVEL_2 = 1000;
export const XP_TO_LEVEL_3 = 2500;
export const MAX_CREW_LEVEL = 5;
export const TRAIT_POINT_BUDGET = 1; 

export const TRAITS: Trait[] = [
  // --- NEW POSITIVE TRAITS (COST 1) ---
  { 
    id: 'grease_monkey', label: 'Grease Monkey', description: '+20% Crafting Speed. +Intelligence.', 
    cost: 1, maxRank: 1, statModifiers: { intelligence: 3 }, 
    iconPath: 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z', type: 'trait' 
  },
  { 
    id: 'street_smart', label: 'Street Smart', description: '+1 Stealth/Smuggler Skill. +Ambush Detection.', 
    cost: 1, maxRank: 1, statModifiers: { agility: 2, luck: 2 }, 
    iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z', type: 'trait' 
  },
  { 
    id: 'cool_head', label: 'Cool Head', description: '+10% Intimidation Resistance. Negotiation bonus.', 
    cost: 1, maxRank: 1, statModifiers: { charisma: 2, intelligence: 1, willpower: 3 }, 
    iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z', type: 'trait' 
  },
  { 
    id: 'glib_tongue', label: 'Glib Tongue', description: '+15% Bargaining Success with civilians.', 
    cost: 1, maxRank: 1, statModifiers: { charisma: 3 }, 
    iconPath: 'M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z', type: 'trait' 
  },
  { 
    id: 'book_keeper', label: 'Book Keeper', description: '+20% Income from Businesses. Detect embezzlement.', 
    cost: 1, maxRank: 1, statModifiers: { intelligence: 2, money: 250 }, 
    iconPath: 'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z', type: 'trait' 
  },
  { 
    id: 'fast_hands', label: 'Fast Hands', description: '+15% Lockpicking Success. +1 Hustler Skill.', 
    cost: 1, maxRank: 1, statModifiers: { agility: 3 }, 
    iconPath: 'M7 11v2h10v-2c0-2.76-2.24-5-5-5s-5 2.24-5 5zm5-7C9.24 4 7 6.24 7 9h1c0-2.21 1.79-4 4-4s4 1.79 4 4h1c0-2.76-2.24-5-5-5z', type: 'trait' 
  },
  { 
    id: 'iron_gut', label: 'Iron Gut', description: 'Immune to food poisoning. High chemical resistance.', 
    cost: 1, maxRank: 1, statModifiers: { strength: 2, maxHp: 30 }, 
    iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z', type: 'trait' 
  },
  { 
    id: 'deep_sleeper', label: 'Deep Sleeper', description: 'Always wakes up fully rested. +10% Regen.', 
    cost: 1, maxRank: 1, statModifiers: { maxHp: 15, willpower: 2 }, 
    iconPath: 'M7 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-3c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 10c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm13-8h-2v-2h-2v2h-2v2h2v2h2v-2h2v-2z', type: 'trait' 
  },
  { 
    id: 'night_owl', label: 'Night Owl', description: '+10% Movement Speed and Action Power at night.', 
    cost: 1, maxRank: 1, statModifiers: { luck: 1, agility: 2 }, 
    iconPath: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm2.23 2.03c.12-.01.24-.03.36-.03 2.04 0 3.96.61 5.6 1.66-2.56.9-4.57 2.91-5.47 5.47-.94 2.56-.94 5.37.01 7.93-4.05-1.05-7.23-4.23-8.28-8.28 1.93-.95 4.14-.95 6.07-.01 1.05 2.56 3.06 4.57 5.62 5.47.66-.46 1.35-.87 2.09-1.21z', type: 'trait' 
  },
  { 
    id: 'old_school', label: 'Old School', description: '+15% Family Opinion Gain. Respect bonus.', 
    cost: 1, maxRank: 1, statModifiers: { strength: 1, respect: 25, willpower: 2 }, 
    iconPath: 'M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76 13.38 12 15 10.83 12.92 8H20v6z', type: 'trait' 
  },
  // --- TRAITS FROM QUESTS ---
  { id: 'smooth_talker', label: 'Smooth Talker', description: 'Bonus to diplomatic events.', cost: 0, maxRank: 1, statModifiers: { charisma: 2 }, iconPath: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z', type: 'trait' },
  { id: 'clumsy', label: 'Clumsy', description: 'Higher risk in delicate operations.', cost: 0, maxRank: 1, statModifiers: { agility: -2 }, iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z', type: 'trait' },

  // --- REPUTATION MODIFIERS (GIVE POINTS, COST -1) ---
  { 
    id: 'felon', label: 'Felon', description: '-3 Charisma. Hard to talk to civilians. Cops hate you.', 
    cost: -1, maxRank: 1, statModifiers: { charisma: -3, heat: 10, willpower: 1 }, 
    iconPath: 'M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 18H4v-6h8v6zm0-8H4V4h8v8zm2 2h6v6h-6v-6zm6-2h-6V4h6v8z', type: 'reputation' 
  },
  { 
    id: 'snitch', label: 'Known Snitch', description: '-2 Luck. Start with -20 Respect. No one trusts you.', 
    cost: -1, maxRank: 1, statModifiers: { luck: -2, respect: -20, willpower: -2 }, 
    iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z', type: 'reputation' 
  },
  { 
    id: 'ex_cop', label: 'Ex-Cop', description: '+2 Str, -4 Cha. Start with +20 Heat. Gangs target you first.', 
    cost: -1, maxRank: 1, statModifiers: { strength: 2, charisma: -4, heat: 20, willpower: 2 }, 
    iconPath: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z', type: 'reputation' 
  },

  // --- BUFFS (TEMPORARY) ---
  { id: 'entertained', label: 'Entertained', description: 'Morale boost', cost: 0, maxRank: 1, statModifiers: { willpower: 2 }, iconPath: '', type: 'buff' },
  { id: 'drunk', label: 'Drunk', description: '-INT, +STR', cost: 0, maxRank: 1, statModifiers: { intelligence: -2, strength: 1, willpower: 1 }, iconPath: '', type: 'buff' },
  { id: 'high', label: 'High', description: '+AGI, +LCK, -INT', cost: 0, maxRank: 1, statModifiers: { agility: 1, luck: 1, intelligence: -1 }, iconPath: '', type: 'buff' },
  { id: 'high_coke', label: 'Coked Up', description: '+STR, +AGI, -WIS', cost: 0, maxRank: 1, statModifiers: { strength: 2, agility: 2, intelligence: -2, charisma: -3, willpower: 3 }, iconPath: '', type: 'buff' },
  { id: 'high_weed', label: 'Stoned', description: '-AGI, +Stress Relief', cost: 0, maxRank: 1, statModifiers: { agility: -2, willpower: -1 }, iconPath: '', type: 'buff' },
  { id: 'high_meth', label: 'Tweaking', description: '+STR, +AGI, -CHA, -INT', cost: 0, maxRank: 1, statModifiers: { strength: 3, agility: 3, intelligence: -3, charisma: -3, willpower: 2 }, iconPath: '', type: 'buff' },
  { id: 'blessed', label: 'Blessed', description: 'Divine favor.', cost: 0, maxRank: 1, statModifiers: { luck: 5, willpower: 5 }, iconPath: '', type: 'buff' },
  { id: 'low_energy', label: 'Low Energy', description: 'Exhausted.', cost: 0, maxRank: 1, statModifiers: { agility: -2, willpower: -2 }, iconPath: '', type: 'debuff' },
  { id: 'caffeinated', label: 'Caffeinated', description: 'Wired. +1 Intelligence.', cost: 0, maxRank: 1, statModifiers: { intelligence: 1 }, iconPath: '', type: 'buff', duration: '4h' },
];

export const BOROUGHS: BoroughDef[] = [
    { id: 'bronx', label: 'The Bronx', abbreviation: 'BX', description: 'Tough streets.', statModifiers: { strength: 2, willpower: 1 }, color: 'bg-red-600' },
    { id: 'brooklyn', label: 'Brooklyn', abbreviation: 'BK', description: 'Hustler\'s paradise.', statModifiers: { charisma: 2 }, color: 'bg-yellow-600' },
    { id: 'manhattan', label: 'Manhattan', abbreviation: 'MN', description: 'High stakes.', statModifiers: { intelligence: 2, willpower: 1 }, color: 'bg-blue-600' },
    { id: 'queens', label: 'Queens', abbreviation: 'QN', description: 'Diverse connections.', statModifiers: { luck: 2, willpower: 1 }, color: 'bg-purple-600' },
    { id: 'staten_island', label: 'Staten Island', abbreviation: 'SI', description: 'Quiet power.', statModifiers: { agility: 2, willpower: 1 }, color: 'bg-green-600' },
    { id: 'jersey', label: 'New Jersey', abbreviation: 'NJ', description: 'Outsider advantage.', statModifiers: { strength: 1, money: 500, willpower: 2 }, color: 'bg-orange-600' },
    { id: 'international', label: 'International', abbreviation: 'INT', description: 'Unknown quantity.', statModifiers: { intelligence: 1, luck: 1, willpower: 1 }, color: 'bg-teal-600' }
];

export const BACKSTORY_STEPS: BackstoryCategory[] = [
  {
    id: 'early_life',
    title: "Early Life",
    description: "Where did you learn the ropes?",
    options: [
      {
        id: 'streets',
        label: 'The Gutters',
        description: 'You fought for scraps in the sewers of Old Brooklyn.',
        statModifiers: { strength: 1, agility: 2, willpower: 1 }
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
        statModifiers: { strength: 2, agility: 1, willpower: 2 }
      },
      {
        id: 'westchester',
        label: 'Westchester County',
        description: "Your school didn't have metal detectors.",
        statModifiers: { luck: 3 }
      },
      {
        id: 'bx_science',
        label: 'Bronx Science',
        description: 'Smart and tough is hard to beat.',
        statModifiers: { strength: 1, intelligence: 2 }
      },
      {
        id: 'little_league',
        label: 'Little League Champ',
        description: 'From little slugger to shotgun slugs.',
        statModifiers: { agility: 3 }
      }
    ]
  },
  {
    id: 'growing_up',
    title: "Growing Up",
    description: "Who raised you in the 90s?",
    options: [
      {
        id: 'bookie_uncle',
        label: 'Bookie Uncle',
        description: 'Learned the odds before you could read.',
        statModifiers: { luck: 2, intelligence: 1 }
      },
      {
        id: 'failed_deli',
        label: 'Failed Deli Owners',
        description: 'Hard work, thin margins, thick skin.',
        statModifiers: { strength: 1, respect: 5, willpower: 2 }
      },
      {
        id: 'numbers_runner',
        label: 'Cousin Ran Numbers',
        description: 'Saw how the cash flows early on.',
        statModifiers: { intelligence: 2, money: 100 }
      },
      {
        id: 'boxer_father',
        label: 'Boxer Father',
        description: 'Discipline and a solid right hook.',
        statModifiers: { strength: 2, agility: 1, willpower: 1 }
      },
      {
        id: 'mob_seamstress',
        label: 'Mob Seamstress',
        description: 'Mother patched up suits and kept secrets.',
        statModifiers: { charisma: 2, luck: 1 }
      },
      {
        id: 'pool_hall',
        label: 'Pool Hall Kid',
        description: 'Slept on a felt table. Shark instincts.',
        statModifiers: { agility: 1, luck: 2 }
      },
      {
        id: 'turf_orphan',
        label: 'Turf War Orphan',
        description: 'Raised by the block itself. Survivor.',
        statModifiers: { strength: 1, maxHp: 10, willpower: 3 }
      }
    ]
  },
  {
    id: 'youth',
    title: "Youth",
    description: "How did you spend your teenage years?",
    options: [
      { id: 'lookout', label: 'Corner Lookout', description: 'Eyes open, mouth shut.', statModifiers: { intelligence: 2, agility: 1 } },
      { id: 'tagger', label: 'Graffiti Artist', description: 'Getting up all over town.', statModifiers: { agility: 2, respect: 5 } },
      { id: 'brawler', label: 'Schoolyard Brawler', description: 'Suspended more than attended.', statModifiers: { strength: 3, willpower: 1 } },
      { id: 'booster', label: 'Shoplifter', description: 'Five finger discount specialist.', statModifiers: { agility: 2, luck: 1 } },
      { id: 'dice_runner', label: 'Dice Game Runner', description: 'Cee-lo on the pavement.', statModifiers: { luck: 2, money: 200 } },
      { id: 'truant', label: 'Chronic Truant', description: 'Street smarts over book smarts.', statModifiers: { charisma: 1, luck: 1, intelligence: 1 } },
      { id: 'honor_student', label: 'Honor Student', description: 'The one who was supposed to make it out.', statModifiers: { intelligence: 3, strength: -1, willpower: 1 } },
    ]
  },
  {
    id: 'your_story',
    title: "Your Story",
    description: "What defined your reputation?",
    options: [
        { id: 'choked_robber', label: 'Subway Vigilante', description: 'Choked out a robber on the A train.', statModifiers: { strength: 2, respect: 10, willpower: 2 } },
        { id: 'found_cash', label: 'Dumpster Dive', description: 'Found a bag of cash and kept it.', statModifiers: { money: 1000, luck: 1 } },
        { id: 'juvie_stint', label: 'Took the Fall', description: 'Did 6 months in Spofford for a friend.', statModifiers: { respect: 20, charisma: 1, willpower: 3 } },
        { id: 'kidnap_escape', label: 'Smooth Talker', description: 'Talked your way out of a kidnapping.', statModifiers: { charisma: 3, intelligence: 1 } },
        { id: 'cop_car', label: 'Joyride', description: 'Hotwired a cop car on a dare.', statModifiers: { agility: 2, heat: 5, luck: 1 } },
        { id: 'poker_win', label: 'High Stakes', description: 'Beat a made man at poker.', statModifiers: { luck: 3, money: 500 } },
        { id: 'bullet_scar', label: 'Survivor', description: 'Caught a stray bullet at a block party.', statModifiers: { maxHp: 20, strength: 1, willpower: 1 } },
    ]
  },
  {
    id: 'allegiance',
    title: "Allegiance",
    description: "Who do you serve?",
    options: [
        { id: 'commission', label: 'The Commission', description: 'The Five Families. Tradition & Order. Control: 42%', statModifiers: { respect: 10, money: 500, willpower: 2 }, color: 'bg-red-800' },
        { id: 'cartel', label: 'The Cartel', description: 'Colombian Connection. Product & Power. Control: 35%', statModifiers: { strength: 2, money: 1000 }, color: 'bg-amber-600' },
        { id: 'gangs', label: 'Street Gangs', description: 'New Blood. Chaos & Numbers. Control: 23%', statModifiers: { agility: 2, respect: 5, willpower: 1 }, color: 'bg-purple-800' },
    ]
  }
];

export const CONNECTION_OPTIONS: BackstoryOption[] = [
    {
        id: 'conn_bobby',
        label: 'Your Sister\'s Husband',
        description: "An insurance adjuster who knows exactly which warehouse is 'overdue' for an electrical fire. Needs a match. [Mission: Insurance Fraud]",
        statModifiers: {},
        color: 'bg-blue-50',
        textColor: 'text-blue-900'
    },
    {
        id: 'conn_esposito',
        label: 'Retired Neighbor',
        description: "She sits by her window all day watching the street. She knows exactly where the rival crew hides their cash. [Mission: The Stash House]",
        statModifiers: {},
        color: 'bg-amber-50',
        textColor: 'text-amber-900'
    },
    {
        id: 'conn_priest',
        label: 'Favorite Bartender',
        description: "He serves drinks to cops and crooks alike. He overheard a Councilman talking about a bribe that never arrived. [Mission: The Intercept]",
        statModifiers: {},
        color: 'bg-purple-50',
        textColor: 'text-purple-900'
    },
    {
        id: 'conn_danny',
        label: 'The Childhood Friend',
        description: 'Danny (Warehouse). -25% Smuggling Time. Must maintain "Normal Life".',
        statModifiers: {},
        color: 'bg-emerald-50',
        textColor: 'text-emerald-900'
    },
    {
        id: 'conn_doc',
        label: 'Older Cousin',
        description: "Just got out of the joint. He wants to reclaim his old corner, but he needs someone to watch his back. [Mission: Turf War]",
        statModifiers: {},
        color: 'bg-red-50',
        textColor: 'text-red-900'
    },
    {
        id: 'conn_cop',
        label: 'The Dirty Cop',
        description: 'Sgt. Miller. Reduces heat accumulation. Demands profit share.',
        statModifiers: {},
        color: 'bg-slate-200',
        textColor: 'text-slate-900'
    },
    {
        id: 'conn_mentor',
        label: 'The Ex-Con Mentor',
        description: 'Old Man Ricci. Cheaper recruits. Inherit his old debts.',
        statModifiers: {},
        color: 'bg-stone-200',
        textColor: 'text-stone-900'
    }
];

export const TACTIC_OPTIONS: TacticDef[] = [
    { 
        id: 'aggressive', type: 'attack', name: 'Aggressive', description: 'Overwhelm with force.', icon: '⚔️', 
        statBonus: { strength: 2 },
        advantages: ['+2 Strength to all units', 'High initial burst damage'],
        disadvantages: ['Units tire faster', 'Vulnerable to traps']
    },
    { 
        id: 'flank', type: 'attack', name: 'Flank', description: 'Attack from sides.', icon: '↔️', 
        statBonus: { agility: 2 },
        advantages: ['+2 Agility', 'Bypasses front-line tanks'],
        disadvantages: ['Weak center line', 'Requires high mobility units']
    },
    { 
        id: 'focus', type: 'attack', name: 'Focus Fire', description: 'Target weaklings.', icon: '🎯', 
        statBonus: { intelligence: 2 },
        advantages: ['+2 Intelligence', 'Rapidly eliminates single targets'],
        disadvantages: ['Overkill inefficiency', 'Ignores high-threat tanks']
    },
    // Locked Tactics
    { 
        id: 'guerrilla', type: 'attack', name: 'Guerrilla', description: 'Hit and run tactics.', icon: '🌴', 
        reqLevel: 16,
        statBonus: { agility: 5 },
        advantages: ['+5 Agility', 'High evasion', 'Bonus damage on first hit'],
        disadvantages: ['-3 Strength', 'Cannot hold ground']
    },
    { 
        id: 'scorched_earth', type: 'attack', name: 'Scorched Earth', description: 'Destroy everything.', icon: '🔥', 
        reqLevel: 20,
        statBonus: { strength: 5 },
        advantages: ['+5 Strength', 'Deals damage to obstacles', 'Fear effect'],
        disadvantages: ['Friendly fire risk', 'No loot recovery']
    },
    // Defense
    { 
        id: 'bunker', type: 'defense', name: 'Bunker', description: 'Defensive line.', icon: '🛡️', 
        statBonus: { strength: 1, willpower: 2 },
        advantages: ['+Defense bonus', 'Resistant to knockback'],
        disadvantages: ['-Mobility', 'Vulnerable to AoE']
    },
    { 
        id: 'kite', type: 'defense', name: 'Kite', description: 'Hit and run.', icon: '🏃', 
        statBonus: { agility: 1 },
        advantages: ['Maintains distance', 'Reduces melee damage taken'],
        disadvantages: ['Requires space to retreat', 'Weak against ranged']
    },
    { 
        id: 'hold_center', type: 'defense', name: 'Hold Center', description: 'Protect the boss.', icon: '🏰', 
        statBonus: { strength: 2, willpower: 1 },
        advantages: ['Protects Leader unit', 'Bonus healing received'],
        disadvantages: ['Susceptible to flanking', 'Clusters units for AoE']
    },
];

export const CARDS: Record<string, Card> = {
    'skull_bash': { id: 'skull_bash', name: 'Skull Bash', type: 'spell', effectType: 'damage', cost: 2, range: 1, aoeRadius: 0, targetReq: 'enemy', value: 15, description: 'A heavy melee strike.', rarity: 'common', icon: '🔨' },
    'glock_burst': { id: 'glock_burst', name: 'Glock Burst', type: 'spell', effectType: 'damage', cost: 3, range: 4, aoeRadius: 0, targetReq: 'enemy', value: 10, description: 'Three shots.', rarity: 'common', icon: '🔫' },
    'smoke_bomb': { id: 'smoke_bomb', name: 'Smoke Bomb', type: 'spell', effectType: 'buff', cost: 2, range: 0, aoeRadius: 1, targetReq: 'self', description: 'Increases evasion.', rarity: 'common', icon: '💨' },
    'medkit_toss': { id: 'medkit_toss', name: 'Medkit Toss', type: 'spell', effectType: 'heal', cost: 2, range: 3, aoeRadius: 0, targetReq: 'ally', value: 20, description: 'Heal an ally.', rarity: 'common', icon: '❤️' },
    'intimidate': { id: 'intimidate', name: 'Intimidate', type: 'spell', effectType: 'debuff', cost: 2, range: 2, aoeRadius: 1, targetReq: 'enemy', description: 'Lowers enemy damage.', rarity: 'rare', icon: '😠' },
    'make_it_rain': { id: 'make_it_rain', name: 'Make It Rain', type: 'spell', effectType: 'buff', cost: 4, range: 0, aoeRadius: 2, targetReq: 'ally', description: 'Buffs allies with money.', rarity: 'epic', icon: '💸' },
    'siren_song': { id: 'siren_song', name: 'Siren Song', type: 'spell', effectType: 'debuff', cost: 4, range: 4, aoeRadius: 2, targetReq: 'enemy', description: 'Stun enemies.', rarity: 'epic', icon: '🎤' },
    'bad_batch': { id: 'bad_batch', name: 'Bad Batch', type: 'spell', effectType: 'damage', cost: 3, range: 3, aoeRadius: 1, targetReq: 'enemy', value: 10, description: 'Poison damage.', rarity: 'rare', icon: '☠️' },
    'riot_shield': { id: 'riot_shield', name: 'Riot Shield', type: 'spell', effectType: 'buff', cost: 3, range: 0, aoeRadius: 0, targetReq: 'self', description: 'High defense.', rarity: 'common', icon: '🛡️' },
    'assassinate': { id: 'assassinate', name: 'Assassinate', type: 'spell', effectType: 'damage', cost: 5, range: 1, aoeRadius: 0, targetReq: 'enemy', value: 50, description: 'Massive damage to one target.', rarity: 'legendary', icon: '🗡️' },
    'getaway': { id: 'getaway', name: 'Getaway', type: 'spell', effectType: 'teleport', cost: 2, range: 5, aoeRadius: 0, targetReq: 'empty', description: 'Move quickly.', rarity: 'common', icon: '🚗' },
    'shadow_step': { id: 'shadow_step', name: 'Shadow Step', type: 'spell', effectType: 'teleport', cost: 3, range: 4, aoeRadius: 0, targetReq: 'enemy', description: 'Teleport behind enemy.', rarity: 'rare', icon: '🌑' },
    'blue_magic': { id: 'blue_magic', name: 'Blue Magic', type: 'spell', effectType: 'buff', cost: 4, range: 0, aoeRadius: 2, targetReq: 'ally', description: 'Massive stat boost.', rarity: 'legendary', icon: '💎' },
    'experimental_drug': { id: 'experimental_drug', name: 'Experimental Drug', type: 'spell', effectType: 'buff', cost: 1, range: 1, aoeRadius: 0, targetReq: 'ally', description: 'Random effect.', rarity: 'rare', icon: '🧪' },
    'summon_pusher': { id: 'summon_pusher', name: 'Summon Pusher', type: 'spell', effectType: 'summon', cost: 4, range: 2, aoeRadius: 0, targetReq: 'empty', description: 'Summon a minion.', rarity: 'epic', icon: '🧟' },
    'spotlight': { id: 'spotlight', name: 'Spotlight', type: 'spell', effectType: 'debuff', cost: 3, range: 4, aoeRadius: 1, targetReq: 'enemy', description: 'Blinds enemies.', rarity: 'rare', icon: '🔦' },
    'encore': { id: 'encore', name: 'Encore', type: 'spell', effectType: 'heal', cost: 5, range: 0, aoeRadius: 99, targetReq: 'ally', value: 15, description: 'Heal all allies.', rarity: 'legendary', icon: '👏' },
    'summon_fan': { id: 'summon_fan', name: 'Summon Fan', type: 'spell', effectType: 'summon', cost: 3, range: 2, aoeRadius: 0, targetReq: 'empty', description: 'Summon a distraction.', rarity: 'rare', icon: '🤩' },
    'bribe': { id: 'bribe', name: 'Bribe', type: 'spell', effectType: 'debuff', cost: 3, range: 2, aoeRadius: 0, targetReq: 'enemy', description: 'Enemy skips turn.', rarity: 'epic', icon: '💰' },
    'pocket_sand': { id: 'pocket_sand', name: 'Pocket Sand', type: 'spell', effectType: 'debuff', cost: 1, range: 1, aoeRadius: 0, targetReq: 'enemy', description: 'Blinds enemy.', rarity: 'common', icon: '⏳' },
    'payoff': { id: 'payoff', name: 'Payoff', type: 'spell', effectType: 'heal', cost: 4, range: 2, aoeRadius: 0, targetReq: 'ally', value: 30, description: 'Big heal.', rarity: 'rare', icon: '💵' },
    'blood_rage': { id: 'blood_rage', name: 'Blood Rage', type: 'spell', effectType: 'buff', cost: 3, range: 0, aoeRadius: 0, targetReq: 'self', description: '+Damage, -Defense.', rarity: 'rare', icon: '😡' },
    'titan_form': { id: 'titan_form', name: 'Titan Form', type: 'spell', effectType: 'buff', cost: 5, range: 0, aoeRadius: 0, targetReq: 'self', description: 'Become giant.', rarity: 'legendary', icon: '🦍' },
    'haymaker': { id: 'haymaker', name: 'Haymaker', type: 'spell', effectType: 'damage', cost: 3, range: 1, aoeRadius: 0, targetReq: 'enemy', value: 25, description: 'Heavy punch.', rarity: 'common', icon: '🥊' },
    'free_sample': { id: 'free_sample', name: 'Free Sample', type: 'spell', effectType: 'debuff', cost: 1, range: 2, aoeRadius: 0, targetReq: 'enemy', description: 'Slows enemy.', rarity: 'common', icon: '🍬' },
};

export const ENEMY_NAMES = ["Rival Thug", "Cartel Soldier", "Mafia Associate", "Street Punk", "Corrupt Cop", "Biker"];

export const PAWN_JOBS: Record<string, { label: string, icon: string, description: string, statBonus: Partial<Stats> }> = {
    'pawn': { label: 'Pawn', icon: '♟️', description: 'Basic street muscle.', statBonus: { willpower: 1 } },
    'heavy': { label: 'Heavy', icon: '🛡️', description: 'High HP, low speed.', statBonus: { strength: 2, agility: -1, willpower: 2 } },
    'tank': { label: 'Tank', icon: '🧱', description: 'Maximum defense.', statBonus: { strength: 4, agility: -2, willpower: 4 } },
    'soldier': { label: 'Soldier', icon: '🎖️', description: 'Balanced fighter.', statBonus: { strength: 1, agility: 1, willpower: 1 } },
    'shooter': { label: 'Shooter', icon: '🏹', description: 'Ranged specialist.', statBonus: { agility: 3, willpower: 1 } },
    'hitter': { label: 'Hitter', icon: '⚔️', description: 'High melee damage.', statBonus: { strength: 3, willpower: 1 } },
    'bruiser': { label: 'Bruiser', icon: '🥊', description: 'Tough melee fighter.', statBonus: { strength: 2, luck: 1, willpower: 2 } },
    'closer': { label: 'Closer', icon: '🗡️', description: 'High crit executioner.', statBonus: { strength: 2, luck: 3, willpower: 2 } },
    'flanker': { label: 'Flanker', icon: '👟', description: 'High mobility skirmisher.', statBonus: { agility: 4, intelligence: 1, willpower: 1 } },
};

export const PAWN_TREE: Record<string, string[]> = {
    'pawn': ['heavy', 'hitter'],
    'heavy': ['tank', 'bruiser'],
    'hitter': ['closer', 'flanker'],
    'tank': [],
    'bruiser': [],
    'closer': [],
    'flanker': [],
    // Legacy support for soldier/shooter mapping if needed, otherwise ignore or map to nearest
    'soldier': ['hitter', 'shooter'], 
    'shooter': []
};

export const ENEMY_TRASH_TALK: Record<ClassType, string[]> = {
    [ClassType.Thug]: ["I'll break you!", "Too small!", "Smash!"],
    [ClassType.Smuggler]: ["You won't see me coming.", "Too slow!", "Catch me if you can."],
    [ClassType.Dealer]: ["First hit is free.", "Bad trip?", "Overdose time."],
    [ClassType.Entertainer]: ["Show's over!", "Get off my stage!", "No encore for you."],
    [ClassType.Hustler]: ["Nothing personal.", "Just business.", "You're bad for business."]
};

export const TACTIC_QUOTES: Record<string, string[]> = {
    'aggressive': ["Attack!", "Push them back!", "No mercy!"],
    'defensive': ["Hold the line!", "Shields up!", "Steady!"],
    'flank': ["Surround them!", "Hit the sides!", "Move around!"],
    'focus': ["Focus fire!", "Take out the leader!", "Concentrate!"],
    'bunker': ["Dig in!", "Hold position!", "They come to us!"],
    'kite': ["Keep distance!", "Fall back and fire!", "Don't let them close!"],
    'hold_center': ["Protect the middle!", "Don't let them through!", "Stand firm!"],
};

export const CONSIGLIERE_QUOTES = [
    "Keep your head down, boss.",
    "Money is power.",
    "Respect is everything."
];

export const OBSTACLES = [
    { id: 'crate', name: 'Crate', x: 0, y: 0, icon: '📦' }
];
