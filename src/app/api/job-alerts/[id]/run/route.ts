import { NextRequest, NextResponse } from "next/server";
import { jobAlertService } from "@/lib/services/job-alert.service";
import { notifyNewJobs } from "@/lib/services/telegram.service";
import prisma from "@/lib/db";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await jobAlertService.run(id);

    // Send Telegram notification if new jobs found
    if (result.newJobs > 0) {
      const alert = await prisma.jobAlert.findUnique({ where: { id } });
      if (alert) {
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
        await notifyNewJobs(alert.name, result.newJobs, jobs).catch(console.error);
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
