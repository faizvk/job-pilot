"use client";

import { Briefcase, Phone, Trophy, TrendingUp } from "lucide-react";
import type { DashboardStats } from "@/types";

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    { label: "Applied", value: stats.applied, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Interviews", value: stats.interviews, icon: Phone, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Offers", value: stats.offers, icon: Trophy, color: "text-green-600", bg: "bg-green-50" },
    { label: "Response Rate", value: `${stats.responseRate}%`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-lg border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${card.bg}`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
