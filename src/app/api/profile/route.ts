import { NextRequest, NextResponse } from "next/server";
import { profileService } from "@/lib/services/profile.service";
import { profileSchema } from "@/lib/validators";
import { getCurrentUserId } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const profile = await profileService.getProfile(await getCurrentUserId());
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const data = profileSchema.parse(body);
    const profile = await profileService.updateProfile(await getCurrentUserId(), data);
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
