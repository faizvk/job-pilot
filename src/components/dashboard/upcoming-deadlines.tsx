"use client";

import { formatDate } from "@/lib/utils";
import { Clock } from "lucide-react";

interface FollowUp {
  id: string;
  dueDate: string;
  type: string;
  application: { companyName: string; jobTitle: string };
}

export function UpcomingDeadlines({ followUps }: { followUps: FollowUp[] }) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="font-semibold mb-4">Upcoming</h2>
      {followUps.length === 0 ? (
        <p className="text-sm text-gray-500">No upcoming follow-ups.</p>
      ) : (
        <div className="space-y-3">
          {followUps.map((fu) => (
            <div key={fu.id} className="flex items-start gap-3 text-sm">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium">{fu.application.companyName}</p>
                <p className="text-xs text-gray-500">
                  {fu.type.replace("_", " ")} · {formatDate(fu.dueDate)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
