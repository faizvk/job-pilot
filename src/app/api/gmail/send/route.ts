import { NextRequest, NextResponse } from "next/server";
import { sendGmail, isGmailConnected } from "@/lib/services/gmail.service";

export async function POST(req: NextRequest) {
  try {
    const connected = await isGmailConnected();
    if (!connected) {
      return NextResponse.json({ error: "Gmail not connected" }, { status: 400 });
    }

    const { to, subject, body } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: "Missing to, subject, or body" }, { status: 400 });
    }

    const result = await sendGmail(to, subject, body);
    return NextResponse.json({ success: true, messageId: result.id });
  } catch (error: any) {
    console.error("Gmail send error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
