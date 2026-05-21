"use client";

import { useEffect, useState } from "react";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { WeeklyGoalRing } from "@/components/dashboard/weekly-goal-ring";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { TodayHeadline } from "@/components/dashboard/today-headline";
import { NeedsAttention } from "@/components/dashboard/needs-attention";
import type { DashboardStats, ActivityItem } from "@/types";

interface DashboardData {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
  upcomingFollowUps: Array<{
    id: string;
    applicationId?: string;
    dueDate: string;
    type: string;
    application: { companyName: string; jobTitle: string };
  }>;
}

interface InsightsData {
  staleApplications: { id: string; company: string; title: string; daysAgo: number; hasFollowUp: boolean }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard").then((r) => r.json()),
      fetch("/api/insights?days=30").then((r) => r.json()).catch(() => null),
    ])
      .then(([d, i]) => {
        setData(d);
        setInsights(i);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-32 rounded-md animate-shimmer" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-64 rounded-xl animate-shimmer" />
          <div className="space-y-4">
            <div className="h-32 rounded-xl animate-shimmer" />
            <div className="h-32 rounded-xl animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-slate-200/70 bg-white p-8 text-center">
        <p className="text-slate-500">Couldn&apos;t load dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <TodayHeadline
        applied={data.stats.applied}
        interviews={data.stats.interviews}
        offers={data.stats.offers}
        responseRate={data.stats.responseRate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <ActivityFeed activities={data.recentActivity} />
          {insights && insights.staleApplications.length > 0 && (
            <NeedsAttention apps={insights.staleApplications} />
          )}
        </div>
        <div className="space-y-4">
          <WeeklyGoalRing goal={data.stats.weeklyGoal} />
          <UpcomingDeadlines followUps={data.upcomingFollowUps} />
        </div>
      </div>
    </div>
  );
}
