import type { ModelTier } from "../types.js";
import { ModelBlacklist } from "./blacklist.js";
import { ModelScorer } from "./scorer.js";
import type { MetricsRegistry } from "../observability/metrics.js";
import { getModelsForTier } from "../config/models.js";
import { logger } from "../observability/logger.js";
import { GeminiClientError } from "../services/geminiClient.js";

function classifyError(err: unknown): {
  is429: boolean;
  is5xx: boolean;
  isTimeout: boolean;
  isAuth: boolean;
  isNotFound: boolean;
} {
  const status = err instanceof GeminiClientError ? err.status : undefined;
  const code = err instanceof GeminiClientError ? err.code : undefined;
  const msg = err instanceof Error ? err.message : String(err);
  const s = msg.toLowerCase();
  const isTimeout =
    code === 'TIMEOUT' || s.includes('timeout') || (err instanceof Error && err.message.includes('TIMEOUT'));
  const is429 =
    code === 'RATE_LIMIT' ||
    status === 429 ||
    s.includes('429') ||
    s.includes('resource exhausted') ||
    s.includes('quota');
  const isAuth =
    code === 'AUTH' ||
    status === 401 ||
    status === 403 ||
    s.includes('api key not valid') ||
    s.includes('api_key_invalid') ||
    s.includes('invalid api key') ||
    s.includes('permission_denied');
  const isNotFound =
    code === 'NOT_FOUND' || status === 404 || s.includes('not found') || s.includes('is not found');
  const is5xx =
    code === 'SERVER' ||
    (status != null && status >= 500) ||
    s.includes('500') ||
    s.includes('502') ||
    s.includes('503') ||
    s.includes('504');
  return { is429, is5xx, isTimeout, isAuth, isNotFound };
}

function tierTryOrder(assigned: ModelTier): ModelTier[] {
  if (assigned === 1) return [1, 2, 3];
  if (assigned === 2) return [2, 3, 1];
  return [3, 1, 2];
}

export interface NeverStopSuccess<T> {
  ok: true;
  value: T;
  model: string;
  tier: ModelTier;
  fallbackOccurred: boolean;
}

export interface NeverStopFailure {
  ok: false;
  error: unknown;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Try models across tiers with 429 blacklist, 5xx retries (up to 2), timeout retry (once).
 */
export async function neverStopExecute<T>(params: {
  assignedTier: ModelTier;
  blacklist: ModelBlacklist;
  scorer: ModelScorer;
  metrics: MetricsRegistry;
  run: (modelId: string) => Promise<T>;
}): Promise<NeverStopSuccess<T> | NeverStopFailure> {
  const { assignedTier, blacklist, scorer, metrics, run } = params;

  const tiersToTry = tierTryOrder(assignedTier);
  let fallbackOccurred = false;
  let lastError: unknown = new Error('all_models_failed');

  for (const tier of tiersToTry) {
    if (tier !== assignedTier) {
      fallbackOccurred = true;
      await metrics.recordFallback();
      logger.warn({ fromTier: assignedTier, toTier: tier }, 'ai_router_tier_fallback');
    }

    const models = getModelsForTier(tier);
    const ranked = [...models].sort((a, b) => {
      const sa = scorer.score(a, assignedTier, tier);
      const sb = scorer.score(b, assignedTier, tier);
      return sb - sa;
    });

    for (const modelId of ranked) {
      if (await blacklist.isBlocked(modelId)) continue;

      let fivexxRetries = 0;
      let timeoutRetries = 0;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const start = Date.now();
        try {
          const value = await run(modelId);
          const latency = Date.now() - start;
          scorer.recordLatency(modelId, latency);
          await metrics.recordRequest(modelId, true, latency);
          logger.info(
            { model: modelId, tier, latencyMs: latency, fallbackOccurred },
            'ai_router_success',
          );
          return {
            ok: true,
            value,
            model: modelId,
            tier,
            fallbackOccurred,
          };
        } catch (err) {
          lastError = err;
          const latency = Date.now() - start;
          await metrics.recordRequest(modelId, false, latency);
          scorer.recordFailure(modelId);

          const c = classifyError(err);

          logger.warn(
            {
              model: modelId,
              tier,
              err: err instanceof Error ? err.message : String(err),
              ...c,
            },
            'ai_router_model_error',
          );

          if (c.isAuth) {
            return { ok: false, error: err };
          }

          if (c.is429) {
            await blacklist.blockForRateLimit(modelId);
            break;
          }

          if (c.is5xx && fivexxRetries < 2) {
            fivexxRetries += 1;
            await sleep(350 * fivexxRetries);
            continue;
          }

          if (c.isTimeout && timeoutRetries < 1) {
            timeoutRetries += 1;
            continue;
          }

          if (err instanceof GeminiClientError && err.code === 'EMPTY' && timeoutRetries < 1) {
            timeoutRetries += 1;
            continue;
          }

          break;
        }
      }
    }
  }

  return { ok: false, error: lastError };
}
