# ChequeIn Sales OS — Next.js

A production-shaped rebuild of the ChequeIn sales system: a free-payroll pipeline that is gated by compliance, activated by staff sessions, and measured in naira per employee.

## Stack

- **Next.js 16** App Router + **React 19** + **TypeScript**
- **Tailwind CSS v4** with a token-based design system
- **Zustand** with `persist` for local-first state
- **Zod** for import validation
- **Radix UI** primitives (dialog, tabs, slot)
- **Recharts** for the weekly output chart
- **Lucide** icons, **Sonner** toasts, **date-fns** dates
- **Playwright** (system Chrome) for smoke tests

## Run it

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm typecheck
pnpm build          # static export to out/
```

Node 20.9+ is required. The project uses the official Node binary in this environment because the sandboxed runtime's hardened Node cannot load the signed SWC native module.

## Deploy to GitHub Pages

The app is a static export and deploys from `/docs`:

```bash
pnpm build:pages
git add docs && git commit -m "Deploy" && git push
```

`next.config.ts` sets `basePath: "/chequein-sales-os-next"` when `GITHUB_PAGES=true`. Keep the repository name in sync if you rename it.

## Structure

```
src/
  app/                  routes: /, /pipeline, /compliance, /playbook, /numbers
  components/           app shell, employer sheet, action rows, dialogs
  components/ui/        buttons, cards, badges, modal, sheet, tabs
  lib/
    types.ts            the domain model
    data.ts             seeded employers, sequences, scripts, qualification rules
    domain.ts           gates, scoring, status, action queue, metrics
    utils.ts            currency, dates, WhatsApp links, copy
  store/
    use-sales-store.ts  Zustand store + persistence + mutations
    use-ui-store.ts     dialog/sheet state
```

## What is enforced

- **Qualified** requires all seven answers, 7/10+, 10+ staff, transfer payroll, CAC/TIN and a decision maker.
- **Demo → Compliance** requires the demo to be marked complete.
- **Compliance → Live** requires all eight documents. The stage button is disabled and states exactly what is missing.

The domain logic is in `src/lib/domain.ts`, independent of the UI, so it can be unit-tested or moved behind an API.

## Data

This build is **local-first**: the store persists to `localStorage`, keyed by origin. Each visitor gets their own workspace; export/import in **Settings & data** moves a snapshot between people.

A shared team pipeline needs a server or hosted database. The earlier Netlify function in the sibling project (`../chequein-sales-os/netlify/functions/state.mjs`) is a working version-checked sync API, but it cannot be used from a static GitHub Pages export. To make this app multi-user, replace the Zustand persistence layer with calls to a Next route handler + Postgres/SQLite, or host this project on a Node runtime (Vercel, Netlify, Fly) and add the API there.

## Notes

- Seeded baseline: 3 live employers, 106 employees, ₦31,905/month, 33% EWA, 8% savings, 6.4% reported repayment.
- The seven failed employers are placeholders; rename them before triage.
- The seeded numbers and employer names are in the public bundle. Sanitize before sharing widely.
