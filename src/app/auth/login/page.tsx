"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googling, setGoogling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (!res || res.error) {
        setError("Invalid email or password.");
      } else {
        router.push(next);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setGoogling(true);
    await signIn("google", { redirectTo: next });
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
        <p className="text-sm text-slate-500 mt-1">Sign in to continue your job hunt.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md p-2.5">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-md text-sm font-medium hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-50"
        >
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : "Sign in"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
        <div className="flex-1 h-px bg-slate-200" />
        <span>or</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <button
        onClick={handleGoogle}
        disabled={googling}
        className="w-full inline-flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-700 py-2.5 rounded-md text-sm font-medium hover:bg-slate-50 transition disabled:opacity-50"
      >
        {googling ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.5-5.9 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.2 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.1 0 9.8-2 13.3-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.4 0-9.9-3.4-11.5-8.1l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2c-.4.4 6.7-4.9 6.7-14.9 0-1.2-.1-2.3-.4-3.5z"/>
          </svg>
        )}
        Continue with Google
      </button>

      <p className="text-center text-sm text-slate-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-slate-900 font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-400">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
