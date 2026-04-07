import { NextRequest, NextResponse } from "next/server";
import { applicationService } from "@/lib/services/application.service";
import { updateStatusSchema } from "@/lib/validators";
import { weeklyGoalService } from "@/lib/services/weekly-goal.service";
import { DEFAULT_USER_ID } from "@/lib/constants";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, note } = updateStatusSchema.parse(body);
    const app = await applicationService.updateStatus(id, status, note);

    if (status === "applied") {
      await weeklyGoalService.incrementAchieved(DEFAULT_USER_ID);
    }

    return NextResponse.json(app);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
