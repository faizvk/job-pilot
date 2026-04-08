"use client";

import { useEffect, useState } from "react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { WeeklyGoalRing } from "@/components/dashboard/weekly-goal-ring";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { Zap } from "lucide-react";
import type { DashboardStats, ActivityItem } from "@/types";

interface DashboardData {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
  upcomingFollowUps: Array<{
    id: string;
    dueDate: string;
    type: string;
    application: { companyName: string; jobTitle: string };
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Your job search at a glance</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[108px] rounded-xl animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-[22px] font-bold text-gray-900">Dashboard</h1>
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-card p-8 text-center">
          <p className="text-gray-500">Failed to load dashboard data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your job search at a glance</p>
        </div>
        <a
          href="/quick-apply"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-600/25 transition-all active:scale-[0.98]"
        >
          <Zap className="w-4 h-4" />
          Quick Apply
        </a>
      </div>

      <StatsCards stats={data.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ActivityFeed activities={data.recentActivity} />
        </div>
        <div className="space-y-5">
          <WeeklyGoalRing goal={data.stats.weeklyGoal} />
          <UpcomingDeadlines followUps={data.upcomingFollowUps} />
        </div>
      </div>
    </div>
  );
}
