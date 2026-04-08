"use client";

import { useState } from "react";
import { Plus, X, Zap } from "lucide-react";
import { SKILL_CATEGORIES, SKILL_LEVELS } from "@/lib/constants";

export function SkillsManager({ skills, onRefresh }: { skills: any[]; onRefresh: () => void }) {
  const [adding, setAdding] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [form, setForm] = useState({ name: "", category: "technical", level: "intermediate" });
  const [bulkText, setBulkText] = useState("");
  const [bulkCategory, setBulkCategory] = useState("technical");
  const [bulkLevel, setBulkLevel] = useState("intermediate");
  const [bulkLoading, setBulkLoading] = useState(false);

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

  const handleBulkAdd = async () => {
    const names = bulkText
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (names.length === 0) return;

    setBulkLoading(true);
    const existingNames = new Set(skills.map((s) => s.name.toLowerCase()));

    for (const name of names) {
      if (existingNames.has(name.toLowerCase())) continue;
      await fetch("/api/profile/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category: bulkCategory, level: bulkLevel }),
      });
    }

    setBulkText("");
    setBulkMode(false);
    setBulkLoading(false);
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
    technical: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/10",
    soft: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/10",
    language: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10",
    tool: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10",
  };

  return (
    <div className="space-y-6">
      {SKILL_CATEGORIES.map((cat) => (
        <div key={cat}>
          <h3 className="text-[13px] font-semibold text-gray-700 mb-2 capitalize">{cat} Skills</h3>
          <div className="flex flex-wrap gap-1.5">
            {grouped[cat]?.map((skill) => (
              <span key={skill.id} className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md ${categoryColors[cat]}`}>
                {skill.name}
                <button onClick={() => handleDelete(skill.id)} className="hover:opacity-60 transition-opacity">
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

      <div className="flex items-center gap-3 pt-2">
        {/* Bulk add */}
        {bulkMode ? (
          <div className="flex-1 border border-gray-200 rounded-xl p-4 space-y-3 animate-scale-in">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-gray-800">Bulk Add Skills</p>
              <button onClick={() => setBulkMode(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={3}
              placeholder="Paste skills separated by commas or new lines:&#10;JavaScript, React, Node.js, TypeScript, Python, Git, Docker..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none transition-all"
            />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Category:</label>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-xs shadow-xs"
                >
                  {SKILL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Level:</label>
                <select
                  value={bulkLevel}
                  onChange={(e) => setBulkLevel(e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-xs shadow-xs"
                >
                  {SKILL_LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1" />
              {bulkText && (
                <span className="text-xs text-gray-400">
                  {bulkText.split(/[,\n]/).filter((s) => s.trim()).length} skills
                </span>
              )}
              <button
                onClick={handleBulkAdd}
                disabled={!bulkText.trim() || bulkLoading}
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition-all active:scale-[0.98]"
              >
                {bulkLoading ? "Adding..." : "Add All"}
              </button>
            </div>
          </div>
        ) : adding ? (
          <form onSubmit={handleAdd} className="flex items-end gap-2 border border-gray-200 rounded-xl p-3 animate-scale-in">
            <div>
              <label className="block text-[11px] text-gray-500 mb-1 font-medium">Skill</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm w-40 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1 font-medium">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm shadow-xs"
              >
                {SKILL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1 font-medium">Level</label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm shadow-xs"
              >
                {SKILL_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-all">Add</button>
            <button type="button" onClick={() => setAdding(false)} className="border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 shadow-xs transition-all">Cancel</button>
          </form>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBulkMode(true)}
              className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <Zap className="w-4 h-4" /> Bulk Add Skills
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
            >
              <Plus className="w-4 h-4" /> Add One
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
