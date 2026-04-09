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
    let latexSections: { name: string; content: string; startIdx: number; endIdx: number }[] = [];

    if (hasLatex) {
      // Parse original LaTeX into sections, have AI modify only relevant ones,
      // then reassemble — avoids truncation and syntax corruption.
      latexSections = parseLatexSections(baseResume.latexContent!);

      prompt = `You are a professional resume writer. I will give you specific SECTIONS of a LaTeX resume. Apply ONLY the improvements listed below to the relevant sections. Do not add fake experience or skills the person doesn't have.

TARGET JOB: ${jobTitle || "Software Engineer"} at ${companyName || "a company"}
RELEVANT TECH: ${(techStack || []).join(", ")}

IMPROVEMENTS TO APPLY:
${suggestionsText}

HERE ARE THE RESUME SECTIONS:
${latexSections.map((s) => `=== SECTION: ${s.name} ===\n${s.content}`).join("\n\n")}

INSTRUCTIONS:
- Output ONLY the sections you modified, in this exact format for each:
  === SECTION: <section name> ===
  <modified LaTeX content>
- Do NOT output sections that are unchanged
- Keep the EXACT same LaTeX commands, \\textbf{} patterns, \\href{}{} links, \\begin{itemize}/\\end{itemize} structure
- PRESERVE the original \\textbf{} pattern: only bold category labels and key technologies, NOT every single skill
- Do NOT invent experience, projects, or skills that aren't in the original
- Make MINIMAL changes — only what the suggestions explicitly ask for
- Do NOT wrap output in markdown code blocks`;

      systemPrompt = "You are an expert resume writer. Output only the modified LaTeX sections in the specified format. Do not output unchanged sections.";
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

    // Clean up AI output
    let cleanedResume = updatedResume;
    if (hasLatex) {
      cleanedResume = cleanedResume
        .replace(/^```(?:latex|tex)?\s*\n?/i, "")
        .replace(/\n?```\s*$/i, "")
        .trim();

      // Reassemble: merge AI's modified sections back into the original LaTeX
      cleanedResume = reassembleLatex(
        baseResume.latexContent!,
        latexSections,
        cleanedResume
      );
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

interface LatexSection {
  name: string;
  content: string;
  startIdx: number;
  endIdx: number;
}

/**
 * Parse a LaTeX resume into named sections.
 * Splits on \section{...} boundaries, with a "preamble" for everything before the first section.
 */
function parseLatexSections(latex: string): LatexSection[] {
  const sections: LatexSection[] = [];
  const sectionRegex = /\\section\{([^}]+)\}/g;
  const matches: { name: string; idx: number }[] = [];

  let m;
  while ((m = sectionRegex.exec(latex)) !== null) {
    matches.push({ name: m[1], idx: m.index });
  }

  // Add preamble (everything before first \section)
  if (matches.length > 0) {
    sections.push({
      name: "preamble",
      content: latex.slice(0, matches[0].idx).trim(),
      startIdx: 0,
      endIdx: matches[0].idx,
    });
  }

  // Add each section
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].idx;
    const end = i + 1 < matches.length ? matches[i + 1].idx : latex.indexOf("\\end{document}");
    const endIdx = end !== -1 ? end : latex.length;
    sections.push({
      name: matches[i].name,
      content: latex.slice(start, endIdx).trim(),
      startIdx: start,
      endIdx,
    });
  }

  return sections;
}

/**
 * Merge AI-modified sections back into the original LaTeX document.
 * AI outputs only changed sections in format:
 *   === SECTION: Name ===
 *   <content>
 * Unchanged sections are kept verbatim from original.
 */
function reassembleLatex(
  originalLatex: string,
  originalSections: LatexSection[],
  aiOutput: string
): string {
  // Parse AI output into modified sections
  const modifiedSections = new Map<string, string>();
  const sectionSplitRegex = /===\s*SECTION:\s*(.+?)\s*===/g;
  const aiMatches: { name: string; idx: number }[] = [];

  let m;
  while ((m = sectionSplitRegex.exec(aiOutput)) !== null) {
    aiMatches.push({ name: m[1].trim(), idx: m.index + m[0].length });
  }

  for (let i = 0; i < aiMatches.length; i++) {
    const start = aiMatches[i].idx;
    const end = i + 1 < aiMatches.length
      ? aiOutput.lastIndexOf("===", aiMatches[i + 1].idx - 1)
      : aiOutput.length;
    const content = aiOutput.slice(start, end).trim();
    modifiedSections.set(aiMatches[i].name, content);
  }

  // If AI didn't use the section format, it probably output the full doc — return original
  if (modifiedSections.size === 0) {
    console.warn("AI didn't use section format, returning original LaTeX");
    return originalLatex;
  }

  // Reassemble: use modified sections where available, original sections elsewhere
  const parts: string[] = [];
  for (const section of originalSections) {
    const modified = modifiedSections.get(section.name);
    if (modified) {
      parts.push(modified);
    } else {
      parts.push(section.content);
    }
  }

  // Add \end{document}
  let result = parts.join("\n\n") + "\n\n\\end{document}\n";

  // Ensure no duplicate \end{document}
  result = result.replace(/(\\end\{document\}\s*){2,}/g, "\\end{document}\n");

  return result;
}
