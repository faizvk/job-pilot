"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { SKILL_CATEGORIES, SKILL_LEVELS } from "@/lib/constants";

export function SkillsManager({ skills, onRefresh }: { skills: any[]; onRefresh: () => void }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", category: "technical", level: "intermediate" });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/profile/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", category: "technical", level: "intermediate" });
    setAdding(false);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/profile/skills/${id}`, { method: "DELETE" });
    onRefresh();
  };

  const grouped = SKILL_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = skills.filter((s) => s.category === cat);
    return acc;
  }, {} as Record<string, any[]>);

  const categoryColors: Record<string, string> = {
    technical: "bg-blue-100 text-blue-700",
    soft: "bg-purple-100 text-purple-700",
    language: "bg-amber-100 text-amber-700",
    tool: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      {SKILL_CATEGORIES.map((cat) => (
        <div key={cat}>
          <h3 className="text-sm font-medium text-gray-700 mb-2 capitalize">{cat} Skills</h3>
          <div className="flex flex-wrap gap-2">
            {grouped[cat]?.map((skill) => (
              <span key={skill.id} className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${categoryColors[cat]}`}>
                {skill.name}
                <button onClick={() => handleDelete(skill.id)} className="hover:opacity-70">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {(!grouped[cat] || grouped[cat].length === 0) && (
              <span className="text-xs text-gray-400">No skills added</span>
            )}
          </div>
        </div>
      ))}

      {adding ? (
        <form onSubmit={handleAdd} className="flex items-end gap-2 border rounded-lg p-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Skill</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border rounded-lg px-2 py-1.5 text-sm w-40" required />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border rounded-lg px-2 py-1.5 text-sm">
              {SKILL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Level</label>
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="border rounded-lg px-2 py-1.5 text-sm">
              {SKILL_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm">Add</button>
          <button type="button" onClick={() => setAdding(false)} className="border px-3 py-1.5 rounded-lg text-sm">Cancel</button>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
          <Plus className="w-4 h-4" /> Add Skill
        </button>
      )}
    </div>
  );
}
