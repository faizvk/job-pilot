"use client";

import { Briefcase, Phone, Trophy, TrendingUp } from "lucide-react";
import type { DashboardStats } from "@/types";

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      label: "Applied",
      value: stats.applied,
      icon: Briefcase,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      accent: "border-l-indigo-500",
    },
    {
      label: "Interviews",
      value: stats.interviews,
      icon: Phone,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      accent: "border-l-violet-500",
    },
    {
      label: "Offers",
      value: stats.offers,
      icon: Trophy,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      accent: "border-l-emerald-500",
    },
    {
      label: "Response Rate",
      value: `${stats.responseRate}%`,
      icon: TrendingUp,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      accent: "border-l-amber-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-white rounded-xl border border-gray-200/80 shadow-card p-5 border-l-[3px] ${card.accent} card-hover`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] text-gray-500 font-medium">{card.label}</p>
              <p className="text-[28px] font-bold text-gray-900 mt-1 tracking-tight">{card.value}</p>
            </div>
            <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
              <card.icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
