"use client";

import { useState } from "react";

export function PersonalInfoForm({ profile, onSave }: { profile: any; onSave: (data: any) => void }) {
  const [form, setForm] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    location: profile?.location || "",
    linkedin: profile?.linkedin || "",
    github: profile?.github || "",
    portfolio: profile?.portfolio || "",
    summary: profile?.summary || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Full Name</label>
          <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Faiz Zubair" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Email</label>
          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@email.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Phone</label>
          <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98765 43210" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Location</label>
          <input type="text" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Kerala, India" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1.5">LinkedIn</label>
          <input type="text" value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} placeholder="linkedin.com/in/yourname" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1.5">GitHub</label>
          <input type="text" value={form.github} onChange={(e) => update("github", e.target.value)} placeholder="github.com/yourname" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
        </div>
      </div>
      <div>
        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Portfolio URL</label>
        <input type="text" value={form.portfolio} onChange={(e) => update("portfolio", e.target.value)} placeholder="yourportfolio.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Professional Summary</label>
        <textarea rows={4} value={form.summary} onChange={(e) => update("summary", e.target.value)} placeholder="Junior Software Engineer with experience in JavaScript, React, and Node.js. Currently working at Synup..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-[0.98]"
      >
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
