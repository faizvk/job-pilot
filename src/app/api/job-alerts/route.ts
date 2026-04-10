import { NextRequest, NextResponse } from "next/server";
import { jobAlertService } from "@/lib/services/job-alert.service";
import { DEFAULT_USER_ID } from "@/lib/constants";

export async function GET() {
  try {
    const alerts = await jobAlertService.list(DEFAULT_USER_ID);
    return NextResponse.json(alerts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const alert = await jobAlertService.create(DEFAULT_USER_ID, body);
    return NextResponse.json(alert, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
