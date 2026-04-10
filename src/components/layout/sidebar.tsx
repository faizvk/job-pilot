"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Briefcase, Zap, Layers, Search, FileText,
  Mail, Bell, BarChart3, User, Rocket, ClipboardPaste, BellRing
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
    <aside className="hidden md:flex flex-col w-[260px] bg-gray-900 border-r border-gray-800/50">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-800/60">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-500/20">
          <Rocket className="w-4 h-4 text-white" />
        </div>
        <span className="text-[15px] font-semibold text-white tracking-tight">JobPilot</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
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
                      "group flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13px] transition-all duration-150 relative",
                      isActive
                        ? "bg-indigo-500/[0.12] text-indigo-400 font-medium"
                        : "text-gray-400 hover:bg-white/[0.05] hover:text-gray-200"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-indigo-400" />
                    )}
                    <Icon className={cn(
                      "w-[18px] h-[18px] flex-shrink-0 transition-colors",
                      isActive ? "text-indigo-400" : "text-gray-500 group-hover:text-gray-400"
                    )} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3.5 border-t border-gray-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-semibold">
            JP
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-300 truncate">JobPilot</p>
            <p className="text-[10px] text-gray-500">v1.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
