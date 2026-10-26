/**
 * Same contract as client `lib/config.ts` — API on `/api`, media on server origin.
 * Set `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_SERVER_URL` in `.env` or `app` config extra.
 */
import Constants from 'expo-constants';

const trim = (s: string | undefined) => (s || '').trim();

const extra = (Constants.expoConfig?.extra ?? {}) as { apiUrl?: string; serverUrl?: string };
const envApi = trim(process.env.EXPO_PUBLIC_API_URL);
const envServer = trim(process.env.EXPO_PUBLIC_SERVER_URL);
const derivedServerFromApi = trim(envApi.replace(/\/api\/?$/i, ''));

const DEV_FALLBACK_API = 'http://localhost:5000/api';
const DEV_FALLBACK_SERVER = 'http://localhost:5000';

export const API_BASE_URL = envApi || trim(extra.apiUrl) || (__DEV__ ? DEV_FALLBACK_API : '');

export const SERVER_URL =
  envServer || trim(extra.serverUrl) || derivedServerFromApi || (__DEV__ ? DEV_FALLBACK_SERVER : '');

if (!__DEV__ && !API_BASE_URL) {
  console.error(
    '[config] EXPO_PUBLIC_API_URL is missing. Set it to your API base (e.g. https://host.com/api).',
  );
}

export function resolveAssetUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = SERVER_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

/** Socket.IO handshake URL. Must stay http(s) so XHR polling works; do not convert to ws(s). */
export function getSocketUrl(): string {
  const w = trim(process.env.EXPO_PUBLIC_WS_URL);
  const raw = w || SERVER_URL;
  if (!raw) return '';
  return raw
    .replace(/\/$/, '')
    .replace(/^ws:/i, 'http:')
    .replace(/^wss:/i, 'https:');
}
