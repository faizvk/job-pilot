"use client";

import { useEffect, useState } from "react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { WeeklyGoalRing } from "@/components/dashboard/weekly-goal-ring";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { Zap, ArrowRight } from "lucide-react";
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
        {/* Hero skeleton */}
        <div className="h-[140px] rounded-2xl animate-shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[120px] rounded-2xl animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-card p-8 text-center">
          <p className="text-slate-500">Failed to load dashboard data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-slate-200/70 pb-4 sm:pb-5">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-[-0.02em] text-slate-900">Today</h1>
          <p className="text-sm text-slate-500 mt-1">Your search at a glance.</p>
        </div>
        <a
          href="/quick-apply"
          className="group inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Zap className="w-4 h-4" />
          Quick Apply
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
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
