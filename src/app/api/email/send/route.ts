import { NextRequest, NextResponse } from "next/server";
import { sendGmail, isGmailConnected } from "@/lib/services/gmail.service";
import prisma from "@/lib/db";

/**
 * Parse an email draft string into subject and body.
 * Expected format:
 * Subject: <subject line>
 *
 * <body>
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
    const hasGmail = await isGmailConnected();

    if (!hasGmail) {
      return NextResponse.json(
        { error: "No email provider configured. Connect Gmail in Profile → Integrations." },
        { status: 503 }
      );
    }

    const { followUpId, to, draft } = await req.json();

    if (!to || !draft) {
      return NextResponse.json({ error: "to and draft required" }, { status: 400 });
    }

    const { subject, body } = parseEmailDraft(draft);
    const result = await sendGmail(to, subject, body);
    const emailId = result.id ?? undefined;

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
