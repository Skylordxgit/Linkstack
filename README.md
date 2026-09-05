# LinkApp

A private, single-admin link management platform — inspired by the functionality of
Linktree / mssg.me. One admin login, unlimited public pages (`domain.com/baji`,
`domain.com/support`, `domain.com/social`, ...), each with its own profile, links, social icons,
glass UI theme, background, SEO and analytics.

This is **not** a SaaS: there is no signup, no billing, no multi-tenant customer system. Just one
admin dashboard controlling as many public pages as you want.

**Stack**: Next.js 15 (App Router) frontend, Express + TypeScript + Prisma API, PostgreSQL via
**Supabase** (database + file storage), deployed as one site on **Netlify**.

## Architecture

```
root/
  frontend/    Next.js 15 (App Router, TypeScript, Tailwind) — admin UI + public pages
  backend/     Node.js + Express + TypeScript + Prisma — REST API
                 src/server.ts            standalone entrypoint (local dev / any self-host)
                 netlify/functions/api.ts Netlify Function entrypoint (same Express app)
  deploy/      Example Nginx config (self-hosted alternative)
  netlify.toml Netlify build/deploy config (frontend + API function, one site)
  ecosystem.config.js  PM2 process definitions (self-hosted alternative)
  docker-compose.yml   Local/self-hosted stack with a containerized Postgres
```

The **same** Express app (routes, controllers, middleware — everything in `backend/src`) runs two
ways without any code changes: as a normal long-running Node process (`app.listen`, via
`src/server.ts`) for local development or any self-hosted deployment, and wrapped as a single
Netlify Function (`netlify/functions/api.ts`, via `serverless-http`) for the Netlify deployment.
The frontend never talks to a database directly — everything goes through this API.

### How requests are routed (Netlify)

Netlify serves the whole app from one domain:

```
https://your-site.netlify.app/          -> Next.js (via @netlify/plugin-nextjs)
https://your-site.netlify.app/api/*     -> the Express app (one Netlify Function)
```

`netlify.toml` redirects `/api/*` to the Function. Because it's all one origin, the browser's API
client just calls the relative path `/api`, so there's no CORS to configure and the admin session
cookie is naturally first-party. Server-side rendering (the public pages, the admin auth check)
calls the same API over the network at this site's own URL — Netlify exposes that automatically as
the `URL` environment variable at runtime, so no extra configuration is needed for that either.

Uploaded media (avatars, backgrounds, thumbnails, etc.) never touches the Next.js or Express
runtimes' disk — Netlify Functions have no persistent filesystem — it's uploaded straight to
**Supabase Storage** and served from Supabase's own CDN URL.

## Requirements

- Node.js 20 LTS
- A free [Supabase](https://supabase.com) project (Postgres database + Storage)
- A free [Netlify](https://netlify.com) account
- npm

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com/dashboard).
2. **Database connection strings** — Project Settings -> Database -> Connection string:
   - Copy the **Transaction pooler** string (port `6543`, includes `?pgbouncer=true`) — this is
     your `DATABASE_URL`.
   - Copy the **Direct connection** string (port `5432`) — this is your `DIRECT_URL` (only used
     for running migrations).
   - Both use the password you set when creating the project.
3. **API keys** — Project Settings -> API:
   - Copy the **Project URL** — this is `SUPABASE_URL`.
   - Copy the **service_role** secret key — this is `SUPABASE_SERVICE_ROLE_KEY`. Keep this
     private; it bypasses Row Level Security and must never reach the browser.
4. **Storage bucket** — Storage -> New bucket. Create a bucket named `media` and mark it
   **Public** (so uploaded images/videos can be viewed directly by anyone visiting your public
   pages, the same way any other Linktree-style link page works). If you name it something else,
   set `SUPABASE_STORAGE_BUCKET` to match.

You now have everything for `backend/.env`'s `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_STORAGE_BUCKET`.

## 2. Local development

```bash
# Install everything
npm run install:all

# Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# edit backend/.env with your Supabase values from step 1, plus a JWT_SECRET,
# ADMIN_EMAIL and ADMIN_PASSWORD

# Set up the database (creates tables from backend/prisma/schema.prisma)
cd backend
npx prisma migrate deploy
npm run seed          # creates your admin account + default settings
cd ..

# Run both apps together
npm run dev
```

- Frontend: http://localhost:3000
- Backend health check: http://localhost:4000/api/health
- Admin login: http://localhost:3000/admin/login (use the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from
  `backend/.env`)

