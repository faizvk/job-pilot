import { NextResponse } from "next/server";
import { batchService } from "@/lib/services/batch.service";
import { getCurrentUserId } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const stats = await batchService.getDailyStats(await getCurrentUserId());
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
