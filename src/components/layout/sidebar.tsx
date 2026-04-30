"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import {
  LayoutDashboard, Briefcase, Zap, Layers, Search, FileText,
  BarChart3, User, BellRing, Building2,
  ChevronsLeft, ChevronsRight, Bot
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/job-feed", label: "Job Feed", icon: Search },
      { href: "/company-search", label: "Company Search", icon: Building2 },
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
      { href: "/resumes", label: "Resumes", icon: FileText },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/automations", label: "Automations", icon: Bot },
      { href: "/profile", label: "Profile", icon: User },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-[#0b0d10] relative overflow-hidden transition-all duration-300 ease-in-out border-r border-white/[0.04]",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <Link
        href="/dashboard"
        className={cn(
          "relative flex items-center h-16 border-b border-white/[0.06] transition-all duration-300",
          collapsed ? "px-0 justify-center" : "px-5 gap-3"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-light.svg" alt="Pursuit" width={36} height={36} className="flex-shrink-0" />
        {!collapsed && (
          <div className="animate-fade-in">
            <span className="text-[15px] font-semibold text-white tracking-[-0.01em]">Pursuit</span>
          </div>
        )}
      </Link>

      {/* Navigation */}
      <nav className={cn(
        "relative flex-1 py-5 overflow-y-auto overflow-x-hidden space-y-6 transition-all duration-300",
        collapsed ? "px-2" : "px-3"
      )}>
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 animate-fade-in">
                {group.label}
              </p>
            )}
            {collapsed && <div className="mb-1.5 mx-auto w-6 h-px bg-white/[0.06]" />}
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    title={collapsed ? label : undefined}
                    className={cn(
                      "group flex items-center rounded-xl text-[13px] transition-all duration-200 relative",
                      collapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-[9px]",
                      isActive
                        ? "bg-white/[0.06] text-white font-medium"
                        : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
                    )}
                  >
                    {isActive && !collapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r-full bg-white" />
                    )}
                    {isActive && collapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full bg-white" />
                    )}
                    <Icon className={cn(
                      "w-[18px] h-[18px] flex-shrink-0 transition-colors duration-200",
                      isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                    )} />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Quick Apply CTA */}
      {!collapsed && (
        <div className="relative px-3 pb-3 animate-fade-in">
          <Link
            href="/quick-apply"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md bg-white text-[#0b0d10] text-[13px] font-medium hover:bg-slate-100 transition-all duration-200 active:scale-[0.98]"
          >
            <Zap className="w-4 h-4" />
            Quick Apply
          </Link>
        </div>
      )}
      {collapsed && (
        <div className="relative px-2 pb-3">
          <Link
            href="/quick-apply"
            title="Quick Apply"
            className="flex items-center justify-center w-full p-2.5 rounded-md bg-white text-[#0b0d10] hover:bg-slate-100 transition-all duration-200 active:scale-[0.98]"
          >
            <Zap className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Collapse Toggle + Footer */}
      <div className="relative border-t border-white/[0.06]">
        <button
          onClick={toggle}
          className={cn(
            "flex items-center w-full py-3.5 text-slate-500 hover:text-slate-300 hover:bg-white/[0.03] transition-all duration-200",
            collapsed ? "justify-center px-0" : "gap-2.5 px-5"
          )}
        >
          {collapsed ? (
            <ChevronsRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronsLeft className="w-4 h-4" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
