"use client";

import { formatDate } from "@/lib/utils";
import { Check, Clock, Mail } from "lucide-react";

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  follow_up: { label: "Follow Up", color: "bg-blue-100 text-blue-700" },
  thank_you: { label: "Thank You", color: "bg-green-100 text-green-700" },
  check_in: { label: "Check In", color: "bg-purple-100 text-purple-700" },
};

export function FollowUpList({ followUps, onMarkSent }: { followUps: any[]; onMarkSent: (id: string) => void }) {
  return (
    <div className="space-y-3">
      {followUps.map((fu) => {
        const typeConfig = TYPE_CONFIG[fu.type] || TYPE_CONFIG.follow_up;
        const isOverdue = new Date(fu.dueDate) < new Date() && fu.status === "pending";
        return (
          <div key={fu.id} className={`bg-white border rounded-lg p-4 flex items-center gap-4 ${isOverdue ? "border-red-200" : ""}`}>
            <div className={`p-2 rounded-lg ${fu.status === "sent" ? "bg-green-50" : "bg-gray-50"}`}>
              {fu.status === "sent" ? <Check className="w-5 h-5 text-green-600" /> : <Clock className="w-5 h-5 text-gray-400" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{fu.application?.companyName || "Application"}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${typeConfig.color}`}>{typeConfig.label}</span>
              </div>
              <p className="text-xs text-gray-500">{fu.application?.jobTitle}</p>
              <p className={`text-xs mt-1 ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
                {isOverdue ? "Overdue: " : "Due: "}{formatDate(fu.dueDate)}
              </p>
            </div>
            {fu.status === "pending" && (
              <button
                onClick={() => onMarkSent(fu.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Mail className="w-3 h-3" /> Mark Sent
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
