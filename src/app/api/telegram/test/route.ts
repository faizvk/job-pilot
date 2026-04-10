import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { sendMessage, isTelegramConfigured } from "@/lib/services/telegram.service";

export async function POST() {
  if (!isTelegramConfigured()) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 503 });
  }

  const user = await prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } });
  if (!user?.telegramChatId) {
    return NextResponse.json({ error: "Telegram chat ID not set" }, { status: 400 });
  }

  const ok = await sendMessage(user.telegramChatId, "🧪 <b>Test Message</b>\n\nJobPilot notifications are working! 🎉");
  return NextResponse.json({ ok });
}
