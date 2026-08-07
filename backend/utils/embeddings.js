import { GoogleGenAI } from "@google/genai";

//const EMBED_MODEL = "model: gemini-embedding-001";
const EMBED_MODEL = "gemini-embedding-001";

let ai = null;
const getClient = () => {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing — check backend/.env");
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
};

export const embedBatch = async (texts) => {
  const response = await getClient().models.embedContent({
    model: EMBED_MODEL,
    contents: texts
  });
  return response.embeddings.map((e) => e.values);
};

export const embedOne = async (text) => {
  const response = await getClient().models.embedContent({
    model: EMBED_MODEL,
    contents: text
  });
  return response.embeddings[0].values;
};