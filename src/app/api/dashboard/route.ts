import { NextResponse } from "next/server";
import { analyticsService } from "@/lib/services/analytics.service";
import { weeklyGoalService } from "@/lib/services/weekly-goal.service";
import { followUpService } from "@/lib/services/follow-up.service";
import prisma from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";

export async function GET() {
  try {
    const [stats, weeklyGoal, upcomingFollowUps, recentChanges] = await Promise.all([
      analyticsService.getStats(DEFAULT_USER_ID),
      weeklyGoalService.getCurrent(DEFAULT_USER_ID),
      followUpService.list(DEFAULT_USER_ID, { status: "pending" }),
      prisma.statusChange.findMany({
        take: 10,
        orderBy: { changedAt: "desc" },
        include: {
          application: { select: { companyName: true, jobTitle: true, userId: true } },
        },
      }),
    ]);

    const recentActivity = recentChanges
      .filter((c) => c.application.userId === DEFAULT_USER_ID)
      .map((c) => ({
        id: c.id,
        applicationId: c.applicationId,
        companyName: c.application.companyName,
        jobTitle: c.application.jobTitle,
        fromStatus: c.fromStatus,
        toStatus: c.toStatus,
        changedAt: c.changedAt.toISOString(),
      }));

    return NextResponse.json({
      stats: { ...stats, weeklyGoal: { target: weeklyGoal.target, achieved: weeklyGoal.achieved } },
      recentActivity,
      upcomingFollowUps: upcomingFollowUps.slice(0, 5),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
