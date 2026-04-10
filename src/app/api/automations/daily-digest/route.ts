import { NextResponse } from "next/server";
import { sendDailyDigest } from "@/lib/services/automation.service";

export async function POST() {
  try {
    const result = await sendDailyDigest();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
