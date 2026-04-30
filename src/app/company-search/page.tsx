"use client";

import { useState } from "react";
import {
  Search, Loader2, ExternalLink, Building2, MapPin, Briefcase, Clock,
} from "lucide-react";

interface FetchedJob {
  externalId: string;
  title: string;
  company: string;
  location: string;
  workType: string;
  description: string;
  url: string;
  salary: string;
  experienceLevel: string;
  postedAt: string;
  platform: string;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

export default function CompanySearchPage() {
  const [company, setCompany] = useState("");
  const [state, setState] = useState("");
  const [jobs, setJobs] = useState<FetchedJob[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!company.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const params = new URLSearchParams({ company: company.trim() });
      if (state) params.set("state", state);
      const res = await fetch(`/api/job-search/by-company?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Search failed");
        setJobs([]);
        setSources([]);
      } else {
        setJobs(data.jobs || []);
        setSources(data.sources || []);
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const formatPostedDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (days === 0) return "Today";
      if (days === 1) return "Yesterday";
      if (days < 7) return `${days}d ago`;
      if (days < 30) return `${Math.floor(days / 7)}w ago`;
      return `${Math.floor(days / 30)}mo ago`;
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Company Search</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Find openings at a specific company in a specific Indian state
        </p>
      </div>

      <form
        onSubmit={search}
        className="bg-white border border-slate-200/80 rounded-xl shadow-card p-5 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
          <div>
            <label className="text-[13px] font-medium text-slate-700 mb-1.5 block">
              Company
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Microsoft, Razorpay, Swiggy"
                className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                autoFocus
              />
            </div>
          </div>
          <div>
            <label className="text-[13px] font-medium text-slate-700 mb-1.5 block">
              State (in India)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white"
              >
                <option value="">All India</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={!company.trim() || loading}
              className="inline-flex items-center justify-center gap-1.5 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-md disabled:opacity-50 transition-all active:scale-[0.98] w-full md:w-auto"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</>
              ) : (
                <><Search className="w-4 h-4" /> Search</>
              )}
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Powered by JSearch (LinkedIn / Indeed / Glassdoor) and Adzuna. Set
          <code className="mx-1 bg-slate-100 px-1 py-0.5 rounded font-mono">RAPIDAPI_KEY</code>
          and / or
          <code className="mx-1 bg-slate-100 px-1 py-0.5 rounded font-mono">ADZUNA_APP_ID</code> +
          <code className="mx-1 bg-slate-100 px-1 py-0.5 rounded font-mono">ADZUNA_API_KEY</code> in env for results.
        </p>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {searched && !loading && !error && (
        <div className="text-sm text-slate-500">
          {jobs.length === 0 ? (
            <span>No openings found{state ? ` in ${state}` : ""} for <strong className="text-slate-700">{company}</strong>. Try a different state or check spelling.</span>
          ) : (
            <span>
              Found <strong className="text-slate-900">{jobs.length}</strong> opening{jobs.length === 1 ? "" : "s"} at <strong className="text-slate-900">{company}</strong>{state ? ` in ${state}` : " across India"}
              {sources.length > 0 && <span className="text-slate-400"> · via {sources.join(", ")}</span>}
            </span>
          )}
        </div>
      )}

      {jobs.length > 0 && (
        <div className="space-y-2">
          {jobs.map((job, i) => (
            <div
              key={job.externalId || `${job.company}-${i}`}
              className="bg-white border border-slate-200/80 rounded-xl shadow-card hover:shadow-card-hover transition-all p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[14px] text-slate-900">{job.title}</h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" /> {job.company}
                    </span>
                    {job.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {job.location}
                      </span>
                    )}
                    {job.workType && (
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        {job.workType.charAt(0).toUpperCase() + job.workType.slice(1)}
                      </span>
                    )}
                    {job.postedAt && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {formatPostedDate(job.postedAt)}
                      </span>
                    )}
                  </div>
                  {job.salary && (
                    <p className="text-xs text-emerald-600 font-medium mt-1.5">{job.salary}</p>
                  )}
                  {job.description && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {job.description.slice(0, 250)}...
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/10">
                    {job.platform}
                  </span>
                  {job.url && (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all active:scale-[0.97]"
                    >
                      <ExternalLink className="w-3 h-3" /> Apply
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
