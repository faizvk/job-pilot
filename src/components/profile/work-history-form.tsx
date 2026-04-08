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
        <div key={w.id} className="border border-gray-200 rounded-xl p-4 flex justify-between card-hover">
          <div>
            <p className="font-semibold text-[14px] text-gray-900">{w.title}</p>
            <p className="text-sm text-gray-500">{w.company}</p>
            <p className="text-xs text-gray-400 mt-1">{formatDate(w.startDate)} — {w.current ? "Present" : w.endDate ? formatDate(w.endDate) : ""}</p>
            <p className="text-sm text-gray-600 mt-2 whitespace-pre-line leading-relaxed">{w.description}</p>
          </div>
          <button onClick={() => handleDelete(w.id)} className="text-gray-400 hover:text-red-500 self-start transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {adding ? (
        <form onSubmit={handleAdd} className="border border-gray-200 rounded-xl p-4 space-y-3 animate-scale-in">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" required />
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" required />
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" required />
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" disabled={form.current} />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.current} onChange={(e) => setForm({ ...form, current: e.target.checked })} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /> <span className="text-gray-600">Current position</span>
          </label>
          <textarea placeholder="Description — bullet points of what you did, achievements, technologies used" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" required />
          <div className="flex gap-2">
            <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-all active:scale-[0.98]">Add</button>
            <button type="button" onClick={() => setAdding(false)} className="border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 shadow-xs transition-all">Cancel</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          <Plus className="w-4 h-4" /> Add Work Experience
        </button>
      )}
    </div>
  );
}
