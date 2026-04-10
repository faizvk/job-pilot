import { google } from "googleapis";
import prisma from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";
import * as telegram from "./telegram.service";
import { createCalendarEvent } from "./calendar.service";

// ──────────────────────────────────────────────
// 1. Gmail Auto-Scan for Status Updates
// ──────────────────────────────────────────────

interface EmailSignal {
  type: "interview" | "rejection" | "offer" | "phone_screen";
  company: string;
  subject: string;
  snippet: string;
  date: string;
  interviewDate?: string;
}

const INTERVIEW_PATTERNS = [
  /interview/i,
  /schedule.*(call|meeting|chat)/i,
  /invite.*to.*(discuss|meet)/i,
  /like to (meet|speak|chat)/i,
  /set up.*(time|call)/i,
];

const REJECTION_PATTERNS = [
  /unfortunately/i,
  /not.*(moving forward|proceeding|selected)/i,
  /decided.*(not|other)/i,
  /position.*filled/i,
  /will not be (moving|advancing)/i,
  /regret to inform/i,
  /after careful (review|consideration)/i,
];

const OFFER_PATTERNS = [
  /pleased to offer/i,
  /offer.*(letter|package|position)/i,
  /extend.*offer/i,
  /congratulations.*selected/i,
  /welcome.*team/i,
];

const PHONE_SCREEN_PATTERNS = [
  /phone.*screen/i,
  /initial.*(call|screening)/i,
  /brief.*chat/i,
  /introductory.*(call|conversation)/i,
];

function classifyEmail(subject: string, snippet: string): EmailSignal["type"] | null {
  const text = `${subject} ${snippet}`;
  if (OFFER_PATTERNS.some((p) => p.test(text))) return "offer";
  if (INTERVIEW_PATTERNS.some((p) => p.test(text))) return "interview";
  if (PHONE_SCREEN_PATTERNS.some((p) => p.test(text))) return "phone_screen";
  if (REJECTION_PATTERNS.some((p) => p.test(text))) return "rejection";
  return null;
}

// Extract date/time from email text (common patterns)
function extractInterviewDateTime(text: string): string | undefined {
  // Match patterns like "January 15, 2026 at 2:00 PM", "Jan 15 at 2pm", "15/01/2026 14:00"
  const patterns = [
    /(\w+\s+\d{1,2},?\s+\d{4}\s+at\s+\d{1,2}[:.]\d{2}\s*(?:AM|PM|am|pm)?)/i,
    /(\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}[:.]\d{2})/,
    /(\w+\s+\d{1,2}(?:st|nd|rd|th)?\s+at\s+\d{1,2}(?:[:.]\d{2})?\s*(?:AM|PM|am|pm)?)/i,
  ];
  for (const p of patterns) {
    const match = text.match(p);
    if (match) return match[1];
  }
  return undefined;
}

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );
}

async function getGmailClient() {
  const user = await prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } });
  if (!user?.gmailTokens) return null;

  const tokens = JSON.parse(user.gmailTokens);
  const oauth2 = getOAuth2Client();
  oauth2.setCredentials(tokens);

  oauth2.on("tokens", async (newTokens) => {
    const merged = { ...tokens, ...newTokens };
    await prisma.user.update({
      where: { id: DEFAULT_USER_ID },
      data: { gmailTokens: JSON.stringify(merged) },
    });
  });

  return google.gmail({ version: "v1", auth: oauth2 });
}