In local dev, `next.config.js` proxies `/api/*` to the standalone backend process — you don't need
Netlify running locally to develop.

### Database / Prisma

The schema (`backend/prisma/schema.prisma`) defines: `Admin`, `Page`, `Block`, `SocialLink`,
`PageView`, `LinkClick`, `Media`, `Template`, `Setting`, `AuditLog`.

- `npx prisma migrate dev --name <name>` — create + apply a migration in development
- `npx prisma migrate deploy` — apply pending migrations non-interactively (what you run against
  Supabase, locally or in CI — Netlify's build does **not** run this for you automatically, see
  step 4)
- `npx prisma studio` — browse the database visually

### Admin seed

There is no signup page. The one admin account is created by the seed script from environment
variables:

```
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=a-strong-password-at-least-8-chars
```

Run `npm run seed` (from `backend/`) any time to (re)create the account or reset the password to
what's currently in `.env`.

## 3. Environment variables

**`backend/.env`**

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` \| `production` |
| `PORT` | Backend port for standalone/local mode (default `4000`) |
| `DATABASE_URL` | Supabase **pooled** connection string (runtime queries) |
| `DIRECT_URL` | Supabase **direct** connection string (migrations only) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — server-only, never expose to the browser |
| `SUPABASE_STORAGE_BUCKET` | Storage bucket for uploads (default `media`) |
| `JWT_SECRET` | Long random string signing the session cookie |
| `JWT_EXPIRES_IN` | Session lifetime (default `7d`) |
| `COOKIE_NAME` | Session cookie name (default `linkapp_session`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used only by `npm run seed` |
| `FRONTEND_URL` / `APP_URL` | Used for CORS allow-list |
| `MAX_UPLOAD_SIZE` | Bytes (default 10 MB) |
| `ANALYTICS_RETENTION_DAYS` | Informational; wire up a cleanup cron if you want auto-pruning |

**`frontend`** (`.env.local` for dev, `.env.production` for a local production build — in the
actual Netlify deploy these are set in the Netlify UI instead, see step 4)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Browser-facing API base. Leave as `/api`. |
| `INTERNAL_API_URL` | SSR API base. Leave unset — auto-derived from Netlify's `URL` env var in production, `http://localhost:4000/api` in dev. |
| `BACKEND_ORIGIN` | Local-dev-only rewrite proxy target. |
| `NEXT_PUBLIC_SITE_URL` | Full public site URL, used for SEO/sitemap/share links. |
| `COOKIE_NAME` | Must match the backend's `COOKIE_NAME`. |

## 4. Deploy to Netlify

1. Push this repo to GitHub/GitLab/Bitbucket, then in Netlify: **Add new site -> Import an
   existing project**, and pick it. Netlify will read `netlify.toml` from the repo root
   automatically — no manual build settings needed.
2. **Site configuration -> Environment variables** — add every variable listed in the
   `backend/.env` table above (Supabase values, `JWT_SECRET`, `ADMIN_EMAIL`/`ADMIN_PASSWORD`,
   `COOKIE_NAME`) plus `NEXT_PUBLIC_SITE_URL` set to your Netlify URL (or custom domain once
   attached). Set `FRONTEND_URL`/`APP_URL` to that same URL. You do **not** need to set
   `NEXT_PUBLIC_API_URL`, `INTERNAL_API_URL`, or `PORT` — their defaults are already correct for
   Netlify.
3. **Run the database migration once, before (or right after) your first deploy** — Netlify's
   build does not run `prisma migrate deploy` for you (migrations shouldn't run automatically on
   every build/PR preview against your one production database). From your machine, with
   `backend/.env` pointing at your real Supabase credentials:
   ```bash
   cd backend
   npx prisma migrate deploy
   npm run seed
   ```
