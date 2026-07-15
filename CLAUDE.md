# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

## Stack

- **Next.js 14** (App Router, TypeScript) — all pages use `"use client"` since auth state is managed client-side
- **Supabase** — auth (`supabase.auth`) + database via `@/lib/supabase` singleton client; env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- **Tailwind CSS + custom CSS** — Tailwind for layout, but shared component styles (`.btn`, `.page-header`, `.field`, `.audit-section`, `.rating-btn`, `.toolbar`, etc.) live in `src/app/globals.css`; use these classes before writing inline Tailwind
- **Recharts** — used in KPI dashboard for line/bar charts
- **jsPDF** — imported in 5S audit page for PDF export (not yet fully implemented)

## Architecture

All routes live under `src/app/` using the Next.js App Router:

```
/                       → landing page (public)
/prijava                → email/password login (Supabase auth)
/registracija           → registration with email confirmation
/dashboard              → user home, redirects to /prijava if unauthenticated
/dashboard/kpi          → KPI charts (Recharts), aggregates audits_5s by month
/alati/5s-audit         → main tool: 5S audit form with scoring (0–4 per criterion)
/povijest               → list of user's saved audits (RLS-protected)
/povijest/[id]          → detail view of a single audit with score breakdown
```

Auth guard pattern: each protected page calls `supabase.auth.getUser()` in `useEffect` and pushes to `/prijava` if no user. `Header.tsx` listens to `onAuthStateChange` for reactive nav state.

## Database

Single table: `audits_5s` with columns:
`id, user_id, created_at, firma, osoba, datum, lokacija, smjena, broj, scores (jsonb), comments (jsonb), total_score, observations (jsonb)`

Row Level Security (RLS) is enabled — users only see their own rows. The `scores` jsonb uses criterion IDs as keys (e.g. `s1_1` through `s5_5`), each with a value 0–4. Max total score is 100 (5 sections × 5 criteria × 4 points).

## Design conventions

- Brand color: `#1a7a5e` (green), light variant `#e8f5f0`
- Fonts: **DM Serif Display** (headings/logo) + **DM Sans** (body) — loaded via Google Fonts in layout
- Score color thresholds: ≥80 green, ≥60 yellow, ≥40 orange, <40 red
- All UI copy is in Croatian
- Business model: freemium — free plan shows "BESPLATNI PLAN" badge and 5 audits/month limit; Pro/Premium features are stubbed (upgrade button in dashboard, KPI report config, PDF export button)
- Footer links `/uvjeti` and `/privatnost` — these pages are not yet created
