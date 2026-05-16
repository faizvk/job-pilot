import prisma from "@/lib/db";
import { getPrimaryUserId } from "@/lib/services/primary-user";

// Status ordering for funnel + response detection
const STATUS_ORDER = ["saved", "applied", "phone_screen", "interview", "offer", "accepted"] as const;
const RESPONDED_STATUSES = new Set(["phone_screen", "interview", "offer", "accepted", "rejected"]);

export interface InsightsReport {
  range: { from: string; to: string; days: number };
  totals: {
    applied: number;
    responded: number;
    interviews: number;
    offers: number;
    rejected: number;
    pending: number;
  };
  rates: {
    response: number;     // 0-100, % of applied that got any response
    interview: number;    // 0-100, % of applied that hit interview/offer
    offer: number;        // 0-100, % of applied that hit offer/accepted
  };
  responseTime: {
    medianDays: number | null;
    p90Days: number | null;
    samples: number;
  };
  funnel: { status: string; label: string; count: number }[];
  matchScoreImpact: {
    bucket: "low" | "mid" | "high";
    range: string;
    applied: number;
    responded: number;
    rate: number;
  }[];
  topCompanies: { company: string; applications: number; responseRate: number }[];
  followUpImpact: {
    withFollowUp: { applications: number; responded: number; rate: number };
    withoutFollowUp: { applications: number; responded: number; rate: number };
  };
  staleApplications: {
    id: string;
    company: string;
    title: string;
    appliedAt: string;
    daysAgo: number;
    hasFollowUp: boolean;
  }[];
  recommendations: { kind: "info" | "action" | "win"; text: string }[];
}

