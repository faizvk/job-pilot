import prisma from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export function isTelegramConfigured(): boolean {
  return !!BOT_TOKEN;
}

export async function isUserTelegramConnected(): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } });
  return !!user?.telegramChatId;
}

export async function sendMessage(chatId: string, text: string, parseMode: string = "HTML"): Promise<boolean> {
  if (!BOT_TOKEN) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode }),
    });
    const data = await res.json();
    return data.ok === true;
  } catch (e) {
    console.error("Telegram send error:", e);
    return false;
  }
}

async function getUserChatId(): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } });
  return user?.telegramChatId || null;
}

export async function notifyNewJobs(alertName: string, jobCount: number) {
  const chatId = await getUserChatId();
  if (!chatId) return;
  await sendMessage(chatId, `🔔 <b>Job Alert: ${alertName}</b>\nFound <b>${jobCount}</b> new matching jobs!\n\nCheck your Job Feed to review them.`);
}

export async function notifyInterviewReminder(company: string, date: string) {
  const chatId = await getUserChatId();
  if (!chatId) return;
  await sendMessage(chatId, `📅 <b>Interview Reminder</b>\n<b>${company}</b> on ${date}\n\nGood luck! 💪`);
}

export async function notifyDeadline(company: string, deadline: string) {
  const chatId = await getUserChatId();
  if (!chatId) return;
  await sendMessage(chatId, `⏰ <b>Deadline Alert</b>\n<b>${company}</b> application due ${deadline}\n\nDon't miss it!`);
}

export async function notifyApplicationUpdate(company: string, status: string) {
  const chatId = await getUserChatId();
  if (!chatId) return;
  await sendMessage(chatId, `📋 <b>Application Update</b>\n<b>${company}</b>: Status changed to <b>${status}</b>`);
}
