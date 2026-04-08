"use client";

import Link from "next/link";
import { StatusBadge } from "./status-badge";
import { timeAgo } from "@/lib/utils";
import { MapPin } from "lucide-react";
import { CompanyLogo } from "@/components/ui/company-logo";

interface ApplicationCardProps {
  app: any;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

export function ApplicationCard({ app, draggable, onDragStart }: ApplicationCardProps) {
  return (
    <Link
      href={`/applications/${app.id}`}
      draggable={draggable}
      onDragStart={onDragStart}
      className="block bg-white rounded-xl border border-gray-200 p-4 card-hover cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <CompanyLogo companyName={app.companyName} size={36} className="flex-shrink-0 mt-0.5 shadow-xs" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-[14px] text-gray-900 truncate pr-2">{app.jobTitle}</h3>
            {app.matchScore != null && (
              <span className={`text-xs font-medium flex-shrink-0 ${app.matchScore >= 70 ? "text-emerald-600" : app.matchScore >= 40 ? "text-amber-600" : "text-red-500"}`}>
                {app.matchScore}%
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-1">{app.companyName}</p>
          {app.location && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
              <MapPin className="w-3 h-3" /> {app.location}
            </p>
          )}
          <div className="flex items-center justify-between">
            <StatusBadge status={app.status} />
            <span className="text-xs text-gray-400">{timeAgo(app.updatedAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
