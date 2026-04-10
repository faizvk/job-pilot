"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";
import { Check, Clock, Mail, Copy, ChevronDown, ChevronRight, Send, Loader2 } from "lucide-react";

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  follow_up: { label: "Follow Up", color: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/10" },
  thank_you: { label: "Thank You", color: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10" },
  check_in: { label: "Check In", color: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/10" },
};

export function FollowUpList({ followUps, onMarkSent }: { followUps: any[]; onMarkSent: (id: string) => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentEmailId, setSentEmailId] = useState<string | null>(null);
  const [emailTo, setEmailTo] = useState<Record<string, string>>({});
  const [emailEnabled, setEmailEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/ai/status")
      .then((r) => r.json())
      .then((s) => setEmailEnabled(s.resend))
      .catch(() => {});
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleSendEmail = async (fu: any) => {
    const to = emailTo[fu.id];
    if (!to || !fu.emailDraft) return;

    setSendingId(fu.id);
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followUpId: fu.id, to, draft: fu.emailDraft }),
      });
      if (res.ok) {
        setSentEmailId(fu.id);
        setTimeout(() => setSentEmailId(null), 3000);
        onMarkSent(fu.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {followUps.map((fu) => {
        const typeConfig = TYPE_CONFIG[fu.type] || TYPE_CONFIG.follow_up;
        const isOverdue = new Date(fu.dueDate) < new Date() && fu.status === "pending";
        const isExpanded = expandedId === fu.id;

        return (
          <div
            key={fu.id}
            className={`bg-white border rounded-xl overflow-hidden card-hover ${isOverdue ? "border-red-200" : "border-slate-200"}`}
          >
            <div className="flex items-center gap-4 p-4">
              <div className={`p-2 rounded-lg ${fu.status === "sent" ? "bg-emerald-50" : "bg-slate-50"}`}>
                {fu.status === "sent" ? (
                  <Check className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Clock className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[14px] text-slate-900">{fu.application?.companyName || "Application"}</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${typeConfig.color}`}>
                    {typeConfig.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{fu.application?.jobTitle}</p>
                <p className={`text-xs mt-1 ${isOverdue ? "text-red-500 font-medium" : "text-slate-400"}`}>
                  {isOverdue ? "Overdue: " : "Due: "}
                  {formatDate(fu.dueDate)}
                  {fu.sentAt && <span className="text-slate-400 ml-2">Sent {formatDate(fu.sentAt)}</span>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {fu.emailDraft && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : fu.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg shadow-xs transition-all"
                  >
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    Draft
                  </button>
                )}
                {fu.status === "pending" && (
                  <button
                    onClick={() => onMarkSent(fu.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm transition-all active:scale-[0.98]"
                  >
                    <Mail className="w-3 h-3" /> Mark Sent
                  </button>
                )}
              </div>
            </div>

            {isExpanded && fu.emailDraft && (
              <div className="border-t border-slate-100 px-4 pb-4 pt-3 animate-scale-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email Draft</span>
                  <button
                    onClick={() => handleCopy(fu.emailDraft, fu.id)}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    {copiedId === fu.id ? (
                      <><Check className="w-3 h-3" /> Copied</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copy</>
                    )}
                  </button>
                </div>
                <pre className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 rounded-lg p-3 border border-slate-200 leading-relaxed">
                  {fu.emailDraft}
                </pre>

                {/* Send Email section */}
                {emailEnabled && fu.status === "pending" && (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="email"
                      placeholder="Recipient email (e.g. hr@company.com)"
                      value={emailTo[fu.id] || ""}
                      onChange={(e) => setEmailTo({ ...emailTo, [fu.id]: e.target.value })}
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                    />
                    <button
                      onClick={() => handleSendEmail(fu)}
                      disabled={!emailTo[fu.id] || sendingId === fu.id}
                      className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98]"
                    >
                      {sentEmailId === fu.id ? (
                        <><Check className="w-3.5 h-3.5" /> Sent!</>
                      ) : sendingId === fu.id ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                      ) : (
                        <><Send className="w-3.5 h-3.5" /> Send Email</>
                      )}
                    </button>
                  </div>
                )}
                {!emailEnabled && fu.status === "pending" && (
                  <p className="mt-2 text-[10px] text-slate-400">Set RESEND_API_KEY in .env to send emails directly</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
