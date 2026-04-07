"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Briefcase, Zap, Layers, Search, FileText, Mail, Bell, BarChart3, User, Rocket
} from "lucide-react";

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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-800">
        <Rocket className="w-6 h-6 text-blue-400" />
        <span className="text-lg font-bold text-white">JobPilot</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-blue-600 text-white font-medium"
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-slate-800">
        <p className="text-xs text-slate-500">JobPilot v1.0</p>
      </div>
    </aside>
  );
}
