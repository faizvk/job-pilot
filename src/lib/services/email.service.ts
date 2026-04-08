import { Resend } from "resend";

let resend: Resend | null = null;

function getClient() {
  if (!resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY not set");
    resend = new Resend(key);
  }
  return resend;
}

export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && !!process.env.RESEND_FROM_EMAIL;
}

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
}

export async function sendEmail(params: SendEmailParams) {
  const client = getClient();
  const from = process.env.RESEND_FROM_EMAIL || "noreply@resend.dev";

  const { data, error } = await client.emails.send({
    from,
    to: [params.to],
    subject: params.subject,
    text: params.body,
    replyTo: params.replyTo,
  });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Parse an email draft string into subject and body.
 * Expected format:
 * Subject: <subject line>
 *
 * <body>
 */
export function parseEmailDraft(draft: string): { subject: string; body: string } {
  const lines = draft.split("\n");
  let subject = "";
  let bodyStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.toLowerCase().startsWith("subject:")) {
      subject = line.replace(/^subject:\s*/i, "").trim();
      // Skip blank line after subject
      bodyStart = lines[i + 1]?.trim() === "" ? i + 2 : i + 1;
      break;
    }
  }

  if (!subject) {
    // No subject line found, use first line as subject
    subject = lines[0]?.trim() || "Follow-up";
    bodyStart = 1;
  }

  const body = lines.slice(bodyStart).join("\n").trim();
  return { subject, body };
}
