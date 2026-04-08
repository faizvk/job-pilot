import { generateText, isGeminiConfigured } from "./gemini";

interface ResumeTailorContext {
  resumeContent: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  matchedSkills: string[];
  missingSkills: string[];
}

export async function tailorResumeWithAI(ctx: ResumeTailorContext): Promise<string | null> {
  if (!isGeminiConfigured()) return null;

  const prompt = `Tailor this resume for the following job. Return ONLY the tailored resume content in markdown format.

CURRENT RESUME:
${ctx.resumeContent.slice(0, 3000)}

TARGET JOB:
- Title: ${ctx.jobTitle}
- Company: ${ctx.companyName}
- Description: ${ctx.jobDescription.slice(0, 2000)}

SKILLS ANALYSIS:
- Matching skills: ${ctx.matchedSkills.join(", ")}
- Missing from resume: ${ctx.missingSkills.join(", ")}

INSTRUCTIONS:
- Keep all factual information (dates, company names, degrees) unchanged
- Reorder bullet points to put the most relevant experience first
- Rewrite bullets to emphasize skills that match the job description
- Add a "Key Skills" section at the top highlighting matched skills
- If the candidate has experience with missing skills but didn't mention them, add them naturally
- Do NOT fabricate experience or skills the candidate doesn't have
- Do NOT add skills from the missing list unless the resume content suggests the candidate knows them
- Keep the same overall structure and sections
- Optimize for ATS keyword matching`;

  return generateText(prompt, "You are a professional resume writer and ATS optimization expert.");
}

export async function suggestResumeImprovements(resumeContent: string, jobDescription: string): Promise<string | null> {
  if (!isGeminiConfigured()) return null;

  const prompt = `Analyze this resume against the job description and give specific, actionable suggestions.

RESUME:
${resumeContent.slice(0, 3000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}

Give exactly 5 suggestions in this format:
1. [Category] - Suggestion
2. [Category] - Suggestion
...

Categories: Skills Gap, Bullet Improvement, Keyword Missing, Section Order, Formatting
Keep each suggestion to 1-2 sentences. Be specific, not generic.`;

  return generateText(prompt, "You are a professional resume reviewer.");
}
