import { NextResponse } from "next/server";
import { isGmailConfigured, isGmailConnected } from "@/lib/services/gmail.service";

export async function GET() {
  const configured = isGmailConfigured();
  const connected = configured ? await isGmailConnected() : false;

  return NextResponse.json({ configured, connected });
}
