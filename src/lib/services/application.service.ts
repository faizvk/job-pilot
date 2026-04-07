import prisma from "@/lib/db";

export const applicationService = {
  async list(userId: string, filters?: { status?: string; search?: string }) {
    const where: any = { userId };
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.OR = [
        { companyName: { contains: filters.search } },
        { jobTitle: { contains: filters.search } },
      ];
    }
    return prisma.application.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: { statusHistory: { orderBy: { changedAt: "desc" }, take: 1 } },
    });
  },

  async getById(id: string) {
    return prisma.application.findUnique({
      where: { id },
      include: {
        statusHistory: { orderBy: { changedAt: "desc" } },
        tailoredResume: true,
        coverLetter: true,
        interviewPrep: true,
        followUps: { orderBy: { dueDate: "asc" } },
      },
    });
  },

  async create(userId: string, data: any) {
    const app = await prisma.application.create({
      data: {
        userId,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        jobUrl: data.jobUrl || null,
        jobDescription: data.jobDescription || null,
        status: data.status || "saved",
        salaryMin: data.salaryMin || null,
        salaryMax: data.salaryMax || null,
        salaryCurrency: data.salaryCurrency || "USD",
        location: data.location || null,
        workType: data.workType || null,
        contactName: data.contactName || null,
        contactEmail: data.contactEmail || null,
        notes: data.notes || null,
        matchScore: data.matchScore || null,
        extractedSkills: data.extractedSkills || null,
        deadline: data.deadline ? new Date(data.deadline) : null,
        appliedAt: data.status === "applied" ? new Date() : null,
      },
    });
    await prisma.statusChange.create({
      data: { applicationId: app.id, fromStatus: "", toStatus: data.status || "saved" },
    });
    return app;
  },

  async update(id: string, data: any) {
    return prisma.application.update({
      where: { id },
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        salaryMin: data.salaryMin || null,
        salaryMax: data.salaryMax || null,
      },
    });
  },

  async updateStatus(id: string, newStatus: string, note?: string) {
    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) throw new Error("Application not found");

    const updateData: any = { status: newStatus };
    if (newStatus === "applied" && !app.appliedAt) {
      updateData.appliedAt = new Date();
    }

    const updated = await prisma.application.update({ where: { id }, data: updateData });
    await prisma.statusChange.create({
      data: { applicationId: id, fromStatus: app.status, toStatus: newStatus, note },
    });
    return updated;
  },

  async delete(id: string) {
    return prisma.application.delete({ where: { id } });
  },
};
