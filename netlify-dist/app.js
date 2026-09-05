const state = {
  profile: null,
  links: [],
};

const els = {
  publicView: document.querySelector('#public-view'),
  adminView: document.querySelector('#admin-view'),
  displayName: document.querySelector('#display-name'),
  bio: document.querySelector('#bio'),
  avatar: document.querySelector('#avatar'),
  links: document.querySelector('#links'),
  loginPanel: document.querySelector('#login-panel'),
  dashboardPanel: document.querySelector('#dashboard-panel'),
  loginForm: document.querySelector('#login-form'),
  loginEmail: document.querySelector('#login-email'),
  loginPassword: document.querySelector('#login-password'),
  loginMessage: document.querySelector('#login-message'),
  logoutButton: document.querySelector('#logout-button'),
  profileForm: document.querySelector('#profile-form'),
  profileName: document.querySelector('#profile-name'),
  profileBio: document.querySelector('#profile-bio'),
  profileAvatar: document.querySelector('#profile-avatar'),
  linkForm: document.querySelector('#link-form'),
  linkLabel: document.querySelector('#link-label'),
  linkUrl: document.querySelector('#link-url'),
  adminLinks: document.querySelector('#admin-links'),
};

function isAdminRoute() {
  return window.location.pathname === '/admin';
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
    credentials: 'include',
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function renderPublic() {
  const profile = state.profile || {};
  els.displayName.textContent = profile.display_name || 'Signup Links';
  els.bio.textContent = profile.bio || 'Add your first links from the admin dashboard.';

  if (profile.avatar_url) {
    els.avatar.src = profile.avatar_url;
    els.avatar.hidden = false;
  } else {
    els.avatar.hidden = true;
  }

  els.links.innerHTML = '';
  for (const link of state.links.filter((item) => item.active !== false)) {
    const anchor = document.createElement('a');
    anchor.className = 'link-button';
    anchor.href = link.url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.textContent = link.label;
    els.links.appendChild(anchor);
  }
}

function renderDashboard() {
  const profile = state.profile || {};
  els.profileName.value = profile.display_name || '';
  els.profileBio.value = profile.bio || '';
  els.profileAvatar.value = profile.avatar_url || '';

  els.adminLinks.innerHTML = '';
  if (!state.links.length) {
    els.adminLinks.textContent = 'No links yet.';
    return;
  }

  for (const link of state.links) {
    const row = document.createElement('div');
    row.className = 'admin-link';
    row.innerHTML = `
      <div>
        <strong></strong>
        <span></span>
      </div>
      <button class="danger" type="button">Delete</button>
    `;
    row.querySelector('strong').textContent = link.label;
    row.querySelector('span').textContent = link.url;
    row.querySelector('button').addEventListener('click', async () => {
      await request(`/api/links/${link.id}`, { method: 'DELETE' });
      await loadAdmin();
    });
    els.adminLinks.appendChild(row);
  }
}

async function loadPublic() {
  const data = await request('/api/public');
  state.profile = data.profile;
  state.links = data.links;
  renderPublic();
}

async function loadAdmin() {
  const data = await request('/api/admin');
  state.profile = data.profile;
  state.links = data.links;
  els.loginPanel.hidden = true;
  els.dashboardPanel.hidden = false;
  renderDashboard();
}

async function initAdmin() {
  els.publicView.hidden = true;
  els.adminView.hidden = false;
  try {
    await loadAdmin();
  } catch {
    els.loginPanel.hidden = false;
    els.dashboardPanel.hidden = true;
  }
}

els.loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  els.loginMessage.textContent = '';
  try {
    await request('/api/login', {
      method: 'POST',
      body: JSON.stringify({
        email: els.loginEmail.value,
        password: els.loginPassword.value,
      }),
    });
    els.loginEmail.value = '';
    els.loginPassword.value = '';
    await loadAdmin();
  } catch (error) {
    els.loginMessage.textContent = error.message;
  }
});

els.logoutButton?.addEventListener('click', async () => {
  await request('/api/logout', { method: 'POST' });
  els.loginPanel.hidden = false;
  els.dashboardPanel.hidden = true;
});

els.profileForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  await request('/api/profile', {
    method: 'PUT',
    body: JSON.stringify({
      display_name: els.profileName.value,
      bio: els.profileBio.value,
      avatar_url: els.profileAvatar.value,
    }),
  });
  await loadAdmin();
});

els.linkForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  await request('/api/links', {
    method: 'POST',
    body: JSON.stringify({
      label: els.linkLabel.value,
      url: els.linkUrl.value,
    }),
  });
  els.linkLabel.value = '';
  els.linkUrl.value = '';
  await loadAdmin();
});

if (isAdminRoute()) {
  initAdmin();
} else {
  loadPublic().catch(() => {
    els.bio.textContent = 'The site is deployed. Add Supabase environment variables to load live links.';
  });
}
