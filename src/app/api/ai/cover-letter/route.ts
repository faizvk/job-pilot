import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateAICoverLetter } from "@/lib/services/ai/cover-letter-ai";

export async function POST(req: NextRequest) {
  try {
    const { applicationId, tone = "professional" } = await req.json();
    if (!applicationId) return NextResponse.json({ error: "applicationId required" }, { status: 400 });

    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });

    const user = await prisma.user.findUnique({
      where: { id: app.userId },
      include: {
        skills: true,
        workHistory: { orderBy: { startDate: "desc" }, take: 1 },
        education: { orderBy: { startDate: "desc" }, take: 1 },
      },
    });

    const edu = user?.education[0];
    const work = user?.workHistory[0];

    const content = await generateAICoverLetter({
      jobTitle: app.jobTitle,
      companyName: app.companyName,
      jobDescription: app.jobDescription || "",
      userName: user?.name || "Applicant",
      summary: user?.summary || "",
      skills: user?.skills.map((s) => s.name) || [],
      recentRole: work?.title || "",
      recentCompany: work?.company || "",
      education: edu ? `${edu.degree} in ${edu.field} from ${edu.institution}` : "",
      experienceYears: work ? `${Math.max(1, Math.round((Date.now() - new Date(work.startDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)))} years` : "",
      tone,
    });

    if (!content) {
      return NextResponse.json({ error: "Gemini API not configured. Set GEMINI_API_KEY in .env" }, { status: 503 });
    }

    // Save as generated cover letter
    const existing = await prisma.generatedCoverLetter.findUnique({ where: { applicationId } });
    const saved = existing
      ? await prisma.generatedCoverLetter.update({ where: { applicationId }, data: { content } })
      : await prisma.generatedCoverLetter.create({ data: { applicationId, content } });

    return NextResponse.json({ content: saved.content, id: saved.id });
  } catch (error: any) {
    console.error("AI Cover Letter Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
