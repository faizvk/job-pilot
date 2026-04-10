"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function EducationForm({ education, onRefresh }: { education: any[]; onRefresh: () => void }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ institution: "", degree: "", field: "", startDate: "", endDate: "", gpa: "" });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/profile/education", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ institution: "", degree: "", field: "", startDate: "", endDate: "", gpa: "" });
    setAdding(false);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/profile/education/${id}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {education.map((e) => (
        <div key={e.id} className="border border-slate-200 rounded-xl p-4 flex justify-between card-hover">
          <div>
            <p className="font-semibold text-[14px] text-slate-900">{e.degree} in {e.field}</p>
            <p className="text-sm text-slate-500">{e.institution}</p>
            <p className="text-xs text-slate-400 mt-1">{formatDate(e.startDate)} — {e.endDate ? formatDate(e.endDate) : "Present"}</p>
            {e.gpa && <p className="text-xs text-slate-400 mt-0.5">GPA: {e.gpa}</p>}
          </div>
          <button onClick={() => handleDelete(e.id)} className="text-slate-400 hover:text-red-500 self-start transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {adding ? (
        <form onSubmit={handleAdd} className="border border-slate-200 rounded-xl p-4 space-y-3 animate-scale-in">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Institution" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} className="border border-slate-200 rounded-xl px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" required />
            <input placeholder="Degree (e.g. B.Tech)" value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} className="border border-slate-200 rounded-xl px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" required />
            <input placeholder="Field of Study (e.g. Computer Science)" value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })} className="border border-slate-200 rounded-xl px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" required />
            <input placeholder="GPA (optional)" value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} className="border border-slate-200 rounded-xl px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="border border-slate-200 rounded-xl px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" required />
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="border border-slate-200 rounded-xl px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm transition-all active:scale-[0.98]">Add</button>
            <button type="button" onClick={() => setAdding(false)} className="border border-slate-200 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 shadow-xs transition-all">Cancel</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          <Plus className="w-4 h-4" /> Add Education
        </button>
      )}
    </div>
  );
}
