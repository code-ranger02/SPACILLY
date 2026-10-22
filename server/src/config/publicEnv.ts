/**
 * Central place for public-facing URLs. Uses process.env only; dev fallbacks when NODE_ENV !== production.
 * Never import from routes that execute before dotenv loads — safe after server/index.ts runs dotenv.config().
 */

export function isProductionNodeEnv(): boolean {
  return (process.env.NODE_ENV || '').toLowerCase() === 'production';
}

/** Frontend origin (email links, OAuth redirects, payment return, logos). */
export function getClientUrl(): string {
  const v = (process.env.CLIENT_URL || '').trim().replace(/\/$/, '');
  if (v) return v;
  if (!isProductionNodeEnv()) return 'http://localhost:5173';
  return '';
}

/** API / asset server base (uploads, Gemini image URLs, webhooks). */
export function getServerUrl(): string {
  const v =
    (process.env.SERVER_URL || '').trim() ||
    (process.env.APP_URL || '').trim();
  const normalized = v.replace(/\/$/, '');
  if (normalized) return normalized;
  if (!isProductionNodeEnv()) return 'http://localhost:5000';
  return '';
}

export function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/$/, '');
}

function splitOriginList(s: string): string[] {
  return s.split(',').map((x) => normalizeOrigin(x)).filter(Boolean);
}

function expandWww(origin: string): string[] {
  const normalized = normalizeOrigin(origin);
  try {
    const u = new URL(normalized);
    const host = u.hostname;
    if (host.startsWith('www.')) {
      const bare = host.slice(4);
      return [normalized, `${u.protocol}//${bare}`];
    }
    return [normalized, `${u.protocol}//www.${host}`];
  } catch {
    return [normalized];
  }
}

/** Live storefront hosts — always allowed over HTTPS so apex vs www cannot drift from ALLOWED_ORIGINS. */
const CANONICAL_STOREFRONT_ORIGINS = ['https://spacilly.com', 'https://www.spacilly.com'];

/**
 * CORS / Socket.IO allowed browser origins.
 * Production merges CLIENT_URL + ALLOWED_ORIGINS (www and apex of each) plus the canonical storefront.
 */
export function getAllowedCorsOrigins(): string[] {
  const client = getClientUrl();
  const envList = splitOriginList(process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGINS || '');
  const localhostPack = ['http://localhost:5173', 'http://localhost:3000'];

  if (isProductionNodeEnv()) {
    const merged = [
      ...CANONICAL_STOREFRONT_ORIGINS,
      ...(client ? expandWww(client) : []),
      ...envList.flatMap(expandWww),
    ];
    const unique = [...new Set(merged)];
    if (!client && envList.length === 0) {
      console.error('[cors] Set CLIENT_URL and ALLOWED_ORIGINS in production.');
    }
    return unique;
  }

  return [
    ...new Set([
      ...localhostPack,
      ...(client ? expandWww(client) : []),
      ...envList.flatMap(expandWww),
    ]),
  ];
}

export function isAllowedCorsOrigin(
  origin: string | undefined | null,
  allowed: string[] = getAllowedCorsOrigins(),
): boolean {
  if (!origin) return true;
  const normalized = normalizeOrigin(origin);
  if (allowed.some((item) => normalizeOrigin(item) === normalized)) return true;
  try {
    const u = new URL(normalized);
    if (u.protocol !== 'https:') return false;
    const host = u.hostname.toLowerCase();
    return host === 'spacilly.com' || host.endsWith('.spacilly.com');
  } catch {
    return false;
  }
}