4. Trigger a deploy (push to your connected branch, or **Trigger deploy** in the Netlify UI).
   Netlify will install both `backend` and `frontend` dependencies, generate the Prisma client,
   build the Next.js app, and bundle the API as a Netlify Function — all defined in `netlify.toml`,
   nothing else to configure.
5. Visit `https://<your-site>.netlify.app/admin/login` and sign in with `ADMIN_EMAIL` /
   `ADMIN_PASSWORD`.

### Re-deploying after schema changes

Whenever you change `backend/prisma/schema.prisma` and create a new migration
(`npx prisma migrate dev --name ...` locally), run `npx prisma migrate deploy` against production
**before** the Netlify deploy that depends on it goes live (same command as step 4.3). Netlify
deploys are otherwise just `git push`.

### Notes and trade-offs

- **Rate limiting** (`express-rate-limit`) is in-memory per Function instance. On Netlify, each
  cold-started instance starts a fresh counter, so limits are best-effort rather than a hard
  global guarantee. For stronger guarantees, back it with an external store (e.g. Upstash Redis)
  — the current setup is a reasonable default for a personal, single-admin tool.
- **SSR fetches leave the Function and come back in** over the network (Next.js's server runtime
  and the API are separate Netlify Functions — there's no shared "localhost" between them the way
  there is on a VPS). This adds a small amount of latency to server-rendered pages compared to the
  self-hosted setup below, in exchange for zero server management.
- Netlify Functions execution time is capped (10s on the free tier, more on paid plans) — plenty
  for this app's request patterns, but worth knowing if you significantly extend it.

## Alternative: self-hosted (Hostinger VPS / any Ubuntu VPS)

Because the Express app also runs as a plain long-running process, you can skip Netlify entirely
and self-host both apps with PM2 + Nginx, still against the same Supabase database and storage
bucket (or point `DATABASE_URL`/`DIRECT_URL` at a self-managed Postgres instead — see
`docker-compose.yml` for a fully containerized alternative with a local Postgres container; media
uploads still go to Supabase Storage either way, since Netlify isn't the only place that benefits
from not managing local disk backups).

1. **Provision**: Ubuntu 22.04+ VPS, Node.js 20 LTS, Nginx.

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
   sudo apt-get install -y nodejs nginx
   sudo npm install -g pm2
   ```

2. **Clone and configure**:

   ```bash
   git clone <your-repo-url> /var/www/linkapp
   cd /var/www/linkapp
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.production
   # edit both with your Supabase values (see step 1 above) and production URLs:
   # NEXT_PUBLIC_SITE_URL=https://domain.com, NEXT_PUBLIC_API_URL=/api,
   # INTERNAL_API_URL=http://localhost:4000/api, FRONTEND_URL=https://domain.com
   ```

3. **Install, migrate, seed, build**:

   ```bash
   npm run install:all
   cd backend && npx prisma migrate deploy && npm run seed && npm run build && cd ..
   cd frontend && npm run build && cd ..
   ```

4. **Start with PM2**:

   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup   # follow the printed instructions to enable boot startup
   ```

5. **Nginx**: copy `deploy/nginx.conf` to `/etc/nginx/sites-available/linkapp`, edit `domain.com`
   to your real domain, then:

   ```bash
   sudo ln -s /etc/nginx/sites-available/linkapp /etc/nginx/sites-enabled/linkapp
   sudo nginx -t && sudo systemctl reload nginx
   ```

