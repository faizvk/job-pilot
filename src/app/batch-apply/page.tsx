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

  // Timer
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

  // Load resumes and stats
  useEffect(() => {
    fetch("/api/resumes").then((r) => r.json()).then((data) => {
      setResumes(data);
      const base = data.find((r: any) => r.isBase) || data[0];
      if (base) setSelectedResumeId(base.id);
    });
    fetch("/api/batch/daily-stats").then((r) => r.json()).then(setDailyStats);
  }, []);

  // Parse bulk text into job entries
  const parseBulkJobs = useCallback(() => {
    if (!bulkText.trim()) return;

    // Split by double newlines or "---" separator
    const blocks = bulkText.split(/\n{3,}|---+/).filter((b) => b.trim());
    const newJobs: JobEntry[] = blocks.map((block, i) => {
      const lines = block.trim().split("\n").filter((l) => l.trim());

      // Try to parse structured format: Company | Title | URL | Location
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

      // Try URL detection
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

  // Add single job
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

  // BATCH IMPORT - The main action
  const handleBatchImport = async () => {
    const jobsToImport = jobs.filter((j) => j.status === "pending" && j.companyName && j.jobTitle);
    if (jobsToImport.length === 0) return;

    setProcessing(true);
    if (!startTime) setStartTime(Date.now());

    // Mark as importing
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

      // Update individual job statuses
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

      // Handle errors
      result.errors?.forEach((err: string) => {
        const match = err.match(/^(.+?) - (.+?):/);
        if (match) {
          const job = jobsToImport.find((j) => j.companyName === match[1]);
          if (job) updateJob(job.id, { status: "error", error: err });
        }
      });

      // Refresh daily stats
      fetch("/api/batch/daily-stats").then((r) => r.json()).then(setDailyStats);
    } catch (err: any) {
      jobsToImport.forEach((j) => updateJob(j.id, { status: "error", error: err.message }));
    } finally {
      setProcessing(false);
    }
  };

  // Bulk mark as applied
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
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" /> Batch Apply
          </h1>
          <p className="text-gray-500 mt-1">Import 50+ jobs, auto-tailor resumes, track everything</p>
        </div>
        {startTime && (
          <div className="text-right">
            <div className="flex items-center gap-2 text-lg font-mono font-bold">
              <Clock className="w-5 h-5 text-blue-600" />
              {formatTime(elapsedTime)}
            </div>
            <p className="text-xs text-gray-500">{importedCount} imported, {appliedCount} applied</p>
          </div>
        )}
      </div>

      {/* Daily Stats Bar */}
      {dailyStats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white border rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{dailyStats.todayCount}</p>
            <p className="text-xs text-gray-500">Today</p>
          </div>
          <div className="bg-white border rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{dailyStats.todayApplied}</p>
            <p className="text-xs text-gray-500">Applied Today</p>
          </div>
          <div className="bg-white border rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <p className="text-2xl font-bold text-orange-600">{dailyStats.currentStreak}</p>
            </div>
            <p className="text-xs text-gray-500">Day Streak</p>
          </div>
          <div className="bg-white border rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{dailyStats.totalLast30Days}</p>
            <p className="text-xs text-gray-500">Last 30 Days</p>
          </div>
          <div className="bg-white border rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{dailyStats.avgPerDay}</p>
            <p className="text-xs text-gray-500">Avg/Day</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white border rounded-lg p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Base Resume:</label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="">None</option>
              {resumes.map((r: any) => (
                <option key={r.id} value={r.id}>{r.name} {r.isBase ? "(Base)" : ""}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={autoAnalyze} onChange={(e) => setAutoAnalyze(e.target.checked)} className="rounded" />
            Auto-Analyze JDs
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={autoTailor} onChange={(e) => setAutoTailor(e.target.checked)} className="rounded" disabled={!selectedResumeId} />
            Auto-Tailor Resumes
          </label>

          <div className="flex-1" />

          <button
            onClick={() => setShowBulkInput(!showBulkInput)}
            className="inline-flex items-center gap-2 border px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50"
          >
            <Upload className="w-4 h-4" /> Bulk Paste
          </button>

          <button
            onClick={addJob}
            className="inline-flex items-center gap-2 border px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50"
          >
            + Add Job
          </button>
        </div>

        {/* Bulk paste area */}
        {showBulkInput && (
          <div className="border-t pt-4 space-y-3">
            <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="font-medium mb-1">Paste jobs in any of these formats:</p>
              <ul className="list-disc list-inside text-xs space-y-1 text-gray-500">
                <li><strong>Pipe format:</strong> Company | Job Title | URL | Location</li>
                <li><strong>Block format:</strong> Job Title on line 1, Company on line 2, URL on any line</li>
                <li>Separate multiple jobs with a blank line or ---</li>
                <li>Include full job description after the header for best auto-tailoring</li>
              </ul>
            </div>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={10}
              className="w-full border rounded-lg p-3 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Google | Senior Frontend Engineer | https://linkedin.com/jobs/123 | Mountain View, CA
We're looking for a Senior Frontend Engineer with 5+ years experience in React...

---

Amazon | Software Development Engineer II | https://indeed.com/job/456 | Seattle, WA
Join our team building next-gen cloud services. Requirements: Java, AWS, distributed systems...

---

Meta | Full Stack Developer | https://lever.co/meta/789
Building social infrastructure at scale. Must have: React, Node.js, GraphQL...`}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {bulkText ? `~${bulkText.split(/\n{3,}|---+/).filter((b) => b.trim()).length} jobs detected` : ""}
              </p>
              <button
                onClick={parseBulkJobs}
                disabled={!bulkText.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
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
          <div className="flex items-center justify-between bg-white border rounded-lg p-3">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedJobs.size === jobs.length && jobs.length > 0}
                  onChange={selectAll}
                  className="rounded"
                />
                Select All ({selectedJobs.size}/{jobs.length})
              </label>

              {selectedJobs.size > 0 && (
                <>
                  <button
                    onClick={() => {
                      const selected = jobs.filter((j) => selectedJobs.has(j.id) && j.jobUrl);
                      selected.forEach((j) => window.open(j.jobUrl, "_blank"));
                      handleBulkMarkApplied();
                    }}
                    className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Apply Now ({selectedJobs.size})
                  </button>
                  <button
                    onClick={() => {
                      const urls = jobs
                        .filter((j) => selectedJobs.has(j.id) && j.jobUrl)
                        .map((j) => j.jobUrl);
                      urls.forEach((url) => window.open(url, "_blank"));
                    }}
                    className="inline-flex items-center gap-1 text-blue-600 px-3 py-1.5 rounded-lg text-xs hover:bg-blue-50 border border-blue-200"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open URLs Only
                  </button>
                  <button
                    onClick={handleBulkMarkApplied}
                    className="inline-flex items-center gap-1 text-green-600 px-3 py-1.5 rounded-lg text-xs hover:bg-green-50 border border-green-200"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Mark Applied
                  </button>
                  <button
                    onClick={() => {
                      setJobs((prev) => prev.filter((j) => !selectedJobs.has(j.id)));
                      setSelectedJobs(new Set());
                    }}
                    className="inline-flex items-center gap-1 text-red-600 px-3 py-1.5 rounded-lg text-xs hover:bg-red-50 border border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {pendingCount} pending · {importedCount} imported · {appliedCount} applied
              </span>
              <button
                onClick={handleBatchImport}
                disabled={processing || pendingCount === 0}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
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
                className={`bg-white border rounded-lg overflow-hidden transition-colors ${
                  job.status === "error" ? "border-red-200" :
                  job.status === "applied" ? "border-green-200 bg-green-50/30" :
                  job.status === "imported" || job.status === "tailored" ? "border-blue-200" :
                  ""
                }`}
              >
                <div className="flex items-center gap-3 p-3">
                  <input
                    type="checkbox"
                    checked={selectedJobs.has(job.id)}
                    onChange={() => toggleSelect(job.id)}
                    className="rounded flex-shrink-0"
                  />
                  <span className="text-xs text-gray-400 w-6">{index + 1}</span>

                  {job.status === "pending" ? (
                    // Editable row
                    <>
                      <input
                        value={job.companyName}
                        onChange={(e) => updateJob(job.id, { companyName: e.target.value })}
                        placeholder="Company"
                        className="border rounded px-2 py-1.5 text-sm w-40 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                      <input
                        value={job.jobTitle}
                        onChange={(e) => updateJob(job.id, { jobTitle: e.target.value })}
                        placeholder="Job Title"
                        className="border rounded px-2 py-1.5 text-sm flex-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                      <input
                        value={job.jobUrl}
                        onChange={(e) => updateJob(job.id, { jobUrl: e.target.value, platform: detectPlatform(e.target.value) })}
                        placeholder="URL (optional)"
                        className="border rounded px-2 py-1.5 text-sm w-48 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                      <input
                        value={job.location}
                        onChange={(e) => updateJob(job.id, { location: e.target.value })}
                        placeholder="Location"
                        className="border rounded px-2 py-1.5 text-sm w-32 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </>
                  ) : (
                    // Display row
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{job.jobTitle}</span>
                          <span className="text-xs text-gray-500">at {job.companyName}</span>
                          {job.platform && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{job.platform}</span>
                          )}
                          {job.matchScore != null && (
                            <span className={`text-xs font-medium ${job.matchScore >= 70 ? "text-green-600" : job.matchScore >= 40 ? "text-yellow-600" : "text-red-500"}`}>
                              {job.matchScore}% match
                            </span>
                          )}
                        </div>
                        {job.location && <p className="text-xs text-gray-400">{job.location}</p>}
                      </div>
                    </>
                  )}

                  {/* Status */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {job.status === "importing" && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                    {job.status === "imported" && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Imported</span>}
                    {job.status === "tailored" && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Tailored</span>}
                    {job.status === "applied" && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Applied</span>}
                    {job.status === "error" && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Error</span>}

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
                        className="inline-flex items-center gap-1 bg-green-600 text-white px-2.5 py-1 rounded text-xs hover:bg-green-700"
                      >
                        <ExternalLink className="w-3 h-3" /> Apply
                      </button>
                    )}

                    {job.jobUrl && job.status !== "imported" && job.status !== "tailored" && (
                      <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {job.appId && (
                      <a href={`/applications/${job.appId}`} className="text-xs text-blue-600 hover:underline">View</a>
                    )}

                    <button
                      onClick={() => updateJob(job.id, { expanded: !job.expanded })}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {job.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <button onClick={() => removeJob(job.id)} className="text-gray-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded: Job Description */}
                {job.expanded && (
                  <div className="border-t px-3 py-3 bg-gray-50">
                    <textarea
                      value={job.jobDescription}
                      onChange={(e) => updateJob(job.id, { jobDescription: e.target.value })}
                      rows={4}
                      placeholder="Paste job description here for better resume tailoring..."
                      className="w-full border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
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
        <div className="text-center py-16 text-gray-500">
          <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Ready to speed up your applications?</p>
          <p className="text-sm mt-1">Paste jobs in bulk or add them one by one</p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <button onClick={() => setShowBulkInput(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              Bulk Paste Jobs
            </button>
            <button onClick={addJob} className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
              Add Single Job
            </button>
          </div>
        </div>
      )}

      {/* Keyboard shortcut hints */}
      <div className="text-xs text-gray-400 text-center">
        Tip: Use &ldquo;Company | Title | URL | Location&rdquo; format for fastest bulk import. Separate jobs with blank lines.
      </div>
    </div>
  );
}
