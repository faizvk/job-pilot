import { NextRequest, NextResponse } from "next/server";
import { deleteCalendarEvent } from "@/lib/services/calendar.service";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteCalendarEvent(id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
