import { NextRequest, NextResponse } from "next/server";
import { batchService } from "@/lib/services/batch.service";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { applicationIds, status, note } = body;

    if (!applicationIds || !Array.isArray(applicationIds) || !status) {
      return NextResponse.json({ error: "applicationIds and status required" }, { status: 400 });
    }

    const results = await batchService.bulkUpdateStatus(applicationIds, status, note);
    return NextResponse.json({ updated: results.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
