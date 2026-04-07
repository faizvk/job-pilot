import { z } from "zod";

export const applicationStatuses = [
  "saved", "applied", "phone_screen", "interview", "offer", "accepted", "rejected",
] as const;

export const createApplicationSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobUrl: z.string().optional().default(""),
  jobDescription: z.string().optional().default(""),
  status: z.enum(applicationStatuses).default("saved"),
  salaryMin: z.number().int().positive().optional().nullable(),
  salaryMax: z.number().int().positive().optional().nullable(),
  salaryCurrency: z.string().default("USD"),
  location: z.string().optional().default(""),
  workType: z.string().optional().nullable(),
  contactName: z.string().optional().default(""),
  contactEmail: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  deadline: z.string().optional().nullable(),
  matchScore: z.number().optional().nullable(),
  extractedSkills: z.string().optional().nullable(),
});

export const updateApplicationSchema = createApplicationSchema.partial();

export const updateStatusSchema = z.object({
  status: z.enum(applicationStatuses),
  note: z.string().optional(),
});

export const createResumeSchema = z.object({
  name: z.string().min(1),
  content: z.string().min(1),
  isBase: z.boolean().default(false),
});

export const coverLetterTemplateSchema = z.object({
  name: z.string().min(1),
  content: z.string().min(1),
});

export const generateCoverLetterSchema = z.object({
  templateId: z.string().min(1),
  applicationId: z.string().min(1),
});

export const analyzeJdSchema = z.object({
  jobDescription: z.string().min(20),
});

export const profileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable(),
  github: z.string().optional().nullable(),
  portfolio: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
});

export const workHistorySchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().optional().nullable(),
  current: z.boolean().default(false),
  description: z.string().min(1),
});

export const educationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  field: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().optional().nullable(),
  gpa: z.string().optional().nullable(),
});

export const skillSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["technical", "soft", "language", "tool"]),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
});

export const followUpSchema = z.object({
  applicationId: z.string().min(1),
  dueDate: z.string().min(1),
  type: z.enum(["follow_up", "thank_you", "check_in"]),
  emailDraft: z.string().optional().nullable(),
});

export const interviewPrepSchema = z.object({
  notes: z.string().optional().nullable(),
  questions: z.string().optional().nullable(),
  researchLinks: z.string().optional().nullable(),
});
