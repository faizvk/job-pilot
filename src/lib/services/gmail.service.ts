import { google } from "googleapis";
import prisma from "@/lib/db";
import { DEFAULT_USER_ID } from "@/lib/constants";

function getOAuth2Client() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = process.env.GMAIL_REDIRECT_URI || "http://localhost:3001/api/gmail/callback";

  if (!clientId || !clientSecret) {
    throw new Error("Gmail OAuth2 not configured. Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET.");
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function isGmailConfigured(): boolean {
  return !!process.env.GMAIL_CLIENT_ID && !!process.env.GMAIL_CLIENT_SECRET;
}

/**
 * Generate the OAuth2 authorization URL
 */
export function getAuthUrl(): string {
  const oauth2 = getOAuth2Client();
  return oauth2.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
    ],
    prompt: "consent",
  });
}

/**
 * Exchange auth code for tokens and store them
 */
export async function handleCallback(code: string) {
  const oauth2 = getOAuth2Client();
  const { tokens } = await oauth2.getToken(code);

  // Store tokens in the database
  await prisma.user.update({
    where: { id: DEFAULT_USER_ID },
    data: {
      gmailTokens: JSON.stringify(tokens),
    },
  });

  return tokens;
}

/**
 * Get authenticated Gmail client
 */
async function getGmailClient() {
  const user = await prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } });
  if (!user?.gmailTokens) {
    throw new Error("Gmail not connected. Please authorize first.");
  }

  const tokens = JSON.parse(user.gmailTokens);
  const oauth2 = getOAuth2Client();
  oauth2.setCredentials(tokens);

  // Refresh token if needed
  oauth2.on("tokens", async (newTokens) => {
    const merged = { ...tokens, ...newTokens };
    await prisma.user.update({
      where: { id: DEFAULT_USER_ID },
      data: { gmailTokens: JSON.stringify(merged) },
    });
  });

  return google.gmail({ version: "v1", auth: oauth2 });
}

/**
 * Send an email via Gmail
 */
export async function sendGmail(to: string, subject: string, body: string) {
  const gmail = await getGmailClient();

  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
  const raw = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "",
    body,
  ].join("\r\n");

  const encodedMessage = Buffer.from(raw)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encodedMessage },
  });

  return res.data;
}

/**
 * Search for application confirmation emails
 */
export async function searchApplicationEmails(companyName?: string, limit = 20) {
  const gmail = await getGmailClient();

  let query = 'subject:(application OR applied OR "thank you for applying" OR confirmation OR "we received")';
  if (companyName) {
    query += ` (from:${companyName} OR subject:${companyName})`;
  }

  const res = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: limit,
  });

  if (!res.data.messages) return [];

  const emails = [];
  for (const msg of res.data.messages.slice(0, limit)) {
    const detail = await gmail.users.messages.get({
      userId: "me",
      id: msg.id!,
      format: "metadata",
      metadataHeaders: ["Subject", "From", "Date"],
    });

    const headers = detail.data.payload?.headers || [];
    const getHeader = (name: string) => headers.find((h) => h.name === name)?.value || "";

    emails.push({
      id: msg.id,
      subject: getHeader("Subject"),
      from: getHeader("From"),
      date: getHeader("Date"),
      snippet: detail.data.snippet || "",
    });
  }

  return emails;
}

/**
 * Check if Gmail tokens are stored (user has connected)
 */
export async function isGmailConnected(): Promise<boolean> {
  try {
    if (!isGmailConfigured()) return false;
    const user = await prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } });
    return !!user?.gmailTokens;
  } catch {
    return false;
  }
}
