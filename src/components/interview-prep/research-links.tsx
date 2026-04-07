"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ExternalLink } from "lucide-react";

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

  const removeLink = (i: number) => save(links.filter((_, idx) => idx !== i));

  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="font-medium mb-3">Research Links</h3>
      <div className="space-y-2 mb-3">
        {links.map((link, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-blue-600 hover:underline flex items-center gap-1 truncate">
              <ExternalLink className="w-3 h-3 flex-shrink-0" /> {link.title}
            </a>
            <button onClick={() => removeLink(i)} className="text-red-400 hover:text-red-600">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Title" className="flex-1 border rounded px-2 py-1.5 text-sm" />
        <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="URL" className="flex-1 border rounded px-2 py-1.5 text-sm" />
        <button onClick={addLink} className="text-blue-600 hover:text-blue-700">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
