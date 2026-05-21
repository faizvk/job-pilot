"use client";

import { usePathname } from "next/navigation";
import { TopNav } from "@/components/layout/top-nav";

const CHROME_FREE_PREFIXES = ["/auth"];
const CHROME_FREE_EXACT = ["/"]; // landing page has its own chrome

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const isChromeFree =
    CHROME_FREE_EXACT.includes(pathname) ||
    CHROME_FREE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (isChromeFree) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      <main>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
