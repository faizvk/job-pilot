import { SKILLS_DICTIONARY } from "@/lib/data/skills-dictionary";
import type { JdAnalysis } from "@/types";

// Word-boundary matcher so "Java" doesn't match inside "JavaScript" and
// skills with regex-special chars (C++, C#, Node.js) are matched literally.
function skillRegex(alias: string): RegExp {
  return new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
}

export const jdAnalyzerService = {
  /**
   * Return the set of known skills (by dictionary) that appear anywhere in a
   * block of text. Reused to pull skills out of a résumé / work-history so job
   * matching reflects what the candidate has actually done — not only the
   * skills they typed into their profile.
   */
  extractSkillsFromText(text: string): string[] {
    if (!text || text.trim().length === 0) return [];
    const found: string[] = [];
    for (const entry of SKILLS_DICTIONARY) {
      const allNames = [entry.name.toLowerCase(), ...entry.aliases.map((a) => a.toLowerCase())];
      if (allNames.some((alias) => skillRegex(alias).test(text))) {
        found.push(entry.name);
      }
    }
    return found;
  },

  analyze(jobDescription: string, userSkills: { name: string; category: string }[]): JdAnalysis {
    const jdLines = jobDescription.split("\n");

    // Detect required vs nice-to-have sections
    let inRequiredSection = true;
    const requiredLines: string[] = [];
    const niceToHaveLines: string[] = [];

    for (const line of jdLines) {
      const lineLower = line.toLowerCase().trim();
      if (
        lineLower.includes("required") ||
        lineLower.includes("must have") ||
        lineLower.includes("requirements") ||
        lineLower.includes("qualifications")
      ) {
        inRequiredSection = true;
      } else if (
        lineLower.includes("preferred") ||
        lineLower.includes("nice to have") ||
        lineLower.includes("bonus") ||
        // Only flip on the idiomatic "… is/are a plus", not any stray "plus"
        /\b(is|are|would be)\s+a\s+plus\b/.test(lineLower) ||
        lineLower.includes("desired")
      ) {
        inRequiredSection = false;
      }

      if (inRequiredSection) {
        requiredLines.push(lineLower);
      } else {
        niceToHaveLines.push(lineLower);
      }
    }

    const requiredText = requiredLines.join(" ");

    // Extract skills from JD
    const extractedSkills: string[] = [];
    const requiredSkills: string[] = [];
    const niceToHaveSkills: string[] = [];

    for (const entry of SKILLS_DICTIONARY) {
      const allNames = [entry.name.toLowerCase(), ...entry.aliases.map((a) => a.toLowerCase())];
      const found = allNames.some((alias) => skillRegex(alias).test(jobDescription));

      if (found) {
        extractedSkills.push(entry.name);
        const inRequired = allNames.some((alias) => skillRegex(alias).test(requiredText));
        if (inRequired) {
          requiredSkills.push(entry.name);
        } else {
          niceToHaveSkills.push(entry.name);
        }
      }
    }

    // Match against user skills
    const userSkillNames = new Set(userSkills.map((s) => s.name.toLowerCase()));
    const matchedSkills = extractedSkills.filter((s) => userSkillNames.has(s.toLowerCase()));
    const missingSkills = extractedSkills.filter((s) => !userSkillNames.has(s.toLowerCase()));

    // Calculate a meaningful match score.
    // Old formula was matchedRequired/totalRequired only, which collapsed to 0%
    // whenever a JD had no clearly-labelled "required" section (very common),
    // making scores look broken. Blend required-coverage with overall stack
    // coverage so the number always reflects real overlap.
    const extractedCount = extractedSkills.length;
    const overallRatio = extractedCount ? matchedSkills.length / extractedCount : 0;
    const requiredCount = requiredSkills.length;
    const matchedRequired = requiredSkills.filter((s) => userSkillNames.has(s.toLowerCase())).length;
    const requiredRatio = requiredCount ? matchedRequired / requiredCount : overallRatio;
    const blended = requiredCount >= 2 ? 0.65 * requiredRatio + 0.35 * overallRatio : overallRatio;
    const matchScore = extractedCount === 0 ? 0 : Math.round(blended * 100);

    // Extract experience requirements
    const experienceRequirements: string[] = [];
    const expRegex = /(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience\s+(?:in|with)\s+)?([^,.;\n]+)/gi;
    let match;
    while ((match = expRegex.exec(jobDescription)) !== null) {
      experienceRequirements.push(`${match[1]}+ years ${match[2].trim()}`);
    }

    // Extract additional keywords (common job-related terms)
    const keywords = extractedSkills.slice(0, 10);

    return {
      extractedSkills,
      requiredSkills,
      niceToHaveSkills,
      matchedSkills,
      missingSkills,
      matchScore,
      experienceRequirements,
      keywords,
    };
  },
};
