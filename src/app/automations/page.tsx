"use client";

import { useState } from "react";
import {
  Bot, Mail, Clock, MessageCircle, Calendar,
  Play, Loader2, CheckCircle, AlertCircle, Zap
} from "lucide-react";

interface AutomationResult {
  success: boolean;
  data: any;
  error?: string;
}

const automations = [
  {
    id: "gmail-scan",
    title: "Gmail Auto-Scan",
    description: "Scan inbox for interview invites, rejections, and offers — auto-updates application status",
    icon: Mail,
    iconBg: "from-red-500 to-rose-500",
    endpoint: "/api/automations/gmail-scan",
    resultKey: (data: any) =>
      data.updates?.length > 0
        ? `Found ${data.updates.length} update(s): ${data.updates.map((u: any) => `${u.company} → ${u.type}`).join(", ")}`
        : `Scanned ${data.scanned} application(s) — no new updates`,
  },
  {
    id: "auto-followups",
    title: "Auto Follow-ups",
    description: "Create follow-up reminders for applications with no response after 7 days",
    icon: Clock,
    iconBg: "from-amber-500 to-orange-500",
    endpoint: "/api/automations/auto-followups",
    resultKey: (data: any) =>
      data.created > 0
        ? `Created ${data.created} follow-up(s): ${data.applications.join(", ")}`
        : "All applications have follow-ups or are too recent",
  },
  {
    id: "daily-digest",
    title: "Daily Digest",
    description: "Send a Telegram summary with follow-ups, interviews, new jobs, and stale applications",
    icon: MessageCircle,
    iconBg: "from-blue-500 to-indigo-500",
    endpoint: "/api/automations/daily-digest",
    resultKey: (data: any) =>
      data.sent
        ? `Digest sent with ${data.sections.length} section(s): ${data.sections.join(", ") || "all clear"}`
        : "Telegram not connected — configure it in Profile → Integrations",
  },
  {
    id: "sync-interviews",
    title: "Sync Interviews → Calendar",
    description: "Create Google Calendar events for all applications in interview or phone screen stage",
    icon: Calendar,
    iconBg: "from-emerald-500 to-teal-500",
    endpoint: "/api/automations/sync-interviews",
    resultKey: (data: any) =>
      data.synced > 0
        ? `Created ${data.synced} calendar event(s): ${data.events.map((e: any) => e.company).join(", ")}`
        : "No new interviews to sync (already synced or none in pipeline)",
  },
];

export default function AutomationsPage() {
  const [results, setResults] = useState<Record<string, AutomationResult>>({});
  const [running, setRunning] = useState<Record<string, boolean>>({});
  const [runningAll, setRunningAll] = useState(false);

  const runAutomation = async (id: string, endpoint: string) => {
    setRunning((r) => ({ ...r, [id]: true }));
    try {
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setResults((r) => ({ ...r, [id]: { success: false, data: null, error: data.error } }));
      } else {
        setResults((r) => ({ ...r, [id]: { success: true, data } }));
      }
    } catch (e: any) {
      setResults((r) => ({ ...r, [id]: { success: false, data: null, error: e.message } }));
    }
    setRunning((r) => ({ ...r, [id]: false }));
  };

  const runAll = async () => {
    setRunningAll(true);
    try {
      const res = await fetch("/api/automations/run-all", { method: "POST" });
      const data = await res.json();
      if (data.error) {
        for (const a of automations) {
          setResults((r) => ({ ...r, [a.id]: { success: false, data: null, error: data.error } }));
        }
      } else {
        const map: Record<string, any> = {
          "gmail-scan": data.gmailScan,
          "auto-followups": data.followUps,
          "daily-digest": data.digest,
          "sync-interviews": data.calendarSync,
        };
        for (const a of automations) {
          const d = map[a.id];
          if (d) {
            setResults((r) => ({ ...r, [a.id]: { success: true, data: d } }));
          } else {
            setResults((r) => ({ ...r, [a.id]: { success: true, data: null, error: "Skipped (not configured)" } }));
          }
        }
      }
    } catch (e: any) {
      for (const a of automations) {
        setResults((r) => ({ ...r, [a.id]: { success: false, data: null, error: e.message } }));
      }
    }
    setRunningAll(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-600 p-6 text-white shadow-lg shadow-purple-500/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20viewBox%3D%220%200%2030%2030%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%221%22%20cy%3D%221%22%20r%3D%221%22%20fill%3D%22rgba(255%2C255%2C255%2C0.07)%22%2F%3E%3C%2Fsvg%3E')] pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bot className="w-5 h-5" />
              <h1 className="text-2xl font-bold tracking-tight">Automations</h1>
            </div>
            <p className="text-purple-100 text-sm">Let JobPilot handle the repetitive tasks. Run individually or all at once.</p>
          </div>
          <button
            onClick={runAll}
            disabled={runningAll}
            className="group inline-flex items-center gap-2 bg-white text-purple-600 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-black/10 hover:shadow-xl transition-all active:scale-[0.97] disabled:opacity-50"
          >
            {runningAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Run All
          </button>
        </div>
      </div>

      {/* Automation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
        {automations.map((auto) => {
          const Icon = auto.icon;
          const result = results[auto.id];
          const isRunning = running[auto.id] || runningAll;

          return (
            <div
              key={auto.id}
              className="bg-white rounded-2xl border border-slate-200/60 shadow-card p-5 card-hover space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${auto.iconBg} shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{auto.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{auto.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => runAutomation(auto.id, auto.endpoint)}
                  disabled={isRunning}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-[0.97]"
                >
                  {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  {isRunning ? "Running..." : "Run Now"}
                </button>

                {result && (
                  <div className="flex items-center gap-1.5">
                    {result.success ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    )}
                    <span className={`text-[11px] font-medium ${result.success ? "text-emerald-600" : "text-red-600"}`}>
                      {result.success ? "Done" : "Error"}
                    </span>
                  </div>
                )}
              </div>

              {/* Result details */}
              {result && (
                <div className={`text-xs rounded-xl p-3 ${
                  result.success
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                }`}>
                  {result.success && result.data
                    ? auto.resultKey(result.data)
                    : result.error || "No data returned"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60">
        <p className="text-xs text-slate-500 leading-relaxed">
          <strong className="text-slate-700">How it works:</strong> Each automation runs on demand when you click "Run Now" or "Run All".
          Gmail Scan checks your inbox for company replies and auto-updates application status.
          Auto Follow-ups creates reminders for applications with no response after 7 days.
          Daily Digest sends a summary to your Telegram.
          Interview Sync creates Google Calendar events for active interviews.
        </p>
      </div>
    </div>
  );
}
