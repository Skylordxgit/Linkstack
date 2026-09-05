# Netlify deployment

This repository includes a Netlify-native Node MVP for Signup Links.

It uses:

- static files from `netlify-src`
- one Node serverless function at `netlify/functions/api.js`
- Supabase REST as the database backend

## Required Netlify environment variables

```env
SUPABASE_URL=https://cuuwzvgbyzoqsatdxbam.supabase.co
SUPABASE_SECRET_KEY=your-supabase-secret-key
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=change-this-password
SESSION_SECRET=generate-a-long-random-string
NODE_VERSION=20
```

Do not commit the Supabase secret key. Add it only in Netlify environment variables and mark it secret.

## Supabase setup

Open Supabase SQL Editor and run `supabase-schema.sql` once.

## Login

After deployment, open `/admin` and sign in with the values from `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

The public page is available at `/` and `/@admin`.

## Laravel source

The original Laravel/PHP LinkStack code is still in this repository as reference, but the Netlify deployment path now runs the Node MVP described above.
