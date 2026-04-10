"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
          {
            "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm shadow-indigo-600/20 hover:shadow-md hover:shadow-indigo-600/25 hover:from-indigo-500 hover:to-indigo-600": variant === "default",
            "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-sm hover:shadow-md": variant === "destructive",
            "border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300": variant === "outline",
            "bg-slate-100 text-slate-700 hover:bg-slate-200/80": variant === "secondary",
            "text-slate-600 hover:bg-slate-100 hover:text-slate-900": variant === "ghost",
            "text-indigo-600 underline-offset-4 hover:underline": variant === "link",
          },
          {
            "h-10 px-4 py-2 text-sm": size === "default",
            "h-8 px-3 text-xs gap-1.5": size === "sm",
            "h-12 px-6 text-base": size === "lg",
            "h-9 w-9": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
export { Button };
