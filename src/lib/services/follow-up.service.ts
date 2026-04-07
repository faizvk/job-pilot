import prisma from "@/lib/db";

export const followUpService = {
  async list(userId: string, filters?: { status?: string; applicationId?: string }) {
    const where: any = { userId };
    if (filters?.status && filters.status !== "all") where.status = filters.status;
    if (filters?.applicationId) where.applicationId = filters.applicationId;
    return prisma.followUp.findMany({
      where,
      orderBy: { dueDate: "asc" },
      include: { application: { select: { companyName: true, jobTitle: true } } },
    });
  },

  async getById(id: string) {
    return prisma.followUp.findUnique({
      where: { id },
      include: { application: { select: { companyName: true, jobTitle: true } } },
    });
  },

  async create(userId: string, data: any) {
    return prisma.followUp.create({
      data: {
        userId,
        applicationId: data.applicationId,
        dueDate: new Date(data.dueDate),
        type: data.type,
        emailDraft: data.emailDraft || null,
      },
    });
  },

  async update(id: string, data: any) {
    return prisma.followUp.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
    });
  },

  async markSent(id: string) {
    return prisma.followUp.update({
      where: { id },
      data: { status: "sent", sentAt: new Date() },
    });
  },

  async delete(id: string) {
    return prisma.followUp.delete({ where: { id } });
  },
};
