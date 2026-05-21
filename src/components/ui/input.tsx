"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 transition-colors duration-150 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
export { Input };
