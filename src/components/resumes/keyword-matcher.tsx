"use client";

import { Check, X } from "lucide-react";

export function KeywordMatcher({ matched, missing }: { matched: string[]; missing: string[] }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="font-medium mb-3">Keyword Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-green-600 font-medium mb-2 flex items-center gap-1">
            <Check className="w-4 h-4" /> Matched ({matched.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {matched.map((kw) => (
              <span key={kw} className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{kw}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm text-red-600 font-medium mb-2 flex items-center gap-1">
            <X className="w-4 h-4" /> Missing ({missing.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((kw) => (
              <span key={kw} className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">{kw}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
