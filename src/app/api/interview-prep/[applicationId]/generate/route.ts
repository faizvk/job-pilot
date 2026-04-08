import { NextRequest, NextResponse } from "next/server";
import { interviewPrepService } from "@/lib/services/interview-prep.service";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ applicationId: string }> }) {
  try {
    const { applicationId } = await params;
    const questions = await interviewPrepService.generateQuestions(applicationId);
    return NextResponse.json(questions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
