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
