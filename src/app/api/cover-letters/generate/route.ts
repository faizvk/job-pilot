import { NextRequest, NextResponse } from "next/server";
import { coverLetterService } from "@/lib/services/cover-letter.service";
import { generateCoverLetterSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { templateId, applicationId } = generateCoverLetterSchema.parse(body);
    const result = await coverLetterService.generate(templateId, applicationId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
