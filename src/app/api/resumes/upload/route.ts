import { NextRequest, NextResponse } from "next/server";
import { resumeService } from "@/lib/services/resume.service";
import { DEFAULT_USER_ID } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const isBase = formData.get("isBase") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileName = file.name;
    const ext = fileName.split(".").pop()?.toLowerCase();

    if (!ext || !["pdf", "docx", "doc", "txt"].includes(ext)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF, DOCX, or TXT file." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let content = "";

    if (ext === "pdf") {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      content = data.text;
    } else if (ext === "docx" || ext === "doc") {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      content = result.value;
    } else {
      content = buffer.toString("utf-8");
    }

    if (!content.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from the file. The file may be empty or image-based." },
        { status: 400 }
      );
    }

    // Convert raw text to structured markdown
    const markdownContent = textToMarkdown(content);

    // Generate a clean name from filename
    const resumeName = fileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const resume = await resumeService.create(DEFAULT_USER_ID, {
      name: resumeName,
      content: markdownContent,
      isBase,
    });

    return NextResponse.json(resume, { status: 201 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process file" },
      { status: 500 }
    );
  }
}

function textToMarkdown(raw: string): string {
  const lines = raw.split("\n").map((l) => l.trimEnd());

  // Common resume section headers
  const sectionPatterns = [
    /^(summary|objective|profile|about\s*me)$/i,
    /^(experience|work\s*experience|professional\s*experience|employment)$/i,
    /^(education|academic|qualifications)$/i,
    /^(skills|technical\s*skills|core\s*competencies|technologies)$/i,
    /^(projects|personal\s*projects|key\s*projects)$/i,
    /^(certifications?|licenses?|courses?)$/i,
    /^(awards?|achievements?|honors?)$/i,
    /^(languages?|additional\s*info|interests|hobbies|references?)$/i,
    /^(publications?|volunteer|community)$/i,
  ];

  const result: string[] = [];
  let isFirstLine = true;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines but preserve spacing
    if (!trimmed) {
      if (result.length > 0 && result[result.length - 1] !== "") {
        result.push("");
      }
      continue;
    }

    // First non-empty line is likely the name
    if (isFirstLine) {
      result.push(`# ${trimmed}`);
      isFirstLine = false;
      continue;
    }

    // Check if it's a section header
    const isSection = sectionPatterns.some((p) => p.test(trimmed));
    if (isSection) {
      result.push("");
      result.push(`## ${trimmed}`);
      continue;
    }

    // Lines that look like bullet points
    if (/^[•\-\*\u2022\u2023\u25E6\u2043\u2219]\s/.test(trimmed)) {
      result.push(`- ${trimmed.replace(/^[•\-\*\u2022\u2023\u25E6\u2043\u2219]\s*/, "")}`);
      continue;
    }

    // Lines that look like "Company | Role | Date" or "Company - Role - Date"
    if (/\|/.test(trimmed) && trimmed.split("|").length >= 2) {
      result.push(`### ${trimmed}`);
      continue;
    }

    // Regular line
    result.push(trimmed);
  }

  return result.join("\n").trim();
}
