"use client";

export function TemplatePreview({ content }: { content: string }) {
  const rendered = content
    // Conditional sections: show the tag labels in a muted style
    .replace(
      /\{\{#(\w+)\}\}/g,
      '<span class="text-[10px] text-amber-600 bg-amber-50 px-1 rounded font-mono">if $1</span>'
    )
    .replace(
      /\{\{\/(\w+)\}\}/g,
      '<span class="text-[10px] text-amber-600 bg-amber-50 px-1 rounded font-mono">/if</span>'
    )
    // Regular variables
    .replace(
      /\{\{(\w+)\}\}/g,
      '<span class="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[11px] font-mono ring-1 ring-inset ring-emerald-600/10">$1</span>'
    );

  return (
    <div
      className="bg-white border border-slate-200 rounded-xl p-6 h-[400px] overflow-y-auto prose prose-sm max-w-none shadow-xs"
      dangerouslySetInnerHTML={{
        __html: rendered.replace(/\n/g, "<br />"),
      }}
    />
  );
}
