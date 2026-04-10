"use client";

import { useState } from "react";
import { APPLICATION_STATUSES, STATUS_CONFIG, WORK_TYPES } from "@/lib/constants";

interface ApplicationFormProps {
  onSubmit: (data: any) => void;
  defaultValues?: any;
}

export function ApplicationForm({ onSubmit, defaultValues }: ApplicationFormProps) {
  const [form, setForm] = useState({
    companyName: defaultValues?.companyName || "",
    jobTitle: defaultValues?.jobTitle || "",
    jobUrl: defaultValues?.jobUrl || "",
    jobDescription: defaultValues?.jobDescription || "",
    status: defaultValues?.status || "saved",
    salaryMin: defaultValues?.salaryMin || "",
    salaryMax: defaultValues?.salaryMax || "",
    location: defaultValues?.location || "",
    workType: defaultValues?.workType || "",
    contactName: defaultValues?.contactName || "",
    contactEmail: defaultValues?.contactEmail || "",
    notes: defaultValues?.notes || "",
    deadline: defaultValues?.deadline ? new Date(defaultValues.deadline).toISOString().split("T")[0] : "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      salaryMin: form.salaryMin ? parseInt(form.salaryMin) : null,
      salaryMax: form.salaryMax ? parseInt(form.salaryMax) : null,
      deadline: form.deadline || null,
    });
  };

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
          <input
            type="text" required value={form.companyName} onChange={(e) => update("companyName", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
          <input
            type="text" required value={form.jobTitle} onChange={(e) => update("jobTitle", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Job URL</label>
        <input
          type="url" value={form.jobUrl} onChange={(e) => update("jobUrl", e.target.value)}
          className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select
            value={form.status} onChange={(e) => update("status", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
          <input
            type="text" value={form.location} onChange={(e) => update("location", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Work Type</label>
          <select
            value={form.workType} onChange={(e) => update("workType", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select...</option>
            {WORK_TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Salary Min</label>
          <input
            type="number" value={form.salaryMin} onChange={(e) => update("salaryMin", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Salary Max</label>
          <input
            type="number" value={form.salaryMax} onChange={(e) => update("salaryMax", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
          <input
            type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Contact Name</label>
          <input
            type="text" value={form.contactName} onChange={(e) => update("contactName", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
          <input
            type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Job Description</label>
        <textarea
          rows={6} value={form.jobDescription} onChange={(e) => update("jobDescription", e.target.value)}
          className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
          placeholder="Paste the full job description..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
        <textarea
          rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)}
          className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50"
        >
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          {defaultValues ? "Update" : "Save Application"}
        </button>
      </div>
    </form>
  );
}