6. **SSL** with Let's Encrypt:

   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d domain.com -d www.domain.com
   ```

### Docker (optional, self-hosted only)

`docker-compose.yml` runs a fully containerized stack (frontend + backend + a local Postgres
container instead of Supabase's database, though Supabase Storage is still used for uploads).

```bash
cp backend/.env.example .env   # SUPABASE_*, JWT_SECRET, ADMIN_EMAIL/PASSWORD are read from here
docker compose up -d --build
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run seed
```

### Updating (self-hosted)

```bash
cd /var/www/linkapp
git pull
npm run install:all
cd backend && npx prisma migrate deploy && npm run build && cd ..
cd frontend && npm run build && cd ..
pm2 restart ecosystem.config.js
```

## Testing before you ship

```bash
cd backend && npm run lint && npx tsc --noEmit && npm run typecheck:netlify && npx prisma validate
cd frontend && npm run lint && npm run build
```

Then manually verify the golden path: admin login → create page → upload avatar → add a WhatsApp
link → add a Telegram link → add a custom link → drag to reorder blocks → publish → open the
public page → confirm a view is recorded → click a link → confirm a click is recorded → duplicate
the page → generate a QR code → check `/admin/analytics` → log out.

## Backups

- **Database**: Supabase takes automatic daily backups on paid plans; on the free tier, run your
  own periodic `pg_dump` against the direct connection string and store it offsite.
- **Media**: back up your Supabase Storage bucket (Supabase's dashboard or the Storage API can
  export objects) — it's not in git and not part of the Postgres backup.

## Troubleshooting

- **Netlify build fails with a Prisma/OpenSSL error at runtime**: the generated client ships
  binaries for `native`, `rhel-openssl-1.0.x`, and `rhel-openssl-3.0.x` (see `generator client` in
  `schema.prisma`) to cover Netlify's Lambda runtime. If Netlify changes their base image and this
  ever needs a different target, check the exact error for the required `binaryTarget` name and
  add it to that list.
- **`/api/*` returns Netlify's default 404 page**: check the Function actually deployed (Netlify
  dashboard -> Functions) and that `netlify.toml`'s redirect is present — `netlify build` locally
  (`npx netlify-cli build`) will surface bundling errors before you deploy.
- **Login works locally but not on Netlify**: confirm every variable in the `backend/.env` table
  is set in Netlify's environment variables UI — a missing `SUPABASE_SERVICE_ROLE_KEY` or
  `JWT_SECRET` will make the Function throw on cold start.
- **Uploads fail**: confirm the Supabase Storage bucket exists, is named exactly
  `SUPABASE_STORAGE_BUCKET` (default `media`), and is marked Public.
- **Prisma migration errors**: never edit an already-applied migration; create a new one with
  `npx prisma migrate dev --name fix_x` locally, commit it, then `npx prisma migrate deploy`
  against Supabase.
- **CORS errors**: only relevant if the frontend calls the backend cross-origin. Make sure that
  exact origin is in `FRONTEND_URL`/`APP_URL` on the backend.

## What's implemented

Admin auth (single account, HttpOnly JWT cookie, bcrypt), full page/block/social-link CRUD with
drag-and-drop reordering, autosaving visual page editor with live mobile/desktop preview, 12
theme presets on top of a fully custom glass/background/button/animation system, media library
(Supabase Storage, images re-encoded through Sharp to strip EXIF before upload), built-in +
savable templates, page duplication, publish/draft/hidden/archived status, dynamic SEO metadata +
`robots.txt` + `sitemap.xml`, privacy-friendly view/click analytics (daily-rotating salted visitor
hash — no persistent fingerprinting) with device/browser/referrer/UTM breakdowns and Recharts
dashboards, share sheet + QR code (PNG/SVG) generation, and an audit log of admin actions.

**Not implemented** (documented rather than faked): GeoIP country lookup for analytics (the
`country` field exists in the schema but is never populated — wiring in a GeoIP database/service
is a self-contained addition to `backend/src/utils/visitor.ts`).

## Security notes

- Session auth uses an HttpOnly, `SameSite=Lax` cookie (`Secure` in production) — never
  `localStorage`.
- All `/api/admin/*` routes require a valid session; the frontend's `/admin/*` routes are guarded
  both by middleware (fast cookie-presence redirect) and by a server-side `GET /api/auth/me` check
  in the protected layout (the real check).
- `javascript:`, `data:`, and `vbscript:` URLs are rejected wherever a user-supplied URL is stored
  (link blocks, social links).
- Uploaded images are re-encoded through Sharp (strips EXIF, blocks disguised files) before being
  sent to Supabase Storage; raw SVG uploads are not accepted.
- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security and is used only in backend code — it is
  never sent to the browser.
- Rate limiting on `/api/auth/login`, uploads, and public endpoints; Helmet, and a Zod-validated
  request body on every write route.
