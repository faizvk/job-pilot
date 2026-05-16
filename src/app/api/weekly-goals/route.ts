import { NextRequest, NextResponse } from "next/server";
import { weeklyGoalService } from "@/lib/services/weekly-goal.service";
import { getCurrentUserId } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const goal = await weeklyGoalService.getCurrent(await getCurrentUserId());
    return NextResponse.json(goal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const goal = await weeklyGoalService.setTarget(await getCurrentUserId(), body.target);
    return NextResponse.json(goal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
