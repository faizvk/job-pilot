import { NextRequest, NextResponse } from "next/server";
import { generateJSON, isAIConfigured } from "@/lib/services/ai/gemini";
import { profileService } from "@/lib/services/profile.service";
import prisma from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";

interface ExtractedProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  summary: string;
  skills: Array<{
    name: string;
    category: "technical" | "soft" | "language" | "tool";
    level: "beginner" | "intermediate" | "advanced" | "expert";
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startYear: string;
    endYear: string;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: "No AI provider configured" },
        { status: 503 }
      );
    }

    const { resumeId } = await req.json();

    // Fetch the resume
    const resume = resumeId
      ? await prisma.resume.findUnique({ where: { id: resumeId } })
      : await prisma.resume.findFirst({
          where: { userId: DEFAULT_USER_ID, isBase: true },
        });

    if (!resume) {
      return NextResponse.json(
        { error: "No resume found. Upload a resume first." },
        { status: 404 }
      );
    }

    // Use AI to extract structured profile data
    const extracted = await generateJSON<ExtractedProfile>(
      `Extract structured profile information from this resume. Be accurate — only extract what is explicitly stated.

Return JSON with these fields:
- name: full name (string)
- email: email address (string, or "" if not found)
- phone: phone number (string, or "" if not found)
- location: city/state/country (string, or "" if not found)
- linkedin: LinkedIn URL or username (string, or "" if not found)
- github: GitHub URL or username (string, or "" if not found)
- portfolio: portfolio/website URL (string, or "" if not found)
- summary: the professional summary/objective section verbatim (string, or "" if not found)
- skills: array of skills, each with:
  - name: skill name (e.g., "React", "Node.js", "Python")
  - category: one of "technical", "soft", "language", "tool"
    - "technical" = programming languages, frameworks, libraries, databases
    - "tool" = Git, Docker, Postman, CI/CD, cloud platforms
    - "soft" = communication, leadership, teamwork
    - "language" = spoken languages like English, Hindi
  - level: estimate based on context — if it's a primary/featured skill use "advanced", if mentioned in passing use "intermediate", if listed as "basic" or "learning" use "beginner"
- education: array of entries, each with:
  - institution: school/university name
  - degree: degree type (e.g., "B.Tech", "M.S.", "Bachelor's")
  - field: field of study (e.g., "Computer Science and Engineering")
  - startYear: start year as "YYYY" string (or "" if unknown)
  - endYear: end year as "YYYY" string (or "" if still studying)

Resume content:
${resume.content.slice(0, 5000)}`,
      "You are an expert resume parser. Extract accurate, structured data. Do not invent or assume information not present in the resume."
    );

    // Get current profile
    const profile = await profileService.getProfile(DEFAULT_USER_ID);

    // Update personal info (only fill empty fields, don't overwrite existing data)
    const profileUpdate: Record<string, string> = {};
    if (extracted.name && (!profile.name || profile.name === "Your Name")) {
      profileUpdate.name = extracted.name;
    }
    if (extracted.email && (!profile.email || profile.email === "your@email.com")) {
      profileUpdate.email = extracted.email;
    }
    if (extracted.phone && !profile.phone) profileUpdate.phone = extracted.phone;
    if (extracted.location && !profile.location) profileUpdate.location = extracted.location;
    if (extracted.linkedin && !profile.linkedin) profileUpdate.linkedin = extracted.linkedin;
    if (extracted.github && !profile.github) profileUpdate.github = extracted.github;
    if (extracted.portfolio && !profile.portfolio) profileUpdate.portfolio = extracted.portfolio;
    if (extracted.summary && !profile.summary) profileUpdate.summary = extracted.summary;

    if (Object.keys(profileUpdate).length > 0) {
      await profileService.updateProfile(DEFAULT_USER_ID, profileUpdate);
    }

    // Add skills (skip duplicates)
    const existingSkillNames = new Set(
      profile.skills.map((s: { name: string }) => s.name.toLowerCase())
    );
    let skillsAdded = 0;

    for (const skill of extracted.skills) {
      if (!skill.name || existingSkillNames.has(skill.name.toLowerCase())) continue;
      try {
        await profileService.addSkill(DEFAULT_USER_ID, {
          name: skill.name,
          category: skill.category,
          level: skill.level,
        });
        existingSkillNames.add(skill.name.toLowerCase());
        skillsAdded++;
      } catch {
        // Skip duplicates (unique constraint)
      }
    }

    // Add education (skip if institution already exists)
    const existingInstitutions = new Set(
      profile.education.map((e: { institution: string }) => e.institution.toLowerCase())
    );
    let educationAdded = 0;

    for (const edu of extracted.education) {
      if (!edu.institution || existingInstitutions.has(edu.institution.toLowerCase())) continue;
      try {
        await profileService.addEducation(DEFAULT_USER_ID, {
          institution: edu.institution,
          degree: edu.degree || "Degree",
          field: edu.field || "Not specified",
          startDate: edu.startYear ? `${edu.startYear}-08-01` : "2020-08-01",
          endDate: edu.endYear ? `${edu.endYear}-05-01` : null,
        });
        existingInstitutions.add(edu.institution.toLowerCase());
        educationAdded++;
      } catch {
        // Skip errors
      }
    }

    return NextResponse.json({
      success: true,
      imported: {
        profileFields: Object.keys(profileUpdate).length,
        skills: skillsAdded,
        education: educationAdded,
      },
      extracted,
    });
  } catch (error: any) {
    console.error("Resume import error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
