"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  variant: "success" | "error" | "info";
}

interface ToastContextType {
  addToast: (message: string, variant?: Toast["variant"]) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, variant: Toast["variant"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = icons[toast.variant];
          return (
            <div
              key={toast.id}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm shadow-elevated animate-slide-in min-w-[280px]",
                {
                  "bg-white border border-emerald-200 text-emerald-800": toast.variant === "success",
                  "bg-white border border-red-200 text-red-800": toast.variant === "error",
                  "bg-white border border-gray-200 text-gray-800": toast.variant === "info",
                }
              )}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", {
                "text-emerald-500": toast.variant === "success",
                "text-red-500": toast.variant === "error",
                "text-gray-400": toast.variant === "info",
              })} />
              <span className="flex-1">{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} className="ml-1 p-0.5 hover:opacity-60 transition-opacity">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
