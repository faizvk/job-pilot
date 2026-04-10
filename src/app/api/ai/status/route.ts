import { NextResponse } from "next/server";
import { isGeminiConfigured, isAIConfigured, getConfiguredProviders } from "@/lib/services/ai/gemini";
import { isGroqConfigured } from "@/lib/services/ai/groq";
import { isOpenAIConfigured } from "@/lib/services/ai/openai";
import { isAnthropicConfigured } from "@/lib/services/ai/anthropic";
import { isMistralConfigured } from "@/lib/services/ai/mistral";
import { isDeepSeekConfigured } from "@/lib/services/ai/deepseek";
import { isCohereConfigured } from "@/lib/services/ai/cohere";
import { isTogetherConfigured } from "@/lib/services/ai/together";
import { isGmailConfigured, isGmailConnected } from "@/lib/services/gmail.service";

export async function GET() {
  const gmailConfigured = isGmailConfigured();
  const gmailConnected = gmailConfigured ? await isGmailConnected() : false;

  return NextResponse.json({
    gemini: isGeminiConfigured(),
    groq: isGroqConfigured(),
    openai: isOpenAIConfigured(),
    anthropic: isAnthropicConfigured(),
    deepseek: isDeepSeekConfigured(),
    mistral: isMistralConfigured(),
    cohere: isCohereConfigured(),
    together: isTogetherConfigured(),
    ai: isAIConfigured(),
    providers: getConfiguredProviders(),
    gmail: { configured: gmailConfigured, connected: gmailConnected },
  });
}
