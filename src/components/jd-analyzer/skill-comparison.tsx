"use client";

import { Check, X } from "lucide-react";

export function SkillComparison({ matched, missing }: { matched: string[]; missing: string[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-green-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-green-700 mb-2">Skills You Have ({matched.length})</h4>
        <div className="space-y-1">
          {matched.map((s) => (
            <div key={s} className="flex items-center gap-2 text-sm">
              <Check className="w-3.5 h-3.5 text-green-600" /> {s}
            </div>
          ))}
          {matched.length === 0 && <p className="text-sm text-gray-400">None matched</p>}
        </div>
      </div>
      <div className="bg-red-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-red-700 mb-2">Skills to Add ({missing.length})</h4>
        <div className="space-y-1">
          {missing.map((s) => (
            <div key={s} className="flex items-center gap-2 text-sm">
              <X className="w-3.5 h-3.5 text-red-500" /> {s}
            </div>
          ))}
          {missing.length === 0 && <p className="text-sm text-gray-400">All matched!</p>}
        </div>
      </div>
    </div>
  );
}
