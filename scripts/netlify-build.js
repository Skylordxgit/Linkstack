const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'netlify-src');
const dist = path.join(root, 'netlify-dist');

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
  const from = path.join(source, entry.name);
  const to = path.join(dist, entry.name);
  fs.cpSync(from, to, { recursive: true });
}

console.log(`Created ${path.relative(root, dist)} for Netlify.`);
