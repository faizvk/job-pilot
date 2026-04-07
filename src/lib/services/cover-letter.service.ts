import prisma from "@/lib/db";


export const coverLetterService = {
  async listTemplates(userId: string) {
    return prisma.coverLetterTemplate.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
  },

  async getTemplate(id: string) {
    return prisma.coverLetterTemplate.findUnique({ where: { id } });
  },

  async createTemplate(userId: string, data: { name: string; content: string }) {
    return prisma.coverLetterTemplate.create({ data: { userId, ...data } });
  },

  async updateTemplate(id: string, data: { name?: string; content?: string }) {
    return prisma.coverLetterTemplate.update({ where: { id }, data });
  },

  async deleteTemplate(id: string) {
    return prisma.coverLetterTemplate.delete({ where: { id } });
  },

  async generate(templateId: string, applicationId: string) {
    const template = await prisma.coverLetterTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new Error("Template not found");

    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!app) throw new Error("Application not found");

    const user = await prisma.user.findUnique({
      where: { id: app.userId },
      include: {
        workHistory: { orderBy: { startDate: "desc" }, take: 1 },
        skills: { where: { category: "technical" }, take: 5 },
      },
    });

    const variables: Record<string, string> = {
      companyName: app.companyName,
      jobTitle: app.jobTitle,
      userName: user?.name || "Your Name",
      topSkills: user?.skills.map((s) => s.name).join(", ") || "relevant skills",
      recentRole: user?.workHistory[0]?.title || "Previous Role",
      recentCompany: user?.workHistory[0]?.company || "Previous Company",
      location: app.location || "your location",
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    };

    let content = template.content;
    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    }

    const existing = await prisma.generatedCoverLetter.findUnique({ where: { applicationId } });
    if (existing) {
      return prisma.generatedCoverLetter.update({
        where: { applicationId },
        data: { content, templateId },
      });
    }

    return prisma.generatedCoverLetter.create({
      data: { templateId, applicationId, content },
    });
  },
};
