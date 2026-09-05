const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'netlify-dist');

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>LinkStack needs PHP hosting</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #f6f7fb;
      --text: #17202a;
      --muted: #52616f;
      --panel: #ffffff;
      --accent: #1d7a85;
      --border: #d8dee8;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #101418;
        --text: #edf2f7;
        --muted: #a7b1bd;
        --panel: #171d23;
        --accent: #42c2c8;
        --border: #2c3642;
      }
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 32px;
      background: var(--bg);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.55;
    }
    main {
      width: min(760px, 100%);
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: clamp(24px, 5vw, 48px);
      box-shadow: 0 18px 50px rgba(20, 30, 45, 0.12);
    }
    h1 {
      margin: 0 0 12px;
      font-size: clamp(28px, 4vw, 44px);
      line-height: 1.08;
      letter-spacing: 0;
    }
    p { margin: 0 0 16px; color: var(--muted); }
    strong { color: var(--text); }
    code {
      padding: 2px 6px;
      border-radius: 5px;
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      color: var(--text);
    }
    a { color: var(--accent); font-weight: 700; }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 28px;
    }
    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      padding: 0 16px;
      border: 1px solid var(--accent);
      border-radius: 6px;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <main>
    <h1>LinkStack is not a static Netlify app</h1>
    <p><strong>This deploy is working, but it cannot run the full LinkStack Laravel application on Netlify's static runtime.</strong></p>
    <p>LinkStack needs a PHP runtime, Laravel routes, writable storage, sessions, and a persistent database. Netlify can install PHP dependencies during build, but deployed PHP files are not executed as a long-running Laravel app.</p>
    <p>Use a PHP-capable host, VPS, shared hosting, or the official Docker deployment for the full product. If you only need a static link page, export or rebuild that page as plain HTML/CSS/JS and deploy the generated files to Netlify.</p>
    <div class="actions">
      <a class="button" href="https://github.com/LinkStackOrg/LinkStack">LinkStack repository</a>
      <a class="button" href="https://docs.netlify.com/">Netlify docs</a>
    </div>
  </main>
</body>
</html>`;

fs.writeFileSync(path.join(dist, 'index.html'), html);
console.log(`Created ${path.relative(root, dist)} for Netlify.`);
