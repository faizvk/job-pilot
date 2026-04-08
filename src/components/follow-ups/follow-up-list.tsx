"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { Check, Clock, Mail, Copy, ChevronDown, ChevronRight } from "lucide-react";

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  follow_up: { label: "Follow Up", color: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/10" },
  thank_you: { label: "Thank You", color: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10" },
  check_in: { label: "Check In", color: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/10" },
};

export function FollowUpList({ followUps, onMarkSent }: { followUps: any[]; onMarkSent: (id: string) => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
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
            className={`bg-white border rounded-xl overflow-hidden card-hover ${isOverdue ? "border-red-200" : "border-gray-200"}`}
          >
            <div className="flex items-center gap-4 p-4">
              <div className={`p-2 rounded-lg ${fu.status === "sent" ? "bg-emerald-50" : "bg-gray-50"}`}>
                {fu.status === "sent" ? (
                  <Check className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[14px] text-gray-900">{fu.application?.companyName || "Application"}</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${typeConfig.color}`}>
                    {typeConfig.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{fu.application?.jobTitle}</p>
                <p className={`text-xs mt-1 ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
                  {isOverdue ? "Overdue: " : "Due: "}
                  {formatDate(fu.dueDate)}
                  {fu.sentAt && <span className="text-gray-400 ml-2">Sent {formatDate(fu.sentAt)}</span>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {fu.emailDraft && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : fu.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg shadow-xs transition-all"
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
              <div className="border-t border-gray-100 px-4 pb-4 pt-3 animate-scale-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Email Draft</span>
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
                <pre className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border border-gray-200 leading-relaxed">
                  {fu.emailDraft}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
