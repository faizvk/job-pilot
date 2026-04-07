import { NextResponse } from "next/server";
import { analyticsService } from "@/lib/services/analytics.service";
import { DEFAULT_USER_ID } from "@/lib/constants";

export async function GET() {
  try {
    const [stats, funnel, timeline, resumePerformance] = await Promise.all([
      analyticsService.getStats(DEFAULT_USER_ID),
      analyticsService.getFunnelData(DEFAULT_USER_ID),
      analyticsService.getTimelineData(DEFAULT_USER_ID),
      analyticsService.getResumePerformance(DEFAULT_USER_ID),
    ]);
    return NextResponse.json({ stats, funnel, timeline, resumePerformance, responseRate: timeline });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
