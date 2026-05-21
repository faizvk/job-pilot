import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const PUBLIC_PATHS = [
  "/",            // marketing landing page
  "/auth/login",
  "/auth/signup",
];

const PUBLIC_API_PREFIXES = [
  "/api/auth",     // NextAuth's own routes + signup
  "/api/cron",     // Vercel cron — protected by CRON_SECRET
  "/api/admin",    // Admin/migration endpoints — protected by AUTH_SECRET
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public assets / Next.js internals — let them pass
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/logo") ||
    pathname === "/manifest.json"
  ) {
    return NextResponse.next();
  }

  const isPublicPage = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isPublicApi = PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p));

  if (isPublicPage || isPublicApi) return NextResponse.next();

  const session = await auth();

  // Not authed → redirect to login (preserve where they wanted to go)
  if (!session?.user?.id) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL("/auth/login", req.url);
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Authed but on / → push to dashboard
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|icon-light.svg|logo.svg).*)",
  ],
};
