
import { GameEvent } from '../types';
import { BOBBY_EVENTS } from '../quests/BobbyQuest';

export const EVENTS: Record<string, GameEvent> = {
    // BOBBY QUEST CHAIN
    ...BOBBY_EVENTS,

    // ESPOSITO QUEST: SMUGGLER / COMMISSION
    'event_esposito_meet': {
        id: 'event_esposito_meet',
        title: 'Eyes on the Street',
        description: "Ms. Esposito pours you a cup of espresso so strong it could dissolve concrete. Her apartment overlooks the park entrance. She gestures out the window with a shaking finger. \n\n\"See that bench?\" she whispers. \"Every day at 3 PM, a man leaves a bag. Ten minutes later, a suit picks it up. It's Commission money, but they're sloppy. If you're fast, you could intercept it before the suit arrives.\"",
        image: "https://images.unsplash.com/photo-1485627941502-d2e642960b0e?q=80&w=1000&auto=format&fit=crop",
        speakerName: "Ms. Esposito",
        speakerSeed: "Granny",
        options: [
            {
                label: "Intercept the drop.",
                flavorText: "High risk, high reward. Grab the bag and run.",
                effects: { money: 2000, heat: 40, combat: true }
            },
            {
                label: "Sell the intel.",
                flavorText: "Tell a rival crew instead. Let them take the heat.",
                effects: { money: 500, respect: 5 }
            }
        ]
    },

    // SAL QUEST: THUG / GANGS
    'event_sal_meet': {
        id: 'event_sal_meet',
        title: 'Last Call',
        description: "The Dive Bar is empty except for Sal, who is aggressively polishing a shotgun behind the counter. The air smells of stale beer and impending violence. \n\n\"The Neon Demons want to tax me,\" Sal growls, snapping the breach shut. \"They're coming tonight to collect or smash the place up. I got a few boys in the back, but I need a heavy hitter out front. You in?\"",
        image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000&auto=format&fit=crop",
        speakerName: "Sal",
        speakerSeed: "Father",
        options: [
            {
                label: "Set an ambush.",
                flavorText: "Let them walk in, then shut the door.",
                effects: { combat: true, respect: 25, money: 500 }
            },
            {
                label: "Negotiate.",
                flavorText: "Try to talk them down. Or pay them off.",
                effects: { money: -200, stress: -10 }
            }
        ]
    },

    // DANNY QUEST: THUG / CARTEL
    'event_danny_meet': {
        id: 'event_danny_meet',
        title: 'The Shipment',
        description: "Danny is waiting by the water at Hunters Point, skipping stones into the dark river. A small boat is approaching the pier, running with no lights. \n\n\"Here it comes,\" he whispers, checking his watch. \"Pure product from the Cartel. The plan was to secure it for the boss... but what if we just took a crate for ourselves? Who's gonna know?\"",
        image: "https://images.unsplash.com/photo-1505562130589-9775953046f4?q=80&w=1000&auto=format&fit=crop",
        speakerName: "Danny 'Boxer'",
        speakerSeed: "Danny",
        options: [
            {
                label: "Skim off the top.",
                flavorText: "Take one crate. Sell it fast.",
                effects: { money: 3000, heat: 50, item: 'coke' }
            },
            {
                label: "Stick to the plan.",
                flavorText: "Loyalty pays dividends later.",
                effects: { respect: 30, money: 500 }
            }
        ]
    },

    // JOEY QUEST: DEALER / GANGS
    'event_joey_meet': {
        id: 'event_joey_meet',
        title: 'Hostile Takeover',
        description: "Cousin Joey is pacing back and forth in front of the Zoo entrance, looking wired. \n\n\"The current crew running this block is weak,\" he spits, gesturing wildly. \"They're cutting the product with baby powder. If we go in there and show them what real quality looks like, the customers will flock to us. Or we just beat them up.\"",
        image: "https://images.unsplash.com/photo-1552483775-dbb0f807447b?q=80&w=1000&auto=format&fit=crop",
        speakerName: "Cousin Joey",
        speakerSeed: "Doctor",
        options: [
            {
                label: "Violence.",
                flavorText: "Kick down the door and take the corner.",
                effects: { combat: true, respect: 40 }
            },
            {
                label: "Undercut them.",
                flavorText: "Flood the block with better product.",
                effects: { money: -500, respect: 20, item: 'meth' }
            }
        ]
    },

    // MILLER QUEST: HUSTLER / CARTEL
    'event_miller_meet': {
        id: 'event_miller_meet',
        title: 'The Drop',
        description: "Sgt. Miller leans against his patrol car in the alley behind KB Electronics, smoking a cigarette. He doesn't look at you as you approach. \n\n\"I have the file,\" he says to the air. \"Names, addresses, family members of the rival Cartel lieutenant. You want to make a move, this is the map. But my pension isn't gonna pay itself.\"",
        image: "https://images.unsplash.com/photo-1453873410712-4263e09171f1?q=80&w=1000&auto=format&fit=crop",
        speakerName: "Sgt. Miller",
        speakerSeed: "Cop",
        options: [
            {
                label: "Buy the file.",
                flavorText: "Clean transaction. No loose ends.",
                effects: { money: -1000, item: 'intel_report', heat: -10 }
            },
            {
                label: "Blackmail him.",
                flavorText: "Threaten to expose him to Internal Affairs.",
                effects: { heat: 30, respect: 10, item: 'intel_report' }
            }
        ]
    }
};
