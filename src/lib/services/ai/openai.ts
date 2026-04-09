import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient() {
  if (!client) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY not set");
    client = new OpenAI({ apiKey: key });
  }
  return client;
}

export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

export async function openaiGenerateText(prompt: string, systemInstruction?: string): Promise<string> {
  const c = getClient();
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  if (systemInstruction) messages.push({ role: "system", content: systemInstruction });
  messages.push({ role: "user", content: prompt });

  const result = await c.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.7,
    max_tokens: 4000,
  });

  return result.choices[0]?.message?.content || "";
}

export async function openaiGenerateJSON<T = unknown>(prompt: string, systemInstruction?: string): Promise<T> {
  const c = getClient();
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  if (systemInstruction) messages.push({ role: "system", content: systemInstruction });
  messages.push({ role: "user", content: prompt + "\n\nRespond with valid JSON only, no markdown." });

  const result = await c.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: "json_object" },
  });

  const text = result.choices[0]?.message?.content || "{}";
  return JSON.parse(text) as T;
}
