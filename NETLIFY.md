# Netlify deployment

This repository now includes a `netlify.toml` so Netlify can build and publish a static compatibility page from `netlify-dist`.

The full LinkStack application is a Laravel/PHP app with authentication, installer routes, writable storage, and a database. Netlify can provide PHP and Composer during build, but it does not run Laravel/PHP as the deployed web runtime. Publishing the repository root or `index.php` on Netlify will not run LinkStack.

Use Netlify only for:

- a static informational page
- a separately generated static export of public link pages
- frontend assets that call an external LinkStack backend

Use PHP hosting, a VPS, shared hosting, or LinkStack's Docker deployment for the full app.

## Supabase database

Supabase can be used as the external PostgreSQL database for LinkStack, but it does not make the full app run on Netlify by itself. LinkStack still needs a PHP/Laravel runtime for routes, auth, uploads, sessions, and background work.

For a PHP-capable host, copy `.env.supabase.example` into that host's `.env` and set these values from Supabase:

- `DB_CONNECTION=pgsql`
- `DB_HOST=db.<project-ref>.supabase.co`
- `DB_PORT=5432`
- `DB_DATABASE=postgres`
- `DB_USERNAME=postgres`
- `DB_PASSWORD=<database-password>`
- `DB_SSLMODE=require`

If the direct database host resolves only to IPv6 on your deploy platform, use Supabase's Session Pooler connection string instead. Copy it from Supabase Dashboard > Connect > Session pooler. It usually looks like:

```env
DB_CONNECTION=pgsql
DB_HOST=aws-<pooler-id>-<region>.pooler.supabase.com
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres.<project-ref>
DB_PASSWORD=<database-password>
DB_SSLMODE=require
```

Then run:

```bash
php artisan key:generate --force
php artisan migrate --force
php artisan db:seed --force
```
