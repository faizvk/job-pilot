import { NextRequest, NextResponse } from "next/server";
import { sendEmail, parseEmailDraft, isResendConfigured } from "@/lib/services/email.service";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    if (!isResendConfigured()) {
      return NextResponse.json(
        { error: "Email not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL in .env" },
        { status: 503 }
      );
    }

    const { followUpId, to, draft } = await req.json();

    if (!to || !draft) {
      return NextResponse.json({ error: "to and draft required" }, { status: 400 });
    }

    const { subject, body } = parseEmailDraft(draft);
    const result = await sendEmail({ to, subject, body });

    // Mark follow-up as sent if followUpId provided
    if (followUpId) {
      await prisma.followUp.update({
        where: { id: followUpId },
        data: { status: "sent", sentAt: new Date() },
      });
    }

    return NextResponse.json({ success: true, emailId: result?.id });
  } catch (error: any) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
