"use client";

import { StatusBadge } from "@/components/applications/status-badge";
import { timeAgo } from "@/lib/utils";
import type { ActivityItem } from "@/types";
import Link from "next/link";

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h2 className="font-semibold mb-4">Recent Activity</h2>
        <p className="text-sm text-gray-500">No recent activity. Start tracking applications!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="font-semibold mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((item) => (
          <Link
            key={item.id}
            href={`/applications/${item.applicationId}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.jobTitle}</p>
              <p className="text-xs text-gray-500">{item.companyName}</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {item.fromStatus && <StatusBadge status={item.fromStatus} />}
              {item.fromStatus && <span className="text-gray-400">→</span>}
              <StatusBadge status={item.toStatus} />
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(item.changedAt)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
