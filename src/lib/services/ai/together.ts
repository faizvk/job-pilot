import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient() {
  if (!client) {
    const key = process.env.TOGETHER_API_KEY;
    if (!key) throw new Error("TOGETHER_API_KEY not set");
    client = new OpenAI({ apiKey: key, baseURL: "https://api.together.xyz/v1" });
  }
  return client;
}

export function isTogetherConfigured(): boolean {
  return !!process.env.TOGETHER_API_KEY;
}

export async function togetherGenerateText(prompt: string, systemInstruction?: string): Promise<string> {
  const c = getClient();
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  if (systemInstruction) messages.push({ role: "system", content: systemInstruction });
  messages.push({ role: "user", content: prompt });

  const result = await c.chat.completions.create({
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    messages,
    temperature: 0.7,
    max_tokens: 4000,
  });

  return result.choices[0]?.message?.content || "";
}

export async function togetherGenerateJSON<T = unknown>(prompt: string, systemInstruction?: string): Promise<T> {
  const c = getClient();
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  if (systemInstruction) messages.push({ role: "system", content: systemInstruction });
  messages.push({ role: "user", content: prompt + "\n\nRespond with valid JSON only, no markdown." });

  const result = await c.chat.completions.create({
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    messages,
    temperature: 0.7,
    max_tokens: 4000,
  });

  const text = result.choices[0]?.message?.content || "{}";
  // Try parsing directly, strip code fences if needed
  try {
    return JSON.parse(text) as T;
  } catch {
    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
    return JSON.parse(cleaned) as T;
  }
}
