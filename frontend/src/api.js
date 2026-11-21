import axios from 'axios';

const configuredUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '');
const BASE = configuredUrl ? `${configuredUrl.replace(/\/api$/i, '')}/api` : '/api';

const client = axios.create({ baseURL: BASE, headers: { 'Content-Type': 'application/json' } });
let accessToken = sessionStorage.getItem('access_token');
let refreshToken = sessionStorage.getItem('refresh_token');

export function setSession(session) {
  accessToken = session?.access_token || null;
  refreshToken = session?.refresh_token || null;
  if (accessToken && refreshToken) {
    sessionStorage.setItem('access_token', accessToken);
    sessionStorage.setItem('refresh_token', refreshToken);
    sessionStorage.setItem('user', JSON.stringify(session.user));
  } else {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
  }
  localStorage.removeItem('uid'); // discard untrusted legacy identity
  localStorage.removeItem('user');
}

let refreshing;
async function renewSession() {
  if (!refreshToken) throw new Error('Please sign in again.');
  if (!refreshing) {
    refreshing = client.post('/auth/refresh', { refresh_token: refreshToken })
      .then(({ data }) => { setSession(data); return data.access_token; })
      .catch((e) => { setSession(null); throw e; })
      .finally(() => { refreshing = null; });
  }
  return refreshing;
}

async function request(method, path, body, allowRetry = true) {
  try {
    const response = await client.request({
      method, url: path, data: body,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
    return response.data;
  } catch (error) {
    if (!axios.isAxiosError(error)) throw error;
    if (error.response?.status === 401 && allowRetry && path !== '/auth/login' && path !== '/auth/refresh' && refreshToken) {
      try { await renewSession(); return request(method, path, body, false); }
      catch { throw new Error('Session expired. Please sign in again.'); }
    }
    if (error.response) {
      const data = error.response.data;
      throw new Error((data && typeof data === 'object' && data.error) || `Request failed (${error.response.status})`);
    }
    throw new Error("Can't reach the server. Check that the API is running.");
  }
}

export const api = {
  get: (p) => request('GET', p),
  post: (p, b = {}) => request('POST', p, b),
  put: (p, b) => request('PUT', p, b),
  patch: (p, b) => request('PATCH', p, b),
  del: (p) => request('DELETE', p),
};
