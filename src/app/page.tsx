import Link from "next/link";
import { ArrowRight, Sparkles, Target, Zap, FileText, BarChart3, Mail } from "lucide-react";
import { auth } from "@/lib/auth";
import { SearchHero } from "@/components/landing/search-hero";

export const dynamic = "force-dynamic";

// Curated tech roles for the "Browse top roles" grid.
// Linking to /auth/signup so logged-out users hit the funnel; logged-in users
// get bounced into the app by Auth.js automatically.
const ROLES = [
  { title: "Software Engineer",      avg: "₹8.7L",  blurb: "Most-applied role on Pursuit" },
  { title: "Frontend Developer",     avg: "₹6.2L",  blurb: "React, Vue, TypeScript" },
  { title: "Backend Developer",      avg: "₹7.4L",  blurb: "Node, Python, Java, Go" },
  { title: "Full-Stack Developer",   avg: "₹8.1L",  blurb: "End-to-end product builders" },
  { title: "Data Analyst",           avg: "₹5.8L",  blurb: "SQL, Python, dashboards" },
  { title: "DevOps Engineer",        avg: "₹9.3L",  blurb: "AWS, Kubernetes, CI/CD" },
  { title: "Mobile Developer",       avg: "₹7.1L",  blurb: "Android, iOS, React Native" },
  { title: "ML / AI Engineer",       avg: "₹11.5L", blurb: "Python, PyTorch, LLMs" },
  { title: "QA Engineer",            avg: "₹5.4L",  blurb: "Automation, manual, performance" },
];

const PERKS = [
  { icon: Target,    label: "Personalized match scores", text: "Every job is scored against your real skills, not keyword soup." },
  { icon: Zap,       label: "Tailor in seconds",         text: "AI tailors your resume + cover letter per posting — bulk, parallelized." },
  { icon: FileText,  label: "One profile, every form",   text: "Auto-fill any application form (LinkedIn, Greenhouse, Workday) from your profile." },
  { icon: BarChart3, label: "Know what's working",       text: "Response rates, time-to-reply, funnel drop-off — honest data from your own apps." },
  { icon: Mail,      label: "Smart follow-ups",          text: "Stale apps get auto-flagged. Send follow-ups from Gmail or Resend in one click." },
  { icon: Sparkles,  label: "Daily, automatic",          text: "Fresh jobs, status detection, Telegram digest — all running on a daily cron." },
];

export default async function Home() {
  const session = await auth();
  const authed = !!session?.user;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Marketing nav ─────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="Pursuit" width={32} height={32} />
            <span className="text-base font-semibold tracking-[-0.01em] text-slate-900">Pursuit</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 h-16">
            <span className="px-3 h-16 flex items-center text-sm font-medium text-slate-900 relative">
              Home
              <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-t bg-emerald-600" />
            </span>
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0">
            {authed ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 transition active:scale-[0.98]"
              >
                Open Pursuit
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-emerald-700 hover:text-emerald-800 px-3 py-2"
                >
                  Sign in
                </Link>
                <div className="h-6 w-px bg-slate-200" />
                <Link
                  href="/auth/signup"
                  className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero with search ──────────────────────────────── */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/60 via-white to-white pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-8 sm:pb-12">
          <SearchHero />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="" width={56} height={56} className="mx-auto mb-6 rounded-xl shadow-sm" />
          <h1 className="text-[32px] sm:text-5xl font-bold tracking-[-0.025em] text-slate-900">
            Your next job{" "}
            <span className="text-emerald-600">starts here</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
            Pursuit cuts a junior dev&apos;s job hunt from 3 hours a day to under 30 minutes — tailored resumes, smart matching, automatic follow-ups.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            {authed ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition active:scale-[0.98]"
              >
                Open dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition active:scale-[0.98]"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center text-sm font-medium text-slate-700 hover:text-slate-900 px-4 py-3"
                >
                  Already have an account?
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Browse roles ─────────────────────────────────── */}
      <section className="border-t border-slate-200/70 bg-slate-50/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Browse top tech roles
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2">
              Average salary in India per role. Click any to start a tailored search.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ROLES.map((role) => (
              <Link
                key={role.title}
                href={authed ? `/company-search` : "/auth/signup"}
                className="group bg-white border border-slate-200/80 rounded-xl p-5 hover:border-emerald-300 hover:shadow-sm transition"
              >
                <h3 className="text-base font-semibold text-slate-900 group-hover:text-emerald-700 transition">
                  {role.title}
                </h3>
                <div className="mt-2 text-emerald-600 font-semibold text-sm">
                  Average {role.avg} per year
                </div>
                <p className="text-xs text-slate-500 mt-1.5">{role.blurb}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                  Job openings
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works / perks ─────────────────────────── */}
      <section className="border-t border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Stop spending 3 hours a day on the same boring tasks.
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-3">
              Pursuit automates the slow parts of the job hunt so you can focus on the interview itself.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PERKS.map((p) => (
              <div
                key={p.label}
                className="bg-white border border-slate-200/80 rounded-xl p-5"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <p.icon className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{p.label}</h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────── */}
      <section className="border-t border-slate-200/70 bg-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Land your next role with less effort.
          </h2>
          <p className="text-sm sm:text-base text-emerald-100 mt-3 max-w-xl mx-auto">
            Free to use. Your data is yours. Sign up takes 30 seconds.
          </p>
          <Link
            href={authed ? "/dashboard" : "/auth/signup"}
            className="inline-flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-xl text-sm font-semibold mt-7 hover:bg-emerald-50 transition active:scale-[0.98]"
          >
            {authed ? "Open dashboard" : "Get Started"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="bg-slate-50 border-t border-slate-200/70 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" alt="Pursuit" width={28} height={28} />
              <span className="text-sm font-semibold tracking-[-0.01em] text-slate-900">Pursuit</span>
              <span className="text-xs text-slate-400 ml-2">© {new Date().getFullYear()}</span>
            </div>
            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
              <Link href="/auth/signup" className="hover:text-slate-800">Sign up</Link>
              <Link href="/auth/login" className="hover:text-slate-800">Sign in</Link>
              <a href="https://github.com/faizvk/job-pilot" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800">GitHub</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
