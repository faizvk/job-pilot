"use client";

import Link from "next/link";
import { StatusBadge } from "./status-badge";
import { formatDate, formatSalary } from "@/lib/utils";

export function ApplicationTable({ applications }: { applications: any[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/70 overflow-x-auto">
      <table className="w-full text-sm min-w-[480px]">
        <thead className="bg-slate-50/70 border-b border-slate-200/70">
          <tr>
            <th className="text-left px-3 sm:px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-slate-500">Company</th>
            <th className="text-left px-3 sm:px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-slate-500 hidden sm:table-cell">Title</th>
            <th className="text-left px-3 sm:px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-slate-500">Status</th>
            <th className="text-left px-3 sm:px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-slate-500 hidden lg:table-cell">Location</th>
            <th className="text-left px-3 sm:px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-slate-500 hidden lg:table-cell">Salary</th>
            <th className="text-left px-3 sm:px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-slate-500 hidden md:table-cell">Match</th>
            <th className="text-left px-3 sm:px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-slate-500 hidden sm:table-cell">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {applications.map((app) => (
            <tr key={app.id} className="hover:bg-emerald-50/40 transition-colors duration-100 cursor-pointer">
              <td className="px-3 sm:px-4 py-3">
                <Link href={`/applications/${app.id}`} className="font-medium text-slate-900 hover:text-emerald-700 transition-colors">
                  {app.companyName}
                </Link>
                {/* Mobile-only: show title under company since title column is hidden */}
                <div className="text-xs text-slate-500 mt-0.5 sm:hidden">{app.jobTitle}</div>
              </td>
              <td className="px-3 sm:px-4 py-3 hidden sm:table-cell">{app.jobTitle}</td>
              <td className="px-3 sm:px-4 py-3"><StatusBadge status={app.status} /></td>
              <td className="px-3 sm:px-4 py-3 text-slate-500 hidden lg:table-cell">{app.location || "—"}</td>
              <td className="px-3 sm:px-4 py-3 text-slate-500 hidden lg:table-cell">{formatSalary(app.salaryMin, app.salaryMax)}</td>
              <td className="px-3 sm:px-4 py-3 hidden md:table-cell">
                {app.matchScore != null ? (
                  <span className={app.matchScore >= 70 ? "text-green-600" : app.matchScore >= 40 ? "text-yellow-600" : "text-red-600"}>
                    {app.matchScore}%
                  </span>
                ) : "—"}
              </td>
              <td className="px-3 sm:px-4 py-3 text-slate-500 hidden sm:table-cell">{formatDate(app.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {applications.length === 0 && (
        <p className="text-center py-8 text-slate-500">No applications found.</p>
      )}
    </div>
  );
}
