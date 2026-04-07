"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Mail } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function CoverLettersPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cover-letters/templates")
      .then((r) => r.json())
      .then(setTemplates)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cover Letter Templates</h1>
        <Link
          href="/cover-letters/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> New Template
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No templates yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Link
              key={template.id}
              href={`/cover-letters/${template.id}`}
              className="bg-white border rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <Mail className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-semibold">{template.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {template.content.slice(0, 100)}...
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Updated {formatDate(template.updatedAt)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
