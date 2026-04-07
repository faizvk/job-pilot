import { NextRequest, NextResponse } from "next/server";
import { followUpService } from "@/lib/services/follow-up.service";
import { followUpSchema } from "@/lib/validators";
import { DEFAULT_USER_ID } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const applicationId = searchParams.get("applicationId") || undefined;
    const followUps = await followUpService.list(DEFAULT_USER_ID, { status, applicationId });
    return NextResponse.json(followUps);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = followUpSchema.parse(body);
    const followUp = await followUpService.create(DEFAULT_USER_ID, data);
    return NextResponse.json(followUp, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
