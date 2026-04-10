import { NextRequest, NextResponse } from "next/server";
import { createCalendarEvent, listUpcomingEvents } from "@/lib/services/calendar.service";

export async function GET() {
  try {
    const events = await listUpcomingEvents(15);
    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = await createCalendarEvent(body);
    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
