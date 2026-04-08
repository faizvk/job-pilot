import { NextResponse } from "next/server";
import { getAuthUrl, isGmailConfigured } from "@/lib/services/gmail.service";

export async function GET() {
  if (!isGmailConfigured()) {
    return NextResponse.json(
      { error: "Gmail OAuth2 not configured. Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in .env" },
      { status: 400 }
    );
  }

  const url = getAuthUrl();
  return NextResponse.redirect(url);
}
