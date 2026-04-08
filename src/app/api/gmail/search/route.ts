import { NextRequest, NextResponse } from "next/server";
import { searchApplicationEmails, isGmailConnected } from "@/lib/services/gmail.service";

export async function GET(req: NextRequest) {
  try {
    const connected = await isGmailConnected();
    if (!connected) {
      return NextResponse.json({ error: "Gmail not connected" }, { status: 400 });
    }

    const company = req.nextUrl.searchParams.get("company") || undefined;
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");

    const emails = await searchApplicationEmails(company, limit);
    return NextResponse.json(emails);
  } catch (error: any) {
    console.error("Gmail search error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
