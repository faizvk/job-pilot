"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Briefcase, Zap, Layers, Search, FileText,
  Mail, Bell, BarChart3, User, Rocket, ClipboardPaste, BellRing,
  Sparkles
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/job-feed", label: "Job Feed", icon: Search },
      { href: "/job-alerts", label: "Job Alerts", icon: BellRing },
    ],
  },
  {
    label: "Workflow",
    items: [
      { href: "/applications", label: "Applications", icon: Briefcase },
      { href: "/quick-apply", label: "Quick Apply", icon: Zap },
      { href: "/batch-apply", label: "Batch Apply", icon: Layers },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/smart-paste", label: "Smart Paste", icon: ClipboardPaste },
      { href: "/resumes", label: "Resumes", icon: FileText },
      { href: "/cover-letters", label: "Cover Letters", icon: Mail },
      { href: "/follow-ups", label: "Follow-ups", icon: Bell },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/profile", label: "Profile", icon: User },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-[260px] bg-slate-950 relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-purple-950/10 pointer-events-none" />

      {/* Logo */}
      <div className="relative flex items-center gap-3 px-5 h-16 border-b border-white/[0.06]">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
          <Rocket className="w-[18px] h-[18px] text-white" />
        </div>
        <div>
          <span className="text-[15px] font-bold text-white tracking-tight">JobPilot</span>
          <span className="ml-1.5 text-[10px] font-medium text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded-full">AI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 px-3 py-5 overflow-y-auto space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "group flex items-center gap-2.5 px-3 py-[9px] rounded-xl text-[13px] transition-all duration-200 relative",
                      isActive
                        ? "bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-300 font-medium shadow-sm shadow-indigo-500/5"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-indigo-400 to-purple-400" />
                    )}
                    <Icon className={cn(
                      "w-[18px] h-[18px] flex-shrink-0 transition-colors duration-200",
                      isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-400"
                    )} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Quick Apply CTA */}
      <div className="relative px-3 pb-3">
        <Link
          href="/quick-apply"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[13px] font-medium shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4" />
          Quick Apply
        </Link>
      </div>

      {/* Footer */}
      <div className="relative px-4 py-3.5 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
            JP
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-300 truncate">JobPilot</p>
            <p className="text-[10px] text-slate-600">v1.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
