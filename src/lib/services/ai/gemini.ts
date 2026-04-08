import { GoogleGenerativeAI } from "@google/generative-ai";
import { isGroqConfigured, groqGenerateText, groqGenerateJSON } from "./groq";

let genAI: GoogleGenerativeAI | null = null;

function getClient() {
  if (!genAI) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY not set");
    genAI = new GoogleGenerativeAI(key);
  }
  return genAI;
}

export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * Returns true if any AI provider is available (Gemini or Groq)
 */
export function isAIConfigured(): boolean {
  return isGeminiConfigured() || isGroqConfigured();
}

export async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  // Try Gemini first, fall back to Groq
  if (isGeminiConfigured()) {
    try {
      const client = getClient();
      const model = client.getGenerativeModel({
        model: "gemini-2.0-flash",
        ...(systemInstruction ? { systemInstruction } : {}),
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      console.error("Gemini error, trying Groq fallback:", e);
      if (isGroqConfigured()) {
        return groqGenerateText(prompt, systemInstruction);
      }
      throw e;
    }
  }

  if (isGroqConfigured()) {
    return groqGenerateText(prompt, systemInstruction);
  }

  throw new Error("No AI provider configured. Set GEMINI_API_KEY or GROQ_API_KEY.");
}

export async function generateJSON<T = unknown>(prompt: string, systemInstruction?: string): Promise<T> {
  // Try Gemini first, fall back to Groq
  if (isGeminiConfigured()) {
    try {
      const client = getClient();
      const model = client.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          responseMimeType: "application/json",
        },
        ...(systemInstruction ? { systemInstruction } : {}),
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text) as T;
    } catch (e) {
      console.error("Gemini JSON error, trying Groq fallback:", e);
      if (isGroqConfigured()) {
        return groqGenerateJSON<T>(prompt, systemInstruction);
      }
      throw e;
    }
  }

  if (isGroqConfigured()) {
    return groqGenerateJSON<T>(prompt, systemInstruction);
  }

  throw new Error("No AI provider configured. Set GEMINI_API_KEY or GROQ_API_KEY.");
}
