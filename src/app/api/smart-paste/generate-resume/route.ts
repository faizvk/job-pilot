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
- PRESERVE the original \\textbf{} pattern exactly: only bold category labels (e.g. \\textbf{Languages:}), key project technologies, and action verbs — do NOT over-bold by wrapping every single skill or word in \\textbf{}
- In the Technical Skills section, keep skills as plain text after the bolded category label, exactly like the original format
- DO reword bullet points, reorder sections, and add relevant keywords from the original content as the suggestions say
- Make MINIMAL changes — only what the suggestions explicitly ask for. Do not rewrite sections that aren't mentioned in the suggestions.
- Keep it concise — no longer than the original
- Output the COMPLETE LaTeX document from \\documentclass to \\end{document} — do not truncate or cut off any section
- CRITICAL: Use correct LaTeX syntax — \\begin{itemize} must close with \\end{itemize} (curly braces, NOT parentheses or brackets)
- CRITICAL: Include ALL sections from the original, even if unchanged. The output MUST end with \\end{document}
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

    // Clean up AI output
    let cleanedResume = updatedResume;
    if (hasLatex) {
      cleanedResume = cleanedResume
        .replace(/^```(?:latex|tex)?\s*\n?/i, "")
        .replace(/\n?```\s*$/i, "")
        .trim();

      // Fix common AI LaTeX mistakes
      cleanedResume = sanitizeLatex(cleanedResume, baseResume.latexContent!);
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

/**
 * Fix common AI-introduced LaTeX errors by comparing against the original.
 * Main strategy: detect where AI output diverges/truncates and splice in original's tail.
 */
function sanitizeLatex(generated: string, original: string): string {
  let fixed = generated;

  // 1. Fix brace mixups: \end{itemize) → \end{itemize}
  fixed = fixed.replace(/\\(begin|end)\{([^}]*?)[)\]]/g, "\\$1{$2}");

  // 2. Fix truncated \href — find any \href{url that's missing }{text}
  //    Pattern: \href{...  at end of line without closing }{...}
  const hrefRegex = /\\href\{([^}]*)$/m;
  const truncatedHref = hrefRegex.exec(fixed);
  if (truncatedHref) {
    // Find this partial URL in the original and get the complete \href{url}{text}
    const partialUrl = truncatedHref[1];
    const originalIdx = original.indexOf(partialUrl);
    if (originalIdx !== -1) {
      // Find the complete \href from the original starting before this URL
      const hrefStart = original.lastIndexOf("\\href{", originalIdx);
      if (hrefStart !== -1) {
        // Extract everything from this \href to the end of the line/entry
        const afterHref = original.slice(hrefStart);
        // Match the complete \href{url}{text} possibly followed by more text on the line
        const completeMatch = afterHref.match(/\\href\{[^}]+\}\{[^}]+\}[^\n]*/);
        if (completeMatch) {
          // Replace the truncated \href line with the complete one
          const truncStart = fixed.lastIndexOf("\\href{" + partialUrl.slice(0, 20));
          if (truncStart !== -1) {
            fixed = fixed.slice(0, truncStart) + completeMatch[0];
          }
        }
      }
    }
  }

  // 3. If \end{document} is missing, recover the tail from the original.
  //    Find the last line in generated that also exists in original,
  //    then append everything from original after that point.
  if (!fixed.includes("\\end{document}")) {
    const genLines = fixed.split("\n");
    const origLines = original.split("\n");

    // Walk backwards through generated lines to find last matching line in original
    let spliceFromOrigLine = -1;
    for (let i = genLines.length - 1; i >= 0; i--) {
      const line = genLines[i].trim();
      if (!line || line.startsWith("%")) continue;

      // Find this line in the original
      for (let j = 0; j < origLines.length; j++) {
        if (origLines[j].trim() === line) {
          spliceFromOrigLine = j;
          break;
        }
      }
      if (spliceFromOrigLine !== -1) break;
    }

    if (spliceFromOrigLine !== -1 && spliceFromOrigLine < origLines.length - 1) {
      // Append everything after the matched line from original
      const tail = origLines.slice(spliceFromOrigLine + 1).join("\n");
      fixed = fixed.trimEnd() + "\n" + tail;
    } else {
      // Fallback: just close the document
      fixed = fixed.trimEnd() + "\n\n\\end{itemize}\n\n\\end{document}\n";
    }
  }

  // 4. Fix unbalanced \begin/\end pairs
  const envCounts: Record<string, number> = {};
  const beginRe = /\\begin\{([^}]+)\}/g;
  const endRe = /\\end\{([^}]+)\}/g;
  let m;
  while ((m = beginRe.exec(fixed)) !== null) {
    envCounts[m[1]] = (envCounts[m[1]] || 0) + 1;
  }
  while ((m = endRe.exec(fixed)) !== null) {
    envCounts[m[1]] = (envCounts[m[1]] || 0) - 1;
  }
  for (const env of Object.keys(envCounts)) {
    if (env === "document") continue;
    const missing = envCounts[env] || 0;
    if (missing > 0) {
      const endDoc = fixed.lastIndexOf("\\end{document}");
      if (endDoc !== -1) {
        const insert = ("\\end{" + env + "}\n").repeat(missing);
        fixed = fixed.slice(0, endDoc) + insert + fixed.slice(endDoc);
      }
    }
  }

  return fixed;
}
