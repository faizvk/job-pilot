import { NextRequest, NextResponse } from "next/server";
import { generateJSON, isAIConfigured } from "@/lib/services/ai/gemini";
import { suggestResumeImprovements } from "@/lib/services/ai/resume-ai";
import { generateAICoverLetter } from "@/lib/services/ai/cover-letter-ai";
import prisma from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";

/**
 * POST /api/smart-paste
 * Takes raw pasted job text, extracts structured info, analyzes it,
 * compares with base resume, and suggests improvements.
 */
export async function POST(req: NextRequest) {
  try {
    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: "No AI provider configured. Set GEMINI_API_KEY or GROQ_API_KEY in .env" },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { rawText, action } = body;

    if (!rawText || !rawText.trim()) {
      return NextResponse.json({ error: "rawText is required" }, { status: 400 });
    }

    // Step 1: Extract structured job info from raw pasted text
    if (action === "analyze") {
      const extracted = await generateJSON<{
        jobTitle: string;
        companyName: string;
        location: string;
        workType: string;
        description: string;
        requirements: string[];
        techStack: string[];
        experienceLevel: string;
        salary: string;
      }>(
        `Extract structured job posting details from this raw text. The text may be messy — copied from a job site with mixed formatting, nav elements, etc. Focus on the actual job posting content.

Return JSON with these fields:
- jobTitle: the job title (string)
- companyName: the company name (string)
- location: job location or "Not specified" (string)
- workType: "remote", "hybrid", "onsite", or "Not specified" (string)
- description: a clean 2-3 sentence summary of the role (string)
- requirements: array of key requirements/qualifications (string[])
- techStack: array of technologies/tools mentioned (string[])
- experienceLevel: "intern", "junior", "mid", "senior", or "Not specified" (string)
- salary: salary info if mentioned, or "Not specified" (string)

Raw pasted text:
${rawText.slice(0, 5000)}`,
        "You are an expert job posting parser. Extract accurate structured data from messy copied text."
      );

      // Fetch base resume
      const baseResume = await prisma.resume.findFirst({
        where: { userId: DEFAULT_USER_ID, isBase: true },
      });

      let resumeSuggestions: string | null = null;
      if (baseResume) {
        resumeSuggestions = await suggestResumeImprovements(
          baseResume.content,
          `${extracted.jobTitle} at ${extracted.companyName}\n\nRequirements: ${extracted.requirements.join(", ")}\nTech Stack: ${extracted.techStack.join(", ")}\n\n${extracted.description}`
        );
      }

      // Fetch user profile for skill match
      const user = await prisma.user.findUnique({
        where: { id: DEFAULT_USER_ID },
        include: { skills: true },
      });

      const userSkills = user?.skills?.map((s) => s.name.toLowerCase()) || [];
      const jobSkills = extracted.techStack.map((s) => s.toLowerCase());
      const matchedSkills = jobSkills.filter((s) =>
        userSkills.some((us) => us.includes(s) || s.includes(us))
      );
      const missingSkills = jobSkills.filter(
        (s) => !userSkills.some((us) => us.includes(s) || s.includes(us))
      );

      return NextResponse.json({
        extracted,
        resumeSuggestions,
        hasBaseResume: !!baseResume,
        skillMatch: {
          matched: matchedSkills,
          missing: missingSkills,
          score: jobSkills.length > 0
            ? Math.round((matchedSkills.length / jobSkills.length) * 100)
            : 0,
        },
      });
    }

    // Step 2: Generate cover letter from extracted info
    if (action === "cover-letter") {
      const { jobTitle, companyName, description, tone } = body;

      const user = await prisma.user.findUnique({
        where: { id: DEFAULT_USER_ID },
        include: {
          skills: true,
          workHistory: { orderBy: { startDate: "desc" }, take: 1 },
          education: { orderBy: { startDate: "desc" }, take: 1 },
        },
      });

      const recentJob = user?.workHistory?.[0];
      const recentEdu = user?.education?.[0];

      const coverLetter = await generateAICoverLetter({
        jobTitle: jobTitle || "Software Engineer",
        companyName: companyName || "the company",
        jobDescription: rawText.slice(0, 3000),
        userName: user?.name || "Applicant",
        summary: user?.summary || "",
        skills: user?.skills?.map((s) => s.name) || [],
        recentRole: recentJob?.title || "",
        recentCompany: recentJob?.company || "",
        education: recentEdu
          ? `${recentEdu.degree} in ${recentEdu.field} from ${recentEdu.institution}`
          : "",
        experienceYears: recentJob ? "1+" : "0",
        tone: tone || "professional",
      });

      return NextResponse.json({ coverLetter });
    }

    return NextResponse.json({ error: "Invalid action. Use 'analyze' or 'cover-letter'" }, { status: 400 });
  } catch (error: any) {
    console.error("Smart paste error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
