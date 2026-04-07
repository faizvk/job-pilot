import { NextRequest, NextResponse } from "next/server";
import { profileService } from "@/lib/services/profile.service";
import { workHistorySchema } from "@/lib/validators";
import { DEFAULT_USER_ID } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = workHistorySchema.parse(body);
    const entry = await profileService.addWorkHistory(DEFAULT_USER_ID, data);
    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
