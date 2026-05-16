import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { sendMessage, isTelegramConfigured } from "@/lib/services/telegram.service";

export async function POST() {
  if (!isTelegramConfigured()) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 503 });
  }

  const user = await prisma.user.findUnique({ where: { id: await getCurrentUserId() } });
  if (!user?.telegramChatId) {
    return NextResponse.json({ error: "Telegram chat ID not set" }, { status: 400 });
  }

  const ok = await sendMessage(user.telegramChatId, "🧪 <b>Test Message</b>\n\nPursuit notifications are working! 🎉");
  return NextResponse.json({ ok });
}
