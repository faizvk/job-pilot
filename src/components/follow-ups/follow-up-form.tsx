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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
            {FOLLOW_UP_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Draft (optional)</label>
        <textarea rows={4} value={form.emailDraft} onChange={(e) => setForm({ ...form, emailDraft: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" placeholder="Draft your follow-up email..." />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Create Follow-up</button>
        <button type="button" onClick={onCancel} className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
      </div>
    </form>
  );
}
