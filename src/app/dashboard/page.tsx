"use client";

import { useEffect, useState } from "react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { WeeklyGoalRing } from "@/components/dashboard/weekly-goal-ring";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { Sparkles, ArrowRight } from "lucide-react";
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
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 p-6 text-white shadow-lg shadow-indigo-500/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20viewBox%3D%220%200%2030%2030%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%221%22%20cy%3D%221%22%20r%3D%221%22%20fill%3D%22rgba(255%2C255%2C255%2C0.07)%22%2F%3E%3C%2Fsvg%3E')] pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-indigo-100 mt-1 text-sm">Your job search at a glance. Keep the momentum going!</p>
          </div>
          <a
            href="/quick-apply"
            className="group inline-flex items-center gap-2 bg-white text-indigo-600 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15 transition-all active:scale-[0.97]"
          >
            <Sparkles className="w-4 h-4" />
            Quick Apply
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
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
