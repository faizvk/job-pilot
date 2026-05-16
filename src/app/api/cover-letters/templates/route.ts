import { NextRequest, NextResponse } from "next/server";
import { coverLetterService } from "@/lib/services/cover-letter.service";
import { coverLetterTemplateSchema } from "@/lib/validators";
import { getCurrentUserId } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const templates = await coverLetterService.listTemplates(await getCurrentUserId());
    return NextResponse.json(templates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = coverLetterTemplateSchema.parse(body);
    const template = await coverLetterService.createTemplate(await getCurrentUserId(), data);
    return NextResponse.json(template, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
