import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";

export async function POST() {
  try {
    await prisma.user.update({
      where: { id: DEFAULT_USER_ID },
      data: { gmailTokens: null },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
