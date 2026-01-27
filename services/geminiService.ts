


import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ClassType } from "../types";

// Initialize the client using the pattern required
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCharacterLore = async (classType: ClassType): Promise<{ name: string; nickname: string; backstory: string }> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are a gritty crime novelist writing for a cyberpunk noir game set in NYC 2044 called "Streets of New York".
      Generate a profile for a crew member with the class: ${classType}.
      
      Return ONLY a JSON object with the following keys:
      - name: A realistic name (could be diverse: Italian, Russian, Caribbean, etc. reflecting NYC).
      - nickname: A street name.
      - backstory: A 2-sentence gritty bio about how they survived the "Great War" or their life in the slums.

      Example output format:
      {
        "name": "Marco Rossi",
        "nickname": "The Butcher",
        "backstory": "Former line cook who learned to carve more than just beef during the hunger riots of '39. Now he serves cold cuts to anyone crossing the family."
      }
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");

    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini generation failed:", error);
    // Fallback if API fails or key is missing
    return {
      name: "Unknown Soldier",
      nickname: "Ghost",
      backstory: "A shadow from the streets with no past and no future."
    };
  }
};

export const generateMissionReport = async (crewNames: string[]): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Write a very short, 3-sentence mission report for a gang operation in 2044 NYC.
      The crew involved: ${crewNames.join(', ')}.
      The mission was a "Territory Grab" in the Bronx.
      Result: Success but messy.
      Tone: The Wire meets Cyberpunk.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Mission completed. Details classified.";
  } catch (e) {
    return "Mission completed successfully.";
  }
};

interface BattleIntro {
  playerTrashTalk: string;
  enemyTrashTalk: string;
  playerCommand: string;
  enemyCommand: string;
}

export const generateBattleIntro = async (
  playerClass: string,
  enemyClass: string,
  tactic: string,
  crewCount: number,
  playerBackstory: string,
  playerBorough: string,
  lastBattle?: { result: 'won' | 'lost' | 'draw', enemyName: string }
): Promise<BattleIntro> => {
  try {
    const model = 'gemini-2.5-flash';
    
    let historyContext = "This is a fresh street beef.";
    if (lastBattle) {
      historyContext = `The crew just ${lastBattle.result === 'won' ? 'won against' : 'got beaten by'} ${lastBattle.enemyName}.`;
    }

    const prompt = `
      You are writing a ridiculous, high-energy, over-the-top pre-battle dialogue for a game.
      
      Matchup:
      - Player: A ${playerClass} Boss from ${playerBorough}. Backstory: "${playerBackstory}".
      - Enemy: A ${enemyClass} Boss.
      - Player Tactic: ${tactic}
      - Context: ${historyContext}

      Task: Generate 4 short text strings in JSON format.
      1. "playerTrashTalk": (UNUSED, but required field) A generic insult.
      2. "enemyTrashTalk": The Enemy Boss insults the Player. 
         - It must be a direct, RIDICULOUS mockery.
         - 30% of the time, SPECIFICALLY insult the Player's origin from ${playerBorough} (e.g. "Go back to the ${playerBorough} Zoo!").
         - Otherwise, mock their class or backstory.
      3. "playerCommand": A cool tactical command based on '${tactic}'. (e.g. "Focus fire!", "Bunker down!")
      4. "enemyCommand": A command for the enemy.

      Make it funny, gritty, and memorable. Max 1 sentence per quote.

      Example Output:
      {
        "playerTrashTalk": "...",
        "enemyTrashTalk": "I thought ${playerBorough} only bred rats, not clowns!",
        "playerCommand": "Execute Plan A!",
        "enemyCommand": "Get them!"
      }
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    return JSON.parse(text);

  } catch (e) {
    console.error("Gemini Intro Gen Failed", e);
    return {
      playerTrashTalk: "...",
      enemyTrashTalk: `You should have stayed in ${playerBorough}!`,
      playerCommand: `Execute ${tactic}!`,
      enemyCommand: "Get them!"
    };
  }
};