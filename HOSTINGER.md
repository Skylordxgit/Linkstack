# Hostinger deployment

Use these build settings:

```text
Framework preset: Next.js
Branch: main
Node version: 20.x
Root directory: ./
Build command: npm run build
Package manager: npm
Output directory: frontend/.next
```

The root `npm run build` script installs `backend` and `frontend` dependencies before building both projects, which is required for Hostinger's limited build-command dropdown.

Use `npm run start --prefix backend` as the backend start command if Hostinger asks for one.
