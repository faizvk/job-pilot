import { NextRequest, NextResponse } from "next/server";
import { generateText, isAIConfigured } from "@/lib/services/ai/gemini";
import { resumeService } from "@/lib/services/resume.service";
import prisma from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";

/**
 * POST /api/smart-paste/generate-resume
 * Takes the base resume + selected suggestions + job context,
 * generates an improved LaTeX resume for Overleaf.
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

    const hasLatex = !!baseResume.latexContent;

    let prompt: string;
    let systemPrompt: string;

    if (hasLatex) {
      // Generate modified LaTeX
      prompt = `You are a professional resume writer who works with LaTeX. Take this existing LaTeX resume and apply ONLY the selected improvements listed below. Do not add fake experience or skills the person doesn't have.

TARGET JOB: ${jobTitle || "Software Engineer"} at ${companyName || "a company"}
RELEVANT TECH: ${(techStack || []).join(", ")}

IMPROVEMENTS TO APPLY:
${suggestionsText}

CURRENT RESUME (LaTeX source):
${baseResume.latexContent}

INSTRUCTIONS:
- Apply each improvement listed above to the LaTeX resume
- Keep the EXACT same LaTeX structure, packages, formatting commands, and style
- Do NOT change the document class, margins, fonts, section formatting, or custom commands
- Do NOT invent experience, projects, or skills that aren't in the original
- DO reword bullet points, reorder sections, add relevant keywords from the original content, and bold important terms with \\textbf{}
- Keep it concise — no longer than the original
- Output ONLY the complete LaTeX document from \\documentclass to \\end{document}, nothing else
- Do NOT wrap it in markdown code blocks or add any explanation`;

      systemPrompt = "You are an expert resume writer and LaTeX typesetter. Output only the complete modified LaTeX document, no explanations or markdown.";
    } else {
      // Fallback to markdown
      prompt = `You are a professional resume writer. Take this existing resume and apply ONLY the selected improvements listed below. Do not add fake experience or skills the person doesn't have.

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

      systemPrompt = "You are an expert resume writer. Output only the improved resume in clean markdown format.";
    }

    const updatedResume = await generateText(prompt, systemPrompt);

    // Clean up: strip markdown code fences if AI wrapped the output
    let cleanedResume = updatedResume;
    if (hasLatex) {
      cleanedResume = cleanedResume
        .replace(/^```(?:latex|tex)?\s*\n?/i, "")
        .replace(/\n?```\s*$/i, "")
        .trim();
    }

    // Save as a new resume in the Resumes section
    const savedResume = await resumeService.create(DEFAULT_USER_ID, {
      name: `${baseResume.name} — ${companyName || jobTitle || "Tailored"}`,
      content: hasLatex ? baseResume.content : cleanedResume,
      isBase: false,
      filePath: baseResume.filePath || undefined,
    });

    // Also store the LaTeX on the new resume if we generated LaTeX
    if (hasLatex) {
      await prisma.resume.update({
        where: { id: savedResume.id },
        data: { latexContent: cleanedResume },
      });
    }

    return NextResponse.json({
      resume: cleanedResume,
      savedId: savedResume.id,
      originalFilePath: !!baseResume.filePath,
      isLatex: hasLatex,
    });
  } catch (error: any) {
    console.error("Generate resume error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
