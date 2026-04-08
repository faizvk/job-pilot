import { NextRequest, NextResponse } from "next/server";
import { analyzeJDWithAI } from "@/lib/services/ai/jd-analyzer-ai";

export async function POST(req: NextRequest) {
  try {
    const { jobDescription, jobTitle, companyName } = await req.json();
    if (!jobDescription) {
      return NextResponse.json({ error: "jobDescription required" }, { status: 400 });
    }

    const analysis = await analyzeJDWithAI(jobDescription, jobTitle || "", companyName || "");
    if (!analysis) {
      return NextResponse.json({ error: "Gemini API not configured" }, { status: 503 });
    }

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("AI JD Analysis Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
