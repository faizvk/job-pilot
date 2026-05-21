"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ExternalLink, Link2 } from "lucide-react";

interface ResearchLink {
  url: string;
  title: string;
}

export function ResearchLinks({ links: linksJson, onChange }: { links: string; onChange: (v: string) => void }) {
  const [links, setLinks] = useState<ResearchLink[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    try { setLinks(JSON.parse(linksJson)); } catch { setLinks([]); }
  }, [linksJson]);

  const save = (updated: ResearchLink[]) => {
    setLinks(updated);
    onChange(JSON.stringify(updated));
  };

  const addLink = () => {
    if (!newUrl) return;
    save([...links, { url: newUrl, title: newTitle || newUrl }]);
    setNewUrl("");
    setNewTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addLink();
    }
  };

  const removeLink = (i: number) => save(links.filter((_, idx) => idx !== i));

  return (
    <div className="bg-white border border-slate-200/70 rounded-xl p-4 sm:p-5 shadow-xs transition-shadow duration-200 hover:shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center">
          <Link2 className="w-3.5 h-3.5 text-teal-600" />
        </div>
        <h3 className="font-semibold text-[14px] text-slate-900">Research Links</h3>
      </div>
      <div className="space-y-2 mb-3">
        {links.map((link, i) => (
          <div key={i} className="flex items-center gap-2 group">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 truncate transition-colors"
            >
              <ExternalLink className="w-3 h-3 flex-shrink-0" /> {link.title}
            </a>
            <button
              onClick={() => removeLink(i)}
              className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {links.length === 0 && (
          <p className="text-xs text-slate-400">Add links to company pages, Glassdoor reviews, news articles...</p>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Title"
          className="flex-1 border border-slate-200 rounded-md px-2.5 py-1.5 text-sm shadow-xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 transition-colors duration-150"
        />
        <input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="URL"
          className="flex-1 border border-slate-200 rounded-md px-2.5 py-1.5 text-sm shadow-xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 transition-colors duration-150"
        />
        <button
          onClick={addLink}
          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors duration-150 px-3 py-1.5 rounded-md flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
