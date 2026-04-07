import prisma from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { jdAnalyzerService } from "./jd-analyzer.service";
import { resumeService } from "./resume.service";

export interface BulkJobEntry {
  companyName: string;
  jobTitle: string;
  jobUrl?: string;
  jobDescription?: string;
  location?: string;
  workType?: string;
  platform?: string; // linkedin, indeed, glassdoor, etc.
}

export interface BatchResult {
  total: number;
  created: number;
  tailored: number;
  errors: string[];
  applications: any[];
}

export const batchService = {
  /**
   * Import multiple jobs at once, optionally auto-analyze and auto-tailor
   */
  async bulkImport(
    jobs: BulkJobEntry[],
    options: { autoAnalyze?: boolean; autoTailor?: boolean; baseResumeId?: string }
  ): Promise<BatchResult> {
    const result: BatchResult = { total: jobs.length, created: 0, tailored: 0, errors: [], applications: [] };

    // Get user skills for analysis
    let userSkills: { name: string; category: string }[] = [];
    if (options.autoAnalyze) {
      const user = await prisma.user.findUnique({
        where: { id: DEFAULT_USER_ID },
        include: { skills: true },
      });
      userSkills = user?.skills.map((s) => ({ name: s.name, category: s.category })) || [];
    }

    for (const job of jobs) {
      try {
        // Analyze JD if provided and autoAnalyze is enabled
        let matchScore: number | null = null;
        let extractedSkills: string | null = null;

        if (options.autoAnalyze && job.jobDescription && job.jobDescription.length >= 20) {
          const analysis = jdAnalyzerService.analyze(job.jobDescription, userSkills);
          matchScore = analysis.matchScore;
          extractedSkills = JSON.stringify(analysis.extractedSkills);
        }

        // Create application
        const app = await prisma.application.create({
          data: {
            userId: DEFAULT_USER_ID,
            companyName: job.companyName,
            jobTitle: job.jobTitle,
            jobUrl: job.jobUrl || null,
            jobDescription: job.jobDescription || null,
            location: job.location || null,
            workType: job.workType || null,
            status: "saved",
            matchScore,
            extractedSkills,
            notes: job.platform ? `Imported from ${job.platform}` : null,
          },
        });

        // Create status change record
        await prisma.statusChange.create({
          data: { applicationId: app.id, fromStatus: "", toStatus: "saved" },
        });

        result.created++;
        result.applications.push(app);

        // Auto-tailor resume if enabled
        if (options.autoTailor && options.baseResumeId && extractedSkills) {
          try {
            await resumeService.tailorResume(options.baseResumeId, app.id);
            result.tailored++;
          } catch {
            // Non-critical - continue even if tailoring fails
          }
        }
      } catch (err: any) {
        result.errors.push(`${job.companyName} - ${job.jobTitle}: ${err.message}`);
      }
    }

    return result;
  },

  /**
   * Batch update status for multiple applications
   */
  async bulkUpdateStatus(applicationIds: string[], newStatus: string, note?: string) {
    const results = [];
    for (const id of applicationIds) {
      try {
        const app = await prisma.application.findUnique({ where: { id } });
        if (!app) continue;

        const updated = await prisma.application.update({
          where: { id },
          data: {
            status: newStatus,
            appliedAt: newStatus === "applied" && !app.appliedAt ? new Date() : undefined,
          },
        });

        await prisma.statusChange.create({
          data: { applicationId: id, fromStatus: app.status, toStatus: newStatus, note },
        });

        results.push(updated);
      } catch (err: any) {
        // continue
      }
    }
    return results;
  },

  /**
   * Auto-tailor resumes for multiple applications in batch
   */
  async bulkTailorResumes(applicationIds: string[], baseResumeId: string) {
    let tailored = 0;
    const errors: string[] = [];

    for (const appId of applicationIds) {
      try {
        await resumeService.tailorResume(baseResumeId, appId);
        tailored++;
      } catch (err: any) {
        errors.push(`${appId}: ${err.message}`);
      }
    }

    return { tailored, errors };
  },

  /**
   * Get daily application stats
   */
  async getDailyStats(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const apps = await prisma.application.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by date
    const dailyMap: Record<string, { total: number; applied: number }> = {};
    for (const app of apps) {
      const dateKey = app.createdAt.toISOString().slice(0, 10);
      if (!dailyMap[dateKey]) dailyMap[dateKey] = { total: 0, applied: 0 };
      dailyMap[dateKey].total++;
      if (app.status !== "saved") dailyMap[dateKey].applied++;
    }

    // Fill in missing dates
    const result = [];
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().slice(0, 10);
      result.push({
        date: key,
        total: dailyMap[key]?.total || 0,
        applied: dailyMap[key]?.applied || 0,
      });
    }

    // Calculate streaks
    let currentStreak = 0;
    let maxStreak = 0;
    for (let i = result.length - 1; i >= 0; i--) {
      if (result[i].total > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        if (i < result.length - 1) break; // only count from today backwards
        currentStreak = 0;
      }
    }

    const today = result[result.length - 1];

    return {
      daily: result,
      todayCount: today?.total || 0,
      todayApplied: today?.applied || 0,
      currentStreak,
      maxStreak,
      totalLast30Days: apps.length,
      avgPerDay: Math.round(apps.length / days),
    };
  },

  /**
   * Parse job info from a pasted block of text (URL + description)
   */
  parseJobFromText(text: string): Partial<BulkJobEntry> {
    const lines = text.trim().split("\n");
    const result: Partial<BulkJobEntry> = {};

    // Try to find URL
    const urlMatch = text.match(/(https?:\/\/[^\s]+)/);
    if (urlMatch) {
      result.jobUrl = urlMatch[1];
      // Detect platform from URL
      if (result.jobUrl.includes("linkedin.com")) result.platform = "LinkedIn";
      else if (result.jobUrl.includes("indeed.com")) result.platform = "Indeed";
      else if (result.jobUrl.includes("glassdoor.com")) result.platform = "Glassdoor";
      else if (result.jobUrl.includes("ziprecruiter.com")) result.platform = "ZipRecruiter";
      else if (result.jobUrl.includes("dice.com")) result.platform = "Dice";
      else if (result.jobUrl.includes("monster.com")) result.platform = "Monster";
      else if (result.jobUrl.includes("lever.co")) result.platform = "Lever";
      else if (result.jobUrl.includes("greenhouse.io")) result.platform = "Greenhouse";
      else if (result.jobUrl.includes("workday.com")) result.platform = "Workday";
    }

    // First non-URL line is likely the job title
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("http")) {
        if (!result.jobTitle) {
          result.jobTitle = trimmed;
        } else if (!result.companyName) {
          result.companyName = trimmed;
        }
        break;
      }
    }

    // Everything after title/company is likely the description
    const descStart = lines.findIndex((l) => l.trim() && !l.trim().startsWith("http") && l.trim() !== result.jobTitle && l.trim() !== result.companyName);
    if (descStart > 0) {
      result.jobDescription = lines.slice(descStart).join("\n").trim();
    }

    return result;
  },
};
