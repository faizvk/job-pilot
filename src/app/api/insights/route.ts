import { NextRequest, NextResponse } from "next/server";
import { insightsService } from "@/lib/services/insights.service";
import { DEFAULT_USER_ID } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const days = Number(new URL(req.url).searchParams.get("days") || 90);
    const report = await insightsService.generate(DEFAULT_USER_ID, Number.isFinite(days) ? days : 90);
    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
