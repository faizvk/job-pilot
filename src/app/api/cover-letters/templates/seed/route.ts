import { NextResponse } from "next/server";
import { coverLetterService } from "@/lib/services/cover-letter.service";
import { DEFAULT_USER_ID } from "@/lib/constants";

export async function POST() {
  try {
    const created = await coverLetterService.seedStarterTemplates(DEFAULT_USER_ID);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