export async function scanGmailForUpdates(): Promise<{
  scanned: number;
  updates: Array<{ company: string; type: string; subject: string }>;
}> {
  const gmail = await getGmailClient();
  if (!gmail) return { scanned: 0, updates: [] };

  // Get all active applications (applied or later, not rejected/accepted)
  const applications = await prisma.application.findMany({
    where: {
      userId: DEFAULT_USER_ID,
      status: { in: ["applied", "phone_screen", "interview"] },
    },
  });

  if (applications.length === 0) return { scanned: 0, updates: [] };

  const updates: Array<{ company: string; type: string; subject: string }> = [];

  for (const app of applications) {
    try {
      // Search emails from/about this company in the last 7 days
      const query = `(from:${app.companyName} OR subject:"${app.companyName}") newer_than:7d`;
      const res = await gmail.users.messages.list({
        userId: "me",
        q: query,
        maxResults: 5,
      });

      if (!res.data.messages) continue;

      for (const msg of res.data.messages) {
        const detail = await gmail.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "metadata",
          metadataHeaders: ["Subject", "From", "Date"],
        });

        const headers = detail.data.payload?.headers || [];
        const subject = headers.find((h) => h.name === "Subject")?.value || "";
        const snippet = detail.data.snippet || "";
        const dateStr = headers.find((h) => h.name === "Date")?.value || "";

        const type = classifyEmail(subject, snippet);
        if (!type) continue;

        // Map email type to application status
        const statusMap: Record<string, string> = {
          interview: "interview",
          phone_screen: "phone_screen",
          offer: "offer",
          rejection: "rejected",
        };
        const newStatus = statusMap[type];

        // Only update if it's a progression (don't go backwards)
        const statusOrder = ["saved", "applied", "phone_screen", "interview", "offer", "accepted", "rejected"];
        const currentIdx = statusOrder.indexOf(app.status);
        const newIdx = statusOrder.indexOf(newStatus);

        // rejected can come from any state; others must be forward
        if (type === "rejection" || newIdx > currentIdx) {
          await prisma.application.update({
            where: { id: app.id },
            data: { status: newStatus },
          });

          await prisma.statusChange.create({
            data: {
              applicationId: app.id,
              fromStatus: app.status,
              toStatus: newStatus,
              note: `Auto-detected from email: "${subject}"`,
            },
          });

          // Notify via Telegram
          await telegram.notifyApplicationUpdate(app.companyName, newStatus);

          updates.push({ company: app.companyName, type: newStatus, subject });

          // If interview detected, try to create calendar event
          if (type === "interview" || type === "phone_screen") {
            const interviewDate = extractInterviewDateTime(`${subject} ${snippet}`);
            if (interviewDate) {
              try {
                const parsed = new Date(interviewDate);
                if (!isNaN(parsed.getTime())) {
                  const endTime = new Date(parsed.getTime() + 60 * 60 * 1000); // 1 hour
                  await createCalendarEvent({
                    title: `Interview: ${app.companyName} - ${app.jobTitle}`,
                    description: `Auto-detected from email.\n\nSubject: ${subject}`,
                    startTime: parsed.toISOString(),
                    endTime: endTime.toISOString(),
                  });
                }
              } catch {
                // Calendar event creation is best-effort
              }
            }
          }

          break; // One update per application per scan
        }
      }
    } catch (e) {
      console.error(`Gmail scan error for ${app.companyName}:`, e);
    }
  }

  return { scanned: applications.length, updates };
}

// ──────────────────────────────────────────────
// 2. Auto Follow-up Scheduler
// ──────────────────────────────────────────────

export async function scheduleAutoFollowUps(): Promise<{
  created: number;
  applications: string[];
}> {
  // Find applications that were marked "applied" more than 7 days ago
  // and don't have a pending follow-up already
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const applications = await prisma.application.findMany({
    where: {
      userId: DEFAULT_USER_ID,
      status: "applied",
      appliedAt: { lte: sevenDaysAgo },
    },
    include: {
      followUps: {
        where: { status: "pending" },
      },
    },
  });

  const needsFollowUp = applications.filter((a) => a.followUps.length === 0);
  const created: string[] = [];

  for (const app of needsFollowUp) {
    // Create follow-up due in 1 day (so user can review before sending)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);

    // Draft a follow-up email
    const emailDraft = generateFollowUpDraft(app.companyName, app.jobTitle, app.contactName, app.contactEmail);

    await prisma.followUp.create({
      data: {
        userId: DEFAULT_USER_ID,
        applicationId: app.id,
        type: "follow_up",
        dueDate,
        emailDraft,
        status: "pending",
      },
    });

    created.push(app.companyName);
  }

  // Notify via Telegram if any follow-ups were created
  if (created.length > 0) {
    const chatId = await getChatId();
    if (chatId) {
      const list = created.map((c) => `  • ${c}`).join("\n");
      await telegram.sendMessage(
        chatId,
        `📝 <b>Auto Follow-ups Created</b>\n\n${created.length} application(s) need follow-up (7+ days with no response):\n${list}\n\nReview them in Follow-ups.`
      );
    }
  }

  return { created: created.length, applications: created };
}

