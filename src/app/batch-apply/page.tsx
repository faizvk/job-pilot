"use client";

import { useState, useEffect, useCallback } from "react";
import { Zap, Upload, CheckCircle, Loader2, Trash2, ChevronDown, ChevronUp, ExternalLink, Clock, Flame } from "lucide-react";

interface JobEntry {
  id: string;
  companyName: string;
  jobTitle: string;
  jobUrl: string;
  jobDescription: string;
  location: string;
  workType: string;
  platform: string;
  status: "pending" | "importing" | "imported" | "tailoring" | "tailored" | "applied" | "error";
  appId?: string;
  matchScore?: number;
  error?: string;
  expanded?: boolean;
}

interface DailyStats {
  todayCount: number;
  todayApplied: number;
  currentStreak: number;
  totalLast30Days: number;
  avgPerDay: number;
}

export default function BatchApplyPage() {
  const [jobs, setJobs] = useState<JobEntry[]>([]);
  const [bulkText, setBulkText] = useState("");
  const [showBulkInput, setShowBulkInput] = useState(true);
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [autoTailor, setAutoTailor] = useState(true);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    fetch("/api/resumes").then((r) => r.json()).then((data) => {
      setResumes(data);
      const base = data.find((r: any) => r.isBase) || data[0];
      if (base) setSelectedResumeId(base.id);
    });
    fetch("/api/batch/daily-stats").then((r) => r.json()).then(setDailyStats);
  }, []);

  const parseBulkJobs = useCallback(() => {
    if (!bulkText.trim()) return;
    const blocks = bulkText.split(/\n{3,}|---+/).filter((b) => b.trim());
    const newJobs: JobEntry[] = blocks.map((block, i) => {
      const lines = block.trim().split("\n").filter((l) => l.trim());
      const pipeFormat = lines[0]?.includes("|");
      if (pipeFormat) {
        const parts = lines[0].split("|").map((p) => p.trim());
        return {
          id: `job-${Date.now()}-${i}`,
          companyName: parts[0] || "",
          jobTitle: parts[1] || "",
          jobUrl: parts[2] || "",
          location: parts[3] || "",
          workType: "",
          platform: detectPlatform(parts[2] || ""),
          jobDescription: lines.slice(1).join("\n").trim(),
          status: "pending" as const,
        };
      }
      const urlLine = lines.find((l) => l.trim().startsWith("http"));
      const nonUrlLines = lines.filter((l) => !l.trim().startsWith("http"));
      return {
        id: `job-${Date.now()}-${i}`,
        companyName: nonUrlLines[1]?.trim() || "",
        jobTitle: nonUrlLines[0]?.trim() || "",
        jobUrl: urlLine?.trim() || "",
        location: "",
        workType: "",
        platform: detectPlatform(urlLine || ""),
        jobDescription: nonUrlLines.slice(2).join("\n").trim(),
        status: "pending" as const,
      };
    });
    setJobs((prev) => [...prev, ...newJobs]);
    setBulkText("");
    setShowBulkInput(false);
  }, [bulkText]);

  const detectPlatform = (url: string): string => {
    if (url.includes("linkedin")) return "LinkedIn";
    if (url.includes("indeed")) return "Indeed";
    if (url.includes("glassdoor")) return "Glassdoor";
    if (url.includes("ziprecruiter")) return "ZipRecruiter";
    if (url.includes("dice")) return "Dice";
    if (url.includes("lever.co")) return "Lever";
    if (url.includes("greenhouse")) return "Greenhouse";
    return "";
  };

  const addJob = () => {
    setJobs((prev) => [
      ...prev,
      {
        id: `job-${Date.now()}`,
        companyName: "",
        jobTitle: "",
        jobUrl: "",
        jobDescription: "",
        location: "",
        workType: "",
        platform: "",
        status: "pending",
      },
    ]);
  };

  const updateJob = (id: string, updates: Partial<JobEntry>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));
  };

  const removeJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    setSelectedJobs((prev) => { const next = new Set(prev); next.delete(id); return next; });
  };

  const toggleSelect = (id: string) => {
    setSelectedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedJobs.size === jobs.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(jobs.map((j) => j.id)));
    }
  };

  const handleBatchImport = async () => {
    const jobsToImport = jobs.filter((j) => j.status === "pending" && j.companyName && j.jobTitle);
    if (jobsToImport.length === 0) return;
    setProcessing(true);
    if (!startTime) setStartTime(Date.now());
    for (const job of jobsToImport) {
      updateJob(job.id, { status: "importing" });
    }
    try {
      const res = await fetch("/api/batch/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobs: jobsToImport.map((j) => ({
            companyName: j.companyName,
            jobTitle: j.jobTitle,
            jobUrl: j.jobUrl,
            jobDescription: j.jobDescription,
            location: j.location,
            workType: j.workType,
            platform: j.platform,
          })),
          autoAnalyze,
          autoTailor,
          baseResumeId: selectedResumeId,
        }),
      });
      const result = await res.json();
      result.applications?.forEach((app: any, i: number) => {
        const job = jobsToImport[i];
        if (job) {
          updateJob(job.id, {
            status: autoTailor ? "tailored" : "imported",
            appId: app.id,
            matchScore: app.matchScore,
          });
        }
      });
      result.errors?.forEach((err: string) => {
        const match = err.match(/^(.+?) - (.+?):/);
        if (match) {
          const job = jobsToImport.find((j) => j.companyName === match[1]);
          if (job) updateJob(job.id, { status: "error", error: err });
        }
      });
      fetch("/api/batch/daily-stats").then((r) => r.json()).then(setDailyStats);
    } catch (err: any) {
      jobsToImport.forEach((j) => updateJob(j.id, { status: "error", error: err.message }));
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkMarkApplied = async () => {
    const ids = jobs.filter((j) => selectedJobs.has(j.id) && j.appId).map((j) => j.appId!);
    if (ids.length === 0) return;
    await fetch("/api/batch/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationIds: ids, status: "applied" }),
    });
    jobs.forEach((j) => {
      if (selectedJobs.has(j.id) && j.appId) {
        updateJob(j.id, { status: "applied" });
      }
    });
    fetch("/api/batch/daily-stats").then((r) => r.json()).then(setDailyStats);
    setSelectedJobs(new Set());
  };

  const importedCount = jobs.filter((j) => ["imported", "tailored", "applied"].includes(j.status)).length;
  const appliedCount = jobs.filter((j) => j.status === "applied").length;
  const pendingCount = jobs.filter((j) => j.status === "pending").length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Batch Apply</h1>
          <p className="text-sm text-slate-500 mt-0.5">Import jobs, auto-tailor resumes, track everything</p>
        </div>
        {startTime && (
          <div className="text-right bg-white border border-slate-200/80 rounded-xl shadow-card px-4 py-2.5">
            <div className="flex items-center gap-2 text-lg font-mono font-bold text-indigo-600">
              <Clock className="w-4 h-4" />
              {formatTime(elapsedTime)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{importedCount} imported, {appliedCount} applied</p>
          </div>
        )}
      </div>

      {/* Daily Stats */}
      {dailyStats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Today", value: dailyStats.todayCount, color: "text-indigo-600", accent: "border-l-indigo-400" },
            { label: "Applied Today", value: dailyStats.todayApplied, color: "text-emerald-600", accent: "border-l-emerald-400" },
            { label: "Day Streak", value: dailyStats.currentStreak, color: "text-orange-600", accent: "border-l-orange-400", icon: true },
            { label: "Last 30 Days", value: dailyStats.totalLast30Days, color: "text-slate-900", accent: "border-l-gray-400" },
            { label: "Avg/Day", value: dailyStats.avgPerDay, color: "text-slate-900", accent: "border-l-gray-400" },
          ].map((stat) => (
            <div key={stat.label} className={`bg-white border border-slate-200/80 rounded-xl shadow-card p-3.5 border-l-[3px] ${stat.accent}`}>
              <div className="flex items-center justify-center gap-1">
                {stat.icon && <Flame className="w-4 h-4 text-orange-500" />}
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <p className="text-[11px] text-slate-400 text-center mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-card p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-[13px] font-medium text-slate-700">Base Resume:</label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-1.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            >
              <option value="">None</option>
              {resumes.map((r: any) => (
                <option key={r.id} value={r.id}>{r.name} {r.isBase ? "(Base)" : ""}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={autoAnalyze} onChange={(e) => setAutoAnalyze(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            <span className="text-slate-600">Auto-Analyze JDs</span>
          </label>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={autoTailor} onChange={(e) => setAutoTailor(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" disabled={!selectedResumeId} />
            <span className="text-slate-600">Auto-Tailor Resumes</span>
          </label>

          <div className="flex-1" />

          <button
            onClick={() => setShowBulkInput(!showBulkInput)}
            className="inline-flex items-center gap-2 border border-slate-200 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-xs transition-all"
          >
            <Upload className="w-4 h-4" /> Bulk Paste
          </button>

          <button
            onClick={addJob}
            className="inline-flex items-center gap-2 border border-slate-200 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-xs transition-all"
          >
            + Add Job
          </button>
        </div>

        {/* Bulk paste */}
        {showBulkInput && (
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="text-sm text-slate-600 bg-indigo-50/50 border border-indigo-200/50 rounded-xl p-3">
              <p className="font-medium text-indigo-900 mb-1.5 text-[13px]">Paste jobs in any format:</p>
              <ul className="list-disc list-inside text-xs space-y-1 text-slate-500">
                <li><span className="font-medium text-slate-700">Pipe format:</span> Company | Job Title | URL | Location</li>
                <li><span className="font-medium text-slate-700">Block format:</span> Job Title on line 1, Company on line 2, URL on any line</li>
                <li>Separate multiple jobs with a blank line or ---</li>
                <li>Include full job description after the header for best auto-tailoring</li>
              </ul>
            </div>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={10}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm font-mono resize-none shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              placeholder={`Google | Senior Frontend Engineer | https://linkedin.com/jobs/123 | Mountain View, CA
We're looking for a Senior Frontend Engineer with 5+ years experience in React...

---

Amazon | Software Development Engineer II | https://indeed.com/job/456 | Seattle, WA
Join our team building next-gen cloud services. Requirements: Java, AWS, distributed systems...`}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                {bulkText ? `~${bulkText.split(/\n{3,}|---+/).filter((b) => b.trim()).length} jobs detected` : ""}
              </p>
              <button
                onClick={parseBulkJobs}
                disabled={!bulkText.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98]"
              >
                Parse & Add Jobs
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Job Queue */}
      {jobs.length > 0 && (
        <div className="space-y-3">
          {/* Batch action bar */}
          <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-xl shadow-card p-3">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedJobs.size === jobs.length && jobs.length > 0}
                  onChange={selectAll}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-600">Select All</span>
                <span className="text-xs text-slate-400">({selectedJobs.size}/{jobs.length})</span>
              </label>

              {selectedJobs.size > 0 && (
                <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-slate-200">
                  <button
                    onClick={() => {
                      const selected = jobs.filter((j) => selectedJobs.has(j.id) && j.jobUrl);
                      selected.forEach((j) => window.open(j.jobUrl, "_blank"));
                      handleBulkMarkApplied();
                    }}
                    className="inline-flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-emerald-700 shadow-sm transition-all active:scale-[0.97]"
                  >
                    <ExternalLink className="w-3 h-3" /> Apply Now ({selectedJobs.size})
                  </button>
                  <button
                    onClick={() => {
                      const urls = jobs.filter((j) => selectedJobs.has(j.id) && j.jobUrl).map((j) => j.jobUrl);
                      urls.forEach((url) => window.open(url, "_blank"));
                    }}
                    className="inline-flex items-center gap-1 text-indigo-600 px-2.5 py-1.5 rounded-lg text-xs hover:bg-indigo-50 border border-indigo-200 transition-all"
                  >
                    <ExternalLink className="w-3 h-3" /> Open URLs
                  </button>
                  <button
                    onClick={handleBulkMarkApplied}
                    className="inline-flex items-center gap-1 text-emerald-600 px-2.5 py-1.5 rounded-lg text-xs hover:bg-emerald-50 border border-emerald-200 transition-all"
                  >
                    <CheckCircle className="w-3 h-3" /> Mark Applied
                  </button>
                  <button
                    onClick={() => {
                      setJobs((prev) => prev.filter((j) => !selectedJobs.has(j.id)));
                      setSelectedJobs(new Set());
                    }}
                    className="inline-flex items-center gap-1 text-red-500 px-2.5 py-1.5 rounded-lg text-xs hover:bg-red-50 border border-red-200 transition-all"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                {pendingCount} pending &middot; {importedCount} imported &middot; {appliedCount} applied
              </span>
              <button
                onClick={handleBatchImport}
                disabled={processing || pendingCount === 0}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98]"
              >
                {processing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : (
                  <><Zap className="w-4 h-4" /> Import All ({pendingCount})</>
                )}
              </button>
            </div>
          </div>

          {/* Job cards */}
          <div className="space-y-2">
            {jobs.map((job, index) => (
              <div
                key={job.id}
                className={`bg-white border rounded-xl overflow-hidden transition-all duration-150 shadow-card ${
                  job.status === "error" ? "border-red-200" :
                  job.status === "applied" ? "border-emerald-200 bg-emerald-50/20" :
                  job.status === "imported" || job.status === "tailored" ? "border-indigo-200" :
                  "border-slate-200/80"
                }`}
              >
                <div className="flex items-center gap-3 p-3">
                  <input
                    type="checkbox"
                    checked={selectedJobs.has(job.id)}
                    onChange={() => toggleSelect(job.id)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
                  />
                  <span className="text-[11px] text-slate-400 w-6 font-mono">{index + 1}</span>

                  {job.status === "pending" ? (
                    <>
                      <input
                        value={job.companyName}
                        onChange={(e) => updateJob(job.id, { companyName: e.target.value })}
                        placeholder="Company"
                        className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm w-40 shadow-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all"
                      />
                      <input
                        value={job.jobTitle}
                        onChange={(e) => updateJob(job.id, { jobTitle: e.target.value })}
                        placeholder="Job Title"
                        className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm flex-1 shadow-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all"
                      />
                      <input
                        value={job.jobUrl}
                        onChange={(e) => updateJob(job.id, { jobUrl: e.target.value, platform: detectPlatform(e.target.value) })}
                        placeholder="URL (optional)"
                        className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm w-48 shadow-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all"
                      />
                      <input
                        value={job.location}
                        onChange={(e) => updateJob(job.id, { location: e.target.value })}
                        placeholder="Location"
                        className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm w-32 shadow-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all"
                      />
                    </>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-slate-900 truncate">{job.jobTitle}</span>
                        <span className="text-xs text-slate-400">at {job.companyName}</span>
                        {job.platform && (
                          <span className="text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-medium">{job.platform}</span>
                        )}
                        {job.matchScore != null && (
                          <span className={`text-xs font-bold ${job.matchScore >= 70 ? "text-emerald-600" : job.matchScore >= 40 ? "text-amber-600" : "text-red-500"}`}>
                            {job.matchScore}% match
                          </span>
                        )}
                      </div>
                      {job.location && <p className="text-xs text-slate-400 mt-0.5">{job.location}</p>}
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {job.status === "importing" && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
                    {job.status === "imported" && <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium ring-1 ring-inset ring-indigo-600/10">Imported</span>}
                    {job.status === "tailored" && <span className="text-[11px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded-md font-medium ring-1 ring-inset ring-violet-600/10">Tailored</span>}
                    {job.status === "applied" && <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-medium ring-1 ring-inset ring-emerald-600/10">Applied</span>}
                    {job.status === "error" && <span className="text-[11px] bg-red-50 text-red-700 px-2 py-0.5 rounded-md font-medium ring-1 ring-inset ring-red-600/10">Error</span>}

                    {job.jobUrl && (job.status === "imported" || job.status === "tailored") && (
                      <button
                        onClick={async () => {
                          window.open(job.jobUrl, "_blank");
                          if (job.appId) {
                            await fetch("/api/batch/status", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ applicationIds: [job.appId], status: "applied" }),
                            });
                            updateJob(job.id, { status: "applied" });
                            fetch("/api/batch/daily-stats").then((r) => r.json()).then(setDailyStats);
                          }
                        }}
                        className="inline-flex items-center gap-1 bg-emerald-600 text-white px-2.5 py-1 rounded-xl text-xs font-medium hover:bg-emerald-700 shadow-sm transition-all active:scale-[0.97]"
                      >
                        <ExternalLink className="w-3 h-3" /> Apply
                      </button>
                    )}

                    {job.jobUrl && job.status !== "imported" && job.status !== "tailored" && (
                      <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {job.appId && (
                      <a href={`/applications/${job.appId}`} className="text-xs text-indigo-600 hover:underline font-medium">View</a>
                    )}

                    <button
                      onClick={() => updateJob(job.id, { expanded: !job.expanded })}
                      className="text-slate-400 hover:text-slate-600 p-0.5 hover:bg-slate-100 rounded transition-all"
                    >
                      {job.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <button onClick={() => removeJob(job.id)} className="text-slate-400 hover:text-red-500 transition-colors p-0.5">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded: Job Description */}
                {job.expanded && (
                  <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/50">
                    <textarea
                      value={job.jobDescription}
                      onChange={(e) => updateJob(job.id, { jobDescription: e.target.value })}
                      rows={4}
                      placeholder="Paste job description here for better resume tailoring..."
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                    />
                    {job.error && <p className="text-xs text-red-500 mt-2">{job.error}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {jobs.length === 0 && !showBulkInput && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-7 h-7 text-amber-500" />
          </div>
          <p className="text-lg font-semibold text-slate-900">Ready to speed up your applications?</p>
          <p className="text-sm text-slate-500 mt-1.5">Paste jobs in bulk or add them one by one</p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <button onClick={() => setShowBulkInput(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98]">
              Bulk Paste Jobs
            </button>
            <button onClick={addJob} className="border border-slate-200 px-5 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-xs transition-all">
              Add Single Job
            </button>
          </div>
        </div>
      )}

      {/* Tip */}
      <p className="text-xs text-slate-400 text-center">
        Tip: Use &ldquo;Company | Title | URL | Location&rdquo; format for fastest bulk import. Separate jobs with blank lines.
      </p>
    </div>
  );
}
