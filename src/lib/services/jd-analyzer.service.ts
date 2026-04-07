import { SKILLS_DICTIONARY } from "@/lib/data/skills-dictionary";
import type { JdAnalysis } from "@/types";

export const jdAnalyzerService = {
  analyze(jobDescription: string, userSkills: { name: string; category: string }[]): JdAnalysis {
    const jdLower = jobDescription.toLowerCase();
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
        lineLower.includes("plus") ||
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
      const found = allNames.some((alias) => {
        // Word boundary match
        const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
        return regex.test(jdLower);
      });

      if (found) {
        extractedSkills.push(entry.name);
        const inRequired = allNames.some((alias) => {
          const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
          return regex.test(requiredText);
        });
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

    // Calculate match score
    const totalRequired = requiredSkills.length || 1;
    const matchedRequired = requiredSkills.filter((s) => userSkillNames.has(s.toLowerCase())).length;
    const matchScore = Math.round((matchedRequired / totalRequired) * 100);

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
