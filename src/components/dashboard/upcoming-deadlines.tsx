"use client";

import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface FollowUp {
  id: string;
  applicationId?: string;
  dueDate: string;
  type: string;
  application: { companyName: string; jobTitle: string };
}

export function UpcomingDeadlines({ followUps }: { followUps: FollowUp[] }) {
  if (followUps.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200/70 bg-white">
        <header className="px-4 sm:px-5 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Upcoming follow-ups</h2>
        </header>
        <div className="px-4 sm:px-5 py-8 text-center">
          <p className="text-sm text-slate-500">No pending follow-ups.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200/70 bg-white">
      <header className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">Upcoming follow-ups</h2>
        <span className="text-xs text-slate-400">{followUps.length}</span>
      </header>
      <ul className="divide-y divide-slate-100">
        {followUps.slice(0, 5).map((fu) => {
          const isOverdue = new Date(fu.dueDate) < new Date();
          return (
            <li key={fu.id}>
              <Link
                href={fu.applicationId ? `/applications/${fu.applicationId}` : "#"}
                className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-slate-50/70 transition-colors duration-100 group"
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isOverdue ? "bg-rose-500" : "bg-emerald-500"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate group-hover:text-emerald-700 transition-colors">{fu.application.companyName}</p>
                  <p className="text-xs text-slate-500 truncate">{fu.type.replace("_", " ")}</p>
                </div>
                <span className={`text-[11px] whitespace-nowrap font-medium tabular-nums ${isOverdue ? "text-rose-600" : "text-slate-500"}`}>
                  {isOverdue ? "Overdue " : ""}{formatDate(fu.dueDate)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
