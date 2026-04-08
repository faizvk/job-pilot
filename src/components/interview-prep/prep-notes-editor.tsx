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
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">
          <FileText className="w-3.5 h-3.5 text-indigo-600" />
        </div>
        <h3 className="font-semibold text-[14px] text-gray-900">Notes</h3>
      </div>
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        rows={10}
        className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
        placeholder="Talking points, salary expectations, company culture notes, questions to ask the interviewer..."
      />
    </div>
  );
}
