
import { GameEvent } from '../types';

export const BOBBY_QUEST_DATA = {
    questId: "quest_bobby_intro",
    introMessage: "Listen, kid. The walls are closing in. I got a warehouse in Port Morris (Block 13-4) full of 'vintage' VCRs that nobody wants, and the insurance premium is due Tuesday. I need a problem solver. I need family. Meet me there tonight. Don't tell your sister.",
    meetingLocation: { x: 13, y: 4, label: "Port Morris" }
};

export const BOBBY_EVENTS: Record<string, GameEvent> = {
    'event_bobby_meet': {
        id: 'event_bobby_meet',
        title: 'The Ledger\'s Problem',
        description: "You step into the dimly lit office of the Port Morris warehouse. \n\nBobby is pacing back and forth in front of a massive pile of boxes. He gestures frantically at the floor .\n\n\"You came...,\" he exhales, wiping his forehead. \"Here's the situation. I made some bad investments with your sister's inheritance. We are completely fucked... But I can fix it I just need your {{HIGHEST_STAT}}.\"",
        image: "https://images.unsplash.com/photo-1598282717904-20b1274092b7?q=80&w=1000&auto=format&fit=crop",
        speakerName: "Bobby 'The Ledger'",
        speakerSeed: "Bobby",
        options: [
            {
                label: "Light the match.",
                flavorText: "Standard insurance fraud. Clean and simple.",
                effects: { money: 2000, heat: 25, respect: 10, stress: 5 },
                nextEventId: 'event_bobby_outcome_match'
            },
            {
                label: "Shake him down.",
                flavorText: "\"I want double, Bobby. Or I call the insurance adjuster myself.\"",
                effects: { money: 4000, respect: -15, stress: -5 },
                nextEventId: 'event_bobby_outcome_shake'
            },
            {
                label: "Frame the Union.",
                flavorText: "Plant evidence implicating the local Union Rep. Takes the heat off us.",
                effects: { money: 2500, heat: -10, respect: 20 },
                nextEventId: 'event_bobby_outcome_frame'
            }
        ]
    },
    'event_bobby_outcome_match': {
        id: 'event_bobby_outcome_match',
        title: "Up in Smoke",
        description: "The flames catch the cardboard instantly. Bobby is already running for the door. You watch the inventory turn to ash. The insurance money is safe.",
        image: "https://images.unsplash.com/photo-1496316279183-f38b00994f4c?q=80&w=1000&auto=format&fit=crop",
        speakerName: "Bobby 'The Ledger'",
        speakerSeed: "Bobby",
        options: [{ label: "Leave", flavorText: "Job done.", completeEventId: 'event_bobby_meet', effects: {} }]
    },
    'event_bobby_outcome_shake': {
        id: 'event_bobby_outcome_shake',
        title: "Blood Money",
        description: "Bobby goes pale, then red. He hands over a thick envelope from his desk safe. 'You're bleeding me dry,' he mutters. But he pays.",
        image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1000&auto=format&fit=crop",
        speakerName: "Bobby 'The Ledger'",
        speakerSeed: "Bobby",
        options: [{ label: "Leave", flavorText: "Pleasure doing business.", completeEventId: 'event_bobby_meet', effects: {} }]
    },
    'event_bobby_outcome_frame': {
        id: 'event_bobby_outcome_frame',
        title: "Union Buster",
        description: "You plant the incendiary device in a Union-marked crate. When the fire marshal finds it, Bobby won't just get paid—he'll have leverage over the local chapter.",
        image: "https://images.unsplash.com/photo-1599409899120-747d9b9a6713?q=80&w=1000&auto=format&fit=crop",
        speakerName: "Bobby 'The Ledger'",
        speakerSeed: "Bobby",
        options: [{ label: "Leave", flavorText: "Smart move.", completeEventId: 'event_bobby_meet', effects: {} }]
    }
};
