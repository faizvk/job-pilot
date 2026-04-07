"use client";

import { useRouter } from "next/navigation";
import { ApplicationForm } from "@/components/applications/application-form";

export default function NewApplicationPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const app = await res.json();
      router.push(`/applications/${app.id}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Add New Application</h1>
      <ApplicationForm onSubmit={handleSubmit} />
    </div>
  );
}
