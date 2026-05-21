"use client";

import { useState, useCallback } from "react";
import { FileText } from "lucide-react";

export function PrepNotesEditor({ notes, onChange }: { notes: string; onChange: (v: string) => void }) {
  const [value, setValue] = useState(notes);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    if (timer) clearTimeout(timer);
    const t = setTimeout(() => onChange(newValue), 1000);
    setTimer(t);
  }, [onChange, timer]);

  return (
    <div className="bg-white border border-slate-200/70 rounded-xl p-4 sm:p-5 shadow-xs transition-shadow duration-200 hover:shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-emerald-50 rounded-md flex items-center justify-center">
          <FileText className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <h3 className="font-semibold text-[14px] text-slate-900">Notes</h3>
      </div>
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        rows={10}
        className="w-full border border-slate-200 rounded-md p-3 text-sm resize-y shadow-xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 transition-colors duration-150"
        placeholder="Talking points, salary expectations, company culture notes, questions to ask the interviewer..."
      />
    </div>
  );
}
