"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Mail, FileText, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";

const TEMPLATE_ICONS: Record<string, string> = {
  "General Application": "bg-indigo-50 text-indigo-600",
  "Technical / Engineering": "bg-violet-50 text-violet-600",
  "Startup / Growth Stage": "bg-amber-50 text-amber-600",
};

export default function CoverLettersPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const load = () => {
    fetch("/api/cover-letters/templates")
      .then((r) => r.json())
      .then(setTemplates)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const seedTemplates = async () => {
    setSeeding(true);
    await fetch("/api/cover-letters/templates/seed", { method: "POST" });
    load();
    setSeeding(false);
  };

  const iconClass = (name: string) => TEMPLATE_ICONS[name] || "bg-gray-50 text-gray-600";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cover Letter Templates</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage templates for different job types</p>
        </div>
        <Link
          href="/cover-letters/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> New Template
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-white border border-gray-200 rounded-xl animate-shimmer" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">No templates yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">Start with our pre-built templates or create your own</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={seedTemplates}
              disabled={seeding}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" /> {seeding ? "Creating..." : "Add Starter Templates"}
            </button>
            <Link
              href="/cover-letters/new"
              className="inline-flex items-center gap-2 border border-gray-200 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" /> Create from Scratch
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Link
              key={template.id}
              href={`/cover-letters/${template.id}`}
              className="bg-white border border-gray-200 rounded-xl p-5 card-hover group"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${iconClass(template.name)}`}>
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-[14px] text-gray-900 group-hover:text-indigo-600 transition-colors">{template.name}</h3>
              <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                {template.content.replace(/\{\{[#/]?\w+\}\}/g, "___").slice(0, 120)}...
              </p>
              <p className="text-xs text-gray-400 mt-3">
                Updated {formatDate(template.updatedAt)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
