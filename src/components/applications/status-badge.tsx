"use client";

import { cn } from "@/lib/utils";
import { STATUS_CONFIG, type ApplicationStatus } from "@/lib/constants";

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as ApplicationStatus] || { label: status, color: "text-gray-700", bgColor: "bg-gray-100" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", config.color, config.bgColor)}>
      {config.label}
    </span>
  );
}
