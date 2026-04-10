"use client";

import { useEffect, useState } from "react";
import { FollowUpList } from "@/components/follow-ups/follow-up-list";
import { Bell, Plus, X } from "lucide-react";

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ applicationId: "", type: "follow_up", dueDate: "" });
  const [createLoading, setCreateLoading] = useState(false);

  const fetchFollowUps = () => {
    fetch(`/api/follow-ups?status=${filter}`)
      .then((r) => r.json())
      .then(setFollowUps)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFollowUps();
  }, [filter]);

  useEffect(() => {
    if (creating && applications.length === 0) {
      fetch("/api/applications")
        .then((r) => r.json())
        .then(setApplications)
        .catch(console.error);
    }
  }, [creating]);

  const handleMarkSent = async (id: string) => {
    await fetch(`/api/follow-ups/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "sent" }),
    });
    fetchFollowUps();
  };

  const handleCreate = async () => {
    if (!createForm.applicationId || !createForm.dueDate) return;
    setCreateLoading(true);
    await fetch("/api/follow-ups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...createForm, autoDraft: true }),
    });
    setCreating(false);
    setCreateForm({ applicationId: "", type: "follow_up", dueDate: "" });
    setCreateLoading(false);
    fetchFollowUps();
  };

  // Default due date: 1 week from now
  const defaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  };

  const overdue = followUps.filter((fu) => new Date(fu.dueDate) < new Date() && fu.status === "pending");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Follow-ups</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {overdue.length > 0 ? (
              <span className="text-red-500 font-medium">{overdue.length} overdue</span>
            ) : (
              "Track your follow-up emails"
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5 bg-slate-100 p-0.5 rounded-lg">
            {["pending", "sent", "all"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs rounded-md capitalize transition-all ${
                  filter === f
                    ? "bg-white shadow-sm font-semibold text-slate-900"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setCreating(true); if (!createForm.dueDate) setCreateForm((f) => ({ ...f, dueDate: defaultDueDate() })); }}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> New Follow-up
          </button>
        </div>
      </div>

      {creating && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[14px] text-slate-900">Create Follow-up</h3>
            <button onClick={() => setCreating(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Application</label>
              <select
                value={createForm.applicationId}
                onChange={(e) => setCreateForm({ ...createForm, applicationId: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              >
                <option value="">Select application...</option>
                {applications.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.companyName} — {a.jobTitle}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Type</label>
              <select
                value={createForm.type}
                onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              >
                <option value="follow_up">Follow Up</option>
                <option value="thank_you">Thank You</option>
                <option value="check_in">Check In</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Due Date</label>
              <input
                type="date"
                value={createForm.dueDate}
                onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">An email draft will be auto-generated based on the follow-up type.</p>
          <div className="flex justify-end mt-4 gap-2">
            <button
              onClick={() => setCreating(false)}
              className="border border-slate-200 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 shadow-xs transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!createForm.applicationId || !createForm.dueDate || createLoading}
              className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition-all active:scale-[0.98]"
            >
              {createLoading ? "Creating..." : "Create with Draft"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white border border-slate-200 rounded-xl animate-shimmer" />
          ))}
        </div>
      ) : followUps.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Bell className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">No follow-ups found</p>
          <p className="text-sm text-slate-400 mt-1">Create one to stay on top of your applications</p>
        </div>
      ) : (
        <FollowUpList followUps={followUps} onMarkSent={handleMarkSent} />
      )}
    </div>
  );
}
