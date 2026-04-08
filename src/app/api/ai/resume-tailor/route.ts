import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { tailorResumeWithAI, suggestResumeImprovements } from "@/lib/services/ai/resume-ai";
import { jdAnalyzerService } from "@/lib/services/jd-analyzer.service";

export async function POST(req: NextRequest) {
  try {
    const { applicationId, resumeId, action = "tailor" } = await req.json();
    if (!applicationId || !resumeId) {
      return NextResponse.json({ error: "applicationId and resumeId required" }, { status: 400 });
    }

    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });

    const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume) return NextResponse.json({ error: "Resume not found" }, { status: 404 });

    const user = await prisma.user.findUnique({
      where: { id: app.userId },
      include: { skills: true },
    });

    const userSkills = user?.skills.map((s) => ({ name: s.name, category: s.category })) || [];
    const analysis = jdAnalyzerService.analyze(app.jobDescription || "", userSkills);

    if (action === "suggest") {
      const suggestions = await suggestResumeImprovements(resume.content, app.jobDescription || "");
      if (!suggestions) {
        return NextResponse.json({ error: "Gemini API not configured" }, { status: 503 });
      }
      return NextResponse.json({ suggestions });
    }

    const tailored = await tailorResumeWithAI({
      resumeContent: resume.content,
      jobTitle: app.jobTitle,
      companyName: app.companyName,
      jobDescription: app.jobDescription || "",
      matchedSkills: analysis.matchedSkills,
      missingSkills: analysis.missingSkills,
    });

    if (!tailored) {
      return NextResponse.json({ error: "Gemini API not configured" }, { status: 503 });
    }

    // Create a tailored copy
    const tailoredResume = await prisma.resume.create({
      data: {
        userId: app.userId,
        name: `${resume.name} — Tailored for ${app.companyName}`,
        content: tailored,
      },
    });

    return NextResponse.json(tailoredResume);
  } catch (error: any) {
    console.error("AI Resume Tailor Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
