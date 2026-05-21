"use client";

import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

interface Props {
  applied: number;
  interviews: number;
  offers: number;
  responseRate: number;
}

export function TodayHeadline({ applied, interviews, offers, responseRate }: Props) {
  // A single-row hero: big number + sparse secondary stats inline.
  // No emoji, no gradients, no card-spam — just typography.
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{greeting}.</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.025em] text-slate-900 mt-1">
            Pick up where you left off.
          </h1>
        </div>
        <Link
          href="/quick-apply"
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors duration-150 active:scale-[0.98] self-start sm:self-auto"
        >
          <Zap className="w-4 h-4" />
          Quick Apply
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Inline stat row — no boxes, just numbers separated by hairline dividers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 border-y border-slate-200/70 py-5">
        <Stat label="Applied" value={applied} />
        <Stat label="Interviews" value={interviews} />
        <Stat label="Offers" value={offers} />
        <Stat label="Response rate" value={`${responseRate}%`} accent={responseRate >= 15 ? "good" : responseRate >= 5 ? "neutral" : "warn"} />
      </div>
    </div>
  );
}

function Stat({ label, value, accent = "neutral" }: { label: string; value: number | string; accent?: "good" | "warn" | "neutral" }) {
  const color =
    accent === "good" ? "text-emerald-600" :
    accent === "warn" ? "text-rose-600" :
    "text-slate-900";
  return (
    <div className="group cursor-default">
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl sm:text-[26px] font-semibold tracking-tight mt-1 ${color} group-hover:opacity-80 transition-opacity duration-150`}>{value}</p>
    </div>
  );
}
