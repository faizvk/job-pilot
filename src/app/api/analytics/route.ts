import { NextResponse } from "next/server";
import { analyticsService } from "@/lib/services/analytics.service";
import { getCurrentUserId } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const [stats, funnel, timeline, resumePerformance] = await Promise.all([
      analyticsService.getStats(await getCurrentUserId()),
      analyticsService.getFunnelData(await getCurrentUserId()),
      analyticsService.getTimelineData(await getCurrentUserId()),
      analyticsService.getResumePerformance(await getCurrentUserId()),
    ]);
    return NextResponse.json({ stats, funnel, timeline, resumePerformance, responseRate: timeline });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
