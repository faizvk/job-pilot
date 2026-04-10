"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FollowUpList } from "@/components/follow-ups/follow-up-list";
import { FollowUpForm } from "@/components/follow-ups/follow-up-form";
import { Plus } from "lucide-react";

export default function ApplicationFollowUpsPage() {
  const { id } = useParams();
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchData = () => {
    Promise.all([
      fetch(`/api/applications/${id}`).then((r) => r.json()),
      fetch(`/api/follow-ups?applicationId=${id}`).then((r) => r.json()),
    ])
      .then(([appData, fuData]) => {
        setApp(appData);
        setFollowUps(fuData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreate = async (data: any) => {
    await fetch("/api/follow-ups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, applicationId: id }),
    });
    setShowForm(false);
    fetchData();
  };

  const handleMarkSent = async (fuId: string) => {
    await fetch(`/api/follow-ups/${fuId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "sent" }),
    });
    fetchData();
  };

  if (loading) return <div className="animate-pulse h-96 bg-slate-100 rounded-lg" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Follow-ups</h1>
          <p className="text-slate-500">
            {app?.jobTitle} at {app?.companyName}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add Follow-up
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-lg p-6">
          <FollowUpForm
            applicationId={id as string}
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <FollowUpList followUps={followUps} onMarkSent={handleMarkSent} />
    </div>
  );
}
