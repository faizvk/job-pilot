import prisma from "@/lib/db";
import { jdAnalyzerService } from "./jd-analyzer.service";

interface GeneratedQuestion {
  question: string;
  answer: string;
  category: "technical" | "behavioral" | "situational" | "company";
}

// Common behavioral questions mapped to skills/contexts
const BEHAVIORAL_QUESTIONS = [
  "Tell me about a time you had to learn a new technology quickly. What was your approach?",
  "Describe a challenging bug you debugged. How did you find the root cause?",
  "Tell me about a project you are most proud of. What made it successful?",
  "How do you handle disagreements with teammates about technical decisions?",
  "Describe a time you missed a deadline or things did not go as planned. What did you learn?",
  "Tell me about a time you had to explain a complex technical concept to a non-technical person.",
  "How do you prioritize tasks when you have multiple deadlines?",
  "Describe a situation where you had to work with limited resources or incomplete requirements.",
];

const TECHNICAL_QUESTION_TEMPLATES = [
  "Can you explain how {{skill}} works under the hood?",
  "What are the pros and cons of {{skill}} compared to alternatives?",
  "Describe a project where you used {{skill}} extensively. What challenges did you face?",
  "How would you set up a new project using {{skill}}?",
  "What are common pitfalls when working with {{skill}} and how do you avoid them?",
  "How do you test code that uses {{skill}}?",
  "What is your experience level with {{skill}} and what is something new you learned about it recently?",
];

const COMPANY_QUESTIONS = [
  "Why do you want to work at {{company}}?",
  "What do you know about {{company}}'s products or services?",
  "How does this {{role}} position align with your career goals?",
  "What specifically attracted you to this {{role}} opening?",
  "Where do you see yourself in 2-3 years at {{company}}?",
];

function generateQuestionsFromJob(
  jobDescription: string,
  companyName: string,
  jobTitle: string,
  userSkills: { name: string; category: string }[]
): GeneratedQuestion[] {
  const analysis = jdAnalyzerService.analyze(jobDescription, userSkills);
  const questions: GeneratedQuestion[] = [];

  // Technical questions based on required skills
  const topSkills = [...analysis.requiredSkills, ...analysis.niceToHaveSkills].slice(0, 6);
  const usedTemplates = new Set<number>();

  for (const skill of topSkills) {
    // Pick a random-ish template (deterministic based on skill name)
    let templateIdx = skill.length % TECHNICAL_QUESTION_TEMPLATES.length;
    while (usedTemplates.has(templateIdx) && usedTemplates.size < TECHNICAL_QUESTION_TEMPLATES.length) {
      templateIdx = (templateIdx + 1) % TECHNICAL_QUESTION_TEMPLATES.length;
    }
    usedTemplates.add(templateIdx);

    questions.push({
      question: TECHNICAL_QUESTION_TEMPLATES[templateIdx].replace(/\{\{skill\}\}/g, skill),
      answer: "",
      category: "technical",
    });
  }

  // Add questions about missing skills (gap areas)
  for (const skill of analysis.missingSkills.slice(0, 2)) {
    questions.push({
      question: `The role mentions ${skill}, which is not on your profile. How would you approach learning it?`,
      answer: "",
      category: "technical",
    });
  }

  // Experience requirement questions
  for (const req of analysis.experienceRequirements.slice(0, 2)) {
    questions.push({
      question: `The job asks for ${req}. Can you walk me through your relevant experience?`,
      answer: "",
      category: "situational",
    });
  }

  // Behavioral questions (pick 3-4)
  const behavioralCount = Math.min(4, BEHAVIORAL_QUESTIONS.length);
  const startIdx = companyName.length % BEHAVIORAL_QUESTIONS.length;
  for (let i = 0; i < behavioralCount; i++) {
    const idx = (startIdx + i * 2) % BEHAVIORAL_QUESTIONS.length;
    questions.push({
      question: BEHAVIORAL_QUESTIONS[idx],
      answer: "",
      category: "behavioral",
    });
  }

  // Company-specific questions
  for (const template of COMPANY_QUESTIONS.slice(0, 3)) {
    questions.push({
      question: template.replace(/\{\{company\}\}/g, companyName).replace(/\{\{role\}\}/g, jobTitle),
      answer: "",
      category: "company",
    });
  }

  return questions;
}

export const interviewPrepService = {
  async getByApplicationId(applicationId: string) {
    let prep = await prisma.interviewPrep.findUnique({ where: { applicationId } });
    if (!prep) {
      prep = await prisma.interviewPrep.create({
        data: { applicationId, notes: "", questions: "[]", researchLinks: "[]" },
      });
    }
    return prep;
  },

  async update(applicationId: string, data: { notes?: string; questions?: string; researchLinks?: string }) {
    return prisma.interviewPrep.upsert({
      where: { applicationId },
      update: data,
      create: { applicationId, ...data },
    });
  },

  async generateQuestions(applicationId: string) {
    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!app) throw new Error("Application not found");

    const user = await prisma.user.findUnique({
      where: { id: app.userId },
      include: { skills: true },
    });

    const userSkills = user?.skills.map((s) => ({ name: s.name, category: s.category })) || [];
    const jobDescription = app.jobDescription || "";
    const questions = generateQuestionsFromJob(jobDescription, app.companyName, app.jobTitle, userSkills);

    // Merge with existing questions (don't overwrite user's answers)
    const prep = await this.getByApplicationId(applicationId);
    let existingQuestions: GeneratedQuestion[] = [];
    try { existingQuestions = JSON.parse(prep.questions || "[]"); } catch { /* empty */ }

    // Only add new questions that don't already exist
    const existingSet = new Set(existingQuestions.map((q) => q.question));
    const newQuestions = questions.filter((q) => !existingSet.has(q.question));
    const merged = [...existingQuestions, ...newQuestions];

    await this.update(applicationId, { questions: JSON.stringify(merged) });
    return merged;
  },
};
