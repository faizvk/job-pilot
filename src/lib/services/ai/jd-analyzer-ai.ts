import { generateJSON, isGeminiConfigured } from "./gemini";

interface AIJdAnalysis {
  seniorityLevel: "intern" | "junior" | "mid" | "senior" | "lead" | "principal" | "unknown";
  roleType: string;
  techStack: string[];
  softSkills: string[];
  responsibilities: string[];
  redFlags: string[];
  salaryEstimate: { min: number; max: number; currency: string } | null;
  companyCulture: string[];
  remotePolicy: "remote" | "hybrid" | "onsite" | "unknown";
  summary: string;
}

export async function analyzeJDWithAI(jobDescription: string, jobTitle: string, companyName: string): Promise<AIJdAnalysis | null> {
  if (!isGeminiConfigured()) return null;

  const prompt = `Analyze this job description and return structured JSON.

JOB TITLE: ${jobTitle}
COMPANY: ${companyName}

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

Return a JSON object with these fields:
- "seniorityLevel": one of "intern", "junior", "mid", "senior", "lead", "principal", "unknown"
- "roleType": brief role category like "Frontend Engineer", "Full Stack Developer", "Data Scientist" etc
- "techStack": array of specific technologies/frameworks mentioned
- "softSkills": array of soft skills mentioned or implied
- "responsibilities": array of 3-5 key responsibilities (brief)
- "redFlags": array of any concerning aspects (unrealistic requirements, low pay signals, vague descriptions). Empty array if none
- "salaryEstimate": object with min, max (annual USD), currency. null if cannot estimate
- "companyCulture": array of culture signals like "startup", "fast-paced", "enterprise", "remote-first"
- "remotePolicy": one of "remote", "hybrid", "onsite", "unknown"
- "summary": 2-3 sentence summary of what this role is really about

Be precise and factual. Only include what is actually stated or strongly implied.`;

  return generateJSON<AIJdAnalysis>(prompt, "You are a technical recruiter and job market analyst.");
}
