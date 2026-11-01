import axios from 'axios';

const configuredUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '');
const BASE = configuredUrl
  ? `${configuredUrl.replace(/\/api$/i, '')}/api`
  : '/api';

let userId = localStorage.getItem('uid');

const client = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

export function setUserId(id) {
  userId = id;
  if (id) localStorage.setItem('uid', id);
  else localStorage.removeItem('uid');
}

async function request(method, path, body) {
  try {
    const response = await client.request({
      method,
      url: path,
      data: body,
      headers: userId ? { 'X-User-Id': userId } : undefined,
    });
    return response.data;
  } catch (error) {
    if (!axios.isAxiosError(error)) throw error;

    if (error.response) {
      const data = error.response.data;
      const message = data && typeof data === 'object' ? data.error : null;
      throw new Error(message || `Request failed (${error.response.status})`);
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
