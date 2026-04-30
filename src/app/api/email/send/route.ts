import { NextRequest, NextResponse } from "next/server";
import { sendGmail, isGmailConnected } from "@/lib/services/gmail.service";
import { sendResendEmail, isResendConfigured } from "@/lib/services/resend.service";
import prisma from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";

/**
 * Parse an email draft string into subject and body.
 * Expected format:
 *   Subject: <subject line>
 *
 *   <body>
 */
function parseEmailDraft(draft: string): { subject: string; body: string } {
  const lines = draft.split("\n");
  let subject = "";
  let bodyStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.toLowerCase().startsWith("subject:")) {
      subject = line.replace(/^subject:\s*/i, "").trim();
      bodyStart = lines[i + 1]?.trim() === "" ? i + 2 : i + 1;
      break;
    }
  }

  if (!subject) {
    subject = lines[0]?.trim() || "Follow-up";
    bodyStart = 1;
  }

  const body = lines.slice(bodyStart).join("\n").trim();
  return { subject, body };
}

export async function POST(req: NextRequest) {
  try {
    const { followUpId, to, draft } = await req.json();

    if (!to || !draft) {
      return NextResponse.json({ error: "to and draft required" }, { status: 400 });
    }

    const { subject, body } = parseEmailDraft(draft);

    // Prefer Gmail (sends as the user); fall back to Resend (transactional, but
    // recruiters reply to the user's email via replyTo).
    const hasGmail = await isGmailConnected();
    const hasResend = isResendConfigured();

    if (!hasGmail && !hasResend) {
      return NextResponse.json(
        {
          error:
            "No email provider configured. Connect Gmail in Profile → Integrations, " +
            "or set RESEND_API_KEY + RESEND_FROM_EMAIL in env.",
        },
        { status: 503 }
      );
    }

    let emailId: string | undefined;
    let provider: "gmail" | "resend";

    if (hasGmail) {
      const result = await sendGmail(to, subject, body);
      emailId = result.id ?? undefined;
      provider = "gmail";
    } else {
      const user = await prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } });
      const result = await sendResendEmail(to, subject, body, {
        replyTo: user?.email || undefined,
      });
      emailId = result.id;
      provider = "resend";
    }

    if (followUpId) {
      await prisma.followUp.update({
        where: { id: followUpId },
        data: { status: "sent", sentAt: new Date() },
      });
    }

    return NextResponse.json({ success: true, emailId, provider });
  } catch (error: any) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
