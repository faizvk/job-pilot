"use client";

import { useState, useEffect } from "react";
import {
  Search, RefreshCw, Filter, ExternalLink, ChevronDown, ChevronUp,
  Send, EyeOff, Loader2, MapPin, Building2, Clock, Briefcase, Star, Settings2, X
} from "lucide-react";

interface JobListing {
  id: string;
  externalId: string | null;
  title: string;
  company: string;
  location: string | null;
  workType: string | null;
  description: string | null;
  url: string;
  salary: string | null;
  experienceLevel: string | null;
  postedAt: string | null;
  platform: string;
  skills: string | null;
  matchScore: number | null;
  imported: boolean;
  hidden: boolean;
  fetchedAt: string;
}

interface SearchPrefs {
  jobTitles: string[];
  locations: string[];
  workTypes: string[];
  experienceMin: number;
  experienceMax: number;
  keywords: string;
  excludeKeywords: string;
  salaryMin: number | null;
  platforms: string[];
}

const DEFAULT_PREFS: SearchPrefs = {
  jobTitles: [
    "Junior Software Engineer",
    "Software Developer",
    "Frontend Developer",
    "Full Stack Developer",
    "Backend Developer",
    "Web Developer",
  ],
  locations: ["Kerala, India", "Bangalore, India", "Hyderabad, India", "Chennai, India", "Remote"],
  workTypes: ["remote", "hybrid", "onsite"],
  experienceMin: 0,
  experienceMax: 2,
  keywords: "javascript, react, node, python, typescript, java, angular, vue",
  excludeKeywords: "senior, staff, principal, 10+ years, architect",
  salaryMin: null,
  platforms: ["JSearch", "Remotive", "Adzuna"],
};

const PLATFORM_COLORS: Record<string, string> = {
  LinkedIn: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/10",
  Indeed: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/10",
  Glassdoor: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10",
  ZipRecruiter: "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-600/10",
  Naukri: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/10",
  Shine: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10",
  Monster: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/10",
  Lever: "bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-600/10",
  Greenhouse: "bg-lime-50 text-lime-700 ring-1 ring-inset ring-lime-600/10",
  Workday: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/10",
  Remotive: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/10",
  Jobicy: "bg-pink-50 text-pink-700 ring-1 ring-inset ring-pink-600/10",
  Adzuna: "bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-600/10",
  "Company Site": "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10",
};

