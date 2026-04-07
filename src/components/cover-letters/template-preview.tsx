"use client";

export function TemplatePreview({ content }: { content: string }) {
  const rendered = content.replace(
    /\{\{(\w+)\}\}/g,
    '<span class="bg-blue-100 text-blue-700 px-1 rounded text-xs font-mono">$1</span>'
  );

  return (
    <div
      className="bg-white border rounded-lg p-6 h-[400px] overflow-y-auto prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{
        __html: rendered.replace(/\n/g, "<br />"),
      }}
    />
  );
}
