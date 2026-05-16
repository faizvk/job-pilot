import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    const hashed = await bcrypt.hash(password, 10);

    let user;
    if (existing) {
      // If the account already has a password set, this is a real conflict.
      if (existing.password) {
        return NextResponse.json(
          { error: "An account with this email already exists. Try logging in instead." },
          { status: 409 },
        );
      }
      // Legacy / passwordless row → let the user claim it by setting a password.
      // This preserves any data already tied to that user ID.
      user = await prisma.user.update({
        where: { email },
        data: { name, password: hashed },
        select: { id: true, name: true, email: true },
      });
    } else {
      user = await prisma.user.create({
        data: { name, email, password: hashed },
        select: { id: true, name: true, email: true },
      });
    }

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: err.message || "Signup failed" }, { status: 500 });
  }
}