function generateFollowUpDraft(
  company: string,
  jobTitle: string,
  contactName: string | null,
  contactEmail: string | null
): string {
  const greeting = contactName ? `Dear ${contactName}` : "Dear Hiring Manager";
  return `${greeting},

I hope this message finds you well. I wanted to follow up on my application for the ${jobTitle} position at ${company}.

I remain very enthusiastic about the opportunity and would love to learn more about the next steps in the hiring process. I'm confident my skills and experience align well with what you're looking for.

Please don't hesitate to reach out if you need any additional information from my end.

Thank you for your time and consideration.

Best regards`;
}

// ──────────────────────────────────────────────
// 3. Daily Telegram Digest
// ──────────────────────────────────────────────

export async function sendDailyDigest(): Promise<{ sent: boolean; sections: string[] }> {
  const chatId = await getChatId();
  if (!chatId) return { sent: false, sections: [] };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86400000);
  const weekFromNow = new Date(today.getTime() + 7 * 86400000);

  const sections: string[] = [];
  const lines: string[] = [`📊 <b>Daily Digest — ${today.toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })}</b>\n`];

  // 1. Follow-ups due today
  const dueFollowUps = await prisma.followUp.findMany({
    where: {
      userId: DEFAULT_USER_ID,
      status: "pending",
      dueDate: { gte: today, lt: tomorrow },
    },
    include: { application: true },
  });

  if (dueFollowUps.length > 0) {
    sections.push("follow-ups");
    lines.push(`⏰ <b>Follow-ups Due Today (${dueFollowUps.length})</b>`);
    for (const fu of dueFollowUps) {
      lines.push(`  • ${fu.application.companyName} — ${fu.application.jobTitle} (${fu.type.replace("_", " ")})`);
    }
    lines.push("");
  }

  // 2. Upcoming interviews this week
  const interviews = await prisma.application.findMany({
    where: {
      userId: DEFAULT_USER_ID,
      status: "interview",
    },
  });

  if (interviews.length > 0) {
    sections.push("interviews");
    lines.push(`📅 <b>Active Interviews (${interviews.length})</b>`);
    for (const app of interviews) {
      lines.push(`  • ${app.companyName} — ${app.jobTitle}`);
    }
    lines.push("");
  }

  // 3. New job alert matches (last 24 hours)
  const recentJobs = await prisma.jobListing.count({
    where: {
      fetchedAt: { gte: new Date(now.getTime() - 86400000) },
    },
  });

  if (recentJobs > 0) {
    sections.push("new-jobs");
    lines.push(`🔍 <b>New Job Matches: ${recentJobs}</b> in the last 24 hours`);
    lines.push("");
  }

  // 4. Stale applications (applied > 14 days, no update)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);
  const staleApps = await prisma.application.findMany({
    where: {
      userId: DEFAULT_USER_ID,
      status: "applied",
      updatedAt: { lte: fourteenDaysAgo },
    },
  });

  if (staleApps.length > 0) {
    sections.push("stale");
    lines.push(`⚠️ <b>Needs Attention (${staleApps.length})</b> — No response for 14+ days`);
    for (const app of staleApps.slice(0, 5)) {
      lines.push(`  • ${app.companyName} — ${app.jobTitle}`);
    }
    if (staleApps.length > 5) lines.push(`  ... and ${staleApps.length - 5} more`);
    lines.push("");
  }

  // 5. Pipeline summary
  const pipeline = await prisma.application.groupBy({
    by: ["status"],
    where: { userId: DEFAULT_USER_ID },
    _count: true,
  });

  if (pipeline.length > 0) {
    sections.push("pipeline");
    const statusEmojis: Record<string, string> = {
      saved: "💾", applied: "📨", phone_screen: "📞",
      interview: "🎯", offer: "🎉", accepted: "✅", rejected: "❌",
    };
    const pipelineStr = pipeline
      .map((p) => `${statusEmojis[p.status] || "•"} ${p.status.replace("_", " ")}: ${p._count}`)
      .join("  |  ");
    lines.push(`📈 <b>Pipeline:</b> ${pipelineStr}`);
  }

  // Only send if there's actual content beyond the header
  if (sections.length === 0) {
    lines.push("✨ All clear! No pending items today.");
  }

  lines.push("\n<i>— JobPilot Daily Digest</i>");

  await telegram.sendMessage(chatId, lines.join("\n"));
  return { sent: true, sections };
}

