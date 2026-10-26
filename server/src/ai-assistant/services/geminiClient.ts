import { GoogleGenerativeAI } from '@google/generative-ai';
import { resolveGeminiModelId } from "../../config/geminiEnv.js";

export class GeminiClientError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'GeminiClientError';
  }
}

export interface TimeoutOptions {
  timeoutMs: number;
}

function wrapGeminiError(err: unknown, modelId: string): GeminiClientError {
  const msg = err instanceof Error ? err.message : String(err);
  const statusMatch = msg.match(/\b(4\d{2}|5\d{2})\b/);
  const status = statusMatch ? Number(statusMatch[1]) : undefined;
  let code = 'GEMINI';
  if (status === 404 || /not found|not supported/i.test(msg)) code = 'NOT_FOUND';
  else if (status === 429 || /resource exhausted|quota/i.test(msg)) code = 'RATE_LIMIT';
  else if (status === 401 || status === 403 || /api key not valid|api_key_invalid/i.test(msg))
    code = 'AUTH';
  else if (status && status >= 500) code = 'SERVER';
  return new GeminiClientError(`${modelId}: ${msg}`, code, status);
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(
      () => reject(new GeminiClientError(`timeout:${label}`, 'TIMEOUT')),
      ms,
    );
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

export async function generateText(
  apiKey: string,
  modelId: string,
  prompt: string,
  options: TimeoutOptions,
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const resolved = resolveGeminiModelId(modelId);
  const model = genAI.getGenerativeModel({ model: resolved });
  try {
    const result = await withTimeout(
      model.generateContent(prompt),
      options.timeoutMs,
      resolved,
    );
    const text = result.response.text();
    if (!text?.trim()) {
      throw new GeminiClientError('empty response', 'EMPTY');
    }
    return text;
  } catch (err) {
    if (err instanceof GeminiClientError) throw err;
    throw wrapGeminiError(err, resolved);
  }
}

export async function generateWithSystemInstruction(
  apiKey: string,
  modelId: string,
  systemInstruction: string,
  userText: string,
  options: TimeoutOptions,
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const resolved = resolveGeminiModelId(modelId);
  const model = genAI.getGenerativeModel({
    model: resolved,
    systemInstruction: {
      role: 'system',
      parts: [{ text: systemInstruction }],
    },
  });
  try {
    const result = await withTimeout(
      model.generateContent(userText),
      options.timeoutMs,
      resolved,
    );
    const text = result.response.text();
    if (!text?.trim()) {
      throw new GeminiClientError('empty response', 'EMPTY');
    }
    return text;
  } catch (err) {
    if (err instanceof GeminiClientError) throw err;
    throw wrapGeminiError(err, resolved);
  }
}

export async function embedText(
  apiKey: string,
  modelId: string,
  text: string,
  timeoutMs: number,
): Promise<number[]> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelId });
  const m = model as unknown as {
    embedContent: (req: unknown) => Promise<{ embedding?: { values?: number[] } }>;
  };
  const result = await withTimeout(
    m.embedContent({ content: { parts: [{ text }] } }),
    timeoutMs,
    `embed:${modelId}`,
  );
  const emb = result.embedding?.values;
  if (!emb?.length) {
    throw new GeminiClientError('no embedding', 'EMBED_EMPTY');
  }
  return emb;
}
