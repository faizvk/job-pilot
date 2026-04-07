import { NextRequest, NextResponse } from "next/server";
import { batchService } from "@/lib/services/batch.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { applicationIds, baseResumeId } = body;

    if (!applicationIds || !Array.isArray(applicationIds) || !baseResumeId) {
      return NextResponse.json({ error: "applicationIds and baseResumeId required" }, { status: 400 });
    }

    const result = await batchService.bulkTailorResumes(applicationIds, baseResumeId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
