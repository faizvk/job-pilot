import { NextRequest, NextResponse } from "next/server";
import { jobAlertService } from "@/lib/services/job-alert.service";
import { runAllAutomations } from "@/lib/services/automation.service";

// Single daily cron — fetches new jobs via alerts, then runs automations
// (gmail scan, auto follow-ups, daily digest, interview sync).
// New jobs are surfaced once, in the consolidated Daily Digest, rather than as
// a separate per-alert message per alert (which duplicated the same listings).
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
    // Fetch + store new jobs from due alerts. The Daily Digest (below) reports
    // them in one place, so we don't send a separate message per alert here.
    const alertResults = await jobAlertService.runDueAlerts();
    summary.alerts = {
      ran: alertResults.length,
      newJobs: alertResults.reduce((n, r) => n + r.newJobs, 0),
    };
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
