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
        <div key={e.id} className="border rounded-lg p-4 flex justify-between">
          <div>
            <p className="font-medium">{e.degree} in {e.field}</p>
            <p className="text-sm text-gray-500">{e.institution}</p>
            <p className="text-xs text-gray-400">{formatDate(e.startDate)} — {e.endDate ? formatDate(e.endDate) : "Present"}</p>
            {e.gpa && <p className="text-xs text-gray-400">GPA: {e.gpa}</p>}
          </div>
          <button onClick={() => handleDelete(e.id)} className="text-red-500 hover:text-red-700 self-start">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {adding ? (
        <form onSubmit={handleAdd} className="border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Institution" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" required />
            <input placeholder="Degree" value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" required />
            <input placeholder="Field of Study" value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" required />
            <input placeholder="GPA (optional)" value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" required />
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm">Add</button>
            <button type="button" onClick={() => setAdding(false)} className="border px-3 py-1.5 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
          <Plus className="w-4 h-4" /> Add Education
        </button>
      )}
    </div>
  );
}
