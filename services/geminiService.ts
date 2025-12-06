import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ClassType } from "../types";

// Initialize the client using the pattern required
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCharacterLore = async (classType: ClassType): Promise<{ name: string; nickname: string; backstory: string }> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are a gritty crime novelist writing for a cyberpunk noir game set in mafia-era NYC 1997 called "Streets of New York".
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
      Write a very short, 3-sentence mission report for a gang operation in 1997 NYC.
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
