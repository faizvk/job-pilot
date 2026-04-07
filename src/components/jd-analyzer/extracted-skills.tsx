"use client";

const CATEGORY_COLORS: Record<string, string> = {
  technical: "bg-blue-100 text-blue-700",
  soft: "bg-purple-100 text-purple-700",
  tool: "bg-green-100 text-green-700",
  language: "bg-amber-100 text-amber-700",
};

export function ExtractedSkills({ skills, category }: { skills: string[]; category?: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <span
          key={skill}
          className={`text-xs px-2 py-1 rounded-full ${CATEGORY_COLORS[category || "technical"] || CATEGORY_COLORS.technical}`}
        >
          {skill}
        </span>
      ))}
    </div>
  );
}
