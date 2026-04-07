import prisma from "@/lib/db";

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
};
