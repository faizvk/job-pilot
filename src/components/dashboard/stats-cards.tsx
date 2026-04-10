"use client";

import { Briefcase, Phone, Trophy, TrendingUp } from "lucide-react";
import type { DashboardStats } from "@/types";

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      label: "Applied",
      value: stats.applied,
      icon: Briefcase,
      gradient: "from-indigo-500 to-indigo-600",
      bgGlow: "bg-indigo-500/10",
      textColor: "text-indigo-600",
    },
    {
      label: "Interviews",
      value: stats.interviews,
      icon: Phone,
      gradient: "from-violet-500 to-violet-600",
      bgGlow: "bg-violet-500/10",
      textColor: "text-violet-600",
    },
    {
      label: "Offers",
      value: stats.offers,
      icon: Trophy,
      gradient: "from-emerald-500 to-emerald-600",
      bgGlow: "bg-emerald-500/10",
      textColor: "text-emerald-600",
    },
    {
      label: "Response Rate",
      value: `${stats.responseRate}%`,
      icon: TrendingUp,
      gradient: "from-amber-500 to-orange-500",
      bgGlow: "bg-amber-500/10",
      textColor: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
      {cards.map((card) => (
        <div
          key={card.label}
          className="group bg-white rounded-2xl border border-slate-200/60 shadow-card p-5 card-hover relative overflow-hidden"
        >
          {/* Subtle gradient glow on hover */}
          <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full ${card.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl`} />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[13px] text-slate-500 font-medium">{card.label}</p>
              <p className="text-[28px] font-bold text-slate-900 mt-1 tracking-tight">{card.value}</p>
            </div>
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.gradient} shadow-sm`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
