# Feature Board

A community-driven feature request and voting platform built with Next.js 16 and Supabase.

---

## Table of Contents

1. [What This Is](#1-what-this-is)
2. [Architecture](#2-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [Authentication](#6-authentication)
7. [Data Flow](#7-data-flow)
8. [Environment Variables](#8-environment-variables)
9. [How to Run Locally](#9-how-to-run-locally)
10. [How to Deploy](#10-how-to-deploy)
11. [Path to Production Checklist](#11-path-to-production-checklist)

---

## 1. What This Is

**Feature Board** is a minimal MVP that lets users submit and vote on feature requests. It is designed to validate whether a community-driven feedback mechanism is worth building further.

**UI Design:**
- Modern Material Design 3 interface (Stitch design system)
- Sidebar navigation (fixed on desktop ≥768px, slide-in drawer on mobile)
- Split-screen auth page with gradient left panel
- Detail view route (`/requests/[id]`) for individual request pages
- Responsive at all breakpoints (375px mobile, 768px tablet, 1440px desktop)

**Core user flows:**
- Anyone can browse feature requests (sorted by popularity), view details on individual pages
- Authenticated users can submit new requests (title + description with decorative toolbar)
- Authenticated users can upvote any request (one vote per user per request)
- Users can retract votes
- Requests ranked by vote count, then by recency

---

## 2. Architecture

```
Browser
  │
  ├── Next.js 16 App Router (React Server Components + Client Components)
  │     ├── Server Components → query Supabase directly (no roundtrip)
  │     ├── Client Components → query Supabase via browser client
  │     └── Middleware (proxy.ts) → refreshes auth tokens on every request
  │
  └── Supabase (hosted Postgres + Auth)
        ├── Auth → email/password, session stored in HTTP-only cookies
        ├── requests table → feature submissions
        └── votes table → one vote per user per request
```

**Rendering strategy:**
- Root layout includes `SidebarProvider` (React Context) to share mobile sidebar state between Header and Sidebar components.
- Sidebar is a **Client Component** with drawer mode (mobile) and fixed mode (desktop ≥768px).
- The home page (`/`) is a **Server Component** with `force-dynamic` — fetches fresh data on every request.
- Detail page (`/requests/[id]`) is a **Server Component** — fetches single request with metadata sidebar.
- Login page (`/login`) is a **Client Component** — drives auth in the browser, split-screen layout.
- Voting and form submission are **Client Components** with optimistic UI — updates immediately, syncs via `router.refresh()`.

**No custom API layer** — all database operations go directly to Supabase via the JavaScript client, protected by Row-Level Security policies on every table.

**Design system:**
- Material Design 3 color palette (primary #333093 → primary-container #4b49ac, surface tints)
- Custom utilities: `glass-effect`, `ambient-shadow`, `ambient-shadow-hover`, `ghost-border`
- Tailwind v4 with `@theme inline` for color tokens and font variables

---

## 3. Tech Stack

| Category | Technology | Version |
|---|---|---|
| Framework | Next.js | 16.2.1 |
| UI | React | 19.2.4 |
| Styling | Tailwind CSS | 4.x |
| Design | Material Design 3 (Stitch) | — |
| Fonts | Manrope (headlines), Inter (body) | Google Fonts |
| Icons | Material Symbols Outlined | Google Fonts |
| Database & Auth | Supabase | 2.101.0 |
| Auth SSR | @supabase/ssr | 0.10.0 |
| Language | TypeScript | 5.x |
| Linting | ESLint | 9.x |

---

## 4. Project Structure

```
DemoMVP/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout — Manrope/Inter fonts, Material Symbols link, sidebar provider
│   ├── page.tsx                # Home page (Server Component) — feature board
│   ├── globals.css             # Global styles, CSS vars (Material Design 3), Tailwind import
│   ├── sidebar-context.tsx     # React Context — sidebar open/close state
│   ├── sidebar.tsx             # Sidebar nav (fixed desktop, drawer mobile with hamburger)
│   ├── header.tsx              # Sticky TopAppBar — branding, auth, mobile hamburger
│   ├── submit-form.tsx         # Feature request form with decorative toolbar
│   ├── request-list.tsx        # Feature request list with voting, status chips
│   ├── login/
│   │   └── page.tsx            # Split-screen auth page (gradient left panel)
│   └── requests/
│       └── [id]/
│           └── page.tsx        # Detail view — single request + vote sidebar
│
├── lib/
│   └── supabase/
│       ├── client.ts           # Supabase browser client (for Client Components)
│       └── server.ts           # Supabase server client (for Server Components)
│
├── supabase/
│   └── migrations/
│       └── 001_schema.sql      # Full DB schema — tables, RLS policies, triggers
│
├── proxy.ts                    # Next.js middleware — refreshes Supabase auth tokens
├── next.config.ts              # Next.js config
├── tsconfig.json               # TypeScript strict config
├── postcss.config.mjs          # PostCSS for Tailwind v4
└── .env.local.example          # Environment template
```

---

## 5. Database Schema

### Tables

**`requests`** — stores feature submissions

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key, auto-generated |
| `title` | text | Required |
| `description` | text | Optional |
| `created_by` | uuid | References `auth.users` |
| `created_at` | timestamptz | Defaults to now() |
| `vote_count` | int | Maintained by trigger, defaults to 0 |

**`votes`** — records which users voted on which requests

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key, auto-generated |
| `request_id` | uuid | References `requests`, cascades on delete |
| `user_id` | uuid | References `auth.users`, cascades on delete |
| `created_at` | timestamptz | Defaults to now() |

Unique constraint on `(request_id, user_id)` — one vote per user per request.

### Triggers

`update_vote_count()` runs after any insert or delete on `votes`. It increments `requests.vote_count` on insert and decrements it on delete. This keeps vote counts consistent without application-level aggregation on every read.

### Row-Level Security

All tables have RLS enabled. Policies:

| Table | Operation | Who |
|---|---|---|
| requests | SELECT | Everyone |
| requests | INSERT | Authenticated users (own `created_by` only) |
| requests | DELETE | Owner only |
| votes | SELECT | Everyone |
| votes | INSERT | Authenticated users (own `user_id` only) |
| votes | DELETE | Authenticated users (own `user_id` only) |

---

## 6. Authentication

**Provider:** Supabase Auth (email + password)

**How sessions work:**
1. User signs in via the login page → Supabase returns a session token.
2. `@supabase/ssr` stores that token in an HTTP-only cookie.
3. `proxy.ts` (Next.js middleware) intercepts every request, calls `supabase.auth.getUser()` to refresh the token, and writes the updated cookie to the response.
4. Server Components read the session from cookies via `lib/supabase/server.ts`.
5. Client Components access auth state via `lib/supabase/client.ts`.

**Key files:**

| File | Role |
|---|---|
| `lib/supabase/client.ts` | Creates a browser Supabase client for Client Components |
| `lib/supabase/server.ts` | Creates a server Supabase client that reads/writes Next.js cookies |
| `proxy.ts` | Middleware — runs on every request path except static assets |
| `app/login/page.tsx` | UI for sign in and sign up |

---

## 7. Data Flow

### Loading the home page

```
Request to /
  → proxy.ts refreshes auth token
  → app/page.tsx (Server Component) runs
      → lib/supabase/server.ts creates server client
      → SELECT all requests ORDER BY vote_count DESC, created_at DESC
      → SELECT votes WHERE user_id = current user (if logged in)
  → Layout wraps content: SidebarProvider > Sidebar > Header > main
      → Sidebar (Client) reads context, shows drawer on mobile
      → Header (Client) fetches user state, shows mobile hamburger
  → Renders RequestList with cards (title → clickable to /requests/[id])
  → HTML sent to browser
```

### Loading detail page

```
Request to /requests/[id]
  → proxy.ts refreshes auth token
  → app/requests/[id]/page.tsx (Server Component) runs
      → SELECT * FROM requests WHERE id = [id]
      → 404 if not found
  → Renders title, description, vote count in main area
  → Right sidebar: vote count, "Go vote" link (back to /), metadata
  → HTML sent to browser
```

### Submitting a feature request

```
User fills form → submit-form.tsx
  → supabase.from("requests").insert({ title, description, created_by })
  → RLS verifies created_by = auth.uid()
  → router.refresh() re-fetches server data
  → Form clears immediately (optimistic)
```

### Voting

```
User clicks vote button → request-list.tsx
  → Optimistic: update local vote count immediately
  → If already voted:
      supabase.from("votes").delete().match({ request_id, user_id })
      → trigger decrements requests.vote_count
  → If not voted:
      supabase.from("votes").insert({ request_id, user_id })
      → trigger increments requests.vote_count
  → router.refresh() syncs server state
```

---

## 8. Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Both variables are prefixed with `NEXT_PUBLIC_` — they are safe to expose to the browser. The anon key is restricted by Supabase RLS policies; it cannot bypass row-level security.

Get these values from: **Supabase Dashboard → Project Settings → API**.

---

## 9. How to Run Locally

**Prerequisites:** Node.js 20+, npm

```bash
# 1. Clone the repo
git clone <repo-url>
cd DemoMVP

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase URL and anon key

# 4. Apply database migrations
# Option A: Paste contents of supabase/migrations/001_schema.sql into
#            Supabase Dashboard → SQL Editor and run it.
# Option B: Use Supabase CLI
#   npx supabase login
#   npx supabase link --project-ref <your-project-ref>
#   npx supabase db push

# 5. Start the dev server
npm run dev
```

The app runs at `http://localhost:3000`.

**Available scripts:**

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server (requires build first) |
| `npm run lint` | Run ESLint |

---

## 10. How to Deploy

### Vercel (recommended)

Vercel is the natural host for Next.js projects.

```bash
# Option A: Deploy via Vercel CLI
npm i -g vercel
vercel
```

**Option B: Connect your GitHub repo**
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Vercel auto-detects Next.js — no build config needed
4. Add environment variables in Project Settings → Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

After connecting to GitHub, every push to `main` triggers a production deploy. Every pull request gets a preview URL automatically.

### Self-hosted (Node.js server)

```bash
npm run build
npm start
# Runs on port 3000 by default
# Set PORT env var to override
```

---

## 11. Path to Production Checklist

Before going live, address the following:

**Security**
- [ ] Rotate the Supabase anon key if it was ever committed or exposed
- [ ] Review Supabase Auth settings — disable sign-ups if invite-only is desired
- [ ] Add rate limiting on the Supabase project (Dashboard → Auth → Rate limits)
- [ ] Set allowed redirect URLs in Supabase Auth settings

**Data**
- [ ] Verify all RLS policies are correct in Supabase Dashboard → Authentication → Policies
- [ ] Enable Supabase Point-in-Time Recovery (PITR) for the database
- [ ] Set up database backups

**Performance**
- [ ] The home page is `force-dynamic` — consider adding revalidation or caching if traffic grows
- [ ] Confirm database indexes exist: `idx_requests_vote_count`, `idx_votes_request_id`, `idx_votes_user_id`

**Reliability**
- [ ] Add an error boundary around the main page content
- [ ] Add a custom `app/error.tsx` for graceful error states
- [ ] Add a custom `app/not-found.tsx`

**Observability**
- [ ] Enable Supabase logs in Dashboard → Logs → API / Auth / DB
- [ ] Connect a monitoring service (e.g., Vercel Analytics, Sentry)

**Product**
- [ ] Replace placeholder branding in `header.tsx`
- [ ] Add email confirmation in Supabase Auth settings if needed
- [ ] Add a privacy policy / terms link in the footer
