"use client";

interface SkillGapProps {
  requiredSkills: string[];
  userSkills: string[];
}

export function SkillGapDisplay({ requiredSkills, userSkills }: SkillGapProps) {
  const userSet = new Set(userSkills.map((s) => s.toLowerCase()));

  return (
    <div className="space-y-2">
      {requiredSkills.map((skill) => {
        const hasSkill = userSet.has(skill.toLowerCase());
        return (
          <div key={skill} className="flex items-center gap-3">
            <span className="text-sm w-32 truncate">{skill}</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${hasSkill ? "bg-green-500" : "bg-red-300"}`}
                style={{ width: hasSkill ? "100%" : "20%" }}
              />
            </div>
            <span className={`text-xs ${hasSkill ? "text-green-600" : "text-red-500"}`}>
              {hasSkill ? "Have" : "Gap"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
