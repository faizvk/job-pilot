import { NextResponse } from "next/server";
import { isGeminiConfigured } from "@/lib/services/ai/gemini";
import { isResendConfigured } from "@/lib/services/email.service";

export async function GET() {
  return NextResponse.json({
    gemini: isGeminiConfigured(),
    resend: isResendConfigured(),
  });
}
