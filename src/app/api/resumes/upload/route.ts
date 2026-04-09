import { NextRequest, NextResponse } from "next/server";
import { resumeService } from "@/lib/services/resume.service";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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
      // Use internal lib to avoid pdf-parse's index.js which tries to load a test file
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse/lib/pdf-parse.js");
      const data = await pdfParse(buffer);
      content = data.text;
    } else if (ext === "docx" || ext === "doc") {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      content = result.value;
    } else {
      content = buffer.toString("utf-8");
    }

    // Clean up PDF extraction artifacts
    content = cleanPdfText(content);

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

    // Save the original file to disk
    let filePath: string | undefined;
    if (ext === "pdf" || ext === "docx" || ext === "doc") {
      const uploadsDir = path.join(process.cwd(), "uploads", "resumes");
      await mkdir(uploadsDir, { recursive: true });
      const savedFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      filePath = path.join(uploadsDir, savedFileName);
      await writeFile(filePath, buffer);
    }

    const resume = await resumeService.create(DEFAULT_USER_ID, {
      name: resumeName,
      content: markdownContent,
      isBase,
      filePath,
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

/**
 * Clean up common PDF extraction artifacts:
 * - Icon/symbol characters (R, Ó, ̄, ®, etc.)
 * - Broken hyphenation at line ends
 * - Extra whitespace
 */
function cleanPdfText(text: string): string {
  return text
    // Remove common PDF icon/symbol artifacts that appear before contact info
    .replace(/[R]\s+(?=\S+@)/g, "") // "R" before email
    .replace(/[Ó]\s+(?=\+?\d)/g, "") // "Ó" before phone
    .replace(/[̄¯]\s+(?=\S)/g, "") // combining macron before links
    .replace(/[®]\s+(?=\S)/g, "") // "®" before portfolio
    .replace(/[]\s+(?=\S)/g, "") // box character before links
    // Remove isolated single special characters on lines or between items
    .replace(/·\s*([RÓ¯®])\s*·/g, "·")
    .replace(/\s+[RÓ¯®]\s+/g, " ")
    // Fix broken hyphenation (word- \n continuation)
    .replace(/(\w)-\s*\n\s*(\w)/g, "$1$2")
    // Normalize multiple spaces
    .replace(/[ \t]{2,}/g, " ")
    // Normalize separator dots/middots
    .replace(/\s*·\s*/g, " · ")
    .trim();
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
    /^(awards?|achievements?\s*(?:&|and)?\s*certifications?|honors?)$/i,
    /^(languages?|additional\s*info|interests|hobbies|references?)$/i,
    /^(publications?|volunteer|community)$/i,
  ];

  // Patterns for project/job titles (e.g., "MyStore — Full-Stack E-Commerce Platform")
  const subheadingPatterns = [
    /^.+\s*[—–-]\s*.+(?:GitHub|Live|Link|Demo)/i,
    /^.+\s*\(.+\)\s*(?:GitHub|Live)/i,
  ];

  const result: string[] = [];
  let isFirstLine = true;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // Skip empty lines but preserve spacing
    if (!trimmed) {
      if (result.length > 0 && result[result.length - 1] !== "") {
        result.push("");
      }
      continue;
    }

    // First non-empty line is likely the name
    if (isFirstLine) {
      // Clean name: remove any remaining symbol artifacts
      const cleanName = trimmed.replace(/[^a-zA-Z\s.'-]/g, "").trim();
      result.push(`# ${cleanName || trimmed}`);
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

    // Check if it's a project/job subheading
    const isSubheading = subheadingPatterns.some((p) => p.test(trimmed));
    if (isSubheading) {
      result.push("");
      result.push(`### ${trimmed}`);
      continue;
    }

    // Lines starting with "Languages:", "Web Development:", etc. — keep as list items
    if (/^(Languages?|Web Development|Databases?|Tools?\s*(?:&|and)?\s*APIs?|Frameworks?):\s/i.test(trimmed)) {
      result.push(`- ${trimmed}`);
      continue;
    }

    // Lines that look like bullet points
    if (/^[•\-\*\u2022\u2023\u25E6\u2043\u2219]\s/.test(trimmed)) {
      result.push(`- ${trimmed.replace(/^[•\-\*\u2022\u2023\u25E6\u2043\u2219]\s*/, "")}`);
      continue;
    }

    // Lines that look like "Company | Role | Date"
    if (/\|/.test(trimmed) && trimmed.split("|").length >= 2) {
      result.push(`### ${trimmed}`);
      continue;
    }

    // Regular line
    result.push(trimmed);
  }

  return result.join("\n").trim();
}
