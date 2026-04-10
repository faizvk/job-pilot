import { CohereClient } from "cohere-ai";

let client: CohereClient | null = null;

function getClient() {
  if (!client) {
    const key = process.env.COHERE_API_KEY;
    if (!key) throw new Error("COHERE_API_KEY not set");
    client = new CohereClient({ token: key });
  }
  return client;
}

export function isCohereConfigured(): boolean {
  return !!process.env.COHERE_API_KEY;
}

export async function cohereGenerateText(prompt: string, systemInstruction?: string): Promise<string> {
  const c = getClient();

  const result = await c.chat({
    model: "command-r-plus",
    message: prompt,
    ...(systemInstruction ? { preamble: systemInstruction } : {}),
    temperature: 0.7,
    maxTokens: 4000,
  });

  return result.text || "";
}

export async function cohereGenerateJSON<T = unknown>(prompt: string, systemInstruction?: string): Promise<T> {
  const text = await cohereGenerateText(
    prompt + "\n\nRespond with valid JSON only, no markdown code blocks.",
    systemInstruction
  );

  const cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  return JSON.parse(cleaned) as T;
}
