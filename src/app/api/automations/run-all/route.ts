import { NextResponse } from "next/server";
import { runAllAutomations } from "@/lib/services/automation.service";

export async function POST() {
  try {
    const result = await runAllAutomations();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
