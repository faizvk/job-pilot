import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium leading-5",
        {
          "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/10": variant === "default",
          "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10": variant === "secondary",
          "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10": variant === "destructive",
          "border border-gray-200 text-gray-600": variant === "outline",
          "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10": variant === "success",
        },
        className
      )}
      {...props}
    />
  );
}
