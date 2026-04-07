import { NextRequest, NextResponse } from "next/server";
import { followUpService } from "@/lib/services/follow-up.service";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const followUp = await followUpService.update(id, body);
    return NextResponse.json(followUp);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (body.status === "sent") {
      const followUp = await followUpService.markSent(id);
      return NextResponse.json(followUp);
    }
    const followUp = await followUpService.update(id, body);
    return NextResponse.json(followUp);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await followUpService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
