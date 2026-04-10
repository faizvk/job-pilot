"use client";

export function ResumePreview({ content }: { content: string }) {
  const renderContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("# ")) return <h1 key={i} className="text-2xl font-bold mb-2">{line.slice(2)}</h1>;
      if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-semibold mt-4 mb-2 text-blue-700 border-b pb-1">{line.slice(3)}</h2>;
      if (line.startsWith("### ")) return <h3 key={i} className="text-sm font-semibold mt-2">{line.slice(4)}</h3>;
      if (line.startsWith("- ")) return <li key={i} className="text-sm ml-4 text-slate-700">{line.slice(2)}</li>;
      if (line.startsWith("<!--")) return null;
      if (line.trim() === "") return <br key={i} />;
      return <p key={i} className="text-sm text-slate-700">{line}</p>;
    });
  };

  return (
    <div className="bg-white border rounded-lg p-6 h-[500px] overflow-y-auto">
      {content ? renderContent(content) : (
        <p className="text-slate-400 text-sm">Preview will appear here...</p>
      )}
    </div>
  );
}
