import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
}

export function Progress({ value, max = 100, className, indicatorClassName }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className={cn("h-2 w-full rounded-full bg-gray-200 overflow-hidden", className)}>
      <div
        className={cn("h-full rounded-full bg-blue-600 transition-all duration-300", indicatorClassName)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
