import { NextRequest, NextResponse } from "next/server";
import { resumeService } from "@/lib/services/resume.service";
import { createResumeSchema } from "@/lib/validators";
import { DEFAULT_USER_ID } from "@/lib/constants";

export async function GET() {
  try {
    const resumes = await resumeService.list(DEFAULT_USER_ID);
    return NextResponse.json(resumes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createResumeSchema.parse(body);
    const resume = await resumeService.create(DEFAULT_USER_ID, data);
    return NextResponse.json(resume, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
