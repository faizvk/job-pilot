"use client";

import { useEffect, useState } from "react";
import { Mail, CheckCircle, XCircle, ExternalLink, Search, Loader2 } from "lucide-react";

export function IntegrationsPanel() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchCompany, setSearchCompany] = useState("");

  useEffect(() => {
    fetch("/api/ai/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearchEmails = async () => {
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (searchCompany) params.set("company", searchCompany);
      const res = await fetch(`/api/gmail/search?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) setEmails(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return <div className="h-32 bg-gray-50 rounded-lg animate-shimmer" />;
  }

  const gmailConfigured = status?.gmail?.configured;
  const gmailConnected = status?.gmail?.connected;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-1">Integrations</h2>
        <p className="text-sm text-gray-500">Connect external services to enhance your job search</p>
      </div>

      {/* Service Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatusBadge label="Gemini" active={status?.gemini} />
        <StatusBadge label="Groq" active={status?.groq} />
        <StatusBadge label="OpenAI" active={status?.openai} />
        <StatusBadge label="Claude" active={status?.anthropic} />
        <StatusBadge label="DeepSeek" active={status?.deepseek} />
        <StatusBadge label="Mistral" active={status?.mistral} />
        <StatusBadge label="Cohere" active={status?.cohere} />
        <StatusBadge label="Together" active={status?.together} />
        <StatusBadge label="Resend" active={status?.resend} />
        <StatusBadge label="Gmail" active={gmailConnected} />
      </div>

      {/* Gmail Integration */}
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Gmail</h3>
              <p className="text-xs text-gray-500">Send emails & detect application confirmations</p>
            </div>
          </div>
          {gmailConnected ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <CheckCircle className="w-3.5 h-3.5" /> Connected
            </span>
          ) : gmailConfigured ? (
            <a
              href="/api/gmail/auth"
              className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98]"
            >
              <ExternalLink className="w-4 h-4" /> Connect Gmail
            </a>
          ) : (
            <span className="text-xs text-gray-400">Set GMAIL_CLIENT_ID & GMAIL_CLIENT_SECRET in .env</span>
          )}
        </div>

        {/* Email Search (only when connected) */}
        {gmailConnected && (
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Search Application Emails</h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchCompany}
                onChange={(e) => setSearchCompany(e.target.value)}
                placeholder="Company name (optional)"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
              <button
                onClick={handleSearchEmails}
                disabled={searching}
                className="inline-flex items-center gap-1.5 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search
              </button>
            </div>

            {emails.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {emails.map((email: any) => (
                  <div key={email.id} className="border border-gray-100 rounded-lg p-3 text-sm">
                    <div className="font-medium text-gray-900 truncate">{email.subject}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {email.from} &middot; {email.date}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 line-clamp-2">{email.snippet}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2 border border-gray-100 rounded-lg px-3 py-2.5">
      {active ? (
        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-300 shrink-0" />
      )}
      <span className={`text-xs font-medium ${active ? "text-gray-900" : "text-gray-400"}`}>{label}</span>
    </div>
  );
}
