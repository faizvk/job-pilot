import { NextResponse } from "next/server";
import { jobAlertService } from "@/lib/services/job-alert.service";
import { notifyNewJobs } from "@/lib/services/telegram.service";

async function handle() {
  try {
    const results = await jobAlertService.runDueAlerts();
    for (const result of results) {
      if (result.newJobs > 0) {
        const jobs = result.jobs.map((j) => ({
          title: j.title,
          company: j.company,
          location: j.location,
          workType: j.workType,
          salary: j.salary,
          matchScore: j.matchScore,
          platform: j.platform,
          url: j.url,
        }));
        await notifyNewJobs(result.name, result.newJobs, jobs).catch(console.error);
      }
    }
    return NextResponse.json({ ran: results.length, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
