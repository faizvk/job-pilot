import prisma from "@/lib/db";
import { getPrimaryUserId } from "@/lib/services/primary-user";
import { cleanLocation } from "@/lib/services/job-search.service";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_BASE_URL = (process.env.NEXTAUTH_URL || "https://pursuits.in").replace(/\/+$/, "");
const TELEGRAM_LIMIT = 4096;

export function isTelegramConfigured(): boolean {
  return !!BOT_TOKEN;
}

export async function isUserTelegramConnected(): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: (await getPrimaryUserId()) } });
  return !!user?.telegramChatId;
}

// Truncate on a line boundary so we never cut through an HTML tag/entity
// (which would make Telegram reject the whole message as malformed).
function truncateForTelegram(text: string): string {
  if (text.length <= TELEGRAM_LIMIT) return text;
  const slice = text.slice(0, TELEGRAM_LIMIT - 20);
  const lastNewline = slice.lastIndexOf("\n");
  const cut = lastNewline > TELEGRAM_LIMIT * 0.6 ? slice.slice(0, lastNewline) : slice;
  return cut + "\n…";
}

// Downgrade our HTML to readable plain text for the fallback send.
function htmlToPlainText(html: string): string {
  return html
    .replace(/<a\s+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "$2 ($1)")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function postToTelegram(
  chatId: string,
  text: string,
  parseMode: string | undefined,
  disableWebPagePreview: boolean,
): Promise<boolean> {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      ...(parseMode ? { parse_mode: parseMode } : {}),
      disable_web_page_preview: disableWebPagePreview,
    }),
  });
  const data = await res.json();
  if (data.ok !== true) console.error("Telegram API error:", data.description);
  return data.ok === true;
}

export async function sendMessage(
  chatId: string,
  text: string,
  parseMode: string = "HTML",
  disableWebPagePreview: boolean = true,
): Promise<boolean> {
  if (!BOT_TOKEN) return false;

  const safe = truncateForTelegram(text);

  try {
    const ok = await postToTelegram(chatId, safe, parseMode, disableWebPagePreview);
    if (ok || !parseMode) return ok;

    // A formatting error (e.g. an entity clipped by truncation) makes Telegram
    // reject the message. Retry as plain text so the content still arrives.
    return await postToTelegram(chatId, htmlToPlainText(safe), undefined, disableWebPagePreview);
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

const titleCase = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

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
  const location = cleanLocation(job.location);
  if (location) meta.push(escapeHtml(location));
  if (job.workType) meta.push(titleCase(String(job.workType)));
  if (job.salary) meta.push(escapeHtml(String(job.salary)));
  // Only surface a match score when it's meaningful — a "0% match" line just
  // looks broken and adds noise.
  if (job.matchScore != null && job.matchScore > 0) meta.push(`${job.matchScore}% match`);
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
