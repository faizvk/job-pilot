"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserMenu } from "@/components/layout/user-menu";

export function LandingNav() {
  const { data: session, status } = useSession();
  const isAuthed = !!session?.user;

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="Pursuit" width={32} height={32} />
          <span className="text-base font-semibold tracking-[-0.01em] text-slate-900">Pursuit</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm text-slate-600">
          <Link href="/" className="hover:text-slate-900 font-medium text-slate-900 border-b-2 border-slate-900 h-16 flex items-center">
            Home
          </Link>
          {isAuthed && (
            <>
              <Link href="/job-feed" className="hover:text-slate-900">Job Feed</Link>
              <Link href="/applications" className="hover:text-slate-900">Applications</Link>
              <Link href="/insights" className="hover:text-slate-900">Insights</Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
          ) : isAuthed ? (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center text-sm text-slate-700 font-medium hover:text-slate-900 px-3"
              >
                Dashboard
              </Link>
              <UserMenu />
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition px-3.5 py-2 rounded-md"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
