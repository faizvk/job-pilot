"use client";

import Link from "next/link";
import { AlertCircle, ChevronRight, Mail } from "lucide-react";

interface StaleApp {
  id: string;
  company: string;
  title: string;
  daysAgo: number;
  hasFollowUp: boolean;
}

export function NeedsAttention({ apps }: { apps: StaleApp[] }) {
  if (apps.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200/70 bg-white">
        <header className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Needs your attention</h2>
        </header>
        <div className="px-4 sm:px-5 py-8 text-center">
          <p className="text-sm text-slate-500">Nothing stale right now.</p>
          <p className="text-xs text-slate-400 mt-1">Stale apps appear here after 7 days without a response.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200/70 bg-white">
      <header className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          Needs your attention
        </h2>
        <span className="text-xs text-slate-400">{apps.length} stale</span>
      </header>
      <ul className="divide-y divide-slate-100">
        {apps.slice(0, 6).map((a) => (
          <li key={a.id}>
            <Link
              href={`/applications/${a.id}`}
              className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-slate-50/70 transition-colors duration-100 group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 group-hover:text-emerald-700 transition-colors truncate">{a.title}</p>
                <p className="text-xs text-slate-500 truncate">{a.company} · {a.daysAgo}d ago</p>
              </div>
              {!a.hasFollowUp && (
                <span className="text-[10px] uppercase tracking-wide font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                  Send FU
                </span>
              )}
              <Mail className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-colors flex-shrink-0" />
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
      {apps.length > 6 && (
        <Link
          href="/insights"
          className="block px-4 sm:px-5 py-2.5 text-xs text-emerald-700 font-medium hover:bg-emerald-50/50 transition-colors duration-100 border-t border-slate-100"
        >
          View all {apps.length} in Insights →
        </Link>
      )}
    </section>
  );
}
