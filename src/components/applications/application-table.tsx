"use client";

import Link from "next/link";
import { StatusBadge } from "./status-badge";
import { formatDate, formatSalary } from "@/lib/utils";

export function ApplicationTable({ applications }: { applications: any[] }) {
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Company</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Location</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Salary</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Match</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {applications.map((app) => (
            <tr key={app.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <Link href={`/applications/${app.id}`} className="font-medium text-blue-600 hover:underline">
                  {app.companyName}
                </Link>
              </td>
              <td className="px-4 py-3">{app.jobTitle}</td>
              <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
              <td className="px-4 py-3 text-gray-500">{app.location || "—"}</td>
              <td className="px-4 py-3 text-gray-500">{formatSalary(app.salaryMin, app.salaryMax)}</td>
              <td className="px-4 py-3">
                {app.matchScore != null ? (
                  <span className={app.matchScore >= 70 ? "text-green-600" : app.matchScore >= 40 ? "text-yellow-600" : "text-red-600"}>
                    {app.matchScore}%
                  </span>
                ) : "—"}
              </td>
              <td className="px-4 py-3 text-gray-500">{formatDate(app.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {applications.length === 0 && (
        <p className="text-center py-8 text-gray-500">No applications found.</p>
      )}
    </div>
  );
}
