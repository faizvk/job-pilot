"use client";

import { cn } from "@/lib/utils";
import { STATUS_CONFIG, type ApplicationStatus } from "@/lib/constants";

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as ApplicationStatus] || { label: status, color: "text-slate-600", bgColor: "bg-slate-50 ring-1 ring-inset ring-slate-500/10" };
  return (
    <span className={cn("inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-medium", config.color, config.bgColor)}>
      {config.label}
    </span>
  );
}
