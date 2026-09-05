const crypto = require('crypto');

const PROFILE_ID = 'admin';

function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

function getEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function getAdminEmail() {
  return process.env.ADMIN_EMAIL || 'admin@admin.com';
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || '12345678';
}

function getSessionSecret() {
  return process.env.SESSION_SECRET || process.env.APP_KEY || 'change-me';
}

function sign(value) {
  return crypto.createHmac('sha256', getSessionSecret()).update(value).digest('hex');
}

function makeCookie() {
  const payload = Buffer.from(JSON.stringify({
    email: getAdminEmail(),
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
  })).toString('base64url');
  const token = `${payload}.${sign(payload)}`;
  return `ls_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`;
}

function clearCookie() {
  return 'ls_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0';
}

function parseCookie(header = '') {
  return Object.fromEntries(header.split(';').map((part) => {
    const [key, ...rest] = part.trim().split('=');
    return [key, rest.join('=')];
  }).filter(([key]) => key));
}

function isAuthed(event) {
  const token = parseCookie(event.headers.cookie || event.headers.Cookie || '').ls_session;
  if (!token) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || sign(payload) !== signature) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.email === getAdminEmail() && data.expires > Date.now();
  } catch {
    return false;
  }
}

function cleanUrl(url) {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

async function supabase(path, options = {}) {
  const base = getEnv('SUPABASE_URL').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || getEnv('SUPABASE_SECRET_KEY');
  const response = await fetch(`${base}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      'content-type': 'application/json',
      prefer: options.prefer || '',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || data?.hint || 'Supabase request failed');
  return data;
}

async function getSiteData() {
  const [profiles, links] = await Promise.all([
    supabase(`profiles?id=eq.${PROFILE_ID}&select=*`),
    supabase(`links?profile_id=eq.${PROFILE_ID}&select=*&order=position.asc,created_at.asc`),
  ]);
  return {
    profile: profiles[0] || {
      id: PROFILE_ID,
      display_name: 'Signup Links',
      bio: 'Add your first links from the admin dashboard.',
      avatar_url: '',
    },
    links,
  };
}

async function ensureProfile() {
  await supabase('profiles', {
    method: 'POST',
    prefer: 'resolution=merge-duplicates',
    body: JSON.stringify({
      id: PROFILE_ID,
      display_name: 'Signup Links',
      bio: 'Add your first links from the admin dashboard.',
      avatar_url: '',
    }),
  });
}

exports.handler = async (event) => {
  try {
    const method = event.httpMethod;
    const routePath = event.path.includes('/api/')
      ? event.path.split('/api/')[1]
      : event.path.split('/.netlify/functions/api/')[1] || '';
    const route = `/${routePath.replace(/^\/+/, '')}`;
    const body = event.body ? JSON.parse(event.body) : {};

    if (route === '/public' && method === 'GET') {
      return json(200, await getSiteData());
    }

    if (route === '/login' && method === 'POST') {
      if (body.email === getAdminEmail() && body.password === getAdminPassword()) {
        await ensureProfile();
        return json(200, { ok: true }, { 'set-cookie': makeCookie() });
      }
      return json(401, { error: 'Invalid login' });
    }

    if (route === '/logout' && method === 'POST') {
      return json(200, { ok: true }, { 'set-cookie': clearCookie() });
    }

    if (!isAuthed(event)) {
      return json(401, { error: 'Sign in required' });
    }

    if (route === '/admin' && method === 'GET') {
      await ensureProfile();
      return json(200, await getSiteData());
    }

    if (route === '/profile' && method === 'PUT') {
      await supabase('profiles', {
        method: 'POST',
        prefer: 'resolution=merge-duplicates',
        body: JSON.stringify({
          id: PROFILE_ID,
          display_name: String(body.display_name || 'Signup Links').slice(0, 120),
          bio: String(body.bio || '').slice(0, 500),
          avatar_url: body.avatar_url ? cleanUrl(body.avatar_url) : '',
          updated_at: new Date().toISOString(),
        }),
      });
      return json(200, { ok: true });
    }

    if (route === '/links' && method === 'POST') {
      const url = cleanUrl(body.url);
      if (!url) return json(400, { error: 'Enter a valid http or https URL' });
      const existing = await supabase(`links?profile_id=eq.${PROFILE_ID}&select=id`);
      await supabase('links', {
        method: 'POST',
        prefer: 'return=representation',
        body: JSON.stringify({
          profile_id: PROFILE_ID,
          label: String(body.label || 'Untitled link').slice(0, 120),
          url,
          position: existing.length + 1,
          active: true,
        }),
      });
      return json(200, { ok: true });
    }

    const linkDelete = route.match(/^\/links\/(\d+)$/);
    if (linkDelete && method === 'DELETE') {
      await supabase(`links?id=eq.${linkDelete[1]}&profile_id=eq.${PROFILE_ID}`, {
        method: 'DELETE',
      });
      return json(200, { ok: true });
    }

    return json(404, { error: 'Not found' });
  } catch (error) {
    return json(500, { error: error.message || 'Server error' });
  }
};
