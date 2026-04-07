import { NextRequest, NextResponse } from "next/server";
import { profileService } from "@/lib/services/profile.service";
import { profileSchema } from "@/lib/validators";
import { DEFAULT_USER_ID } from "@/lib/constants";

export async function GET() {
  try {
    const profile = await profileService.getProfile(DEFAULT_USER_ID);
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const data = profileSchema.parse(body);
    const profile = await profileService.updateProfile(DEFAULT_USER_ID, data);
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
