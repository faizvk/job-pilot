# JobPilot — Complete Deployment Guide

Everything you need to go from code to live production with a custom domain.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Prerequisites](#prerequisites)
3. [Local Development Setup](#local-development-setup)
4. [Environment Variables Reference](#environment-variables-reference)
5. [Getting API Keys](#getting-api-keys)
6. [Database Setup (Turso)](#database-setup-turso)
7. [Deploy to Vercel](#deploy-to-vercel)
8. [Custom Domain](#custom-domain)
9. [Google OAuth (Gmail + Calendar)](#google-oauth-gmail--calendar)
10. [Post-Deployment Checklist](#post-deployment-checklist)
11. [Cost Breakdown](#cost-breakdown)
12. [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite (dev) → Turso / libSQL (prod) |
| ORM | Prisma v7 with libSQL adapter |
| Hosting | Vercel |
| Domain | Cloudflare (recommended registrar) |
| AI | Gemini / Groq / OpenAI / Anthropic / Mistral / DeepSeek / Cohere / Together (fallback chain) |
| Email | Gmail API (OAuth2) |
| Notifications | Telegram Bot API |
| Job Search | JSearch via RapidAPI, Adzuna |

---

## Prerequisites

Install these tools before starting:

```bash
# Node.js 20+
node --version   # should be v20+

# npm / pnpm
npm --version

# Git
git --version

# Turso CLI (for database)
brew install tursodatabase/tap/turso    # macOS
# OR
curl -sSfL https://get.tur.so/install.sh | bash  # Linux

# Vercel CLI (for deployment)
npm install -g vercel
```

---

## Local Development Setup

```bash
# 1. Clone the repo
git clone https://github.com/faizvk/job-pilot.git
cd job-pilot

# 2. Install dependencies
npm install

# 3. Copy env file and fill in your keys
cp .env.example .env

# 4. Create local database and push schema
npx prisma db push

# 5. Create the default user (required — app is single-user)
npx prisma studio
# → In Prisma Studio, open User table → Add record:
#   id: "default-user"
#   name: "Your Name"
#   email: "your@email.com"

# 6. Start dev server
npm run dev
# → Opens at http://localhost:3000
```

---

## Environment Variables Reference

Copy `.env.example` to `.env` and fill in the values below.

### Required (app won't work without these)

| Variable | Description |
|----------|-------------|
| `TURSO_DATABASE_URL` | Turso DB URL (`libsql://...`) — production only |
| `TURSO_AUTH_TOKEN` | Turso auth token — production only |

### AI (need at least one — Gemini free tier recommended)

| Variable | Free Tier | Notes |
|----------|-----------|-------|
| `GEMINI_API_KEY` | 15 RPM, 1M tokens/day | Best free option |
| `GROQ_API_KEY` | 30 RPM | Very fast inference |
| `OPENAI_API_KEY` | Paid only | gpt-4o-mini |
| `ANTHROPIC_API_KEY` | Paid only | claude-sonnet |
| `MISTRAL_API_KEY` | Free tier | mistral-small |
| `DEEPSEEK_API_KEY` | $0.14/M tokens | Best value paid |
| `COHERE_API_KEY` | 1000 calls/month | command-r+ |
| `TOGETHER_API_KEY` | $5 free credit | Llama 3.3 70B |

### Job Search

| Variable | Description |
|----------|-------------|
| `RAPIDAPI_KEY` | JSearch API — LinkedIn/Indeed/Glassdoor (500 req/month free) |
| `ADZUNA_APP_ID` | Adzuna App ID (free) |
| `ADZUNA_API_KEY` | Adzuna API Key (free) |

### Gmail / Google OAuth

| Variable | Description |
|----------|-------------|
| `GMAIL_CLIENT_ID` | Google OAuth2 Client ID |
| `GMAIL_CLIENT_SECRET` | Google OAuth2 Client Secret |
| `GMAIL_REDIRECT_URI` | `https://your-domain.com/api/gmail/callback` |

### Telegram

| Variable | Description |
|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | From @BotFather on Telegram |

---

## Getting API Keys

### Gemini (Free — Start Here)
1. Go to https://aistudio.google.com/apikey
2. Click **Create API Key** → Copy it
3. Add to `.env`: `GEMINI_API_KEY=your-key`

### Groq (Free)
1. Go to https://console.groq.com/keys
2. Create API key → Copy it
3. Add to `.env`: `GROQ_API_KEY=your-key`

### RapidAPI / JSearch (Free 500 req/month)
1. Go to https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
2. Sign up → Subscribe to **Basic (free)**
3. Copy your `X-RapidAPI-Key` from the dashboard
4. Add to `.env`: `RAPIDAPI_KEY=your-key`

### Telegram Bot
1. Open Telegram → search `@BotFather`
2. Send `/newbot` → follow prompts → name it `JobPilot`
3. Copy the token it gives you
4. Add to `.env`: `TELEGRAM_BOT_TOKEN=your-token`
5. After deploy: go to Profile → Integrations in the app to link your chat ID

---

## Database Setup (Turso)

Turso is a SQLite-compatible cloud database. Free tier: 9 GB storage, 500M reads/month.

### 1. Login to Turso
```bash
turso auth login
# Opens browser → sign in with GitHub
```

### 2. Create the database
```bash
turso db create jobpilot
```

### 3. Get your credentials
```bash
# Get the database URL
turso db show jobpilot --url
# Output: libsql://jobpilot-yourname.turso.io

# Create an auth token
turso db tokens create jobpilot
# Output: eyJhb...long-token...
```

### 4. Push the schema to Turso
```bash
# Set env vars temporarily
export TURSO_DATABASE_URL="libsql://jobpilot-yourname.turso.io"
export TURSO_AUTH_TOKEN="your-token-here"

# Push Prisma schema to Turso
npx prisma db push
```

### 5. Create the default user in Turso
```bash
# Open Turso shell
turso db shell jobpilot

# Run this SQL
INSERT INTO User (id, name, email, createdAt, updatedAt)
VALUES ('default-user', 'Your Name', 'your@email.com', datetime('now'), datetime('now'));

# Exit
.quit
```

---

## Deploy to Vercel

### 1. Login to Vercel
```bash
vercel login
# Choose GitHub login
```

### 2. Deploy
```bash
# From the project folder
cd job-pilot
vercel

# Answer the prompts:
# → Set up and deploy? Y
# → Which scope? (your account)
# → Link to existing project? N
# → Project name: jobpilot
# → Directory: ./  (press enter)
# → Override settings? N
```

### 3. Add environment variables

Go to **vercel.com → jobpilot → Settings → Environment Variables**

Add each of these for **Production** environment:

| Key | Value |
|-----|-------|
| `TURSO_DATABASE_URL` | `libsql://jobpilot-yourname.turso.io` |
| `TURSO_AUTH_TOKEN` | your turso token |
| `GEMINI_API_KEY` | your key |
| `GROQ_API_KEY` | your key |
| `RAPIDAPI_KEY` | your key |
| `GMAIL_CLIENT_ID` | your client id |
| `GMAIL_CLIENT_SECRET` | your client secret |
| `GMAIL_REDIRECT_URI` | `https://your-domain.com/api/gmail/callback` |
| `TELEGRAM_BOT_TOKEN` | your token |
| *(add any other AI keys you use)* | |

### 4. Redeploy after adding env vars
```bash
vercel --prod
```

---

## Custom Domain

### Option A — Buy domain on Cloudflare (cheapest, ~$9-10/year)

1. Go to https://www.cloudflare.com/products/registrar/
2. Search for your domain → purchase
3. In Cloudflare dashboard → your domain → **DNS**

### Option B — Buy on Namecheap (~$10-15/year)
1. Go to https://www.namecheap.com
2. Search and buy domain
3. Go to **Domain → Advanced DNS** to add records

### Connect domain to Vercel

1. Vercel dashboard → jobpilot → **Settings → Domains**
2. Click **Add Domain** → enter your domain
3. Vercel shows you DNS records to add — either:

**If using Cloudflare as nameserver (recommended):**
```
Type: CNAME
Name: @  (or www)
Value: cname.vercel-dns.com
```

**If using other registrar:**
```
Type: A
Name: @
Value: 76.76.21.21
```

4. Wait 1-5 minutes for DNS to propagate
5. Vercel automatically provisions SSL (HTTPS)

---

## Google OAuth (Gmail + Calendar)

### Setup OAuth Credentials

1. Go to https://console.cloud.google.com
2. Create a new project (or select existing)
3. Go to **APIs & Services → Library**
   - Enable **Gmail API**
   - Enable **Google Calendar API**
4. Go to **APIs & Services → OAuth consent screen**
   - User type: **External**
   - App name: `JobPilot`
   - Add your email as test user
5. Go to **APIs & Services → Credentials**
   - Click **Create Credentials → OAuth Client ID**
   - Application type: **Web Application**
   - Name: `JobPilot`
   - Authorized redirect URIs — add BOTH:
     ```
     http://localhost:3000/api/gmail/callback
     https://your-domain.com/api/gmail/callback
     ```
6. Copy **Client ID** and **Client Secret**
7. Add to Vercel env vars:
   - `GMAIL_CLIENT_ID` = Client ID
   - `GMAIL_CLIENT_SECRET` = Client Secret
   - `GMAIL_REDIRECT_URI` = `https://your-domain.com/api/gmail/callback`

### Connect Gmail in the App

1. Go to **Profile → Integrations**
2. Click **Connect Gmail**
3. Sign in with Google → Allow permissions
4. Done — Gmail scan and email sending will now work

---

## Post-Deployment Checklist

After deploying, verify everything works:

- [ ] App loads at your custom domain
- [ ] HTTPS (padlock icon) is active
- [ ] Dashboard loads without errors
- [ ] Quick Apply — paste a job and click Analyze (tests AI)
- [ ] Applications — create a test application
- [ ] Profile → fill in your name, email, skills
- [ ] Resumes → upload or create a base resume
- [ ] Profile → Integrations → connect Gmail
- [ ] Profile → Integrations → set up Telegram
- [ ] Job Feed → search for jobs (tests RapidAPI)
- [ ] Automations → Run All (tests all integrations)
- [ ] Open dev tools → Console → no red errors

---

## Cost Breakdown

| Service | Free Tier | Paid |
|---------|-----------|------|
| **Vercel** (hosting) | Free (personal) | $20/month (pro) |
| **Turso** (database) | 9GB, 500M reads/month | $29/month (scaler) |
| **Cloudflare** (domain) | — | ~$9-10/year |
| **Gemini API** (AI) | 15 RPM, 1M tokens/day | Pay-as-you-go |
| **Groq API** (AI) | 30 RPM | Pay-as-you-go |
| **RapidAPI/JSearch** | 500 req/month | $10/month (basic) |
| **Telegram Bot** | Always free | — |
| **Gmail API** | Always free | — |

**Minimum cost to deploy: ~$9-10/year** (domain only, everything else on free tiers)

---

## Troubleshooting

### Build fails on Vercel

```
Error: Cannot find module '@/generated/prisma/client'
```
**Fix:** Make sure `postinstall: "prisma generate"` is in `package.json` scripts. It is — if still failing, add `PRISMA_GENERATE_SKIP_AUTOINSTALL=false` as env var in Vercel.

---

### Database connection error in production

```
Error: TURSO_DATABASE_URL is not set
```
**Fix:** Go to Vercel → Settings → Environment Variables → verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set for **Production**.

---

### Gmail redirect_uri_mismatch

```
Error 400: redirect_uri_mismatch
```
**Fix:** In Google Cloud Console → your OAuth client → add `https://your-domain.com/api/gmail/callback` to Authorized redirect URIs. Make sure `GMAIL_REDIRECT_URI` env var in Vercel matches exactly.

---

### AI not working

Check which providers are configured:
```
https://your-domain.com/api/ai/status
```
Returns JSON showing which AI keys are detected. At least one must show `true`.

---

### No jobs in Job Feed

Verify RapidAPI key is set and you've subscribed to JSearch (free plan):
- Go to https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
- Click **Subscribe to Test** → choose Basic (free)

---

### Turso schema out of sync after code changes

If you add/change Prisma models:
```bash
export TURSO_DATABASE_URL="libsql://jobpilot-yourname.turso.io"
export TURSO_AUTH_TOKEN="your-token"
npx prisma db push
```
Then redeploy: `vercel --prod`

---

*Last updated: April 2026*
