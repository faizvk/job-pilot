"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp, Mail, Clock, Target, AlertCircle, CheckCircle2,
  Lightbulb, ChevronRight, Loader2,
} from "lucide-react";

interface Report {
  range: { from: string; to: string; days: number };
  totals: { applied: number; responded: number; interviews: number; offers: number; rejected: number; pending: number };
  rates: { response: number; interview: number; offer: number };
  responseTime: { medianDays: number | null; p90Days: number | null; samples: number };
  funnel: { status: string; label: string; count: number }[];
  matchScoreImpact: { bucket: string; range: string; applied: number; responded: number; rate: number }[];
  topCompanies: { company: string; applications: number; responseRate: number }[];
  followUpImpact: {
    withFollowUp: { applications: number; responded: number; rate: number };
    withoutFollowUp: { applications: number; responded: number; rate: number };
  };
  staleApplications: { id: string; company: string; title: string; appliedAt: string; daysAgo: number; hasFollowUp: boolean }[];
  recommendations: { kind: "info" | "action" | "win"; text: string }[];
}

export default function InsightsPage() {
  const [data, setData] = useState<Report | null>(null);
  const [days, setDays] = useState(90);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/insights?days=${days}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-7 h-7 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!data || data.totals.applied === 0) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Insights</h1>
          <p className="text-sm text-slate-500 mt-0.5">Are you doing this right? Find out from your data.</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-10 text-center">
          <Target className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-base font-medium text-slate-900 mt-3">No applied applications yet</p>
          <p className="text-sm text-slate-500 mt-1">
            Insights kick in once you&apos;ve applied to at least one job.
          </p>
          <Link
            href="/quick-apply"
            className="inline-flex mt-5 items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800"
          >
            Apply your first job
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Insights</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Across the last {data.range.days} days · {data.totals.applied}{" "}
            {data.totals.applied === 1 ? "application" : "applications"}
          </p>
        </div>
        <div className="flex bg-slate-100 rounded-md p-0.5 self-start sm:self-auto">
          {[30, 60, 90, 180].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-xs rounded transition-all ${
                days === d ? "bg-white shadow-xs font-medium text-slate-900" : "text-slate-500"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <div className="space-y-2">
          {data.recommendations.map((r, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-md border p-3.5 text-sm ${
                r.kind === "win"
                  ? "border-emerald-200 bg-emerald-50/60 text-emerald-900"
                  : r.kind === "action"
                    ? "border-amber-200 bg-amber-50/60 text-amber-900"
                    : "border-slate-200 bg-slate-50/60 text-slate-700"
              }`}
            >
              {r.kind === "win" ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" />
              ) : r.kind === "action" ? (
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
              ) : (
                <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
              )}
              <span className="leading-relaxed">{r.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Mail}
          label="Response rate"
          value={`${data.rates.response}%`}
          sub={`${data.totals.responded} of ${data.totals.applied} replied`}
          tone={data.rates.response >= 15 ? "good" : data.rates.response >= 5 ? "neutral" : "warn"}
        />
        <StatCard
          icon={TrendingUp}
          label="Interview rate"
          value={`${data.rates.interview}%`}
          sub={`${data.totals.interviews + data.totals.offers} reached interview`}
        />
        <StatCard
          icon={Target}
          label="Offer rate"
          value={`${data.rates.offer}%`}
          sub={`${data.totals.offers} ${data.totals.offers === 1 ? "offer" : "offers"}`}
        />
        <StatCard
          icon={Clock}
          label="Median reply time"
          value={data.responseTime.medianDays != null ? `${Math.round(data.responseTime.medianDays)}d` : "—"}
          sub={data.responseTime.samples > 0 ? `from ${data.responseTime.samples} samples` : "no replies yet"}
        />
      </div>

      {/* Funnel */}
      <section className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-slate-900">Funnel</h2>
        <p className="text-xs text-slate-500 mt-0.5">Where your applications drop off.</p>
        <div className="mt-4 space-y-2">
          {data.funnel.map((step, i) => {
            const pct = data.funnel[0].count > 0 ? (step.count / data.funnel[0].count) * 100 : 0;
            const dropFromPrev = i > 0 && data.funnel[i - 1].count > 0
              ? Math.round((1 - step.count / data.funnel[i - 1].count) * 100)
              : null;
            return (
              <div key={step.status}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{step.label}</span>
                  <span className="font-mono text-slate-500">
                    {step.count}{" "}
                    {dropFromPrev !== null && step.count > 0 && (
                      <span className="text-slate-300 ml-1">↓ {dropFromPrev}%</span>
                    )}
                  </span>
                </div>
                <div className="mt-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-700 rounded-full transition-all"
                    style={{ width: `${Math.max(2, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Match score impact + Follow-up impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-slate-900">Match score → response</h2>
          <p className="text-xs text-slate-500 mt-0.5">Higher match jobs reply more.</p>
          <div className="mt-4 space-y-3">
            {data.matchScoreImpact.map((b) => (
              <div key={b.bucket} className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-600 w-16">{b.range}</span>
                <div className="flex-1 h-6 bg-slate-50 rounded relative overflow-hidden">
                  <div
                    className={`h-full rounded transition-all ${
                      b.bucket === "high" ? "bg-emerald-400" : b.bucket === "mid" ? "bg-amber-400" : "bg-rose-400"
                    }`}
                    style={{ width: `${b.applied > 0 ? Math.max(4, b.rate) : 0}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-slate-500 w-20 text-right">
                  {b.applied > 0 ? `${b.rate}% (${b.responded}/${b.applied})` : "—"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-slate-900">Follow-up impact</h2>
          <p className="text-xs text-slate-500 mt-0.5">Sending one usually moves the needle.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <ImpactCell
              label="With follow-up"
              rate={data.followUpImpact.withFollowUp.rate}
              detail={`${data.followUpImpact.withFollowUp.responded}/${data.followUpImpact.withFollowUp.applications}`}
              tone="good"
            />
            <ImpactCell
              label="No follow-up"
              rate={data.followUpImpact.withoutFollowUp.rate}
              detail={`${data.followUpImpact.withoutFollowUp.responded}/${data.followUpImpact.withoutFollowUp.applications}`}
            />
          </div>
        </section>
      </div>

      {/* Top companies */}
      {data.topCompanies.length > 0 && (
        <section className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-slate-900">Top companies you applied to</h2>
          <p className="text-xs text-slate-500 mt-0.5">By application count, with their response rate.</p>
          <div className="mt-3 divide-y divide-slate-100">
            {data.topCompanies.map((c) => (
              <div key={c.company} className="flex items-center justify-between py-2.5 text-sm">
                <span className="font-medium text-slate-800 truncate">{c.company}</span>
                <div className="flex items-center gap-3 text-xs text-slate-500 flex-shrink-0">
                  <span>{c.applications} applied</span>
                  <span
                    className={`font-mono ${
                      c.responseRate >= 50 ? "text-emerald-600" : c.responseRate > 0 ? "text-slate-500" : "text-slate-300"
                    }`}
                  >
                    {c.responseRate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Stale applications */}
      {data.staleApplications.length > 0 && (
        <section className="bg-white border border-amber-200 rounded-xl p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Stale applications
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Applied 7+ days ago, still no response. Send a follow-up to bump them.
          </p>
          <div className="mt-3 divide-y divide-slate-100">
            {data.staleApplications.map((a) => (
              <Link
                key={a.id}
                href={`/applications/${a.id}`}
                className="flex items-center gap-3 py-2.5 text-sm hover:bg-slate-50 -mx-2 px-2 rounded transition"
              >
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-slate-800 truncate block">{a.title}</span>
                  <span className="text-xs text-slate-500">{a.company}</span>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">{a.daysAgo}d ago</span>
                {!a.hasFollowUp && (
                  <span className="text-[10px] uppercase tracking-wider text-amber-600 font-medium flex-shrink-0">
                    Needs FU
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "neutral",
}: {
  icon: any;
  label: string;
  value: string;
  sub: string;
  tone?: "good" | "warn" | "neutral";
}) {
  const accent =
    tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-rose-600" : "text-slate-900";
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <Icon className="w-3.5 h-3.5 text-slate-300" />
      </div>
      <div className={`mt-2 text-2xl font-semibold tracking-tight ${accent}`}>{value}</div>
      <div className="mt-0.5 text-[11px] text-slate-400">{sub}</div>
    </div>
  );
}

function ImpactCell({
  label,
  rate,
  detail,
  tone = "neutral",
}: {
  label: string;
  rate: number;
  detail: string;
  tone?: "good" | "neutral";
}) {
  return (
    <div className="border border-slate-100 rounded-lg p-3">
      <div className="text-[11px] text-slate-500 font-medium">{label}</div>
      <div className={`text-xl font-semibold mt-1 ${tone === "good" ? "text-emerald-600" : "text-slate-900"}`}>
        {rate}%
      </div>
      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{detail}</div>
    </div>
  );
}
