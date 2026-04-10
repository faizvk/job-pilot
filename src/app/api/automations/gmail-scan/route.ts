import { NextResponse } from "next/server";
import { scanGmailForUpdates } from "@/lib/services/automation.service";

export async function POST() {
  try {
    const result = await scanGmailForUpdates();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
