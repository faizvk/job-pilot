import { NextRequest, NextResponse } from "next/server";
import { handleCallback } from "@/lib/services/gmail.service";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  try {
    await handleCallback(code);
    // Redirect back to the settings or integrations page
    return NextResponse.redirect(new URL("/settings?gmail=connected", req.url));
  } catch (error) {
    console.error("Gmail callback error:", error);
    return NextResponse.redirect(new URL("/settings?gmail=error", req.url));
  }
}
