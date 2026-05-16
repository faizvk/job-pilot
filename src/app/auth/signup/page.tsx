"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle, Check } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googling, setGoogling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = scorePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Signup failed.");
        setSubmitting(false);
        return;
      }
      // Immediately sign in
      const signRes = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (!signRes || signRes.error) {
        // Account created; ask them to log in
        router.push("/auth/login");
      } else {
        router.push("/profile?welcome=1");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setGoogling(true);
    await signIn("google", { redirectTo: "/profile?welcome=1" });
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-500 mt-1">Free, single user, your data is yours.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            placeholder="Jane Doe"
            className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
          />
        </div>

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
            autoComplete="new-password"
            minLength={8}
            placeholder="At least 8 characters"
            className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
          />
          {password && (
            <div className="mt-1.5 flex items-center gap-2 text-[11px]">
              <div className="flex gap-1 flex-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded ${
                      i < strength.score
                        ? strength.score >= 3 ? "bg-emerald-500" : strength.score === 2 ? "bg-amber-500" : "bg-rose-500"
                        : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
              <span className={`font-medium ${strength.score >= 3 ? "text-emerald-600" : strength.score === 2 ? "text-amber-600" : "text-rose-600"}`}>
                {strength.label}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md p-2.5">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || password.length < 8}
          className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-md text-sm font-medium hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-50"
        >
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create account"}
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

      <div className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-slate-900 font-medium hover:underline">
          Sign in
        </Link>
      </div>

      <ul className="mt-8 space-y-1.5 text-xs text-slate-500">
        <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Track applications, resumes, follow-ups in one place</li>
        <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> AI-tailored resumes + cover letters</li>
        <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Daily job feed + smart insights</li>
      </ul>
    </div>
  );
}

function scorePassword(pw: string): { score: number; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
  const label = ["", "Weak", "Okay", "Strong", "Excellent"][Math.min(score, 4)];
  return { score: Math.min(score, 4), label };
}
