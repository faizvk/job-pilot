"use client";

import Link from "next/link";
import { StatusBadge } from "./status-badge";
import { formatSalary, timeAgo } from "@/lib/utils";
import { MapPin, Building2 } from "lucide-react";

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
      className="block bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-sm truncate pr-2">{app.jobTitle}</h3>
        {app.matchScore != null && (
          <span className={`text-xs font-medium ${app.matchScore >= 70 ? "text-green-600" : app.matchScore >= 40 ? "text-yellow-600" : "text-red-600"}`}>
            {app.matchScore}%
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
        <Building2 className="w-3 h-3" /> {app.companyName}
      </p>
      {app.location && (
        <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
          <MapPin className="w-3 h-3" /> {app.location}
        </p>
      )}
      <div className="flex items-center justify-between">
        <StatusBadge status={app.status} />
        <span className="text-xs text-gray-400">{timeAgo(app.updatedAt)}</span>
      </div>
    </Link>
  );
}
