(() => {
  let csrfToken = '';
  async function token(force = false) {
    if (csrfToken && !force) return csrfToken;
    const res = await fetch('/api/auth/csrf', { credentials: 'same-origin' });
    const data = await res.json(); csrfToken = data.csrfToken || ''; return csrfToken;
  }
  async function request(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const headers = { Accept: 'application/json', ...(options.headers || {}) };
    if (options.body && !(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) headers['X-CSRF-Token'] = await token();
    const res = await fetch(url, { ...options, method, headers, credentials: 'same-origin' });
    const data = res.status === 204 ? {} : await res.json().catch(() => ({}));
    if (!res.ok) { const err = new Error(data.error || 'Please try again.'); err.status = res.status; err.fields = data.fields || []; throw err; }
    if (data.csrfToken) csrfToken = data.csrfToken;
    return data;
  }
  window.EverAPI = {
    request,
    async get(url) { return request(url); },
    async post(url, body) { return request(url, { method: 'POST', body: JSON.stringify(body) }); },
    async put(url, body) { return request(url, { method: 'PUT', body: JSON.stringify(body) }); },
    async patch(url, body) { return request(url, { method: 'PATCH', body: JSON.stringify(body) }); },
    async delete(url) { return request(url, { method: 'DELETE' }); },
    async whoami() { return (await request('/api/auth/me')).user; },
    async login(body) { return request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }); },
    async logout() { const data = await request('/api/auth/logout', { method: 'POST' }); csrfToken = ''; return data; }
  };
  token().catch(() => {});
})();
