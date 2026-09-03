# DGB India — Digibuggy Enterprise

Two separate apps, each independently runnable and deployable:

```
DGB India/
  Backend/     Standalone Payload CMS (content API + admin). Port 4000.
  Frontend/    Next.js marketing site. Port 3000. Reads Backend over HTTP.
```

Start Backend first (it needs to be seeded once), then Frontend:

```bash
cd Backend && npm install && npm run seed && npm run dev
# in a second terminal
cd Frontend && npm install && npm run dev
```

- Site: http://localhost:3000
- Admin: http://localhost:4000/admin

Each folder has its own README with full setup details, environment variables, known issues, and
a production checklist — read the one for whichever app you're touching. `Backend/README.md`
also explains how the two apps authenticate to each other for the one thing Frontend writes back
(contact-form leads).


# DGB India — Digibuggy Enterprise

Two separate, independently-deployable apps, each with its own dependencies and README:

- **Backend/** — standalone Payload CMS (content API + admin panel), runs on port 4000.
- **Frontend/** — Next.js marketing site, runs on port 3000, reads content from Backend over HTTP.

Read `Backend/README.md` and `Frontend/README.md` before working in either — each has its own
setup steps, environment variables, and gotchas (notably a Node/Payload-CLI type-generation
workaround documented in `Backend/README.md`).

`Frontend/CLAUDE.md` and `Backend/CLAUDE.md` each pull in that app's own `AGENTS.md` — a
Next.js-specific file that `next dev` regenerates per app, so read the one inside whichever
folder you're actually working in, not this one.
