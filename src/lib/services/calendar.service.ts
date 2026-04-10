import { google } from "googleapis";
import prisma from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );
}

async function getAuthedClient() {
  const user = await prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } });
  if (!user?.gmailTokens) throw new Error("Google not connected. Connect via Gmail integration first.");

  const oauth2 = getOAuth2Client();
  oauth2.setCredentials(JSON.parse(user.gmailTokens));
  return oauth2;
}

export function isCalendarConfigured(): boolean {
  return !!(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET);
}

export async function createCalendarEvent(data: {
  title: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  reminderMinutes?: number;
}) {
  const auth = await getAuthedClient();
  const calendar = google.calendar({ version: "v3", auth });

  const event = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: data.title,
      description: data.description || "",
      start: { dateTime: data.startTime, timeZone: "Asia/Kolkata" },
      end: { dateTime: data.endTime, timeZone: "Asia/Kolkata" },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: data.reminderMinutes || 30 },
          { method: "email", minutes: data.reminderMinutes || 60 },
        ],
      },
    },
  });

  return { id: event.data.id, link: event.data.htmlLink };
}

export async function listUpcomingEvents(maxResults = 10) {
  const auth = await getAuthedClient();
  const calendar = google.calendar({ version: "v3", auth });

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: "startTime",
  });

  return (res.data.items || []).map((e) => ({
    id: e.id,
    title: e.summary,
    description: e.description,
    start: e.start?.dateTime || e.start?.date,
    end: e.end?.dateTime || e.end?.date,
    link: e.htmlLink,
  }));
}

export async function deleteCalendarEvent(eventId: string) {
  const auth = await getAuthedClient();
  const calendar = google.calendar({ version: "v3", auth });
  await calendar.events.delete({ calendarId: "primary", eventId });
}
