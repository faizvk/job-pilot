"use client";

import { StatusBadge } from "@/components/applications/status-badge";
import { timeAgo } from "@/lib/utils";
import type { ActivityItem } from "@/types";
import Link from "next/link";
import { ArrowRight, Activity } from "lucide-react";

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-card p-5">
        <h2 className="text-[15px] font-semibold text-slate-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <Activity className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-500">No recent activity</p>
          <p className="text-xs text-slate-400 mt-1">Start tracking applications to see updates here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-card p-5">
      <h2 className="text-[15px] font-semibold text-slate-900 mb-4">Recent Activity</h2>
      <div className="space-y-1">
        {activities.map((item) => (
          <Link
            key={item.id}
            href={`/applications/${item.applicationId}`}
            className="flex items-center gap-3 p-2.5 -mx-1 rounded-xl hover:bg-slate-50 transition-colors group"
          >
            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{item.jobTitle}</p>
              <p className="text-xs text-slate-400">{item.companyName}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs flex-shrink-0">
              {item.fromStatus && <StatusBadge status={item.fromStatus} />}
              {item.fromStatus && <ArrowRight className="w-3 h-3 text-slate-300" />}
              <StatusBadge status={item.toStatus} />
            </div>
            <span className="text-[11px] text-slate-400 whitespace-nowrap">{timeAgo(item.changedAt)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
