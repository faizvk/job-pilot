"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard, Search, Briefcase, Zap, Layers, FileText,
  User, BellRing, Bot, Building2, TrendingUp,
  Menu, X, ChevronDown,
} from "lucide-react";
import { UserMenu } from "@/components/layout/user-menu";
import { cn } from "@/lib/utils";

const PRIMARY = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/job-feed", label: "Job Feed", icon: Search },
  { href: "/company-search", label: "Company Search", icon: Building2 },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/insights", label: "Insights", icon: TrendingUp },
];

const SECONDARY = [
  { href: "/quick-apply", label: "Quick Apply", icon: Zap },
  { href: "/batch-apply", label: "Batch Apply", icon: Layers },
  { href: "/resumes", label: "Resumes", icon: FileText },
  { href: "/job-alerts", label: "Job Alerts", icon: BellRing },
  { href: "/automations", label: "Automations", icon: Bot },
  { href: "/profile", label: "Profile", icon: User },
];

export function TopNav() {
  const pathname = usePathname() || "";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo + brand */}
            <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" alt="Pursuit" width={32} height={32} className="transition-transform duration-200 group-hover:scale-105" />
              <span className="text-base font-semibold tracking-[-0.01em] text-slate-900 hidden sm:inline group-hover:text-emerald-700 transition-colors">Pursuit</span>
            </Link>

            {/* Primary tabs — desktop */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 ml-6">
              {PRIMARY.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 h-16 flex items-center text-sm font-medium transition-colors relative",
                      active
                        ? "text-emerald-700"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-t bg-emerald-600" />
                    )}
                  </Link>
                );
              })}

              {/* More dropdown */}
              <div ref={moreRef} className="relative">
                <button
                  onClick={() => setMoreOpen((v) => !v)}
                  className={cn(
                    "px-3 h-16 flex items-center gap-1 text-sm font-medium transition-colors relative",
                    SECONDARY.some((s) => isActive(s.href))
                      ? "text-emerald-700"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  More
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
                  {SECONDARY.some((s) => isActive(s.href)) && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-t bg-emerald-600" />
                  )}
                </button>
                {moreOpen && (
                  <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1 animate-scale-in">
                    {SECONDARY.map(({ href, label, icon: Icon }) => {
                      const active = isActive(href);
                      return (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setMoreOpen(false)}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                            active
                              ? "bg-emerald-50 text-emerald-700 font-medium"
                              : "text-slate-700 hover:bg-slate-50"
                          )}
                        >
                          <Icon className={`w-4 h-4 ${active ? "text-emerald-600" : "text-slate-400"}`} />
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile menu button */}
            <button
              className="lg:hidden ml-auto mr-2 p-2 hover:bg-slate-100 rounded-md transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>

            {/* User menu */}
            <div className="flex-shrink-0">
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile slide-out */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-[80vw] max-w-72 h-full bg-white shadow-2xl animate-slide-in overflow-y-auto">
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icon.svg" alt="Pursuit" width={32} height={32} />
                <span className="text-base font-semibold tracking-[-0.01em] text-slate-900">Pursuit</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 text-slate-500 hover:text-slate-800 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-2">
              {[...PRIMARY, ...SECONDARY].map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                      active
                        ? "bg-emerald-50 text-emerald-700 font-medium"
                        : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-emerald-600" : "text-slate-400"}`} />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 mt-1 border-t border-slate-200">
              <Link
                href="/quick-apply"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition active:scale-[0.98]"
              >
                <Zap className="w-4 h-4" />
                Quick Apply
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
