import { NextRequest, NextResponse } from "next/server";
import { weeklyGoalService } from "@/lib/services/weekly-goal.service";
import { DEFAULT_USER_ID } from "@/lib/constants";

export async function GET() {
  try {
    const goal = await weeklyGoalService.getCurrent(DEFAULT_USER_ID);
    return NextResponse.json(goal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const goal = await weeklyGoalService.setTarget(DEFAULT_USER_ID, body.target);
    return NextResponse.json(goal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
