"use client";

import { useState, useCallback } from "react";

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
    <div className="bg-white border rounded-lg p-4">
      <h3 className="font-medium mb-2">Notes</h3>
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        rows={12}
        className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Company culture notes, talking points, salary expectations..."
      />
    </div>
  );
}
