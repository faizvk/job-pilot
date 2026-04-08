import { generateJSON, isGeminiConfigured } from "./gemini";

interface InterviewQuestion {
  question: string;
  answer: string;
  category: "technical" | "behavioral" | "situational" | "company";
  tip?: string;
}

interface InterviewContext {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  userSkills: string[];
  recentRole: string;
  recentCompany: string;
}

export async function generateAIInterviewQuestions(ctx: InterviewContext): Promise<InterviewQuestion[] | null> {
  if (!isGeminiConfigured()) return null;

  const prompt = `Generate interview questions for this job application. Return a JSON array of objects.

JOB:
- Title: ${ctx.jobTitle}
- Company: ${ctx.companyName}
- Description: ${ctx.jobDescription.slice(0, 2000)}

CANDIDATE:
- Skills: ${ctx.userSkills.join(", ")}
- Current Role: ${ctx.recentRole} at ${ctx.recentCompany}

Generate exactly 15 questions:
- 5 technical questions (specific to the tech stack in the JD)
- 4 behavioral questions (using STAR method scenarios relevant to this role)
- 3 situational questions (hypothetical work scenarios for this company)
- 3 company-specific questions (about the company, culture, role expectations)

Each object must have:
- "question": the interview question
- "answer": empty string ""
- "category": one of "technical", "behavioral", "situational", "company"
- "tip": a brief 1-sentence hint on how to approach the answer

Make questions specific to the actual job description — not generic. Reference real technologies, responsibilities, and requirements from the JD.`;

  return generateJSON<InterviewQuestion[]>(prompt, "You are a senior technical interviewer and career coach.");
}
