"use client";

import { Search } from "lucide-react";

interface JdInputProps {
  value: string;
  onChange: (v: string) => void;
  onAnalyze: () => void;
  loading?: boolean;
}

export function JdInput({ value, onChange, onAnalyze, loading }: JdInputProps) {
  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={10}
        className="w-full border border-slate-200 rounded-md p-3 sm:p-4 text-sm resize-y shadow-xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 transition-colors duration-150"
        placeholder="Paste the job description here..."
      />
      <button
        onClick={onAnalyze}
        disabled={value.length < 20 || loading}
        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 hover:shadow-sm transition-all duration-150 disabled:opacity-50 active:scale-[0.98]"
      >
        <Search className="w-4 h-4" />
        {loading ? "Analyzing..." : "Analyze"}
      </button>
    </div>
  );
}
