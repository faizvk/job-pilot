"use client";

import { formatDate } from "@/lib/utils";
import { Clock, Calendar } from "lucide-react";

interface FollowUp {
  id: string;
  dueDate: string;
  type: string;
  application: { companyName: string; jobTitle: string };
}

export function UpcomingDeadlines({ followUps }: { followUps: FollowUp[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-card p-5">
      <h2 className="text-[15px] font-semibold text-slate-900 mb-4">Upcoming</h2>
      {followUps.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-500">No upcoming follow-ups</p>
        </div>
      ) : (
        <div className="space-y-3">
          {followUps.map((fu) => (
            <div key={fu.id} className="flex items-start gap-3 p-2.5 -mx-1 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 flex-shrink-0 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{fu.application.companyName}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {fu.type.replace("_", " ")} &middot; {formatDate(fu.dueDate)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
