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
