/**
 * Centralized API and server configuration.
 * Production builds must define VITE_API_URL and VITE_SERVER_URL (see .env.production).
 * Development: falls back to localhost when variables are unset.
 */

const trim = (s: string | undefined) => (s || '').trim();

const DEV_FALLBACK_API = 'http://localhost:5000/api';
const DEV_FALLBACK_SERVER = 'http://localhost:5000';

const viteApi = trim(import.meta.env.VITE_API_URL);
const viteServer = trim(import.meta.env.VITE_SERVER_URL);
const derivedServerFromApi = trim(import.meta.env.VITE_API_URL?.replace(/\/api\/?$/i, ''));

/** API base URL — must match the Express app’s /api mount */
export const API_BASE_URL = viteApi || (import.meta.env.DEV ? DEV_FALLBACK_API : '');

/** Origin for uploads, Socket.IO, absolute media (no trailing slash). Always http(s), never ws(s). */
export const SERVER_URL =
  viteServer || derivedServerFromApi || (import.meta.env.DEV ? DEV_FALLBACK_SERVER : '');

/**
 * Socket.IO handshake URL. Engine.IO polling is XHR and must use http(s).
 * `wss://` here is what produces "xhr poll error" in production.
 */
export function getSocketIoUrl(): string {
  const fromWsEnv = trim((import.meta.env as { VITE_WS_URL?: string }).VITE_WS_URL);
  const fromApi = API_BASE_URL.replace(/\/api\/?$/i, '');
  const raw = fromWsEnv || fromApi || SERVER_URL;
  if (!raw) return '';
  return raw
    .replace(/\/$/, '')
    .replace(/^ws:/i, 'http:')
    .replace(/^wss:/i, 'https:');
}

export function socketIoClientOptions(auth?: { token?: string }) {
  return {
    path: '/socket.io',
    transports: ['polling', 'websocket'] as const,
    upgrade: true,
    withCredentials: true,
    timeout: 20000,
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 1500,
    reconnectionDelayMax: 12000,
    ...(auth?.token ? { auth: { token: auth.token } } : {}),
  };
}

if (!import.meta.env.DEV && !viteApi) {
  console.error(
    '[config] VITE_API_URL is missing. Set it in client/.env.production (e.g. https://your-api.example.com/api).',
  );
}

if (!import.meta.env.DEV && !viteServer && !derivedServerFromApi) {
  console.error(
    '[config] VITE_SERVER_URL is missing. Set it in client/.env.production (same host as API, without /api).',
  );
}

/** Resolve a relative path (e.g. /uploads/xxx) to full URL */
export function resolveAssetUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = SERVER_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
