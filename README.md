# LinkApp

A private, self-hosted, single-admin link management application inspired by the functionality of
mssg.me and Linktree. One admin login, unlimited public pages (`domain.com/baji`,
`domain.com/support`, `domain.com/social`, ...), each with its own profile, links, social icons,
glass UI theme, background, SEO and analytics.

This is **not** a SaaS: there is no signup, no billing, no multi-tenant customer system. Just one
admin dashboard controlling as many public pages as you want.

## Architecture

```
root/
  frontend/    Next.js application (App Router, TypeScript, Tailwind) — admin UI + public pages
  backend/     Node.js Express application (TypeScript, Prisma) — REST API
  deploy/      Example Nginx config
  ecosystem.config.js   PM2 process definitions
  docker-compose.yml    Optional containerized stack (frontend + backend + MySQL)
```

- **Frontend** (port 3000): renders the admin dashboard/editor and the public `/[slug]` pages.
  Talks to the backend over HTTP — never touches the database directly.
- **Backend** (port 4000): Express REST API, Prisma ORM, MySQL. Owns auth, all CRUD, uploads,
  analytics, click/view tracking.
- They are independently deployable — you can build/restart/scale each one without touching the
  other, as long as `NEXT_PUBLIC_API_URL` / `INTERNAL_API_URL` (frontend) and `FRONTEND_URL` /
  `APP_URL` (backend) point at each other correctly.

### How requests are routed

In production, Nginx does the routing:

```
https://domain.com           -> frontend (port 3000)
https://domain.com/api/*     -> backend  (port 4000)
https://domain.com/uploads/* -> backend (port 4000), for uploaded media
```

The frontend's browser-side API client defaults to a **relative** `/api` base URL, so it always
calls same-origin, and Nginx forwards that to the backend — no CORS needed, and the admin session
cookie is naturally first-party. Server-side rendering (the public pages, the admin auth check)
talks to the backend directly via `INTERNAL_API_URL` (defaults to `http://localhost:4000/api`),
bypassing Nginx entirely for speed.

In local development (no Nginx), `frontend/next.config.js` rewrites `/api/*` and `/uploads/*` to
`BACKEND_ORIGIN` (defaults to `http://localhost:4000`) so the same relative-URL setup works
without any extra configuration.

## Requirements

- Node.js 20 LTS
- MySQL 8+ (e.g. a Hostinger-provisioned database)
- npm

## Local development

```bash
# 1. Install everything
npm run install:all

# 2. Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# edit backend/.env: set DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

# 3. Set up the database
cd backend
npx prisma migrate dev --name init
npm run seed          # creates your admin account + default settings
cd ..

# 4. Run both apps together
npm run dev
```

- Frontend: http://localhost:3000
- Backend health check: http://localhost:4000/api/health
- Admin login: http://localhost:3000/admin/login (use the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from
  `backend/.env`)

### Frontend setup (standalone)

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Backend setup (standalone)

