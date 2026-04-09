import { GoogleGenerativeAI } from "@google/generative-ai";
import { isGroqConfigured, groqGenerateText, groqGenerateJSON } from "./groq";
import { isOpenAIConfigured, openaiGenerateText, openaiGenerateJSON } from "./openai";
import { isAnthropicConfigured, anthropicGenerateText, anthropicGenerateJSON } from "./anthropic";
import { isMistralConfigured, mistralGenerateText, mistralGenerateJSON } from "./mistral";

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
 * Provider chain — each entry has a check, text generator, and JSON generator.
 * Order: Gemini → Groq → OpenAI → Claude → Mistral
 */
interface AIProvider {
  name: string;
  isConfigured: () => boolean;
  generateText: (prompt: string, system?: string) => Promise<string>;
  generateJSON: <T>(prompt: string, system?: string) => Promise<T>;
}

function getProviders(): AIProvider[] {
  return [
    {
      name: "Gemini",
      isConfigured: isGeminiConfigured,
      generateText: async (prompt, system) => {
        const client = getClient();
        const model = client.getGenerativeModel({
          model: "gemini-2.0-flash",
          ...(system ? { systemInstruction: system } : {}),
        });
        const result = await model.generateContent(prompt);
        return result.response.text();
      },
      generateJSON: async <T>(prompt: string, system?: string): Promise<T> => {
        const client = getClient();
        const model = client.getGenerativeModel({
          model: "gemini-2.0-flash",
          generationConfig: { responseMimeType: "application/json" },
          ...(system ? { systemInstruction: system } : {}),
        });
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text()) as T;
      },
    },
    {
      name: "Groq",
      isConfigured: isGroqConfigured,
      generateText: groqGenerateText,
      generateJSON: groqGenerateJSON,
    },
    {
      name: "OpenAI",
      isConfigured: isOpenAIConfigured,
      generateText: openaiGenerateText,
      generateJSON: openaiGenerateJSON,
    },
    {
      name: "Claude",
      isConfigured: isAnthropicConfigured,
      generateText: anthropicGenerateText,
      generateJSON: anthropicGenerateJSON,
    },
    {
      name: "Mistral",
      isConfigured: isMistralConfigured,
      generateText: mistralGenerateText,
      generateJSON: mistralGenerateJSON,
    },
  ];
}

/**
 * Returns true if any AI provider is available
 */
export function isAIConfigured(): boolean {
  return getProviders().some((p) => p.isConfigured());
}

/**
 * Returns list of configured provider names (for status/debug)
 */
export function getConfiguredProviders(): string[] {
  return getProviders()
    .filter((p) => p.isConfigured())
    .map((p) => p.name);
}

/**
 * Generate text — tries each configured provider in order, falls back on failure
 */
export async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  const providers = getProviders().filter((p) => p.isConfigured());

  if (providers.length === 0) {
    throw new Error(
      "No AI provider configured. Set at least one: GEMINI_API_KEY, GROQ_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, or MISTRAL_API_KEY"
    );
  }

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      const result = await provider.generateText(prompt, systemInstruction);
      return result;
    } catch (e: any) {
      console.error(`${provider.name} error, trying next provider:`, e.message || e);
      lastError = e;
    }
  }

  throw lastError || new Error("All AI providers failed");
}

/**
 * Generate JSON — tries each configured provider in order, falls back on failure
 */
export async function generateJSON<T = unknown>(prompt: string, systemInstruction?: string): Promise<T> {
  const providers = getProviders().filter((p) => p.isConfigured());

  if (providers.length === 0) {
    throw new Error(
      "No AI provider configured. Set at least one: GEMINI_API_KEY, GROQ_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, or MISTRAL_API_KEY"
    );
  }

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      const result = await provider.generateJSON<T>(prompt, systemInstruction);
      return result;
    } catch (e: any) {
      console.error(`${provider.name} JSON error, trying next provider:`, e.message || e);
      lastError = e;
    }
  }

  throw lastError || new Error("All AI providers failed");
}
