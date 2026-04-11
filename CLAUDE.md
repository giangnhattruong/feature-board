# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- **Dev server:** `npm run dev` (runs on localhost:3000)
- **Build:** `npm run build`
- **Lint:** `npm run lint` (ESLint 9, flat config in `eslint.config.mjs`)
- **No test suite configured.** There are no tests in this project.

## Architecture

Feature Board is a feature request voting app built with **Next.js 16** (App Router) + **Supabase** (Postgres + Auth). There is no custom API layer — all database operations go directly to Supabase via the JS client, protected by Row-Level Security.

### Rendering pattern

- **Home page** (`app/page.tsx`): Server Component with `force-dynamic`. Fetches requests and user votes server-side, passes data down as props.
- **Login page** (`app/login/page.tsx`): Client Component for auth interactions.
- **Voting/submission** (`app/request-list.tsx`, `app/submit-form.tsx`): Client Components with optimistic UI that call Supabase directly from the browser, then `router.refresh()` to sync server state.

### Supabase client pattern

Two separate client factories — never mix them:
- `lib/supabase/server.ts` — for Server Components and middleware. Uses `next/headers` cookies.
- `lib/supabase/client.ts` — for Client Components. Uses `createBrowserClient`.

### Auth flow

`proxy.ts` acts as Next.js middleware — it runs on every request (except static assets), refreshes the Supabase auth token via `supabase.auth.getUser()`, and writes updated cookies to the response. This keeps sessions alive without explicit refresh logic in components.

### Database

Schema is in `supabase/migrations/001_schema.sql`. Two tables:
- `requests` — feature submissions with a `vote_count` maintained by a trigger
- `votes` — join table with unique constraint on `(request_id, user_id)`

A `SECURITY DEFINER` trigger (`update_vote_count`) auto-increments/decrements `requests.vote_count` on vote insert/delete.

All tables have RLS enabled. Authenticated users can only insert/delete their own rows.

### Environment variables

Two required env vars in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Both are `NEXT_PUBLIC_` prefixed (safe for browser exposure, restricted by RLS).

## Key conventions

- **Path alias:** `@/*` maps to the project root (configured in `tsconfig.json`)
- **Styling:** Tailwind CSS v4 with custom CSS variables defined in `app/globals.css`
- **Fonts:** Geist and Geist Mono loaded via `next/font/google`
- **TypeScript:** Strict mode enabled
