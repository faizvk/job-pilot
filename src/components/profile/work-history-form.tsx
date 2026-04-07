"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function WorkHistoryForm({ workHistory, onRefresh }: { workHistory: any[]; onRefresh: () => void }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ company: "", title: "", startDate: "", endDate: "", current: false, description: "" });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/profile/work-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ company: "", title: "", startDate: "", endDate: "", current: false, description: "" });
    setAdding(false);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/profile/work-history/${id}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {workHistory.map((w) => (
        <div key={w.id} className="border rounded-lg p-4 flex justify-between">
          <div>
            <p className="font-medium">{w.title}</p>
            <p className="text-sm text-gray-500">{w.company}</p>
            <p className="text-xs text-gray-400">{formatDate(w.startDate)} — {w.current ? "Present" : w.endDate ? formatDate(w.endDate) : ""}</p>
            <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{w.description}</p>
          </div>
          <button onClick={() => handleDelete(w.id)} className="text-red-500 hover:text-red-700 self-start">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {adding ? (
        <form onSubmit={handleAdd} className="border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" required />
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" required />
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" required />
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" disabled={form.current} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.current} onChange={(e) => setForm({ ...form, current: e.target.checked })} /> Current position
          </label>
          <textarea placeholder="Description (bullet points)" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" required />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm">Add</button>
            <button type="button" onClick={() => setAdding(false)} className="border px-3 py-1.5 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
          <Plus className="w-4 h-4" /> Add Work Experience
        </button>
      )}
    </div>
  );
}
