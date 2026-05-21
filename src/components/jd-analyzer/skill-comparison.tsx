"use client";

import { Check, X } from "lucide-react";

export function SkillComparison({ matched, missing }: { matched: string[]; missing: string[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      <div className="bg-emerald-50/60 border border-emerald-200/50 rounded-xl p-4 transition-all duration-150 hover:border-emerald-300 hover:bg-emerald-50">
        <h4 className="text-sm font-semibold text-emerald-700 mb-2">Skills You Have ({matched.length})</h4>
        <div className="space-y-1">
          {matched.map((s) => (
            <div key={s} className="flex items-center gap-2 text-sm text-slate-700 hover:translate-x-0.5 transition-transform duration-100">
              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> {s}
            </div>
          ))}
          {matched.length === 0 && <p className="text-sm text-slate-400">None matched</p>}
        </div>
      </div>
      <div className="bg-rose-50/60 border border-rose-200/50 rounded-xl p-4 transition-all duration-150 hover:border-rose-300 hover:bg-rose-50">
        <h4 className="text-sm font-semibold text-rose-700 mb-2">Skills to Add ({missing.length})</h4>
        <div className="space-y-1">
          {missing.map((s) => (
            <div key={s} className="flex items-center gap-2 text-sm text-slate-700 hover:translate-x-0.5 transition-transform duration-100">
              <X className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" /> {s}
            </div>
          ))}
          {missing.length === 0 && <p className="text-sm text-slate-400">All matched!</p>}
        </div>
      </div>
    </div>
  );
}
