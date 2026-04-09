import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

function getClient() {
  if (!client) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("ANTHROPIC_API_KEY not set");
    client = new Anthropic({ apiKey: key });
  }
  return client;
}

export function isAnthropicConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

export async function anthropicGenerateText(prompt: string, systemInstruction?: string): Promise<string> {
  const c = getClient();

  const result = await c.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    ...(systemInstruction ? { system: systemInstruction } : {}),
    messages: [{ role: "user", content: prompt }],
  });

  const block = result.content[0];
  return block.type === "text" ? block.text : "";
}

export async function anthropicGenerateJSON<T = unknown>(prompt: string, systemInstruction?: string): Promise<T> {
  const text = await anthropicGenerateText(
    prompt + "\n\nRespond with valid JSON only, no markdown code blocks.",
    systemInstruction
  );

  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  return JSON.parse(cleaned) as T;
}
