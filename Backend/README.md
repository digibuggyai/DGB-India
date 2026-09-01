# Digibuggy Enterprise — Backend

Standalone Payload CMS 3 (admin panel + REST/GraphQL API). This is its own deployable service —
it does not render the marketing site; that's `../Frontend`. This app owns the content model:

**Industry → Workload → Application → Requirement → Infrastructure**

## Stack

- Payload CMS 3, run via its Next.js integration (`@payloadcms/next`) — this Next app's only job
  is hosting Payload's admin UI and API routes, there are no content pages here.
- SQLite for local dev (zero setup). Swap to Postgres for production — see below.
- Lexical rich text (`@payloadcms/richtext-lexical`)

## Getting started

```bash
npm install
npm run dev
```

- Admin panel: http://localhost:4000/admin
- REST API: http://localhost:4000/api/{collection} — e.g. `/api/industries`
- GraphQL: http://localhost:4000/api/graphql

### Seed sample content

```bash
npm run seed
```

Creates an admin user (`harshit.digibuggy@gmail.com` / `DGB-Enterprise-2026!` — change this after
first login), a **Frontend service account** with an API key written straight into
`../Frontend/.env` as `BACKEND_SERVICE_API_KEY` (Frontend needs this to create Leads — see "Why a
service account?" below), and representative content across all collections. Safe to re-run — it
checks for existing records by slug/email before creating, and only rotates the service account's
key if `../Frontend/.env` doesn't already have one.

> The dev server and the seed script both write to the same SQLite file, and SQLite only allows
> one writer at a time. If `npm run seed` fails with `database is locked`, stop the dev server
> first, run the seed, then start `npm run dev` again.

### Generating types after a schema change

Whenever you add/edit a field in `src/collections/*.ts` or `src/globals/*.ts`, regenerate
`src/payload-types.ts` — **then copy it to `../Frontend/src/payload-types.ts` too** (Frontend
reads this API over HTTP now, not the Local API, so it can't regenerate its own copy; it needs
yours):

```bash
npx tsx scripts/generate-types.mts
cp src/payload-types.ts ../Frontend/src/payload-types.ts
```

(Not `npm run generate:types` — see "Known issues" below for why.)

## Why a service account? (Frontend ↔ Backend auth)

Frontend and Backend are separate origins now. Public content reads (industries, infrastructure,
posts, ...) go through Payload's open REST API with no auth. But creating a **Lead** — the
contact form submission — needs to be gated (public POST access would let anyone spam the leads
table), which used to be handled by `create: () => false` plus the Local API's access-bypass when
both apps were one process. That bypass doesn't exist across a network boundary, so instead:

- `src/collections/Users.ts` has `auth.useAPIKey: true`.
- The seed script creates a `service`-role user and an API key for it.
- Frontend's `/api/contact` route sends `Authorization: users API-Key <key>` when POSTing to
  `/api/leads`.
- `src/collections/Leads.ts`'s `create` access rule allows any *authenticated* request
  (`Boolean(req.user)`) — in practice that's only ever this one service account, since there's no
  public signup flow.

If you rotate or lose the key, regenerate it from the admin panel (Users →
`frontend-service@dgbindia.local` → API Key) and update `BACKEND_SERVICE_API_KEY` in
`../Frontend/.env` yourself, or just delete that user and re-run `npm run seed`.

## CORS / CSRF

`src/payload.config.ts` allow-lists `FRONTEND_URL` (from `.env`) for both `cors` and `csrf`. If
you deploy Frontend to a real domain, update `FRONTEND_URL` here to match — Frontend's browser-side
fetches and the admin panel's cross-origin requests will otherwise be rejected.

## Project structure

```
src/
  app/(payload)/       Payload's admin panel + REST/GraphQL routes (the whole app, essentially)
  collections/          Payload collection schemas (the content model)
  globals/               Site-wide settings, navigation, reusable CTA copy
  fields/                 Shared field helpers (slug, SEO)
  seed/seed.ts             Sample content + admin/service account seed script
scripts/
  load-env.mts             Loads .env for standalone scripts (see below)
  generate-types.mts        Workaround script for `payload generate:types`
patches/                  Persisted node_modules patch (see below)
```

## The content graph

```
Industry → Workload → Application → Infrastructure Requirement → Infrastructure
```

Example: **VFX & Animation → Rendering → Redshift → high VRAM + fast storage → GPU Servers**

- `workloads` is the hub collection: each workload has a structured `requirementProfile`
  (GPU/CPU intensity, VRAM, RAM, storage type, network, scaling pattern) plus relationships
  to the applications that create that workload and the infrastructure that suits it.
- `industries` link to workloads, featured applications, and recommended infrastructure —
  so an industry page assembles its "why this infrastructure" story from real relationships,
  not hardcoded copy.
- Editors add a new industry, workload or infrastructure item once in `/admin`; every page
  on Frontend that references it (nav, homepage, related-content blocks, sitemap) updates on
  its next ISR revalidation (60s by default — see Frontend's `src/lib/api.ts`).

## Known issues / workarounds (document before you hit them again)

**1. Next.js is pinned to `15.4.11`, not `^15` or `16.x`.**
Payload 3.88.0's peer range for Next is `>=15.2.9 <15.3.0 || >=15.3.9 <15.4.0 || >=15.4.11
<15.5.0 || >=16.2.6 <17.0.0`. Bumping Next past `15.5.0` or below `16.2.6` will produce a
peer-dependency conflict on `npm install`. If you need a newer Next, check Payload's current
peer range first (`npm view @payloadcms/next peerDependencies`).

**2. `payload generate:types` and `payload generate:importmap` don't work directly on this
machine/Node version** (Node 20.19+). Node's newer `require(esm)` interop mis-handles
`@next/env`'s CJS/`__esModule` shape when loaded through Payload's CLI bin scripts, and separately
a plain `export default` gets double-wrapped when a `.ts` config is re-imported from a genuine
ESM script (this project's `package.json` has no `"type": "module"`). Both are worked around in
`scripts/generate-types.mts` (boots a real Payload instance via `getPayload()` instead of using
the raw CLI path, and defensively unwraps `config.default ?? config`). Use that script instead of
the `payload` CLI directly. This is very likely a Payload/Next version-compatibility issue that
will be fixed upstream — worth re-testing the plain CLI next time you bump Payload or Next.

**3. `patches/@next+env+15.4.11.patch`** adds a `.default = module.exports` self-reference to
`@next/env`'s compiled output. It's applied automatically via `postinstall` (`patch-package`).
Needed for the same interop reason as #2. Safe to remove once #2 is fixed upstream.

**4. Keep this project off any live-synced OneDrive/Dropbox folder.** `node_modules` and `.next`
together have well over 100,000 small, rapidly-changing files; OneDrive's live sync has repeatedly
corrupted or evicted them mid-session in this project's history — a whole `node_modules/payload`
directory vanished once with no npm process running, and later `.next`'s build manifests were
deleted out from under a running dev server, crashing it. That's why this project now lives at
`C:\DGB India` rather than under `OneDrive\Desktop`. If you ever move it back into a synced
folder, expect this to recur.

## Going to production

None of the following are wired up yet — they need your own accounts/credentials:

- **Database:** swap the `db` block in `src/payload.config.ts` from `sqliteAdapter` to
  `postgresAdapter` (`@payloadcms/db-postgres`), pointed at Neon/Supabase/RDS via `DATABASE_URI`.
- **Media storage:** Payload's local-disk upload storage won't survive on most serverless hosts
  (no persistent disk). Add `@payloadcms/storage-s3` or `@payloadcms/storage-r2` pointed at your
  bucket.
- **Hosting:** deploy this as its own service (Railway, Render, Fly, a small VM, or Vercel with a
  Postgres + S3/R2 setup). Set `PAYLOAD_SECRET` to a real random value, `PAYLOAD_URL` to this
  service's real domain, and `FRONTEND_URL` to Frontend's real domain.
- **CRM sync:** the `leads` collection has an `afterChange`-friendly shape (status, source/UTM
  fields, internal notes) — wire a webhook or scheduled sync if leads need to land in a CRM.

## What's built vs. what's still copy/content work

Built: the full content model (industries, infrastructure with sub-items, workloads,
applications, case studies, posts, testimonials, partners, leads), admin auth with roles, a
service account for Frontend writes, and the seed script populating representative content.

Still needed before launch: real copy for every seeded record (the seed content is
representative, not final), real case studies, partner/OEM logos, and the production
integrations listed above.

**Naming note:** the `infrastructure` collection is named **Infrastructure**, not "Solutions" —
matches Frontend's nav, which uses "Infrastructure" to avoid colliding with the Industries
section's own use of the word "Solutions." Rename is a five-minute find/replace across this
collection's slug if you'd rather keep "Solutions".
