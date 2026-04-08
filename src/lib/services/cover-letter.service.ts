import prisma from "@/lib/db";

export const STARTER_TEMPLATES = [
  {
    name: "General Application",
    content: `Dear Hiring Manager,

I am writing to express my interest in the {{jobTitle}} position at {{companyName}}. As a {{recentRole}} with experience in {{topSkills}}, I am excited about the opportunity to contribute to your team.

{{summary}}

In my most recent role at {{recentCompany}}, I developed strong expertise in {{topSkills}}. I am confident these skills align well with what you are looking for in a {{jobTitle}}.

{{#matchedSkills}}I noticed your job posting mentions several technologies I work with regularly, including {{matchedSkills}}. {{/matchedSkills}}I am eager to bring this experience to {{companyName}} and help drive results.

I would welcome the opportunity to discuss how my background and skills can benefit your team. Thank you for considering my application.

Best regards,
{{userName}}`,
  },
  {
    name: "Technical / Engineering",
    content: `Dear Hiring Team,

I am excited to apply for the {{jobTitle}} role at {{companyName}}. With {{experienceYears}} of hands-on experience in software development, I bring a strong foundation in {{topSkills}} that I believe makes me a great fit for this position.

As a {{recentRole}} at {{recentCompany}}, I have worked extensively with modern development tools and frameworks. My technical stack includes {{allSkills}}, and I am always eager to learn and adopt new technologies.

{{#matchedSkills}}Your posting specifically mentions {{matchedSkills}} — these are technologies I use daily and am passionate about. {{/matchedSkills}}I am drawn to {{companyName}} because I want to work on challenging problems alongside talented engineers.

{{#education}}My educational background includes {{education}}, which gave me a solid theoretical foundation that I continue to build on through practical work. {{/education}}

I would love to discuss how my technical skills and experience can contribute to {{companyName}}'s engineering goals.

Best regards,
{{userName}}`,
  },
  {
    name: "Startup / Growth Stage",
    content: `Hi there,

I came across the {{jobTitle}} opening at {{companyName}} and it immediately caught my attention. I thrive in fast-paced environments where I can wear multiple hats, and my background in {{topSkills}} positions me well to make an immediate impact.

At {{recentCompany}}, I worked as a {{recentRole}} where I learned to move quickly, ship often, and iterate based on feedback. I am comfortable owning projects end-to-end, from planning through deployment.

{{#matchedSkills}}I am especially excited that your team works with {{matchedSkills}} — tools I know well and enjoy working with. {{/matchedSkills}}Beyond technical skills, I bring strong communication, adaptability, and a genuine passion for building products that users love.

I would love to chat about how I can contribute to {{companyName}}'s growth. Looking forward to hearing from you!

Cheers,
{{userName}}`,
  },
];

export const coverLetterService = {
  async listTemplates(userId: string) {
    return prisma.coverLetterTemplate.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
  },

  async getTemplate(id: string) {
    return prisma.coverLetterTemplate.findUnique({ where: { id } });
  },

  async createTemplate(userId: string, data: { name: string; content: string }) {
    return prisma.coverLetterTemplate.create({ data: { userId, ...data } });
  },

  async updateTemplate(id: string, data: { name?: string; content?: string }) {
    return prisma.coverLetterTemplate.update({ where: { id }, data });
  },

  async deleteTemplate(id: string) {
    return prisma.coverLetterTemplate.delete({ where: { id } });
  },

  async seedStarterTemplates(userId: string) {
    const existing = await prisma.coverLetterTemplate.count({ where: { userId } });
    if (existing > 0) return [];

    const created = [];
    for (const t of STARTER_TEMPLATES) {
      const template = await prisma.coverLetterTemplate.create({
        data: { userId, name: t.name, content: t.content },
      });
      created.push(template);
    }
    return created;
  },

  async generate(templateId: string, applicationId: string) {
    const template = await prisma.coverLetterTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new Error("Template not found");

    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!app) throw new Error("Application not found");

    const user = await prisma.user.findUnique({
      where: { id: app.userId },
      include: {
        workHistory: { orderBy: { startDate: "desc" } },
        skills: true,
        education: { orderBy: { startDate: "desc" }, take: 1 },
      },
    });

    const technicalSkills = user?.skills.filter((s) => s.category === "technical").map((s) => s.name) || [];
    const toolSkills = user?.skills.filter((s) => s.category === "tool").map((s) => s.name) || [];
    const allSkillNames = user?.skills.map((s) => s.name) || [];

    // Match skills from job description
    const jobDesc = (app.jobDescription || "").toLowerCase();
    const matchedSkills = allSkillNames.filter((s) => jobDesc.includes(s.toLowerCase()));

    // Calculate experience years
    let experienceYears = "professional";
    if (user?.workHistory && user.workHistory.length > 0) {
      const earliest = user.workHistory[user.workHistory.length - 1];
      const years = Math.max(1, Math.round((Date.now() - new Date(earliest.startDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)));
      experienceYears = years === 1 ? "1 year" : `${years} years`;
    }

    // Education
    const edu = user?.education[0];
    const educationStr = edu ? `${edu.degree} in ${edu.field} from ${edu.institution}` : "";

    const variables: Record<string, string> = {
      companyName: app.companyName,
      jobTitle: app.jobTitle,
      userName: user?.name || "Your Name",
      topSkills: technicalSkills.slice(0, 5).join(", ") || "relevant skills",
      allSkills: [...technicalSkills, ...toolSkills].join(", ") || "various technologies",
      matchedSkills: matchedSkills.length > 0 ? matchedSkills.join(", ") : "",
      recentRole: user?.workHistory[0]?.title || "Previous Role",
      recentCompany: user?.workHistory[0]?.company || "Previous Company",
      location: app.location || "your location",
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      summary: user?.summary || "",
      experienceYears: experienceYears,
      education: educationStr,
    };

    let content = template.content;

    // Handle conditional sections: {{#variable}}...{{/variable}}
    // Show section only if variable has a value
    content = content.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, inner) => {
      const val = variables[key];
      if (!val || val.trim() === "") return "";
      // Replace the variable inside the section too
      return inner.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val);
    });

    // Replace remaining simple variables
    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    }

    // Clean up any double blank lines
    content = content.replace(/\n{3,}/g, "\n\n");

    const existing = await prisma.generatedCoverLetter.findUnique({ where: { applicationId } });
    if (existing) {
      return prisma.generatedCoverLetter.update({
        where: { applicationId },
        data: { content, templateId },
      });
    }

    return prisma.generatedCoverLetter.create({
      data: { templateId, applicationId, content },
    });
  },
};
