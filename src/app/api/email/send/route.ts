import { NextRequest, NextResponse } from "next/server";
import { sendEmail, parseEmailDraft, isResendConfigured } from "@/lib/services/email.service";
import { sendGmail, isGmailConnected } from "@/lib/services/gmail.service";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const hasResend = isResendConfigured();
    const hasGmail = await isGmailConnected();

    if (!hasResend && !hasGmail) {
      return NextResponse.json(
        { error: "No email provider configured. Set up Resend or connect Gmail." },
        { status: 503 }
      );
    }

    const { followUpId, to, draft, via } = await req.json();

    if (!to || !draft) {
      return NextResponse.json({ error: "to and draft required" }, { status: 400 });
    }

    const { subject, body } = parseEmailDraft(draft);

    let emailId: string | undefined;

    // Use Gmail if explicitly requested or if Resend is not available
    if ((via === "gmail" || !hasResend) && hasGmail) {
      const result = await sendGmail(to, subject, body);
      emailId = result.id ?? undefined;
    } else {
      const result = await sendEmail({ to, subject, body });
      emailId = result?.id;
    }

    // Mark follow-up as sent if followUpId provided
    if (followUpId) {
      await prisma.followUp.update({
        where: { id: followUpId },
        data: { status: "sent", sentAt: new Date() },
      });
    }

    return NextResponse.json({ success: true, emailId });
  } catch (error: any) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
