"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Rocket, ChevronRight, Search, Briefcase, Zap, Layers,
  FileText, Mail, Bell, BarChart3, User, LayoutDashboard, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/job-feed", label: "Job Feed", icon: Search },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/quick-apply", label: "Quick Apply", icon: Zap },
  { href: "/batch-apply", label: "Batch Apply", icon: Layers },
  { href: "/resumes", label: "Resumes", icon: FileText },
  { href: "/cover-letters", label: "Cover Letters", icon: Mail },
  { href: "/follow-ups", label: "Follow-ups", icon: Bell },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  "job-feed": "Job Feed",
  applications: "Applications",
  "quick-apply": "Quick Apply",
  "batch-apply": "Batch Apply",
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
      <header className="flex items-center justify-between px-6 h-14 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu className="w-5 h-5 text-gray-500" />
          </button>

          <nav className="flex items-center gap-1 text-[13px]">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
              Home
            </Link>
            {segments.map((seg, i) => {
              const label = PAGE_TITLES[seg] || seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
              const href = "/" + segments.slice(0, i + 1).join("/");
              const isLast = i === segments.length - 1;
              return (
                <span key={href} className="flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-gray-300" />
                  {isLast ? (
                    <span className="font-medium text-gray-800">{label}</span>
                  ) : (
                    <Link href={href} className="text-gray-400 hover:text-gray-600 transition-colors">
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div
            className="relative w-72 h-full bg-gray-900 shadow-2xl animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 h-16 border-b border-gray-800/60">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700">
                  <Rocket className="w-4 h-4 text-white" />
                </div>
                <span className="text-[15px] font-semibold text-white">JobPilot</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-3 space-y-0.5">
              {links.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] transition-all ${
                      isActive
                        ? "bg-indigo-500/[0.12] text-indigo-400 font-medium"
                        : "text-gray-400 hover:bg-white/[0.05] hover:text-gray-200"
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
