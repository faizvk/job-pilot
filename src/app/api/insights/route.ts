import { NextRequest, NextResponse } from "next/server";
import { insightsService } from "@/lib/services/insights.service";
import { getCurrentUserId } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const days = Number(new URL(req.url).searchParams.get("days") || 90);
    const report = await insightsService.generate(await getCurrentUserId(), Number.isFinite(days) ? days : 90);
    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
