import { GoogleGenAI } from "@google/genai";

  const MODEL = "gemini-3.6-flash";

let ai = null;
const getClient = () => {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY is missing — check backend/.env and that dotenv.config() runs before any AI route is called."
      );
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
};

export const askForJSON = async (systemPrompt, userPrompt) => {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      temperature: 0.3
    }
  });

  const text = response.text;
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error("Gemini did not return valid JSON: " + text.slice(0, 200));
  }
};

export const askForText = async (systemPrompt, userPrompt) => {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.7
    }
  });
  return response.text.trim();
};