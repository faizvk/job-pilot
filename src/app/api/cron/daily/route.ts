import { NextRequest, NextResponse } from "next/server";
import { jobAlertService } from "@/lib/services/job-alert.service";
import { runAllAutomations } from "@/lib/services/automation.service";
import { notifyNewJobs } from "@/lib/services/telegram.service";

// Single daily cron — fetches new jobs via alerts, then runs automations
// (gmail scan, auto follow-ups, daily digest, interview sync).
// Wire in vercel.json -> { "crons": [{ "path": "/api/cron/daily", "schedule": "30 3 * * *" }] }
// 03:30 UTC = 09:00 IST.

export const maxDuration = 300; // 5 min — alerts + Gmail scan can be slow

async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const summary: any = { startedAt: new Date().toISOString() };

  try {
    const alertResults = await jobAlertService.runDueAlerts();
    summary.alerts = { ran: alertResults.length, results: alertResults };

    for (const r of alertResults) {
      if (r.newJobs > 0) {
        await notifyNewJobs(r.name, r.newJobs).catch(console.error);
      }
    }
  } catch (e: any) {
    summary.alertsError = e.message;
  }

  try {
    summary.automations = await runAllAutomations();
  } catch (e: any) {
    summary.automationsError = e.message;
  }

  summary.finishedAt = new Date().toISOString();
  return NextResponse.json(summary);
}

export const GET = handle;
export const POST = handle;
