"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SidebarProvider } from "@/components/layout/sidebar-context";

const CHROME_FREE_PREFIXES = ["/auth"];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const isChromeFree = CHROME_FREE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (isChromeFree) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-[#fafbfc]">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
