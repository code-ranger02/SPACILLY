/** Retired / alias model ids → current Generative Language API ids. */
const MODEL_ALIASES: Record<string, string> = {
  'gemini-flash-latest': 'gemini-3.6-flash',
  'gemini-2.0-flash-latest': 'gemini-3.6-flash',
  'gemini-2.0-flash': 'gemini-3.6-flash',
  'gemini-2.0-flash-lite': 'gemini-3.5-flash-lite',
  'gemini-2.5-flash-lite': 'gemini-3.5-flash-lite',
  'gemini-1.5-flash': 'gemini-3.6-flash',
  'gemini-1.5-flash-latest': 'gemini-3.6-flash',
  'gemini-1.5-pro': 'gemini-2.5-pro',
  'gemini-1.5-pro-latest': 'gemini-2.5-pro',
  'gemini-pro-latest': 'gemini-2.5-pro',
  'gemini-3-flash': 'gemini-3.6-flash',
  'gemini-2-flash': 'gemini-3.6-flash',
  'gemini-2-flash-lite': 'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite': 'gemini-3.5-flash-lite',
  'gemini-3.1-pro': 'gemini-2.5-pro',
};

export function getGeminiApiKey(): string {
  const raw = (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    ''
  )
    .trim()
    .replace(/^["']|["']$/g, '');
  return raw;
}

export function resolveGeminiModelId(id: string): string {
  const trimmed = String(id || '').trim();
  if (!trimmed) return trimmed;
  return MODEL_ALIASES[trimmed] || MODEL_ALIASES[trimmed.toLowerCase()] || trimmed;
}

function errorCode(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    return String((err as { code?: unknown }).code || '');
  }
  return '';
}

function errorText(err: unknown): string {
  return err instanceof Error ? err.message : String(err || '');
}

export function isGeminiAuthError(err: unknown): boolean {
  const code = errorCode(err);
  const s = errorText(err).toLowerCase();
  return (
    code === 'AUTH' ||
    s.includes('api key not valid') ||
    s.includes('api_key_invalid') ||
    s.includes('invalid api key') ||
    s.includes('permission_denied') ||
    s.includes('permission denied') ||
    /\b401\b/.test(s) ||
    /\b403\b/.test(s)
  );
}

export function isGeminiModelError(err: unknown): boolean {
  const code = errorCode(err);
  const s = errorText(err).toLowerCase();
  return (
    code === 'NOT_FOUND' ||
    s.includes('is not found') ||
    s.includes('not found for api version') ||
    s.includes('no longer available') ||
    /models\/[a-z0-9._-]+ is not found/i.test(s) ||
    (s.includes('not found') && s.includes('model'))
  );
}

export function throwIfGeminiUnusable(err: unknown): void {
  if (isGeminiAuthError(err)) {
    throw new Error('GEMINI_API_KEY is invalid or blocked. Check GEMINI_API_KEY in Elastic Beanstalk.');
  }
  if (isGeminiModelError(err)) {
    const detail = errorText(err).slice(0, 280);
    throw new Error(
      `GEMINI_MODEL is invalid or unavailable (${detail}). Set GEMINI_MODEL=gemini-3.6-flash on the server.`,
    );
  }
}

/** Map Gemini config failures to a client-facing 503 (do not return the busy catch-all). */
export function geminiPublicErrorPayload(err: unknown): { status: 503; message: string } | null {
  const msg = errorText(err);
  if (!msg) return null;
  if (msg.includes('GEMINI_API_KEY is not set')) {
    return {
      status: 503,
      message: 'Assistant is not configured. Set GEMINI_API_KEY on the server.',
    };
  }
  if (msg.includes('GEMINI_API_KEY') || msg.includes('GEMINI_MODEL')) {
    return { status: 503, message: msg };
  }
  return null;
}
