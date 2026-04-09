import { Mistral } from "@mistralai/mistralai";

let client: Mistral | null = null;

function getClient() {
  if (!client) {
    const key = process.env.MISTRAL_API_KEY;
    if (!key) throw new Error("MISTRAL_API_KEY not set");
    client = new Mistral({ apiKey: key });
  }
  return client;
}

export function isMistralConfigured(): boolean {
  return !!process.env.MISTRAL_API_KEY;
}

export async function mistralGenerateText(prompt: string, systemInstruction?: string): Promise<string> {
  const c = getClient();
  const messages: { role: "system" | "user"; content: string }[] = [];
  if (systemInstruction) messages.push({ role: "system", content: systemInstruction });
  messages.push({ role: "user", content: prompt });

  const result = await c.chat.complete({
    model: "mistral-small-latest",
    messages,
    temperature: 0.7,
    maxTokens: 4000,
  });

  return result.choices?.[0]?.message?.content?.toString() || "";
}

export async function mistralGenerateJSON<T = unknown>(prompt: string, systemInstruction?: string): Promise<T> {
  const c = getClient();
  const messages: { role: "system" | "user"; content: string }[] = [];
  if (systemInstruction) messages.push({ role: "system", content: systemInstruction });
  messages.push({ role: "user", content: prompt + "\n\nRespond with valid JSON only, no markdown." });

  const result = await c.chat.complete({
    model: "mistral-small-latest",
    messages,
    temperature: 0.7,
    maxTokens: 4000,
    responseFormat: { type: "json_object" },
  });

  const text = result.choices?.[0]?.message?.content?.toString() || "{}";
  return JSON.parse(text) as T;
}
