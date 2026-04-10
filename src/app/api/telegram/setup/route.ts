import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";
import { sendMessage, isTelegramConfigured } from "@/lib/services/telegram.service";

export async function POST(req: NextRequest) {
  try {
    const { chatId } = await req.json();
    if (!chatId) return NextResponse.json({ error: "chatId required" }, { status: 400 });

    await prisma.user.update({
      where: { id: DEFAULT_USER_ID },
      data: { telegramChatId: String(chatId) },
    });

    // Send welcome message
    if (isTelegramConfigured()) {
      await sendMessage(String(chatId), "✅ <b>JobPilot Connected!</b>\n\nYou'll receive notifications for:\n• New job matches\n• Interview reminders\n• Application deadlines\n• Status updates");
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const user = await prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } });
  return NextResponse.json({
    configured: isTelegramConfigured(),
    connected: !!user?.telegramChatId,
    chatId: user?.telegramChatId || null,
  });
}