```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

### Database / Prisma

The schema (`backend/prisma/schema.prisma`) defines: `Admin`, `Page`, `Block`, `SocialLink`,
`PageView`, `LinkClick`, `Media`, `Template`, `Setting`, `AuditLog`.

- `npx prisma migrate dev --name <name>` — create + apply a migration in development
- `npx prisma migrate deploy` — apply pending migrations in production (non-interactive)
- `npx prisma studio` — browse the database visually
- `npm run seed` (in `backend/`) — upserts the single admin account from `ADMIN_EMAIL` /
  `ADMIN_PASSWORD`, and default settings. Safe to re-run.

### Admin seed

There is no signup page. The one admin account is created by the seed script from environment
variables:

```
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=change_this_password
```

Run `npm run seed` (from `backend/`) any time to (re)create the account or reset the password to
what's currently in `.env`.

## Environment variables

**`backend/.env`**

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` \| `production` |
| `PORT` | Backend port (default `4000`) |
| `DATABASE_URL` | MySQL connection string |
| `JWT_SECRET` | Long random string signing the session cookie |
| `JWT_EXPIRES_IN` | Session lifetime (default `7d`) |
| `COOKIE_NAME` | Session cookie name (default `linkapp_session`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used only by `npm run seed` |
| `FRONTEND_URL` / `APP_URL` | Used for CORS allow-list |
| `UPLOAD_PATH` | Local upload directory (default `uploads`) |
| `MAX_UPLOAD_SIZE` | Bytes (default 10 MB) |
| `ANALYTICS_RETENTION_DAYS` | Informational; wire up a cleanup cron if you want auto-pruning |

**`frontend/.env.local`**

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Browser-facing API base. Leave as `/api` (recommended). |
| `INTERNAL_API_URL` | Server-side (SSR) API base, talks to the backend directly. |
| `BACKEND_ORIGIN` | Used by the dev rewrite proxy only. |
| `NEXT_PUBLIC_SITE_URL` | Full public site URL, used for SEO/sitemap/share links. |
| `COOKIE_NAME` | Must match the backend's `COOKIE_NAME`. |

## Build

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm run start

# Frontend
cd frontend
npm install
npm run build
npm run start
```

### Testing before you ship

```bash
cd backend && npm run lint && npx tsc --noEmit && npx prisma validate
cd frontend && npm run lint && npm run build
```

Then manually verify the golden path: admin login → create page → upload avatar → add a WhatsApp
link → add a Telegram link → add a custom link → drag to reorder blocks → publish → open the
public page → confirm a view is recorded → click a link → confirm a click is recorded → duplicate
the page → generate a QR code → check `/admin/analytics` → log out.

## Production deployment (Hostinger VPS / any Ubuntu VPS)

1. **Provision**: Ubuntu 22.04+ VPS, Node.js 20 LTS, Nginx, PM2.

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
   sudo apt-get install -y nodejs nginx
   sudo npm install -g pm2
   ```

2. **Database**: if MySQL isn't already running on the VPS (e.g. `apt-get install -y mysql-server`),
   or use a Hostinger-provisioned MySQL database instead (hPanel -> Databases -> MySQL Databases —
   see `backend/.env.example` for the exact connection string format, including how to enable
   Remote MySQL access if the database isn't on the same machine as this app):

   ```bash
   sudo mysql -e "CREATE USER 'linkapp'@'localhost' IDENTIFIED BY 'change_me';"
   sudo mysql -e "CREATE DATABASE linkapp CHARACTER SET utf8mb4;"
   sudo mysql -e "GRANT ALL PRIVILEGES ON linkapp.* TO 'linkapp'@'localhost'; FLUSH PRIVILEGES;"
   ```

3. **Clone and configure**:

   ```bash
   git clone <your-repo-url> /var/www/linkapp
   cd /var/www/linkapp
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   # edit both with production values: DATABASE_URL, JWT_SECRET, ADMIN_EMAIL/PASSWORD,
   # NEXT_PUBLIC_SITE_URL=https://domain.com, NEXT_PUBLIC_API_URL=/api,
   # INTERNAL_API_URL=http://localhost:4000/api, FRONTEND_URL=https://domain.com
   ```

4. **Install, migrate, seed, build**:

   ```bash
   npm run install:all
   cd backend && npx prisma migrate deploy && npm run seed && npm run build && cd ..
   cd frontend && npm run build && cd ..
   ```

5. **Start with PM2**:

   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup   # follow the printed instructions to enable boot startup
   ```

6. **Nginx**: copy `deploy/nginx.conf` to `/etc/nginx/sites-available/linkapp`, edit `domain.com`
   to your real domain, then:

   ```bash
   sudo ln -s /etc/nginx/sites-available/linkapp /etc/nginx/sites-enabled/linkapp
   sudo nginx -t && sudo systemctl reload nginx
   ```

7. **SSL** with Let's Encrypt:

   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d domain.com -d www.domain.com
   ```

   Certbot rewrites the Nginx config to add the HTTPS server block and redirect HTTP → HTTPS.
   Renewal is automatic via the certbot systemd timer.

### Docker (optional)

A `docker-compose.yml` is provided for a fully containerized stack (frontend + backend +
MySQL). It is **not required** — the PM2 + Nginx setup above works without Docker.

```bash
cp backend/.env.example .env   # only JWT_SECRET / ADMIN_EMAIL / ADMIN_PASSWORD are read from here
docker compose up -d --build
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run seed
```

### Backups

- **Database**: `mysqldump -u linkapp -p linkapp > backup-$(date +%F).sql` (cron this daily; keep
  offsite copies).
- **Uploads**: back up `backend/uploads/` (or the `uploads` Docker volume) — it's not in git.

### Updating the application

```bash
cd /var/www/linkapp
git pull
npm run install:all
cd backend && npx prisma migrate deploy && npm run build && cd ..
cd frontend && npm run build && cd ..
pm2 restart ecosystem.config.js
```

### Troubleshooting

- **502 from Nginx**: check `pm2 status` and `pm2 logs linkapp-backend` /
  `pm2 logs linkapp-frontend` — one of the two processes probably isn't running or crashed on
  boot (usually a missing/incorrect env var).
- **Login works locally but not in production**: confirm `NODE_ENV=production` on the backend
  (the session cookie is only marked `Secure` in production, so it silently gets dropped by the
  browser over plain HTTP) and that you're serving over HTTPS.
- **Images/uploads 404 in production**: make sure the Nginx `/uploads/` location block is present
  and points at the backend, and that `backend/uploads/` is writable by the Node process.
- **`npm run build` fails with Prisma type errors** (e.g. a `pageId: string` not assignable to
  `never`): the generated Prisma client is stale or was never generated for this install —
  `npm run build` runs `prisma generate` automatically first (see `prebuild` in
  `backend/package.json`), but some managed Node.js hosting panels install dependencies with npm
  lifecycle scripts disabled, which can skip even that. Run `npx prisma generate` manually once,
  then retry the build.
- **Prisma migration errors**: never edit an already-applied migration; create a new one with
  `npx prisma migrate dev --name fix_x` locally, commit it, then `npx prisma migrate deploy` in
  production.
- **CORS errors**: only relevant if the frontend calls the backend cross-origin (e.g.
  `NEXT_PUBLIC_API_URL` set to a different domain). Make sure that exact origin is in
  `FRONTEND_URL`/`APP_URL` on the backend.

## What's implemented

Admin auth (single account, HttpOnly JWT cookie, bcrypt), full page/block/social-link CRUD with
drag-and-drop reordering, autosaving visual page editor with live mobile/desktop preview, 12
theme presets on top of a fully custom glass/background/button/animation system, media library
(Multer + Sharp, re-encodes and strips EXIF on upload), built-in + savable templates, page
duplication, publish/draft/hidden/archived status, dynamic SEO metadata + `robots.txt` +
`sitemap.xml`, privacy-friendly view/click analytics (daily-rotating salted visitor hash — no
persistent fingerprinting) with device/browser/referrer/UTM breakdowns and Recharts dashboards,
share sheet + QR code (PNG/SVG) generation, and an audit log of admin actions.

**Not implemented** (documented rather than faked): GeoIP country lookup for analytics (the
`country` field exists in the schema but is never populated — wiring in a GeoIP database/service
is a self-contained addition to `backend/src/utils/visitor.ts`), and a remote/cloud storage
adapter for uploads (currently local disk only, which is what the Hostinger VPS deployment target
expects).

## Security notes

- Session auth uses an HttpOnly, `SameSite=Lax` cookie (`Secure` in production) — never
  `localStorage`.
- All `/api/admin/*` routes require a valid session; the frontend's `/admin/*` routes are guarded
  both by middleware (fast cookie-presence redirect) and by a server-side `GET /api/auth/me` check
  in the protected layout (the real check).
- `javascript:`, `data:`, and `vbscript:` URLs are rejected wherever a user-supplied URL is stored
  (link blocks, social links).
- Uploaded images are re-encoded through Sharp (strips EXIF, blocks disguised files); raw SVG
  uploads are not accepted.
- Rate limiting on `/api/auth/login`, uploads, and public endpoints; Helmet, and a Zod-validated
  request body on every write route.
