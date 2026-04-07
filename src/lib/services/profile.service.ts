import prisma from "@/lib/db";


export const profileService = {
  async getProfile(userId: string) {
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        workHistory: { orderBy: { startDate: "desc" } },
        education: { orderBy: { startDate: "desc" } },
        skills: { orderBy: { category: "asc" } },
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { id: userId, name: "Your Name", email: "your@email.com" },
        include: {
          workHistory: { orderBy: { startDate: "desc" } },
          education: { orderBy: { startDate: "desc" } },
          skills: { orderBy: { category: "asc" } },
        },
      });
    }

    return user;
  },

  async updateProfile(userId: string, data: any) {
    return prisma.user.update({ where: { id: userId }, data });
  },

  async addWorkHistory(userId: string, data: any) {
    return prisma.workHistory.create({
      data: {
        userId,
        company: data.company,
        title: data.title,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        current: data.current || false,
        description: data.description,
      },
    });
  },

  async updateWorkHistory(id: string, data: any) {
    return prisma.workHistory.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
  },

  async deleteWorkHistory(id: string) {
    return prisma.workHistory.delete({ where: { id } });
  },

  async addEducation(userId: string, data: any) {
    return prisma.education.create({
      data: {
        userId,
        institution: data.institution,
        degree: data.degree,
        field: data.field,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        gpa: data.gpa || null,
      },
    });
  },

  async updateEducation(id: string, data: any) {
    return prisma.education.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
  },

  async deleteEducation(id: string) {
    return prisma.education.delete({ where: { id } });
  },

  async addSkill(userId: string, data: { name: string; category: string; level: string }) {
    return prisma.skill.create({ data: { userId, ...data } });
  },

  async updateSkill(id: string, data: { name?: string; category?: string; level?: string }) {
    return prisma.skill.update({ where: { id }, data });
  },

  async deleteSkill(id: string) {
    return prisma.skill.delete({ where: { id } });
  },
};
