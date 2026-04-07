import { NextRequest, NextResponse } from "next/server";
import { interviewPrepService } from "@/lib/services/interview-prep.service";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ applicationId: string }> }) {
  try {
    const { applicationId } = await params;
    const prep = await interviewPrepService.getByApplicationId(applicationId);
    return NextResponse.json(prep);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ applicationId: string }> }) {
  try {
    const { applicationId } = await params;
    const body = await req.json();
    const prep = await interviewPrepService.update(applicationId, body);
    return NextResponse.json(prep);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
