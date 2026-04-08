import { generateText, isGeminiConfigured } from "./gemini";

interface CoverLetterContext {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  userName: string;
  summary: string;
  skills: string[];
  recentRole: string;
  recentCompany: string;
  education: string;
  experienceYears: string;
  tone: "professional" | "technical" | "casual";
}

export async function generateAICoverLetter(ctx: CoverLetterContext): Promise<string | null> {
  if (!isGeminiConfigured()) return null;

  const prompt = `Write a cover letter for the following job application. Return ONLY the cover letter text, no markdown formatting, no extra commentary.

JOB DETAILS:
- Title: ${ctx.jobTitle}
- Company: ${ctx.companyName}
- Description: ${ctx.jobDescription.slice(0, 2000)}

APPLICANT:
- Name: ${ctx.userName}
- Professional Summary: ${ctx.summary}
- Key Skills: ${ctx.skills.join(", ")}
- Current/Recent Role: ${ctx.recentRole} at ${ctx.recentCompany}
- Education: ${ctx.education}
- Experience: ${ctx.experienceYears}

TONE: ${ctx.tone === "casual" ? "Friendly and conversational, like writing to a startup" : ctx.tone === "technical" ? "Technical and precise, emphasizing engineering skills and projects" : "Professional and polished, suitable for corporate roles"}

RULES:
- Keep it under 350 words
- Be specific to the company and role — reference actual requirements from the job description
- Highlight 3-4 relevant skills that match the job requirements
- Do NOT use generic phrases like "I am a highly motivated individual"
- Do NOT use "Dear Hiring Manager" if the tone is casual — use "Hi" or "Hello" instead
- End with a clear call to action
- Sound like a real human wrote it, not AI`;

  return generateText(prompt, "You are a professional career advisor helping job seekers write personalized cover letters.");
}
