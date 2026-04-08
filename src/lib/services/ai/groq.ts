import Groq from "groq-sdk";

let groqClient: Groq | null = null;

function getClient() {
  if (!groqClient) {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("GROQ_API_KEY not set");
    groqClient = new Groq({ apiKey: key });
  }
  return groqClient;
}

export function isGroqConfigured(): boolean {
  return !!process.env.GROQ_API_KEY;
}

export async function groqGenerateText(prompt: string, systemInstruction?: string): Promise<string> {
  const client = getClient();

  const messages: { role: "system" | "user"; content: string }[] = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  const result = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.7,
    max_tokens: 2000,
  });

  return result.choices[0]?.message?.content || "";
}

export async function groqGenerateJSON<T = unknown>(prompt: string, systemInstruction?: string): Promise<T> {
  const client = getClient();

  const messages: { role: "system" | "user"; content: string }[] = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt + "\n\nRespond with valid JSON only, no markdown." });

  const result = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: "json_object" },
  });

  const text = result.choices[0]?.message?.content || "{}";
  return JSON.parse(text) as T;
}
