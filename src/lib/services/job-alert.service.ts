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
    if (!alert || !alert.isActive) return { newJobs: 0, total: 0, jobs: [] as Awaited<ReturnType<typeof prisma.jobListing.findMany>> };

    const keywords = alert.keywords.split(",").map((k) => k.trim()).filter(Boolean);

    const { jobSearchService } = await import("@/lib/services/job-search.service");

    // Honour the user's saved search preferences (experience level, work types,
    // must/exclude keywords, fallback locations) instead of hardcoding a junior
    // 0–2yr search that ignored the profile.
    const prefs = await jobSearchService.getPreferences();
    const locations = alert.location ? [alert.location] : prefs?.locations || [];

    const { jobs: fetchedJobs } = await jobSearchService.fetchJobs({
      jobTitles: keywords,
      locations,
      workTypes: prefs?.workTypes || [],
      experienceMin: prefs?.experienceMin ?? 0,
      experienceMax: prefs?.experienceMax ?? 5,
      keywords: prefs?.keywords || undefined,
      excludeKeywords: prefs?.excludeKeywords || undefined,
      page: 1,
    });

    // Store + score, attributing genuinely-new listings to this alert at
    // creation time. (The old count-delta + `alertId: null` heuristic grabbed
    // arbitrary previously-untagged jobs and mis-reported them as new.)
    const { created } = await jobSearchService.storeAndScoreJobs(fetchedJobs, { alertId: alert.id });
    const newJobs = [...created].sort(
      (a, b) => (b.matchScore ?? -1) - (a.matchScore ?? -1),
    );

    await prisma.jobAlert.update({
      where: { id },
      data: { lastRunAt: new Date(), newJobCount: newJobs.length },
    });

    return { newJobs: newJobs.length, total: fetchedJobs.length, jobs: newJobs };
  },

  async runDueAlerts() {
    const now = new Date();
    const alerts = await prisma.jobAlert.findMany({ where: { isActive: true } });

    const results: { id: string; name: string; newJobs: number; jobs: Awaited<ReturnType<typeof prisma.jobListing.findMany>> }[] = [];

    for (const alert of alerts) {
      const isDue = !alert.lastRunAt || isAlertDue(alert.lastRunAt, alert.frequency, now);
      if (isDue) {
        const result = await this.run(alert.id);
        results.push({ id: alert.id, name: alert.name, newJobs: result.newJobs, jobs: result.jobs });
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
