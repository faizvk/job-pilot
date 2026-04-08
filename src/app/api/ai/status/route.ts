import { NextResponse } from "next/server";
import { isGeminiConfigured, isAIConfigured } from "@/lib/services/ai/gemini";
import { isGroqConfigured } from "@/lib/services/ai/groq";
import { isResendConfigured } from "@/lib/services/email.service";
import { isGmailConfigured, isGmailConnected } from "@/lib/services/gmail.service";

export async function GET() {
  const gmailConfigured = isGmailConfigured();
  const gmailConnected = gmailConfigured ? await isGmailConnected() : false;

  return NextResponse.json({
    gemini: isGeminiConfigured(),
    groq: isGroqConfigured(),
    ai: isAIConfigured(),
    resend: isResendConfigured(),
    gmail: { configured: gmailConfigured, connected: gmailConnected },
  });
}
