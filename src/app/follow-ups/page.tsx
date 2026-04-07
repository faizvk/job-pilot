"use client";

import { useEffect, useState } from "react";
import { FollowUpList } from "@/components/follow-ups/follow-up-list";
import { Bell } from "lucide-react";

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  const fetchFollowUps = () => {
    fetch(`/api/follow-ups?status=${filter}`)
      .then((r) => r.json())
      .then(setFollowUps)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFollowUps();
  }, [filter]);

  const handleMarkSent = async (id: string) => {
    await fetch(`/api/follow-ups/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "sent" }),
    });
    fetchFollowUps();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Follow-ups</h1>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {["pending", "sent", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-md capitalize ${
                filter === f ? "bg-white shadow-sm font-medium" : "text-gray-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : followUps.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No follow-ups found.</p>
        </div>
      ) : (
        <FollowUpList followUps={followUps} onMarkSent={handleMarkSent} />
      )}
    </div>
  );
}
