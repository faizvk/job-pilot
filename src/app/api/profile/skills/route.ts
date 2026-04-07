import { NextRequest, NextResponse } from "next/server";
import { profileService } from "@/lib/services/profile.service";
import { skillSchema } from "@/lib/validators";
import { DEFAULT_USER_ID } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = skillSchema.parse(body);
    const skill = await profileService.addSkill(DEFAULT_USER_ID, data);
    return NextResponse.json(skill, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
