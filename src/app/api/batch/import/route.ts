import { NextRequest, NextResponse } from "next/server";
import { batchService } from "@/lib/services/batch.service";
import { getCurrentUserId } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const body = await req.json();
    const { jobs, autoAnalyze, autoTailor, baseResumeId } = body;

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json({ error: "No jobs provided" }, { status: 400 });
    }

    const result = await batchService.bulkImport(userId, jobs, {
      autoAnalyze: autoAnalyze ?? true,
      autoTailor: autoTailor ?? false,
      baseResumeId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
