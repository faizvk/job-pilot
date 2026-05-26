import prisma from "@/lib/db";
import { getPrimaryUserId } from "@/lib/services/primary-user";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_BASE_URL = (process.env.NEXTAUTH_URL || "https://pursuits.in").replace(/\/+$/, "");

export function isTelegramConfigured(): boolean {
  return !!BOT_TOKEN;
}

export async function isUserTelegramConnected(): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: (await getPrimaryUserId()) } });
  return !!user?.telegramChatId;
}

export async function sendMessage(
  chatId: string,
  text: string,
  parseMode: string = "HTML",
  disableWebPagePreview: boolean = true,
): Promise<boolean> {
  if (!BOT_TOKEN) return false;

  // Telegram caps messages at 4096 chars — truncate safely if we go over.
  const safe = text.length > 4090 ? text.slice(0, 4080) + "\n…" : text;

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: safe,
        parse_mode: parseMode,
        disable_web_page_preview: disableWebPagePreview,
      }),
    });
    const data = await res.json();
    return data.ok === true;
  } catch (e) {
    console.error("Telegram send error:", e);
    return false;
  }
}

async function getUserChatId(): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id: (await getPrimaryUserId()) } });
  return user?.telegramChatId || null;
}

// ── Helpers ─────────────────────────────────────────────

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function appUrl(path: string): string {
  if (!path.startsWith("/")) path = "/" + path;
  return APP_BASE_URL + path;
}

interface JobForTelegram {
  title: string;
  company: string;
  location?: string | null;
  workType?: string | null;
  salary?: string | null;
  matchScore?: number | null;
  platform?: string | null;
  url: string;
}

export function formatJobBlock(job: JobForTelegram): string {
  const parts: string[] = [];
  const title = escapeHtml(job.title || "Untitled");
  const company = escapeHtml(job.company || "");
  // Title is the Apply link → opens job posting directly
  parts.push(`• <a href="${escapeHtml(job.url)}"><b>${title}</b></a> @ ${company}`);

  const meta: string[] = [];
  if (job.location) meta.push(escapeHtml(String(job.location)));
  if (job.workType) meta.push(String(job.workType));
  if (job.salary) meta.push(escapeHtml(String(job.salary)));
  if (job.matchScore != null) meta.push(`${job.matchScore}% match`);
  if (job.platform) meta.push(String(job.platform));
  if (meta.length > 0) parts.push(`   ${meta.join(" · ")}`);

  return parts.join("\n");
}

// ── Notifications ───────────────────────────────────────

/**
 * Notify about new jobs from a saved alert.
 * If `jobs` is provided, includes title/company/location/link for each (up to 8).
 * Otherwise sends a count-only message (backwards-compatible).
 */
export async function notifyNewJobs(
  alertName: string,
  jobCount: number,
  jobs?: JobForTelegram[],
) {
  const chatId = await getUserChatId();
  if (!chatId) return;

  const lines: string[] = [
    `🔔 <b>Job Alert · ${escapeHtml(alertName)}</b>`,
    `Found <b>${jobCount}</b> new matching job${jobCount === 1 ? "" : "s"}.`,
    "",
  ];

  if (jobs && jobs.length > 0) {
    const shown = jobs.slice(0, 8);
    for (const job of shown) {
      lines.push(formatJobBlock(job));
    }
    if (jobs.length > shown.length) {
      lines.push("");
      lines.push(`<i>+ ${jobs.length - shown.length} more in Pursuit</i>`);
    }
  }

  lines.push("");
  lines.push(`📂 <a href="${appUrl("/job-feed")}">Open Job Feed →</a>`);

  await sendMessage(chatId, lines.join("\n"));
}

export async function notifyInterviewReminder(
  company: string,
  date: string,
  opts?: { applicationId?: string; jobTitle?: string },
) {
  const chatId = await getUserChatId();
  if (!chatId) return;

  const lines: string[] = [
    `📅 <b>Interview Reminder</b>`,
    `<b>${escapeHtml(company)}</b>${opts?.jobTitle ? ` — ${escapeHtml(opts.jobTitle)}` : ""}`,
    `When: ${escapeHtml(date)}`,
  ];
  if (opts?.applicationId) {
    lines.push("");
    lines.push(`🔗 <a href="${appUrl(`/applications/${opts.applicationId}`)}">Open application →</a>`);
    lines.push(`📝 <a href="${appUrl(`/applications/${opts.applicationId}/interview-prep`)}">Open prep notes →</a>`);
  }
  lines.push("");
  lines.push("Good luck! 💪");

  await sendMessage(chatId, lines.join("\n"));
}

export async function notifyDeadline(
  company: string,
  deadline: string,
  opts?: { applicationId?: string; jobTitle?: string; jobUrl?: string },
) {
  const chatId = await getUserChatId();
  if (!chatId) return;

  const lines: string[] = [
    `⏰ <b>Deadline Alert</b>`,
    `<b>${escapeHtml(company)}</b>${opts?.jobTitle ? ` — ${escapeHtml(opts.jobTitle)}` : ""}`,
    `Application due: <b>${escapeHtml(deadline)}</b>`,
  ];
  if (opts?.jobUrl) {
    lines.push("");
    lines.push(`🔗 <a href="${escapeHtml(opts.jobUrl)}">Job posting →</a>`);
  }
  if (opts?.applicationId) {
    lines.push(`📂 <a href="${appUrl(`/applications/${opts.applicationId}`)}">Open in Pursuit →</a>`);
  }
  lines.push("");
  lines.push("Don't miss it!");

  await sendMessage(chatId, lines.join("\n"));
}

export async function notifyApplicationUpdate(
  company: string,
  status: string,
  opts?: { applicationId?: string; jobTitle?: string },
) {
  const chatId = await getUserChatId();
  if (!chatId) return;

  const lines: string[] = [
    `📋 <b>Application Update</b>`,
    `<b>${escapeHtml(company)}</b>${opts?.jobTitle ? ` — ${escapeHtml(opts.jobTitle)}` : ""}`,
    `Status → <b>${escapeHtml(status.replace("_", " "))}</b>`,
  ];
  if (opts?.applicationId) {
    lines.push("");
    lines.push(`🔗 <a href="${appUrl(`/applications/${opts.applicationId}`)}">Open application →</a>`);
  }

  await sendMessage(chatId, lines.join("\n"));
}
