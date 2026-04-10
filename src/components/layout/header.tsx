"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Rocket, ChevronRight, Search, Briefcase, Zap, Layers,
  FileText, Mail, Bell, BarChart3, User, LayoutDashboard, X, Sparkles, BellRing, ClipboardPaste } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/job-feed", label: "Job Feed", icon: Search },
  { href: "/job-alerts", label: "Job Alerts", icon: BellRing },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/quick-apply", label: "Quick Apply", icon: Zap },
  { href: "/batch-apply", label: "Batch Apply", icon: Layers },
  { href: "/smart-paste", label: "Smart Paste", icon: ClipboardPaste },
  { href: "/resumes", label: "Resumes", icon: FileText },
  { href: "/cover-letters", label: "Cover Letters", icon: Mail },
  { href: "/follow-ups", label: "Follow-ups", icon: Bell },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  "job-feed": "Job Feed",
  "job-alerts": "Job Alerts",
  applications: "Applications",
  "quick-apply": "Quick Apply",
  "batch-apply": "Batch Apply",
  "smart-paste": "Smart Paste",
  resumes: "Resumes",
  "cover-letters": "Cover Letters",
  "follow-ups": "Follow-ups",
  analytics: "Analytics",
  profile: "Profile",
};

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const segments = pathname.split("/").filter(Boolean);

  return (
    <>
      <header className="flex items-center justify-between px-6 h-14 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-1.5 hover:bg-slate-100 rounded-xl transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu className="w-5 h-5 text-slate-500" />
          </button>

          <nav className="flex items-center gap-1.5 text-[13px]">
            <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
              Home
            </Link>
            {segments.map((seg, i) => {
              const label = PAGE_TITLES[seg] || seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
              const href = "/" + segments.slice(0, i + 1).join("/");
              const isLast = i === segments.length - 1;
              return (
                <span key={href} className="flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-slate-300" />
                  {isLast ? (
                    <span className="font-semibold text-slate-800">{label}</span>
                  ) : (
                    <Link href={href} className="text-slate-400 hover:text-slate-600 transition-colors">
                      {label}
                    </Link>
                  )}
                </span>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div
            className="relative w-72 h-full bg-slate-950 shadow-2xl animate-slide-in overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-purple-950/10 pointer-events-none" />
            <div className="relative flex items-center justify-between px-5 h-16 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
                  <Rocket className="w-[18px] h-[18px] text-white" />
                </div>
                <span className="text-[15px] font-bold text-white">JobPilot</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.05]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="relative p-3 space-y-0.5">
              {links.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-300 font-medium"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                    }`}
                  >
                    <Icon className={`w-[18px] h-[18px] ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="relative px-3 mt-2">
              <Link
                href="/quick-apply"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[13px] font-medium shadow-lg shadow-indigo-500/20"
              >
                <Sparkles className="w-4 h-4" />
                Quick Apply
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
