import prisma from "@/lib/db";
import { APPLICATION_STATUSES } from "@/lib/constants";

export const analyticsService = {
  async getStats(userId: string) {
    const apps = await prisma.application.findMany({ where: { userId } });
    const totalApplications = apps.length;
    const applied = apps.filter((a) => a.status !== "saved").length;
    const interviews = apps.filter((a) => ["interview", "phone_screen"].includes(a.status)).length;
    const offers = apps.filter((a) => ["offer", "accepted"].includes(a.status)).length;
    const rejected = apps.filter((a) => a.status === "rejected").length;
    const responded = apps.filter((a) => !["saved", "applied"].includes(a.status)).length;
    const responseRate = applied > 0 ? Math.round((responded / applied) * 100) : 0;

    return { totalApplications, applied, interviews, offers, rejected, responseRate };
  },

  async getFunnelData(userId: string) {
    const apps = await prisma.application.findMany({ where: { userId } });
    return APPLICATION_STATUSES.map((status) => ({
      status,
      count: apps.filter((a) => a.status === status).length,
    }));
  },

  async getTimelineData(userId: string) {
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

    const apps = await prisma.application.findMany({
      where: { userId, createdAt: { gte: twelveWeeksAgo } },
      orderBy: { createdAt: "asc" },
    });

    const weeks: Record<string, number> = {};
    for (let i = 0; i < 12; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (11 - i) * 7);
      const key = d.toISOString().slice(0, 10);
      weeks[key] = 0;
    }

    for (const app of apps) {
      const weekKey = Object.keys(weeks).reduce((closest, key) => {
        const diff = Math.abs(new Date(key).getTime() - app.createdAt.getTime());
        const closestDiff = Math.abs(new Date(closest).getTime() - app.createdAt.getTime());
        return diff < closestDiff ? key : closest;
      });
      weeks[weekKey]++;
    }

    return Object.entries(weeks).map(([week, count]) => ({ week, count }));
  },

  async getResumePerformance(userId: string) {
    const resumes = await prisma.resume.findMany({
      where: { userId },
      include: {
        tailoredCopies: {
          include: { application: { select: { status: true } } },
        },
      },
    });

    return resumes.map((r) => {
      const total = r.tailoredCopies.length;
      const responded = r.tailoredCopies.filter(
        (t) => !["saved", "applied"].includes(t.application.status)
      ).length;
      return {
        name: r.name,
        totalApps: total,
        responseRate: total > 0 ? Math.round((responded / total) * 100) : 0,
      };
    });
  },
};
