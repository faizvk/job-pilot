import { NextRequest, NextResponse } from "next/server";
import { jobAlertService } from "@/lib/services/job-alert.service";
import { notifyNewJobs } from "@/lib/services/telegram.service";

async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const results = await jobAlertService.runDueAlerts();

    for (const result of results) {
      if (result.newJobs > 0) {
        await notifyNewJobs(result.name, result.newJobs).catch(console.error);
      }
    }

    return NextResponse.json({ ran: results.length, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
