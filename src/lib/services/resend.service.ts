import { Resend } from "resend";

let client: Resend | null = null;

function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && !!process.env.RESEND_FROM_EMAIL;
}

/**
 * Send an email via Resend.
 * `from` defaults to RESEND_FROM_EMAIL.
 *
 * Resend free tier requires either:
 *   - sending from `onboarding@resend.dev` (sandbox, only to your verified address), or
 *   - a verified domain you own (set RESEND_FROM_EMAIL to e.g. "Pursuit <hi@pursuits.in>").
 *
 * Returns { id } on success.
 */
export async function sendResendEmail(
  to: string,
  subject: string,
  body: string,
  opts?: { from?: string; replyTo?: string; html?: string }
): Promise<{ id: string }> {
  const c = getClient();
  if (!c) throw new Error("Resend not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.");

  const from = opts?.from || process.env.RESEND_FROM_EMAIL!;
  if (!from) throw new Error("RESEND_FROM_EMAIL not set.");

  const html = opts?.html || body.replace(/\n/g, "<br>");

  const result = await c.emails.send({
    from,
    to: [to],
    subject,
    text: body,
    html,
    ...(opts?.replyTo ? { replyTo: opts.replyTo } : {}),
  });

  if (result.error) {
    throw new Error(`Resend: ${result.error.message || JSON.stringify(result.error)}`);
  }
  if (!result.data?.id) {
    throw new Error("Resend: no message ID returned");
  }
  return { id: result.data.id };
}
