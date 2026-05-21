"use client";

const CATEGORY_COLORS: Record<string, string> = {
  technical: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15",
  soft: "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-600/15",
  tool: "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-500/15",
  language: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/15",
};

export function ExtractedSkills({ skills, category }: { skills: string[]; category?: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <span
          key={skill}
          className={`text-xs font-medium px-2 py-1 rounded-md transition-all duration-100 hover:-translate-y-px cursor-default ${CATEGORY_COLORS[category || "technical"] || CATEGORY_COLORS.technical}`}
        >
          {skill}
        </span>
      ))}
    </div>
  );
}
