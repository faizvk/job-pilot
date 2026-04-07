import prisma from "@/lib/db";
import { getWeekStart } from "@/lib/utils";

export const weeklyGoalService = {
  async getCurrent(userId: string) {
    const weekStart = getWeekStart();
    let goal = await prisma.weeklyGoal.findUnique({
      where: { userId_weekStart: { userId, weekStart } },
    });
    if (!goal) {
      goal = await prisma.weeklyGoal.create({
        data: { userId, weekStart, target: 5, achieved: 0 },
      });
    }
    return goal;
  },

  async setTarget(userId: string, target: number) {
    const weekStart = getWeekStart();
    return prisma.weeklyGoal.upsert({
      where: { userId_weekStart: { userId, weekStart } },
      update: { target },
      create: { userId, weekStart, target },
    });
  },

  async incrementAchieved(userId: string) {
    const goal = await this.getCurrent(userId);
    return prisma.weeklyGoal.update({
      where: { id: goal.id },
      data: { achieved: goal.achieved + 1 },
    });
  },
};
