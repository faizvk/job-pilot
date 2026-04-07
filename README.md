# JobPilot

A smart job application management system built to help job seekers apply to 50+ jobs in under 2 hours. Aggregates jobs from LinkedIn, Indeed, Glassdoor, and more — with resume tailoring, application tracking, and batch operations.

## The Problem

Applying to jobs across multiple platforms (LinkedIn, Indeed, Glassdoor, Naukri, etc.) takes 6-8 hours daily. Manually tailoring resumes, switching between platforms, uploading documents, and tracking 50+ applications is exhausting and inefficient.

## The Solution

JobPilot centralizes your entire job application workflow:

- **Job Feed** — Auto-fetches 40-50+ jobs from LinkedIn, Indeed, Glassdoor, ZipRecruiter, Naukri, and more based on your preferences (title, location, experience level, keywords)
- **Batch Apply** — Import jobs in bulk, open all URLs in tabs, mark applied with one click
- **Smart Filtering** — Auto-excludes senior roles and high-experience requirements for junior developers
- **Match Scoring** — Scores each job against your skills to show best-fit roles first
- **Resume Tailoring** — Keyword-based resume optimization per job description
- **Cover Letter Generator** — Template-based generation with variable substitution
- **Application Tracker** — Kanban board + table view with status pipeline (Saved -> Applied -> Interview -> Offer)
- **JD Analyzer** — Extracts skills from job descriptions, identifies gaps, computes match score
- **Analytics Dashboard** — Funnel visualization, response rates, timeline tracking
- **Follow-up Manager** — Schedule and track follow-up emails
- **Daily Stats** — Track application count, streaks, and 30-day trends

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite via Prisma v7 + LibSQL adapter
- **Validation**: Zod
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/faizvk/job-pilot.git
cd job-pilot

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Add your RapidAPI key to .env (free at rapidapi.com)
# This enables job fetching from LinkedIn, Indeed, Glassdoor

# Push database schema
npx prisma db push

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### API Keys (Optional but Recommended)

**JSearch (RapidAPI)** — Primary job source, aggregates LinkedIn + Indeed + Glassdoor + ZipRecruiter
1. Sign up at [rapidapi.com](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)
2. Subscribe to the free plan (500 requests/month)
3. Add your key to `.env` as `RAPIDAPI_KEY=your_key`

**Adzuna** — Additional India-specific jobs
1. Sign up at [developer.adzuna.com](https://developer.adzuna.com)
2. Add `ADZUNA_APP_ID` and `ADZUNA_API_KEY` to `.env`

Without API keys, jobs are fetched from Remotive and Jobicy (free, no key needed).

## Pages

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/dashboard` | Overview stats, activity feed, weekly goals |
| Job Feed | `/job-feed` | Auto-fetch jobs from 7+ platforms with filters |
| Applications | `/applications` | Kanban board + table view with status tracking |
| Batch Apply | `/batch-apply` | Bulk import, open URLs, mark applied in batch |
| Quick Apply | `/quick-apply` | 5-step guided workflow for single applications |
| Resumes | `/resumes` | Manage base resumes and tailored versions |
| Cover Letters | `/cover-letters` | Template editor with variable substitution |
| Follow-ups | `/follow-ups` | Schedule and track follow-up emails |
| Analytics | `/analytics` | Funnel, timeline, response rate charts |
| Profile | `/profile` | Personal info, work history, education, skills |

## Workflow

1. **Set preferences** in Job Feed (job titles, locations, experience range)
2. **Fetch jobs** — pulls 40-50+ from LinkedIn, Indeed, Glassdoor, etc.
3. **Review & select** — sorted by match score, filter by platform/work type
4. **Send to Batch Apply** — imports selected jobs into your tracker
5. **Apply Now** — opens all job URLs in new tabs + marks as applied
6. **Track progress** — monitor status, schedule follow-ups, view analytics

## Project Structure

```
src/
├── app/                    # Next.js pages and API routes
│   ├── api/                # REST API endpoints (27 routes)
│   ├── dashboard/          # Dashboard page
│   ├── job-feed/           # Job search aggregator
│   ├── applications/       # Application management
│   ├── batch-apply/        # Bulk operations
│   ├── quick-apply/        # Guided apply workflow
│   ├── resumes/            # Resume management
│   ├── cover-letters/      # Cover letter templates
│   ├── follow-ups/         # Follow-up tracking
│   ├── analytics/          # Analytics dashboard
│   └── profile/            # User profile
├── components/             # Reusable UI components (50+)
│   ├── ui/                 # Base components (button, card, input, etc.)
│   ├── layout/             # Sidebar, header
│   ├── dashboard/          # Dashboard widgets
│   ├── applications/       # Application cards, filters, kanban
│   ├── resumes/            # Resume editor, keyword matcher
│   ├── cover-letters/      # Template editor, preview
│   ├── jd-analyzer/        # JD analysis components
│   ├── analytics/          # Chart components
│   └── ...
├── lib/                    # Core logic
│   ├── services/           # Business logic (10 service files)
│   ├── data/               # Skills dictionary (200+ entries)
│   ├── constants.ts        # App constants, status config
│   ├── validators.ts       # Zod schemas
│   ├── utils.ts            # Helper functions
│   └── db.ts               # Prisma client singleton
├── types/                  # TypeScript interfaces
└── generated/              # Prisma generated client
```

## License

MIT
