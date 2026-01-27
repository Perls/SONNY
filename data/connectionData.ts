
import { ClassType } from '../types';
import { BOBBY_QUEST_DATA } from '../quests/BobbyQuest';
import { ESPOSITO_QUEST_DATA } from '../quests/EspositoQuest';
import { SAL_QUEST_DATA } from '../quests/SalQuest';
import { DANNY_QUEST_DATA } from '../quests/DannyQuest';
import { JOEY_QUEST_DATA } from '../quests/JoeyQuest';
import { MILLER_QUEST_DATA } from '../quests/MillerQuest';

export interface ConnectionProfile {
    id: string;
    name: string;
    role: string;
    phoneNumberDisplay: string;
    phoneNumberDial: string;
    ogm: string[]; // Outgoing Message (Answering Machine)
    introMessage: string;
    meetingLocation: { x: number, y: number, label: string };
    questId: string;
    eventId: string; // The ID of the event to trigger upon meeting
    faction: string;
    classType: ClassType;
    avatarSeed: string;
}

export const CONNECTION_DATA: Record<string, ConnectionProfile> = {
    'conn_bobby': {
        id: 'conn_bobby',
        name: "Bobby 'The Ledger'",
        role: "Brother-in-Law",
        phoneNumberDisplay: "917-501-1972-BO",
        phoneNumberDial: "9175011972BO",
        classType: ClassType.Hustler,
        faction: "The Commission",
        avatarSeed: "Bobby",
        ogm: [
            "CONNECTING...",
            "RINGING...",
            "YOU REACHED BOBBY.",
            "I'M AT THE OFFICE.",
            "OR I'M EATING.",
            "LEAVE A MESSAGE.",
            "IF IT'S ABOUT THE MONEY...",
            "I'LL CALL YOU.",
            "BEEP..."
        ],
        ...BOBBY_QUEST_DATA,
        eventId: 'event_bobby_meet'
    },
    'conn_esposito': {
        id: 'conn_esposito',
        name: "Ms. Esposito",
        role: "The Eyes",
        phoneNumberDisplay: "917-501-0777-MA",
        phoneNumberDial: "9175010777MA",
        classType: ClassType.Smuggler,
        faction: "The Commission",
        avatarSeed: "Granny",
        ogm: [
            "CONNECTING...",
            "RINGING...",
            "I'M WATCHING MY STORIES.",
            "OR I'M AT MASS.",
            "SPEAK UP.",
            "I DON'T HAVE ALL DAY.",
            "AND PULL UP YOUR PANTS.",
            "BEEP..."
        ],
        ...ESPOSITO_QUEST_DATA,
        eventId: 'event_esposito_meet'
    },
    'conn_priest': {
        id: 'conn_priest',
        name: "Sal",
        role: "The Bartender",
        phoneNumberDisplay: "917-501-0000-XX",
        phoneNumberDial: "9175010000XX",
        classType: ClassType.Thug,
        faction: "The Street Gangs",
        avatarSeed: "Father",
        ogm: [
            "CONNECTING...",
            "RINGING...",
            "BAR'S CLOSED.",
            "IF YOU WANT A DRINK,",
            "COME BACK AT SIX.",
            "IF YOU WANT...",
            "OTHER THINGS...",
            "LEAVE A NUMBER.",
            "BEEP..."
        ],
        ...SAL_QUEST_DATA,
        eventId: 'event_sal_meet'
    },
    'conn_danny': {
        id: 'conn_danny',
        name: "Danny 'Boxer'",
        role: "Childhood Friend",
        phoneNumberDisplay: "917-501-5555-KO",
        phoneNumberDial: "9175015555KO",
        classType: ClassType.Thug,
        faction: "The Cartels",
        avatarSeed: "Danny",
        ogm: [
            "CONNECTING...",
            "RINGING...",
            "YEAH. IT'S DANNY.",
            "I'M AT THE GYM.",
            "OR I'M SLEEPING.",
            "LEAVE IT.",
            "BEEP..."
        ],
        ...DANNY_QUEST_DATA,
        eventId: 'event_danny_meet'
    },
    'conn_doc': {
        id: 'conn_doc',
        name: "Cousin Joey",
        role: "The Wildcard",
        phoneNumberDisplay: "917-501-1313-JO",
        phoneNumberDial: "9175011313JO",
        classType: ClassType.Dealer,
        faction: "The Street Gangs",
        avatarSeed: "Doctor",
        ogm: [
            "CONNECTING...",
            "RINGING...",
            "YO!",
            "IDEALLY, I AM",
            "COUNTING MONEY RIGHT NOW.",
            "IF NOT, I'M BUSY.",
            "TALK TO ME.",
            "BEEP..."
        ],
        ...JOEY_QUEST_DATA,
        eventId: 'event_joey_meet'
    },
    'conn_cop': {
        id: 'conn_cop',
        name: "Sgt. Miller",
        role: "Dirty Badge",
        phoneNumberDisplay: "917-501-9110-PD",
        phoneNumberDial: "9175019110PD",
        classType: ClassType.Hustler,
        faction: "The Cartels",
        avatarSeed: "Cop",
        ogm: [
            "CONNECTING...",
            "RINGING...",
            "THIS LINE IS SECURE.",
            "STATE YOUR BUSINESS.",
            "BE BRIEF.",
            "BE CAREFUL.",
            "BEEP..."
        ],
        ...MILLER_QUEST_DATA,
        eventId: 'event_miller_meet'
    }
};
