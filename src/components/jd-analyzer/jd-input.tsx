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
        className="w-full border rounded-lg p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Paste the job description here..."
      />
      <button
        onClick={onAnalyze}
        disabled={value.length < 20 || loading}
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        <Search className="w-4 h-4" />
        {loading ? "Analyzing..." : "Analyze"}
      </button>
    </div>
  );
}