export default function JobFeedPage() {
  const [listings, setListings] = useState<JobListing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [prefs, setPrefs] = useState<SearchPrefs>(DEFAULT_PREFS);
  const [showPrefs, setShowPrefs] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterWorkType, setFilterWorkType] = useState("");
  const [filterMinScore, setFilterMinScore] = useState(0);
  const [sources, setSources] = useState<string[]>([]);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
    loadListings();
  }, []);

  const loadPreferences = async () => {
    const res = await fetch("/api/job-search/preferences");
    const data = await res.json();
    if (!data.empty) {
      setPrefs({
        jobTitles: data.jobTitles || DEFAULT_PREFS.jobTitles,
        locations: data.locations || DEFAULT_PREFS.locations,
        workTypes: data.workTypes || DEFAULT_PREFS.workTypes,
        experienceMin: data.experienceMin ?? 0,
        experienceMax: data.experienceMax ?? 2,
        keywords: data.keywords || "",
        excludeKeywords: data.excludeKeywords || "",
        salaryMin: data.salaryMin,
        platforms: data.platforms || DEFAULT_PREFS.platforms,
      });
    }
  };

  const loadListings = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterPlatform) params.set("platform", filterPlatform);
    if (filterWorkType) params.set("workType", filterWorkType);
    if (filterMinScore > 0) params.set("minScore", String(filterMinScore));
    params.set("imported", "false");

    const res = await fetch(`/api/job-search?${params}`);
    const data = await res.json();
    setListings(data.listings || []);
    setTotal(data.total || 0);
    setLoading(false);
  };

  useEffect(() => {
    loadListings();
  }, [filterPlatform, filterWorkType, filterMinScore]);

  const savePreferences = async () => {
    await fetch("/api/job-search/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
    setShowPrefs(false);
  };

  const fetchJobs = async () => {
    setFetching(true);
    setSources([]);
    try {
      await fetch("/api/job-search/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      const res = await fetch("/api/job-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      const data = await res.json();
      setSources(data.sources || []);
      setLastFetched(new Date().toLocaleTimeString());
      await loadListings();
    } catch (err: any) {
      console.error("Fetch error:", err);
    } finally {
      setFetching(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedJobs.size === listings.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(listings.map((j) => j.id)));
    }
  };

  const sendToBatchApply = async () => {
    const selected = listings.filter((j) => selectedJobs.has(j.id));
    if (selected.length === 0) return;
    const res = await fetch("/api/batch/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobs: selected.map((j) => ({
          companyName: j.company,
          jobTitle: j.title,
          jobUrl: j.url,
          jobDescription: j.description || "",
          location: j.location || "",
          workType: j.workType || "",
          platform: j.platform,
        })),
        autoAnalyze: true,
        autoTailor: false,
      }),
    });
    if (res.ok) {
      await fetch("/api/job-search/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected.map((j) => j.id), action: "import" }),
      });
      setSelectedJobs(new Set());
      await loadListings();
      window.location.href = "/batch-apply";
    }
  };

  const hideSelected = async () => {
    const ids = Array.from(selectedJobs);
    await fetch("/api/job-search/listings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, action: "hide" }),
    });
    setSelectedJobs(new Set());
    await loadListings();
  };

  const formatPostedDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const diff = Date.now() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days === 0) return "Today";
      if (days === 1) return "Yesterday";
      if (days < 7) return `${days}d ago`;
      return `${Math.floor(days / 7)}w ago`;
    } catch {
      return "";
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-gray-400";
    if (score >= 70) return "text-emerald-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-500";
  };

  const getScoreBg = (score: number | null) => {
    if (!score) return "bg-gray-50";
    if (score >= 70) return "bg-emerald-50";
    if (score >= 40) return "bg-amber-50";
    return "bg-red-50";
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">Job Feed</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} jobs found{sources.length > 0 && ` from ${sources.join(", ")}`}
            {lastFetched && ` \u00b7 Last fetched: ${lastFetched}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPrefs(!showPrefs)}
            className="inline-flex items-center gap-1.5 border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-xs"
          >
            <Settings2 className="w-4 h-4" /> Preferences
          </button>
          <button
            onClick={fetchJobs}
            disabled={fetching}
            className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-md disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {fetching ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Fetching Jobs...</>
            ) : (
              <><RefreshCw className="w-4 h-4" /> Fetch 50+ Jobs</>
            )}
          </button>
        </div>
      </div>

      {/* Search Preferences Panel */}
      {showPrefs && (
        <div className="bg-white border border-gray-200/80 rounded-xl shadow-card p-5 space-y-4 animate-scale-in">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-gray-900">Search Preferences</h2>
            <button onClick={() => setShowPrefs(false)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[13px] font-medium text-gray-700">Job Titles (one per line)</label>
              <textarea
                value={prefs.jobTitles.join("\n")}
                onChange={(e) => setPrefs({ ...prefs, jobTitles: e.target.value.split("\n").filter((t) => t.trim()) })}
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1.5 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                placeholder="Junior Software Engineer&#10;Software Developer&#10;Frontend Developer"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-gray-700">Locations (one per line)</label>
              <textarea
                value={prefs.locations.join("\n")}
                onChange={(e) => setPrefs({ ...prefs, locations: e.target.value.split("\n").filter((t) => t.trim()) })}
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1.5 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                placeholder="Kerala, India&#10;Bangalore, India&#10;Remote"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[13px] font-medium text-gray-700">Work Type</label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {["remote", "hybrid", "onsite"].map((type) => (
                  <label key={type} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.workTypes.includes(type)}
                      onChange={(e) => {
                        const wt = e.target.checked
                          ? [...prefs.workTypes, type]
                          : prefs.workTypes.filter((t) => t !== type);
                        setPrefs({ ...prefs, workTypes: wt });
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium text-gray-700">Experience Range (years)</label>
              <div className="flex items-center gap-2 mt-1.5">
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={prefs.experienceMin}
                  onChange={(e) => setPrefs({ ...prefs, experienceMin: parseInt(e.target.value) || 0 })}
                  className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
                <span className="text-gray-400 text-sm">to</span>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={prefs.experienceMax}
                  onChange={(e) => setPrefs({ ...prefs, experienceMax: parseInt(e.target.value) || 0 })}
                  className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
                <span className="text-xs text-gray-400">years</span>
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium text-gray-700">Min Salary (optional)</label>
              <input
                type="number"
                value={prefs.salaryMin || ""}
                onChange={(e) => setPrefs({ ...prefs, salaryMin: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="e.g. 300000"
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm mt-1.5 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[13px] font-medium text-gray-700">Must-have Keywords (comma-separated)</label>
              <input
                value={prefs.keywords}
                onChange={(e) => setPrefs({ ...prefs, keywords: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm mt-1.5 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                placeholder="javascript, react, node, python"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-gray-700">Exclude Keywords (comma-separated)</label>
              <input
                value={prefs.excludeKeywords}
                onChange={(e) => setPrefs({ ...prefs, excludeKeywords: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm mt-1.5 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                placeholder="senior, staff, principal"
              />
            </div>
          </div>

          <div>
            <label className="text-[13px] font-medium text-gray-700 mb-1.5 block">API Keys (optional, for more results)</label>
            <div className="text-xs text-gray-600 bg-amber-50/60 border border-amber-200/60 rounded-lg p-3 space-y-1">
              <p>Set these in your <code className="bg-amber-100/70 px-1 py-0.5 rounded text-amber-800 font-mono">.env</code> file for more job sources:</p>
              <p><code className="font-mono text-gray-800">RAPIDAPI_KEY=your_key</code> — Get free at rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch (500 req/month free, pulls from LinkedIn + Indeed + Glassdoor)</p>
              <p><code className="font-mono text-gray-800">ADZUNA_APP_ID=your_id</code> + <code className="font-mono text-gray-800">ADZUNA_API_KEY=your_key</code> — Get free at developer.adzuna.com (India jobs)</p>
              <p>Without API keys, jobs are fetched from Remotive and Arbeitnow (free, no key needed).</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowPrefs(false)} className="border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-all shadow-xs">
              Cancel
            </button>
            <button
              onClick={savePreferences}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98]"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* Action bar */}
      {listings.length > 0 && (
        <div className="flex items-center justify-between bg-white border border-gray-200/80 rounded-xl shadow-card p-3">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selectedJobs.size === listings.length && listings.length > 0}
                onChange={selectAll}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-600">Select All</span>
              <span className="text-xs text-gray-400">({selectedJobs.size}/{listings.length})</span>
            </label>

            {selectedJobs.size > 0 && (
              <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-gray-200">
                <button
                  onClick={sendToBatchApply}
                  className="inline-flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-700 transition-all shadow-sm active:scale-[0.97]"
                >
                  <Send className="w-3 h-3" /> Batch Apply ({selectedJobs.size})
                </button>
                <button
                  onClick={hideSelected}
                  className="inline-flex items-center gap-1 text-gray-500 px-2.5 py-1.5 rounded-lg text-xs hover:bg-gray-100 transition-all"
                >
                  <EyeOff className="w-3 h-3" /> Hide
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-lg transition-all ${showFilters ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-4 bg-white border border-gray-200/80 rounded-xl shadow-card p-3 animate-scale-in">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">Platform:</label>
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            >
              <option value="">All Platforms</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Indeed">Indeed</option>
              <option value="Glassdoor">Glassdoor</option>
              <option value="Naukri">Naukri</option>
              <option value="ZipRecruiter">ZipRecruiter</option>
              <option value="Remotive">Remotive</option>
              <option value="Jobicy">Jobicy</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">Work Type:</label>
            <select
              value={filterWorkType}
              onChange={(e) => setFilterWorkType(e.target.value)}
              className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            >
              <option value="">All</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">Min Match:</label>
            <input
              type="number"
              min={0}
              max={100}
              value={filterMinScore}
              onChange={(e) => setFilterMinScore(parseInt(e.target.value) || 0)}
              className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
            <span className="text-xs text-gray-400">%</span>
          </div>
        </div>
      )}

      {/* Job listings */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-500 mx-auto" />
          <p className="text-sm text-gray-500 mt-3">Loading jobs...</p>
        </div>
      ) : listings.length > 0 ? (
        <div className="space-y-2">
          {listings.map((job, index) => (
            <div
              key={job.id}
              className={`bg-white border rounded-xl overflow-hidden transition-all duration-150 shadow-card hover:shadow-card-hover ${
                selectedJobs.has(job.id) ? "border-indigo-300 ring-1 ring-indigo-200/50" : "border-gray-200/80"
              }`}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-start gap-3 p-4">
                <input
                  type="checkbox"
                  checked={selectedJobs.has(job.id)}
                  onChange={() => toggleSelect(job.id)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1 flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[14px] text-gray-900 truncate">{job.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-gray-400" /> {job.company}
                        </span>
                        {job.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" /> {job.location}
                          </span>
                        )}
                        {job.workType && (
                          <span className="inline-flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-gray-400" />
                            {job.workType.charAt(0).toUpperCase() + job.workType.slice(1)}
                          </span>
                        )}
                        {job.postedAt && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" /> {formatPostedDate(job.postedAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {job.matchScore != null && (
                        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${getScoreBg(job.matchScore)} ${getScoreColor(job.matchScore)}`}>
                          <Star className="w-3 h-3" />
                          {job.matchScore}%
                        </div>
                      )}
                      <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${PLATFORM_COLORS[job.platform] || "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10"}`}>
                        {job.platform}
                      </span>
                    </div>
                  </div>

                  {/* Skills */}
                  {job.skills && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {(JSON.parse(job.skills) as string[]).slice(0, 8).map((skill) => (
                        <span key={skill} className="text-[11px] bg-indigo-50/80 text-indigo-700 px-1.5 py-0.5 rounded font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Salary */}
                  {job.salary && (
                    <p className="text-xs text-emerald-600 font-medium mt-1.5">{job.salary}</p>
                  )}

                  {/* Description preview */}
                  {job.description && (
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                      {job.description.split("\n").find((l) => l.trim().length > 20 && !l.startsWith("###"))?.trim().slice(0, 200)}...
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all active:scale-[0.97]"
                  >
                    <ExternalLink className="w-3 h-3" /> Apply
                  </a>
                  <button
                    onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                    className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-all"
                  >
                    {expandedJob === job.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded description */}
              {expandedJob === job.id && job.description && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50 max-h-96 overflow-y-auto">
                  <div className="space-y-1 text-sm text-gray-600">
                    {job.description.split("\n").map((line, i) => {
                      const trimmed = line.trim();
                      if (!trimmed) return <div key={i} className="h-2" />;
                      if (trimmed.startsWith("### ")) {
                        return (
                          <h4 key={i} className="font-semibold text-gray-900 text-[13px] pt-3 pb-1 border-b border-gray-200/80 mb-1">
                            {trimmed.replace("### ", "")}
                          </h4>
                        );
                      }
                      if (trimmed.startsWith("\u2022 ")) {
                        return (
                          <div key={i} className="flex gap-2.5 pl-2 py-0.5">
                            <span className="text-indigo-400 flex-shrink-0 mt-0.5">&#8226;</span>
                            <span className="leading-relaxed">{trimmed.replace("\u2022 ", "")}</span>
                          </div>
                        );
                      }
                      return <p key={i} className="leading-relaxed">{trimmed}</p>;
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-indigo-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900">No jobs yet</p>
          <p className="text-sm text-gray-500 mt-1.5 max-w-sm mx-auto">Set your preferences and click &ldquo;Fetch 50+ Jobs&rdquo; to get started</p>
          <button
            onClick={() => { setShowPrefs(true); }}
            className="mt-5 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98]"
          >
            Set Up Preferences
          </button>
        </div>
      )}
    </div>
  );
}
