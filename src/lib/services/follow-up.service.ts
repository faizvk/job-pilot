import prisma from "@/lib/db";

const FOLLOW_UP_TEMPLATES: Record<string, { subject: string; body: string }> = {
  follow_up: {
    subject: "Following Up — {{jobTitle}} Application",
    body: `Dear Hiring Team,

I hope this message finds you well. I wanted to follow up on my application for the {{jobTitle}} position at {{companyName}}, which I submitted on {{appliedDate}}.

I remain very interested in this opportunity and would love to learn more about how I can contribute to your team. Please let me know if there is any additional information I can provide.

Thank you for your time and consideration.

Best regards,
{{userName}}`,
  },
  thank_you: {
    subject: "Thank You — {{jobTitle}} Interview",
    body: `Dear {{companyName}} Team,

Thank you for taking the time to speak with me about the {{jobTitle}} position. I enjoyed learning more about the role and the team.

Our conversation reinforced my enthusiasm for this opportunity, and I am excited about the possibility of contributing to {{companyName}}.

Please do not hesitate to reach out if you need any further information from my end.

Best regards,
{{userName}}`,
  },
  check_in: {
    subject: "Checking In — {{jobTitle}} at {{companyName}}",
    body: `Hi there,

I wanted to check in regarding the {{jobTitle}} position at {{companyName}}. I am still very interested in this opportunity and would appreciate any updates on the hiring timeline.

Looking forward to hearing from you.

Best regards,
{{userName}}`,
  },
};

function fillTemplate(template: { subject: string; body: string }, vars: Record<string, string>) {
  let subject = template.subject;
  let body = template.body;
  for (const [key, value] of Object.entries(vars)) {
    subject = subject.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    body = body.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return `Subject: ${subject}\n\n${body}`;
}

export const followUpService = {
  async list(userId: string, filters?: { status?: string; applicationId?: string }) {
    const where: any = { userId };
    if (filters?.status && filters.status !== "all") where.status = filters.status;
    if (filters?.applicationId) where.applicationId = filters.applicationId;
    return prisma.followUp.findMany({
      where,
      orderBy: { dueDate: "asc" },
      include: { application: { select: { companyName: true, jobTitle: true } } },
    });
  },

  async getById(id: string) {
    return prisma.followUp.findUnique({
      where: { id },
      include: { application: { select: { companyName: true, jobTitle: true } } },
    });
  },

  async create(userId: string, data: any) {
    return prisma.followUp.create({
      data: {
        userId,
        applicationId: data.applicationId,
        dueDate: new Date(data.dueDate),
        type: data.type,
        emailDraft: data.emailDraft || null,
      },
    });
  },

  async createWithDraft(userId: string, data: { applicationId: string; type: string; dueDate: string }) {
    const app = await prisma.application.findUnique({ where: { id: data.applicationId } });
    if (!app) throw new Error("Application not found");

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const template = FOLLOW_UP_TEMPLATES[data.type] || FOLLOW_UP_TEMPLATES.follow_up;
    const emailDraft = fillTemplate(template, {
      jobTitle: app.jobTitle,
      companyName: app.companyName,
      userName: user?.name || "Your Name",
      appliedDate: app.appliedAt
        ? new Date(app.appliedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : "recently",
    });

    return prisma.followUp.create({
      data: {
        userId,
        applicationId: data.applicationId,
        dueDate: new Date(data.dueDate),
        type: data.type,
        emailDraft,
      },
      include: { application: { select: { companyName: true, jobTitle: true } } },
    });
  },

  async update(id: string, data: any) {
    return prisma.followUp.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
    });
  },

  async markSent(id: string) {
    return prisma.followUp.update({
      where: { id },
      data: { status: "sent", sentAt: new Date() },
    });
  },

  async delete(id: string) {
    return prisma.followUp.delete({ where: { id } });
  },
};
