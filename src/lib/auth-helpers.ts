import { auth } from "@/lib/auth";

/**
 * Returns the current authenticated user's ID.
 * Throws with a 401-ish error message if no session — callers should
 * surface this as a 401 response in their API route.
 */
export async function getCurrentUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user.id;
}

/**
 * Same as getCurrentUserId but returns null instead of throwing.
 * Useful for pages/handlers that need optional auth.
 */
export async function tryGetCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
