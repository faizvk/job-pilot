import { NextRequest, NextResponse } from "next/server";
import { jobAlertService } from "@/lib/services/job-alert.service";
import { getCurrentUserId } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const alerts = await jobAlertService.list(await getCurrentUserId());
    return NextResponse.json(alerts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const alert = await jobAlertService.create(await getCurrentUserId(), body);
    return NextResponse.json(alert, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
