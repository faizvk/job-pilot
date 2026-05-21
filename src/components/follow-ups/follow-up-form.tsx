"use client";

import { useState } from "react";
import { FOLLOW_UP_TYPES } from "@/lib/constants";

interface FollowUpFormProps {
  applicationId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function FollowUpForm({ applicationId, onSubmit, onCancel }: FollowUpFormProps) {
  const [form, setForm] = useState({
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    type: "follow_up",
    emailDraft: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, applicationId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Due Date</label>
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm shadow-xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 transition-colors duration-150" required />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm shadow-xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 transition-colors duration-150 cursor-pointer">
            {FOLLOW_UP_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Email Draft (optional)</label>
        <textarea rows={4} value={form.emailDraft} onChange={(e) => setForm({ ...form, emailDraft: e.target.value })} className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm resize-y shadow-xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 transition-colors duration-150" placeholder="Draft your follow-up email..." />
      </div>
      <div className="flex flex-col-reverse sm:flex-row gap-2">
        <button type="button" onClick={onCancel} className="border border-slate-200 px-4 py-2 rounded-md text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors duration-150">Cancel</button>
        <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 hover:shadow-sm transition-all duration-150 active:scale-[0.98]">Create Follow-up</button>
      </div>
    </form>
  );
}
