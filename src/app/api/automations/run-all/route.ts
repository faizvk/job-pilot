import { NextResponse } from "next/server";
import { runAllAutomations } from "@/lib/services/automation.service";

async function handle() {
  try {
    const result = await runAllAutomations();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
