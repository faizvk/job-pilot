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
- techStack: array of individual technologies/tools mentioned — normalize names like "React JS" to "React", "Node JS" to "Node.js" etc. (string[])
- experienceLevel: "intern", "junior", "mid", "senior", or "Not specified" (string)
- salary: salary info if mentioned, or "Not specified" (string)

Raw pasted text:
${rawText.slice(0, 5000)}`,
        "You are an expert job posting parser. Extract accurate structured data from messy copied text. Normalize technology names to their common forms."
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

      // Skill matching: check profile skills AND base resume content
      const user = await prisma.user.findUnique({
        where: { id: DEFAULT_USER_ID },
        include: { skills: true },
      });

      const profileSkills = user?.skills?.map((s) => s.name.toLowerCase()) || [];
      const resumeContent = (baseResume?.content || "").toLowerCase();

      const jobSkills = extracted.techStack.map((s) => s.toLowerCase());

      const matchedSkills: string[] = [];
      const missingSkills: string[] = [];

      for (const skill of jobSkills) {
        const normalizedSkill = skill.replace(/[.\-\/]/g, "").replace(/\s+/g, "");
        const inProfile = profileSkills.some((ps) => {
          const normalizedPs = ps.replace(/[.\-\/]/g, "").replace(/\s+/g, "");
          return normalizedPs.includes(normalizedSkill) || normalizedSkill.includes(normalizedPs);
        });
        // Also check if the skill appears in the resume text
        const inResume = resumeContent.includes(skill) ||
          resumeContent.includes(normalizedSkill) ||
          resumeContent.includes(skill.replace(/\./g, "")) ||
          // Check common variations
          checkSkillInResume(skill, resumeContent);

        if (inProfile || inResume) {
          matchedSkills.push(skill);
        } else {
          missingSkills.push(skill);
        }
      }

      return NextResponse.json({
        extracted,
        resumeSuggestions,
        hasBaseResume: !!baseResume,
        resumeContent: baseResume?.content || null,
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

      // Also fetch base resume to enrich context
      const baseResume = await prisma.resume.findFirst({
        where: { userId: DEFAULT_USER_ID, isBase: true },
      });

      const recentJob = user?.workHistory?.[0];
      const recentEdu = user?.education?.[0];

      // Combine profile skills with skills from resume
      const resumeSkills = baseResume ? extractSkillsFromResume(baseResume.content) : [];
      const profileSkills = user?.skills?.map((s) => s.name) || [];
      const allSkills = Array.from(new Set([...profileSkills, ...resumeSkills]));

      const coverLetter = await generateAICoverLetter({
        jobTitle: jobTitle || "Software Engineer",
        companyName: companyName || "the company",
        jobDescription: rawText.slice(0, 3000),
        userName: user?.name || baseResume ? extractNameFromResume(baseResume?.content || "") : "Applicant",
        summary: user?.summary || extractSummaryFromResume(baseResume?.content || ""),
        skills: allSkills,
        recentRole: recentJob?.title || "",
        recentCompany: recentJob?.company || "",
        education: recentEdu
          ? `${recentEdu.degree} in ${recentEdu.field} from ${recentEdu.institution}`
          : extractEducationFromResume(baseResume?.content || ""),
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

/**
 * Check if a skill exists in resume text with common name variations
 */
function checkSkillInResume(skill: string, resumeText: string): boolean {
  const variations: Record<string, string[]> = {
    "react": ["react", "reactjs", "react.js", "react js"],
    "node.js": ["node", "nodejs", "node.js", "node js"],
    "express": ["express", "expressjs", "express.js"],
    "javascript": ["javascript", "js", "es6"],
    "typescript": ["typescript", "ts"],
    "redux": ["redux", "redux toolkit"],
    "docker": ["docker"],
    "kubernetes": ["kubernetes", "k8s"],
    "github": ["github", "git"],
    "azure": ["azure"],
    "jest": ["jest"],
    "context api": ["context api", "context"],
    "json": ["json"],
    "yaml": ["yaml"],
    "server-side rendering": ["server-side rendering", "ssr", "server side"],
    "css": ["css", "css3"],
    "html": ["html", "html5"],
    "mongodb": ["mongodb", "mongo"],
    "redis": ["redis"],
    "tailwind": ["tailwind", "tailwindcss"],
    "ci/cd": ["ci/cd", "ci cd", "pipelines", "pipeline"],
  };

  const skillLower = skill.toLowerCase();

  // Check direct variations
  const vars = variations[skillLower];
  if (vars) {
    return vars.some((v) => resumeText.includes(v));
  }

  // Check if any variation map contains this skill as a value
  for (const [, alts] of Object.entries(variations)) {
    if (alts.includes(skillLower)) {
      return alts.some((v) => resumeText.includes(v));
    }
  }

  return false;
}

/**
 * Extract skill-like keywords from resume content
 */
function extractSkillsFromResume(content: string): string[] {
  const skillPatterns = [
    /(?:languages?|skills?|technologies?|tools?):\s*(.+)/gi,
    /(?:web development|databases?|frameworks?):\s*(.+)/gi,
  ];

  const skills: string[] = [];
  for (const pattern of skillPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const items = match[1].split(/[,·•|]/).map((s) => s.trim()).filter(Boolean);
      skills.push(...items);
    }
  }
  return skills;
}

function extractNameFromResume(content: string): string {
  const firstLine = content.split("\n").find((l) => l.trim())?.replace(/^#+\s*/, "").trim() || "";
  return firstLine.replace(/[^a-zA-Z\s]/g, "").trim() || "Applicant";
}

function extractSummaryFromResume(content: string): string {
  const summaryMatch = content.match(/##\s*Summary\n([\s\S]*?)(?=\n##|\n$)/i);
  return summaryMatch?.[1]?.trim() || "";
}

function extractEducationFromResume(content: string): string {
  const eduMatch = content.match(/##\s*Education\n([\s\S]*?)(?=\n##|\n$)/i);
  if (!eduMatch) return "";
  const firstLine = eduMatch[1].split("\n").find((l) => l.trim());
  return firstLine?.replace(/^[-•*]\s*/, "").trim() || "";
}
