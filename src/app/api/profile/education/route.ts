import { NextRequest, NextResponse } from "next/server";
import { profileService } from "@/lib/services/profile.service";
import { educationSchema } from "@/lib/validators";
import { getCurrentUserId } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = educationSchema.parse(body);
    const entry = await profileService.addEducation(await getCurrentUserId(), data);
    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
