/** Unsplash photo IDs that now 404. Rewrite to a working asset. */
const DEAD_UNSPLASH_IDS = {
  'photo-1596755094514-f87e34085b00':
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=240&q=80&auto=format&fit=crop',
  'photo-1611591437281-460bf4d0a6a2':
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=240&q=80&auto=format&fit=crop',
};

const SHIRT_FALLBACK =
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=240&q=80&auto=format&fit=crop';

export function rewriteBrokenUnsplashUrl(url) {
  if (!url || typeof url !== 'string') return url;
  for (const [id, replacement] of Object.entries(DEAD_UNSPLASH_IDS)) {
    if (url.includes(id)) return replacement;
  }
  return url;
}

export function categoryImageOrFallback(url, fallback = SHIRT_FALLBACK) {
  return rewriteBrokenUnsplashUrl(url) || fallback;
}
