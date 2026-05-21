"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, MapPin } from "lucide-react";

const INDIAN_STATES = [
  "All India", "Karnataka", "Maharashtra", "Tamil Nadu", "Telangana",
  "Kerala", "Delhi", "Uttar Pradesh", "Gujarat", "West Bengal",
  "Haryana", "Andhra Pradesh", "Rajasthan", "Madhya Pradesh", "Punjab",
];

export function SearchHero() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [where, setWhere] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Send everyone (logged in or not) to signup with the query preserved.
    // After signup they land in the app; if already logged in, /auth/signup
    // immediately bounces them to /dashboard via NextAuth.
    const params = new URLSearchParams();
    if (title.trim()) params.set("title", title.trim());
    if (where.trim() && where !== "All India") params.set("state", where);
    router.push(`/auth/signup${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <form
      onSubmit={submit}
      className="bg-white rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch gap-2"
    >
      <div className="flex-1 flex items-center gap-2 px-3 sm:border-r sm:border-slate-200">
        <Search className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Job title, keywords, or company"
          className="w-full py-3 text-sm bg-transparent focus:outline-none placeholder:text-slate-400"
          autoFocus
        />
      </div>

      <div className="flex-1 flex items-center gap-2 px-3 border-t border-slate-200 sm:border-t-0">
        <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <select
          value={where}
          onChange={(e) => setWhere(e.target.value)}
          className="w-full py-3 text-sm bg-transparent focus:outline-none text-slate-700"
        >
          <option value="">State (all India)</option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-600/30 transition-all duration-150 active:scale-[0.98]"
      >
        Find jobs
      </button>
    </form>
  );
}
