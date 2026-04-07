import { NextRequest, NextResponse } from "next/server";
import { resumeService } from "@/lib/services/resume.service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = await resumeService.tailorResume(id, body.applicationId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
