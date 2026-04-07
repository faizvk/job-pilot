import { NextResponse } from "next/server";
import { batchService } from "@/lib/services/batch.service";
import { DEFAULT_USER_ID } from "@/lib/constants";

export async function GET() {
  try {
    const stats = await batchService.getDailyStats(DEFAULT_USER_ID);
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
