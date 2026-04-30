import { NextRequest, NextResponse } from "next/server";
import { runAllAutomations } from "@/lib/services/automation.service";

async function handle(req: NextRequest) {
  // If CRON_SECRET is set, require it (Vercel sends Authorization: Bearer <secret>)
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await runAllAutomations();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