// ──────────────────────────────────────────────
// 5. Interview Email → Calendar Event
// ──────────────────────────────────────────────
// (Integrated into scanGmailForUpdates above)
// This is a standalone version for manual trigger

export async function syncInterviewsToCalendar(): Promise<{
  synced: number;
  events: Array<{ company: string; title: string }>;
}> {
  // Find all applications in interview/phone_screen status
  const apps = await prisma.application.findMany({
    where: {
      userId: DEFAULT_USER_ID,
      status: { in: ["interview", "phone_screen"] },
    },
  });

  const events: Array<{ company: string; title: string }> = [];

  for (const app of apps) {
    try {
      // Check if calendar event already exists for this interview
      const existingEvents = await prisma.statusChange.findMany({
        where: {
          applicationId: app.id,
          note: { contains: "Calendar event created" },
        },
      });

      if (existingEvents.length > 0) continue;

      // Create a placeholder calendar event for tomorrow at 10am
      // User can adjust the time later
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      const endTime = new Date(tomorrow.getTime() + 60 * 60 * 1000);

      const title = `${app.status === "phone_screen" ? "Phone Screen" : "Interview"}: ${app.companyName} - ${app.jobTitle}`;

      const result = await createCalendarEvent({
        title,
        description: `Application: ${app.jobTitle} at ${app.companyName}\n${app.jobUrl || ""}\n\nAdjust the time as needed — this was auto-created by JobPilot.`,
        startTime: tomorrow.toISOString(),
        endTime: endTime.toISOString(),
      });

      // Mark that we created a calendar event
      await prisma.statusChange.create({
        data: {
          applicationId: app.id,
          fromStatus: app.status,
          toStatus: app.status,
          note: `Calendar event created: ${result.link}`,
        },
      });

      events.push({ company: app.companyName, title });
    } catch (e) {
      console.error(`Calendar sync error for ${app.companyName}:`, e);
    }
  }

  if (events.length > 0) {
    const chatId = await getChatId();
    if (chatId) {
      const list = events.map((e) => `  • ${e.company}`).join("\n");
      await telegram.sendMessage(
        chatId,
        `📅 <b>Calendar Events Created</b>\n\n${events.length} interview(s) added to your calendar:\n${list}\n\n<i>Please adjust the time if needed!</i>`
      );
    }
  }

  return { synced: events.length, events };
}

// ──────────────────────────────────────────────
// Run All Automations
// ──────────────────────────────────────────────

export async function runAllAutomations(): Promise<{
  gmailScan: Awaited<ReturnType<typeof scanGmailForUpdates>> | null;
  followUps: Awaited<ReturnType<typeof scheduleAutoFollowUps>>;
  calendarSync: Awaited<ReturnType<typeof syncInterviewsToCalendar>> | null;
  digest: Awaited<ReturnType<typeof sendDailyDigest>>;
}> {
  let gmailScan = null;
  let calendarSync = null;

  // Gmail scan (only if connected)
  try {
    const user = await prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } });
    if (user?.gmailTokens) {
      gmailScan = await scanGmailForUpdates();
      calendarSync = await syncInterviewsToCalendar();
    }
  } catch (e) {
    console.error("Gmail/Calendar automation error:", e);
  }

  // Follow-ups (always runs)
  const followUps = await scheduleAutoFollowUps();

  // Daily digest (only if Telegram connected)
  const digest = await sendDailyDigest();

  return { gmailScan, followUps, calendarSync, digest };
}

// Helper
async function getChatId(): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } });
  return user?.telegramChatId || null;
}
