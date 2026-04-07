"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ApplicationForm } from "@/components/applications/application-form";

export default function EditApplicationPage() {
  const { id } = useParams();
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/applications/${id}`)
      .then((res) => res.json())
      .then(setApp)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data: any) => {
    const res = await fetch(`/api/applications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push(`/applications/${id}`);
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-gray-100 rounded-lg" />;
  if (!app) return <p className="text-gray-500">Application not found.</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Edit Application</h1>
      <ApplicationForm onSubmit={handleSubmit} defaultValues={app} />
    </div>
  );
}
