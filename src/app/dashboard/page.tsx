"use client";

import { useEffect, useState } from "react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { WeeklyGoalRing } from "@/components/dashboard/weekly-goal-ring";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
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
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Failed to load dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <a
          href="/quick-apply"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Quick Apply
        </a>
      </div>

      <StatsCards stats={data.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed activities={data.recentActivity} />
        </div>
        <div className="space-y-6">
          <WeeklyGoalRing goal={data.stats.weeklyGoal} />
          <UpcomingDeadlines followUps={data.upcomingFollowUps} />
        </div>
      </div>
    </div>
  );
}
