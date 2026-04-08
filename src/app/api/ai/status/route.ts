import { NextResponse } from "next/server";
import { isGeminiConfigured } from "@/lib/services/ai/gemini";

export async function GET() {
  return NextResponse.json({
    gemini: isGeminiConfigured(),
  });
}
