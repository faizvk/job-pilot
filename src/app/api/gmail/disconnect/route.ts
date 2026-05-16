import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-helpers";

export async function POST() {
  try {
    await prisma.user.update({
      where: { id: await getCurrentUserId() },
      data: { gmailTokens: null },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
