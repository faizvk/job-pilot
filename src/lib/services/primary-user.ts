import prisma from "@/lib/db";

/**
 * Returns the ID of the primary user — used in non-authenticated contexts
 * like Vercel cron jobs where there is no session.
 *
 * Strategy: for now (single-user deployment) just return the most recently
 * updated user. If you ever go multi-tenant, the cron should iterate over all
 * users instead of relying on this.
 */
let cached: { id: string; ts: number } | null = null;
const TTL_MS = 60_000; // 1 min cache so cron loops don't hammer the DB

export async function getPrimaryUserId(): Promise<string> {
  if (cached && Date.now() - cached.ts < TTL_MS) return cached.id;

  const user = await prisma.user.findFirst({
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });
  if (!user) throw new Error("No users in database");

  cached = { id: user.id, ts: Date.now() };
  return user.id;
}
