import { NextRequest, NextResponse } from "next/server";
import { batchService } from "@/lib/services/batch.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobs, autoAnalyze, autoTailor, baseResumeId } = body;

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json({ error: "No jobs provided" }, { status: 400 });
    }

    const result = await batchService.bulkImport(jobs, {
      autoAnalyze: autoAnalyze ?? true,
      autoTailor: autoTailor ?? false,
      baseResumeId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
