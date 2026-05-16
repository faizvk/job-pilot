import { NextResponse } from "next/server";
import { coverLetterService } from "@/lib/services/cover-letter.service";
import { getCurrentUserId } from "@/lib/auth-helpers";

export async function POST() {
  try {
    const created = await coverLetterService.seedStarterTemplates(await getCurrentUserId());
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
