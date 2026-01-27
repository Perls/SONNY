
import { ReportData, CrewMember } from '../types';
import { generateBlockBuildings } from './mapUtils';

export const generateIntelReport = (
    targetX: number, 
    targetY: number, 
    crew: CrewMember[], 
    durationScore: number, // 0 to 100
    faction: string,
    bossName: string
): ReportData => {
    
    // 1. Calculate Quality
    // Base 50 + (Crew Count * 10) + (Average Crew Level * 2) + (Duration/2)
    const crewCount = crew.length;
    const avgLevel = crew.reduce((acc, c) => acc + c.level, 0) / (crewCount || 1);
    const score = 30 + (crewCount * 15) + (avgLevel * 5) + (durationScore * 0.4);
    
    let quality: 'Low' | 'Medium' | 'High' = 'Low';
    if (score > 80) quality = 'High';
    else if (score > 50) quality = 'Medium';

    // 2. Generate Content
    const buildings = generateBlockBuildings(targetX, targetY);
    const landmark = buildings.find(b => b.type === 'landmark' || b.name.includes('Dock') || b.type === 'corner');
    const shops = buildings.filter(b => b.type === 'commercial'); // Removed incorrect shop check
    
    // Mock Player Names
    const PLAYERS = ["Slick Vinny", "Tony Two-Times", "Machine Gun Kelly", "The Shadow", "Ghost", "Viper", "Brick"];
    const seenPlayers = [];
    if (Math.random() > 0.3) seenPlayers.push(PLAYERS[Math.floor(Math.random() * PLAYERS.length)]);
    if (quality !== 'Low' && Math.random() > 0.5) seenPlayers.push(PLAYERS[Math.floor(Math.random() * PLAYERS.length)]);

    // Mock Loot
    const LOOT = ["Crates of VCRs", "Stolen Furs", "Cash Stash", "Weapon Cache", "Medical Supplies", "Uncut Product"];
    const foundLoot = [];
    if (Math.random() > 0.4) foundLoot.push(LOOT[Math.floor(Math.random() * LOOT.length)]);
    
    // Construct Body Text
    let body = "";
    
    // Intro
    const intro = [
        `Boss, we staked out Block ${targetX}-${targetY} like you asked.`,
        `Eyes on the target. Block ${targetX}-${targetY} is hot.`,
        `Report from the field. Sector ${targetX}-${targetY}.`
    ];
    body += intro[Math.floor(Math.random() * intro.length)] + "\n\n";

    // Faction Info
    if (quality === 'Low') {
        body += `Looks like ${faction} territory. Or maybe not. Hard to tell, lots of noise.\n`;
    } else {
        body += `Confirmed ${faction} control. The streets are watching.\n`;
    }

    // Property Info
    if (landmark) {
        body += `Key structure: ${landmark.name}. Heavily guarded.\n`;
    }
    if (quality === 'High' && shops.length > 0) {
        body += `Commercial activity detected at ${shops.map(s => s.name).join(', ')}.\n`;
    }

    // Player Sightings
    if (seenPlayers.length > 0) {
        body += `\nSpotted: ${seenPlayers.join(', ')}. They were moving fast.\n`;
    } else {
        body += `\nNo major players spotted.\n`;
    }

    // Loot
    if (foundLoot.length > 0) {
        body += `\nASSET INTEL: We saw them moving ${foundLoot.join(' and ')} into a basement.\n`;
    }

    // Typos for Low Quality
    if (quality === 'Low') {
        body = body.replace(/the/g, 'da').replace(/ing/g, 'in').replace(/you/g, 'u').toLowerCase();
        body += "\n\n(Note: The handwriting is barely legible)";
    }

    return {
        bossName,
        crewNames: crew.map(c => c.name),
        location: `Block ${targetX}-${targetY}`,
        body,
        timestamp: Date.now(),
        quality
    };
};
