import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// One-shot migration: adds Auth.js columns + tables. Idempotent.
// Protected by AUTH_SECRET — delete this file after running.
export async function POST(req: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return NextResponse.json({ error: "AUTH_SECRET not set" }, { status: 500 });
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ops: { sql: string; status: "ok" | "skipped" | "error"; error?: string }[] = [];
  const statements = [
    `ALTER TABLE User ADD COLUMN password TEXT`,
    `ALTER TABLE User ADD COLUMN emailVerified DATETIME`,
    `ALTER TABLE User ADD COLUMN image TEXT`,
    `CREATE TABLE IF NOT EXISTS Account (
      id TEXT NOT NULL PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      providerAccountId TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT,
      CONSTRAINT Account_userId_fkey FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS Account_provider_providerAccountId_key ON Account(provider, providerAccountId)`,
    `CREATE TABLE IF NOT EXISTS Session (
      id TEXT NOT NULL PRIMARY KEY,
      sessionToken TEXT NOT NULL,
      userId TEXT NOT NULL,
      expires DATETIME NOT NULL,
      CONSTRAINT Session_userId_fkey FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS Session_sessionToken_key ON Session(sessionToken)`,
    `CREATE TABLE IF NOT EXISTS VerificationToken (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL,
      expires DATETIME NOT NULL
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS VerificationToken_token_key ON VerificationToken(token)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS VerificationToken_identifier_token_key ON VerificationToken(identifier, token)`,
  ];

  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
      ops.push({ sql: sql.slice(0, 80).replace(/\s+/g, " "), status: "ok" });
    } catch (e: any) {
      const msg = String(e.message || e);
      if (/duplicate column|already exists/i.test(msg)) {
        ops.push({ sql: sql.slice(0, 80).replace(/\s+/g, " "), status: "skipped" });
      } else {
        ops.push({ sql: sql.slice(0, 80).replace(/\s+/g, " "), status: "error", error: msg });
      }
    }
  }

  return NextResponse.json({ ok: true, ops });
}
