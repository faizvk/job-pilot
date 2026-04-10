import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient() {
  if (!client) {
    const key = process.env.DEEPSEEK_API_KEY;
    if (!key) throw new Error("DEEPSEEK_API_KEY not set");
    client = new OpenAI({ apiKey: key, baseURL: "https://api.deepseek.com" });
  }
  return client;
}

export function isDeepSeekConfigured(): boolean {
  return !!process.env.DEEPSEEK_API_KEY;
}

export async function deepseekGenerateText(prompt: string, systemInstruction?: string): Promise<string> {
  const c = getClient();
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  if (systemInstruction) messages.push({ role: "system", content: systemInstruction });
  messages.push({ role: "user", content: prompt });

  const result = await c.chat.completions.create({
    model: "deepseek-chat",
    messages,
    temperature: 0.7,
    max_tokens: 4000,
  });

  return result.choices[0]?.message?.content || "";
}

export async function deepseekGenerateJSON<T = unknown>(prompt: string, systemInstruction?: string): Promise<T> {
  const c = getClient();
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  if (systemInstruction) messages.push({ role: "system", content: systemInstruction });
  messages.push({ role: "user", content: prompt + "\n\nRespond with valid JSON only, no markdown." });

  const result = await c.chat.completions.create({
    model: "deepseek-chat",
    messages,
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: "json_object" },
  });

  const text = result.choices[0]?.message?.content || "{}";
  return JSON.parse(text) as T;
}
