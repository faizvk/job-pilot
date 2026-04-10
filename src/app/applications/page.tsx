"use client";

import { useEffect, useState } from "react";
import { PipelineBoard } from "@/components/applications/pipeline-board";
import { ApplicationTable } from "@/components/applications/application-table";
import { ApplicationFilters } from "@/components/applications/application-filters";
import { Plus, LayoutGrid, List } from "lucide-react";
import Link from "next/link";

type ViewMode = "kanban" | "table";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchApplications = () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (searchQuery) params.set("search", searchQuery);

    fetch(`/api/applications?${params}`)
      .then((res) => res.json())
      .then(setApplications)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, searchQuery]);

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/applications/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchApplications();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track and manage your job applications</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-2 rounded-md transition-all ${viewMode === "kanban" ? "bg-white shadow-xs text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-md transition-all ${viewMode === "table" ? "bg-white shadow-xs text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Link
            href="/applications/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add Application
          </Link>
        </div>
      </div>

      <ApplicationFilters
        search={searchQuery}
        onSearchChange={setSearchQuery}
        status={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl animate-shimmer" />
          ))}
        </div>
      ) : viewMode === "kanban" ? (
        <PipelineBoard applications={applications} onStatusChange={handleStatusChange} />
      ) : (
        <ApplicationTable applications={applications} />
      )}
    </div>
  );
}
