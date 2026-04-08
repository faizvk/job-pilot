"use client";

import { StatusBadge } from "@/components/applications/status-badge";
import { timeAgo } from "@/lib/utils";
import type { ActivityItem } from "@/types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-card p-5">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">No recent activity</p>
          <p className="text-xs text-gray-400 mt-1">Start tracking applications to see updates here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-card p-5">
      <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Recent Activity</h2>
      <div className="space-y-1">
        {activities.map((item) => (
          <Link
            key={item.id}
            href={`/applications/${item.applicationId}`}
            className="flex items-center gap-3 p-2.5 -mx-1 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate group-hover:text-indigo-600 transition-colors">{item.jobTitle}</p>
              <p className="text-xs text-gray-400">{item.companyName}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs flex-shrink-0">
              {item.fromStatus && <StatusBadge status={item.fromStatus} />}
              {item.fromStatus && <ArrowRight className="w-3 h-3 text-gray-300" />}
              <StatusBadge status={item.toStatus} />
            </div>
            <span className="text-[11px] text-gray-400 whitespace-nowrap">{timeAgo(item.changedAt)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
