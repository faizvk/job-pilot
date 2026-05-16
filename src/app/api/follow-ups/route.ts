import { NextRequest, NextResponse } from "next/server";
import { followUpService } from "@/lib/services/follow-up.service";
import { followUpSchema } from "@/lib/validators";
import { getCurrentUserId } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const applicationId = searchParams.get("applicationId") || undefined;
    const followUps = await followUpService.list(await getCurrentUserId(), { status, applicationId });
    return NextResponse.json(followUps);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { autoDraft, ...rest } = body;
    const data = followUpSchema.parse(rest);

    const followUp = autoDraft
      ? await followUpService.createWithDraft(await getCurrentUserId(), data)
      : await followUpService.create(await getCurrentUserId(), data);

    return NextResponse.json(followUp, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
