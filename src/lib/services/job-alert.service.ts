import prisma from "@/lib/db";

export const jobAlertService = {
  async create(userId: string, data: { name: string; keywords: string; location?: string; frequency?: string }) {
    return prisma.jobAlert.create({
      data: { userId, ...data },
    });
  },

  async list(userId: string) {
    return prisma.jobAlert.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async update(id: string, data: Partial<{ name: string; keywords: string; location: string; frequency: string; isActive: boolean }>) {
    return prisma.jobAlert.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.jobAlert.delete({ where: { id } });
  },

  async run(id: string) {
    const alert = await prisma.jobAlert.findUnique({ where: { id } });
    if (!alert || !alert.isActive) return { newJobs: 0 };

    const keywords = alert.keywords.split(",").map((k) => k.trim()).filter(Boolean);

    // Use existing job search service
    const { jobSearchService } = await import("@/lib/services/job-search.service");
    const { jobs: fetchedJobs } = await jobSearchService.fetchJobs({
      jobTitles: keywords,
      locations: alert.location ? [alert.location] : [],
      workTypes: [],
      experienceMin: 0,
      experienceMax: 2,
      page: 1,
    });

    // Store and score, then count new ones
    const before = await prisma.jobListing.count();
    await jobSearchService.storeAndScoreJobs(fetchedJobs);
    const after = await prisma.jobListing.count();
    const newCount = after - before;

    // Tag new jobs with alertId
    if (newCount > 0) {
      const newJobs = await prisma.jobListing.findMany({
        where: { alertId: null },
        orderBy: { fetchedAt: "desc" },
        take: newCount,
      });
      for (const job of newJobs) {
        await prisma.jobListing.update({
          where: { id: job.id },
          data: { alertId: alert.id },
        });
      }
    }

    await prisma.jobAlert.update({
      where: { id },
      data: { lastRunAt: new Date(), newJobCount: newCount },
    });

    return { newJobs: newCount, total: fetchedJobs.length };
  },

  async runDueAlerts() {
    const now = new Date();
    const alerts = await prisma.jobAlert.findMany({ where: { isActive: true } });

    const results: { id: string; name: string; newJobs: number }[] = [];

    for (const alert of alerts) {
      const isDue = !alert.lastRunAt || isAlertDue(alert.lastRunAt, alert.frequency, now);
      if (isDue) {
        const result = await this.run(alert.id);
        results.push({ id: alert.id, name: alert.name, newJobs: result.newJobs });
      }
    }

    return results;
  },
};

function isAlertDue(lastRun: Date, frequency: string, now: Date): boolean {
  const diff = now.getTime() - lastRun.getTime();
  const hours = diff / (1000 * 60 * 60);

  switch (frequency) {
    case "hourly": return hours >= 1;
    case "daily": return hours >= 24;
    case "weekly": return hours >= 168;
    default: return hours >= 24;
  }
}
