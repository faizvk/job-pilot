"use client";

import { StatusBadge } from "@/components/applications/status-badge";
import { timeAgo } from "@/lib/utils";
import type { ActivityItem } from "@/types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200/70 bg-white">
        <header className="px-4 sm:px-5 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Recent activity</h2>
        </header>
        <div className="px-4 sm:px-5 py-8 text-center">
          <p className="text-sm text-slate-500">No activity yet.</p>
          <p className="text-xs text-slate-400 mt-1">Status changes show up here.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200/70 bg-white">
      <header className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">Recent activity</h2>
        <Link href="/applications" className="text-xs text-emerald-700 font-medium hover:underline">
          All applications
        </Link>
      </header>
      <ul className="divide-y divide-slate-100">
        {activities.slice(0, 8).map((item) => (
          <li key={item.id}>
            <Link
              href={`/applications/${item.applicationId}`}
              className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto] items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 hover:bg-slate-50/70 transition-colors duration-100 group"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 group-hover:text-emerald-700 transition-colors truncate">{item.jobTitle}</p>
                <p className="text-xs text-slate-500 truncate">{item.companyName}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 hidden sm:flex">
                {item.fromStatus && <StatusBadge status={item.fromStatus} />}
                {item.fromStatus && <ArrowRight className="w-3 h-3 text-slate-300" />}
                <StatusBadge status={item.toStatus} />
              </div>
              <span className="text-[11px] text-slate-400 whitespace-nowrap flex-shrink-0 tabular-nums">{timeAgo(item.changedAt)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
