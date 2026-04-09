import { NextRequest, NextResponse } from "next/server";
import { generateText, isAIConfigured } from "@/lib/services/ai/gemini";
import { resumeService } from "@/lib/services/resume.service";
import prisma from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";

/**
 * POST /api/smart-paste/generate-resume
 * Takes the base resume + selected suggestions + job context,
 * generates an improved resume, saves it to the Resumes section.
 */
export async function POST(req: NextRequest) {
  try {
    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: "No AI provider configured" },
        { status: 503 }
      );
    }

    const { suggestions, jobTitle, companyName, techStack } = await req.json();

    if (!suggestions || !suggestions.length) {
      return NextResponse.json(
        { error: "Select at least one suggestion to apply" },
        { status: 400 }
      );
    }

    // Fetch base resume
    const baseResume = await prisma.resume.findFirst({
      where: { userId: DEFAULT_USER_ID, isBase: true },
    });

    if (!baseResume) {
      return NextResponse.json(
        { error: "No base resume found. Upload one first." },
        { status: 404 }
      );
    }

    const suggestionsText = suggestions
      .map((s: string, i: number) => `${i + 1}. ${s}`)
      .join("\n");

    const prompt = `You are a professional resume writer. Take this existing resume and apply ONLY the selected improvements listed below. Do not add fake experience or skills the person doesn't have.

TARGET JOB: ${jobTitle || "Software Engineer"} at ${companyName || "a company"}
RELEVANT TECH: ${(techStack || []).join(", ")}

IMPROVEMENTS TO APPLY:
${suggestionsText}

CURRENT RESUME (in markdown):
${baseResume.content}

INSTRUCTIONS:
- Apply each improvement listed above to the resume
- Keep the same structure and markdown format (# for name, ## for sections, ### for sub-items, - for bullets)
- Do NOT invent experience, projects, or skills that aren't in the original
- DO reorder sections, reword bullets, add missing keywords from the original content, and improve formatting as the suggestions say
- Keep it concise — no longer than the original
- Output ONLY the updated resume in markdown format, nothing else`;

    const updatedResume = await generateText(
      prompt,
      "You are an expert resume writer. Output only the improved resume in clean markdown format."
    );

    // Save as a new resume in the Resumes section
    const savedResume = await resumeService.create(DEFAULT_USER_ID, {
      name: `${baseResume.name} — ${companyName || jobTitle || "Tailored"}`,
      content: updatedResume,
      isBase: false,
      filePath: baseResume.filePath || undefined,
    });

    return NextResponse.json({
      resume: updatedResume,
      savedId: savedResume.id,
      originalFilePath: !!baseResume.filePath,
    });
  } catch (error: any) {
    console.error("Generate resume error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
