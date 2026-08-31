# Digibuggy Enterprise — Frontend

Next.js 15 marketing site. Reads all content from `../Backend` (standalone Payload CMS) over
its REST API — this app has no database access and no Payload dependency of its own.

## Stack

- Next.js 15.4.11, TypeScript, Tailwind v4
- **Animation:** Framer Motion (scroll reveals, magnetic buttons, cursor-spotlight cards) +
  Three.js/GSAP ScrollTrigger for the homepage's pinned particle-sphere hero
- **Icons:** Lucide

## Getting started

Backend must be running first (`cd ../Backend && npm run dev`, seeded at least once — see its
README) so there's an API to read from.

```bash
npm install
npm run dev
```

- Site: http://localhost:3000

## Talking to the Backend

`src/lib/api.ts` is the only place that knows about Payload's REST API shape (`?where[x][equals]=y`
query params, `{ docs: [...] }` response envelope for collections, a bare object for globals).
`src/lib/content.ts` wraps it into typed per-collection functions (`getIndustries()`,
`getIndustryBySlug()`, ...) — everything else in the app calls those, never `fetch` directly.
Content is revalidated every 60s (ISR) by default; adjust `DEFAULT_REVALIDATE` in `api.ts` for
content that needs to feel closer to live.

`NEXT_PUBLIC_API_URL` (in `.env`) points at the Backend. Change it per environment.

### The one write path: the contact form

`src/app/api/contact/route.ts` is the only place this app writes to the Backend — it proxies the
requirement form to `POST /api/leads` on Backend, authenticated with a service account's API key
(`BACKEND_SERVICE_API_KEY` in `.env`). That key is generated and written here automatically by
Backend's seed script (`cd ../Backend && npm run seed`) — see Backend's README, "Why a service
account?" section, for the full explanation. If leads stop working, check that env var is set
before anything else.

### Payload types

`src/payload-types.ts` is a **copy** of Backend's generated types, not generated here (this app
has no Payload install to generate them from). After changing a collection/global in Backend, re-copy:

```bash
cp ../Backend/src/payload-types.ts src/payload-types.ts
```

### Visual QA (screenshotting the running site)

Playwright is installed as a dev dependency for exactly one purpose: letting an agent (or you)
see the rendered page instead of guessing from source. Two scripts, both write into a scratch
folder you pass as an argument (or edit the default path at the top of the file):

```bash
npx tsx scripts/screenshot.mts http://localhost:3000/some-page   # full-page screenshot,
                                                                   # scrolls incrementally first
                                                                   # so IntersectionObserver-based
                                                                   # reveal animations actually fire
npx tsx scripts/screenshot-hero.mts http://localhost:3000         # captures the homepage
                                                                   # ScrollHero sequence at several
                                                                   # scroll depths (0, 5%, 18%, ...)
```

## The homepage hero (`src/components/home/ScrollHero.tsx`)

A pinned, scroll-scrubbed sequence (GSAP ScrollTrigger `pin` + `scrub`) built on a Three.js
particle system: the headline fades, six differentiators reveal around the sphere (3 left / 3
right), the sphere relocates next to a condensed "How We Work" panel, then its particles morph
from a chaotic sphere into an ordered grid — the "chaotic workload → ordered infrastructure"
story, visually.

It degrades to a plain static hero (no WebGL, no 380vh pin) below 900px width, when
`prefers-reduced-motion: reduce` is set, or if WebGL init throws — the component always starts in
that "simple" mode and only expands into the full pinned experience once Three.js/GSAP have
actually loaded, so there's never a blank tall-scroll trap for slow/no-JS clients. See the
in-file comments before touching the GSAP timeline — the tween positions are absolute (0–1),
not chained `"+="` offsets, on purpose (chained relative offsets made an earlier version silently
skip the whole middle stage — easy mistake, worth avoiding twice).

The navbar (`src/components/site/HeaderClient.tsx`) hides on scroll-down and reappears on
scroll-up, and is transparent (no border/blur) at the very top of the page so it blends with the
hero instead of sitting on a hard bar.

## Project structure

```
src/
  app/
    (frontend)/        Public site — layout, homepage, all page routes
    api/contact/         Lead submission endpoint (proxies to Backend, see above)
    sitemap.ts, robots.ts
  components/
    site/                 Header (mega-menu), Footer
    home/                  Homepage sections
    ui/                     Button, Reveal (scroll animation), SpotlightCard,
                             MagneticButton, RichText renderer, RouteProgress, Skeleton, Spinner
    forms/                  Lead/requirement form
    resources/              Blog/insight/case-study list & detail views
  lib/
    api.ts                  REST client for the Backend (the only fetch-shape-aware file)
    content.ts               Typed data-fetching helpers per collection, built on api.ts
    nav-data.ts               Builds the mega-menu tree from live CMS data
  payload-types.ts          Copy of Backend's generated types (see "Payload types" above)
scripts/
  screenshot.mts, screenshot-hero.mts   Visual QA (see above)
```

## Known issues

**This project lives inside a live-synced OneDrive folder.** `node_modules` has tens of
thousands of small files; OneDrive's live sync has been observed intermittently corrupting or
evicting them mid-session. If you hit unexplained "module not found" errors after things were
working, suspect this first — `rm -rf node_modules && npm install` is the fix. Pausing OneDrive
sync while actively developing, or excluding this folder from sync, avoids it entirely.

## Going to production

- **Loading states:** a top route-change progress bar and per-route `loading.tsx` skeletons are
  already wired up (industries, infrastructure, and case-study detail pages) — add more as you
  add slower routes.
- **Spam protection:** `TURNSTILE_SECRET_KEY` — the contact route already verifies a Turnstile
  token server-side if set; you'll need to add the widget client-side in `RequirementForm.tsx`
  and set `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
- **Email:** `RESEND_API_KEY` + `LEADS_NOTIFY_EMAIL` — the contact route calls Resend's API if
  both are set right after a successful lead creation; it's a no-op otherwise.
- **Hosting:** Vercel is the natural fit for this app specifically. Set `NEXT_PUBLIC_SERVER_URL`
  to your real domain and `NEXT_PUBLIC_API_URL` to Backend's real domain — and update `FRONTEND_URL`
  in Backend's `.env` to match this app's real domain (CORS will reject requests otherwise).

## What's built vs. what's still copy/content work

Built: full IA, homepage, industry and infrastructure detail templates, How We Work, About,
Resources (blog/insights/case studies), Contact + lead capture wired to the Backend, sitemap/
robots/JSON-LD, and loading states.

Still needed before launch: real copy and images for every page (seeded content is
representative, not final), real case studies, partner/OEM logos, and the production
integrations listed above.
