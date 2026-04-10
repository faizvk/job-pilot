import { NextResponse } from "next/server";
import { jobAlertService } from "@/lib/services/job-alert.service";
import { notifyNewJobs } from "@/lib/services/telegram.service";

export async function POST() {
  try {
    const results = await jobAlertService.runDueAlerts();

    // Send Telegram notifications for alerts that found new jobs
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
