"use client";

import { useEffect, useState } from "react";
import { BellRing, Plus, Play, Trash2, Loader2, Clock, MapPin } from "lucide-react";

interface JobAlert {
  id: string;
  name: string;
  keywords: string;
  location: string | null;
  frequency: string;
  isActive: boolean;
  lastRunAt: string | null;
  newJobCount: number;
}

export default function JobAlertsPage() {
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [runningAll, setRunningAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", keywords: "", location: "", frequency: "daily" });

  const fetchAlerts = async () => {
    const res = await fetch("/api/job-alerts");
    const data = await res.json();
    if (Array.isArray(data)) setAlerts(data);
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.keywords) return;
    setCreating(true);
    await fetch("/api/job-alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", keywords: "", location: "", frequency: "daily" });
    setShowForm(false);
    setCreating(false);
    fetchAlerts();
  };

  const handleRun = async (id: string) => {
    setRunningId(id);
    await fetch(`/api/job-alerts/${id}/run`, { method: "POST" });
    setRunningId(null);
    fetchAlerts();
  };

  const handleRunAll = async () => {
    setRunningAll(true);
    await fetch("/api/job-alerts/run-due", { method: "POST" });
    setRunningAll(false);
    fetchAlerts();
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    await fetch(`/api/job-alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchAlerts();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/job-alerts/${id}`, { method: "DELETE" });
    fetchAlerts();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BellRing className="w-5 h-5 text-indigo-500" />
            Job Alerts
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Automated job searches with notifications</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunAll}
            disabled={runningAll || alerts.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
          >
            {runningAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Run All Due
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            New Alert
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Create Job Alert</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Alert name (e.g. React Jobs)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="col-span-2 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
            <input
              placeholder="Keywords (comma-separated: react, frontend, javascript)"
              value={form.keywords}
              onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              className="col-span-2 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
            <input
              placeholder="Location (optional)"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
            <select
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700">
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !form.name || !form.keywords}
              className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Create Alert
            </button>
          </div>
        </div>
      )}

      {/* Alerts List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
          <BellRing className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No job alerts yet</p>
          <p className="text-xs text-slate-400 mt-1">Create one to start getting notified about new jobs</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className={`bg-white border rounded-xl p-4 flex items-center justify-between transition-all ${alert.isActive ? "border-slate-200" : "border-slate-100 opacity-60"}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">{alert.name}</h3>
                  {alert.newJobCount > 0 && (
                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {alert.newJobCount} new
                    </span>
                  )}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${alert.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                    {alert.isActive ? "Active" : "Paused"}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span>{alert.keywords}</span>
                  {alert.location && (
                    <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{alert.location}</span>
                  )}
                  <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{alert.frequency}</span>
                  {alert.lastRunAt && (
                    <span>Last: {new Date(alert.lastRunAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleRun(alert.id)}
                  disabled={runningId === alert.id}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-all"
                  title="Run now"
                >
                  {runningId === alert.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleToggle(alert.id, alert.isActive)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${alert.isActive ? "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-600" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}
                >
                  {alert.isActive ? "Pause" : "Resume"}
                </button>
                <button
                  onClick={() => handleDelete(alert.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
