import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateAIInterviewQuestions } from "@/lib/services/ai/interview-ai";
import { interviewPrepService } from "@/lib/services/interview-prep.service";

export async function POST(req: NextRequest) {
  try {
    const { applicationId } = await req.json();
    if (!applicationId) return NextResponse.json({ error: "applicationId required" }, { status: 400 });

    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });

    const user = await prisma.user.findUnique({
      where: { id: app.userId },
      include: {
        skills: true,
        workHistory: { orderBy: { startDate: "desc" }, take: 1 },
      },
    });

    const questions = await generateAIInterviewQuestions({
      jobTitle: app.jobTitle,
      companyName: app.companyName,
      jobDescription: app.jobDescription || "",
      userSkills: user?.skills.map((s) => s.name) || [],
      recentRole: user?.workHistory[0]?.title || "",
      recentCompany: user?.workHistory[0]?.company || "",
    });

    if (!questions) {
      return NextResponse.json({ error: "Gemini API not configured. Set GEMINI_API_KEY in .env" }, { status: 503 });
    }

    // Merge with existing (don't overwrite user answers)
    const prep = await interviewPrepService.getByApplicationId(applicationId);
    let existing: any[] = [];
    try { existing = JSON.parse(prep.questions || "[]"); } catch { /* empty */ }

    const existingSet = new Set(existing.map((q: any) => q.question));
    const newQuestions = questions.filter((q) => !existingSet.has(q.question));
    const merged = [...existing, ...newQuestions];

    await interviewPrepService.update(applicationId, { questions: JSON.stringify(merged) });

    return NextResponse.json(merged);
  } catch (error: any) {
    console.error("AI Interview Prep Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
