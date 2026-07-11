import prisma from "@/lib/db";

export const resumeService = {
  async list(userId: string) {
    return prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: { tailoredCopies: { select: { id: true, applicationId: true } } },
    });
  },

  async getById(id: string) {
    return prisma.resume.findUnique({
      where: { id },
      include: { tailoredCopies: true },
    });
  },

  async create(userId: string, data: { name: string; content: string; isBase: boolean; filePath?: string }) {
    return prisma.resume.create({ data: { userId, ...data } });
  },

  async update(id: string, data: { name?: string; content?: string; isBase?: boolean }) {
    return prisma.resume.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.resume.delete({ where: { id } });
  },

  async tailorResume(baseResumeId: string, applicationId: string) {
    const resume = await prisma.resume.findUnique({ where: { id: baseResumeId } });
    if (!resume) throw new Error("Resume not found");

    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!app) throw new Error("Application not found");

    const jdSkills: string[] = app.extractedSkills ? JSON.parse(app.extractedSkills) : [];

    // Extract keywords from JD
    const resumeContent = resume.content.toLowerCase();

    const matched: string[] = [];
    const missing: string[] = [];

    for (const skill of jdSkills) {
      if (resumeContent.includes(skill.toLowerCase())) {
        matched.push(skill);
      } else {
        missing.push(skill);
      }
    }

    // Prefer a real AI rewrite (reorders/emphasises relevant experience for the
    // role) when a provider is configured. Fall back to the lightweight
    // keyword-annotation approach only when AI is unavailable or fails — the old
    // behaviour just prepended a header + an HTML comment, which barely tailored
    // anything.
    let tailoredContent: string | null = null;
    try {
      const { tailorResumeWithAI } = await import("./ai/resume-ai");
      const ai = await tailorResumeWithAI({
        resumeContent: resume.content,
        jobTitle: app.jobTitle,
        companyName: app.companyName,
        jobDescription: app.jobDescription || "",
        matchedSkills: matched,
        missingSkills: missing,
      });
      if (ai && ai.trim().length > 50) tailoredContent = ai.trim();
    } catch {
      // fall through to keyword-based tailoring
    }

    if (!tailoredContent) {
      tailoredContent = resume.content;
      // Add Key Skills section at the top if there are matched skills
      if (matched.length > 0) {
        const skillsSection = `## Key Skills for This Role\n${matched.join(" | ")}\n\n`;
        tailoredContent = skillsSection + tailoredContent;
      }
      // Add missing skills note
      if (missing.length > 0) {
        tailoredContent += `\n\n<!-- Skills to consider adding: ${missing.join(", ")} -->`;
      }
    }

    // Upsert tailored resume
    const existing = await prisma.tailoredResume.findUnique({ where: { applicationId } });
    if (existing) {
      return prisma.tailoredResume.update({
        where: { applicationId },
        data: {
          content: tailoredContent,
          matchedKeywords: JSON.stringify(matched),
          missingKeywords: JSON.stringify(missing),
        },
      });
    }

    return prisma.tailoredResume.create({
      data: {
        baseResumeId,
        applicationId,
        content: tailoredContent,
        matchedKeywords: JSON.stringify(matched),
        missingKeywords: JSON.stringify(missing),
      },
    });
  },
};