export const insightsService = {
  async generate(userId?: string, days: number = 90): Promise<InsightsReport> {
    const effectiveUserId = userId ?? (await getPrimaryUserId());
    const from = new Date();
    from.setDate(from.getDate() - days);

    const apps = await prisma.application.findMany({
      where: {
        userId: effectiveUserId,
        status: { not: "saved" },
        OR: [
          { appliedAt: { gte: from } },
          { appliedAt: null, createdAt: { gte: from } },
        ],
      },
      include: {
        statusHistory: { orderBy: { changedAt: "asc" } },
        followUps: { select: { id: true, status: true } },
      },
    });

    const totals = {
      applied: apps.length,
      responded: 0,
      interviews: 0,
      offers: 0,
      rejected: 0,
      pending: 0,
    };

    const responseTimesDays: number[] = [];

    for (const app of apps) {
      if (app.status === "rejected") totals.rejected++;
      if (app.status === "interview" || app.status === "phone_screen") totals.interviews++;
      if (app.status === "offer" || app.status === "accepted") totals.offers++;
      if (app.status === "applied") totals.pending++;
      if (RESPONDED_STATUSES.has(app.status)) totals.responded++;

      // First transition out of "applied" → response
      const appliedAt = app.appliedAt ?? app.createdAt;
      const firstResponse = app.statusHistory.find(
        (sc) => sc.fromStatus === "applied" && sc.toStatus !== "applied",
      );
      if (firstResponse && appliedAt) {
        const ms = firstResponse.changedAt.getTime() - new Date(appliedAt).getTime();
        const days = ms / (1000 * 60 * 60 * 24);
        if (days >= 0 && days < 365) responseTimesDays.push(days);
      }
    }

    const rates = {
      response: totals.applied ? Math.round((totals.responded / totals.applied) * 100) : 0,
      interview: totals.applied
        ? Math.round(((totals.interviews + totals.offers) / totals.applied) * 100)
        : 0,
      offer: totals.applied ? Math.round((totals.offers / totals.applied) * 100) : 0,
    };

    const responseTime = {
      medianDays: percentile(responseTimesDays, 50),
      p90Days: percentile(responseTimesDays, 90),
      samples: responseTimesDays.length,
    };

    const funnel = STATUS_ORDER.map((s) => ({
      status: s,
      label: s.charAt(0).toUpperCase() + s.slice(1).replace("_", " "),
      count: countAtOrPast(apps, s),
    }));

    // Match score impact
    const buckets: Record<"low" | "mid" | "high", { applied: number; responded: number }> = {
      low: { applied: 0, responded: 0 },
      mid: { applied: 0, responded: 0 },
      high: { applied: 0, responded: 0 },
    };
    for (const app of apps) {
      if (app.matchScore == null) continue;
      const b = app.matchScore < 40 ? "low" : app.matchScore < 70 ? "mid" : "high";
      buckets[b].applied++;
      if (RESPONDED_STATUSES.has(app.status)) buckets[b].responded++;
    }
    const matchScoreImpact = (Object.entries(buckets) as [keyof typeof buckets, typeof buckets.low][]).map(
      ([bucket, v]) => ({
        bucket,
        range: bucket === "low" ? "<40%" : bucket === "mid" ? "40–69%" : "70%+",
        applied: v.applied,
        responded: v.responded,
        rate: v.applied ? Math.round((v.responded / v.applied) * 100) : 0,
      }),
    );

    // Top companies (by # applications, with multi-app)
    const byCompany = new Map<string, { applications: number; responded: number }>();
    for (const app of apps) {
      const c = byCompany.get(app.companyName) ?? { applications: 0, responded: 0 };
      c.applications++;
      if (RESPONDED_STATUSES.has(app.status)) c.responded++;
      byCompany.set(app.companyName, c);
    }
    const topCompanies = [...byCompany.entries()]
      .filter(([, v]) => v.applications >= 1)
      .map(([company, v]) => ({
        company,
        applications: v.applications,
        responseRate: v.applications ? Math.round((v.responded / v.applications) * 100) : 0,
      }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 10);

    // Follow-up impact
    let withFu = { applications: 0, responded: 0 };
    let withoutFu = { applications: 0, responded: 0 };
    for (const app of apps) {
      const sentFu = app.followUps.some((f) => f.status === "sent");
      const target = sentFu ? withFu : withoutFu;
      target.applications++;
      if (RESPONDED_STATUSES.has(app.status)) target.responded++;
    }
    const followUpImpact = {
      withFollowUp: {
        ...withFu,
        rate: withFu.applications ? Math.round((withFu.responded / withFu.applications) * 100) : 0,
      },
      withoutFollowUp: {
        ...withoutFu,
        rate: withoutFu.applications
          ? Math.round((withoutFu.responded / withoutFu.applications) * 100)
          : 0,
      },
    };

    // Stale apps: applied > 7 days ago, still status "applied"
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const staleApplications = apps
      .filter((a) => {
        if (a.status !== "applied") return false;
        const at = a.appliedAt ?? a.createdAt;
        return new Date(at) < sevenDaysAgo;
      })
      .map((a) => {
        const at = new Date(a.appliedAt ?? a.createdAt);
        const daysAgo = Math.floor((Date.now() - at.getTime()) / (1000 * 60 * 60 * 24));
        return {
          id: a.id,
          company: a.companyName,
          title: a.jobTitle,
          appliedAt: at.toISOString(),
          daysAgo,
          hasFollowUp: a.followUps.length > 0,
        };
      })
      .sort((a, b) => b.daysAgo - a.daysAgo)
      .slice(0, 20);

    // Recommendations — short, actionable, grounded in the data
    const recommendations: InsightsReport["recommendations"] = [];

    if (totals.applied < 5) {
      recommendations.push({
        kind: "info",
        text: `You've only logged ${totals.applied} ${totals.applied === 1 ? "application" : "applications"}. Insights get sharper after ~10.`,
      });
    } else {
      if (rates.response < 5) {
        recommendations.push({
          kind: "action",
          text: `Response rate is ${rates.response}% — try tightening your match (apply to roles scoring 60%+) and personalize each application.`,
        });
      } else if (rates.response >= 15) {
        recommendations.push({
          kind: "win",
          text: `Response rate is ${rates.response}%, well above the typical 5–10% benchmark. Whatever you're doing, keep it up.`,
        });
      }

      const high = matchScoreImpact.find((b) => b.bucket === "high");
      const low = matchScoreImpact.find((b) => b.bucket === "low");
      if (high && low && high.applied >= 3 && low.applied >= 3 && high.rate > low.rate + 10) {
        recommendations.push({
          kind: "action",
          text: `High-match jobs (70%+) reply ${high.rate}% of the time vs ${low.rate}% for low-match. Skip applications under 40%.`,
        });
      }

      if (followUpImpact.withFollowUp.applications >= 3 && followUpImpact.withoutFollowUp.applications >= 3) {
        const lift = followUpImpact.withFollowUp.rate - followUpImpact.withoutFollowUp.rate;
        if (lift > 5) {
          recommendations.push({
            kind: "win",
            text: `Follow-ups boost response rate by +${lift}pp (${followUpImpact.withFollowUp.rate}% vs ${followUpImpact.withoutFollowUp.rate}%). Keep sending them.`,
          });
        }
      }

      if (staleApplications.length >= 3) {
        recommendations.push({
          kind: "action",
          text: `${staleApplications.length} ${staleApplications.length === 1 ? "application is" : "applications are"} stale (no reply in 7+ days). Send a follow-up — see list below.`,
        });
      }

      if (responseTime.medianDays != null && responseTime.medianDays > 0) {
        recommendations.push({
          kind: "info",
          text: `Companies typically reply in ~${Math.round(responseTime.medianDays)} day${Math.round(responseTime.medianDays) === 1 ? "" : "s"} when they reply at all.`,
        });
      }
    }

    return {
      range: { from: from.toISOString(), to: new Date().toISOString(), days },
      totals,
      rates,
      responseTime,
      funnel,
      matchScoreImpact,
      topCompanies,
      followUpImpact,
      staleApplications,
      recommendations,
    };
  },
};

function percentile(arr: number[], p: number): number | null {
  if (arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * sorted.length)));
  return Math.round(sorted[idx] * 10) / 10;
}

function countAtOrPast(apps: { status: string }[], target: string): number {
  const targetIdx = STATUS_ORDER.indexOf(target as (typeof STATUS_ORDER)[number]);
  if (targetIdx === -1) return 0;
  return apps.filter((a) => {
    const i = STATUS_ORDER.indexOf(a.status as (typeof STATUS_ORDER)[number]);
    return i >= targetIdx;
  }).length;
}
