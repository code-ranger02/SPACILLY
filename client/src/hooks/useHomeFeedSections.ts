import { useQuery } from '@tanstack/react-query';
import { homeFeedApi, type FeedSectionId } from '../services/homeFeedApi';
import { productAPI } from '../services/api';

/** Target product count per home section (8–10). */
export const HOME_PRODUCT_LIMIT = 10;

export type HomeFeedBundle = {
  trending: unknown[];
  bestsellers: unknown[];
  fresh: unknown[];
  foryou: unknown[];
  meta: Partial<Record<FeedSectionId, { title?: string; subtitle?: string }>>;
};

function sectionList(section: { products?: unknown[] } | null | undefined, limit: number) {
  const list = Array.isArray(section?.products) ? section.products : [];
  return list.slice(0, limit);
}

async function loadSectionProducts(id: FeedSectionId, limit: number) {
  try {
    const section = await homeFeedApi.getSection(id, { limit });
    const list = sectionList(section, limit);
    if (list.length) return { list, title: section?.title, subtitle: section?.subtitle };
  } catch {
    /* product API fallback — real catalog only, never demo fixtures */
  }
  try {
    const res = await productAPI.getProducts({ limit, sort: '-rating' });
    const list = Array.isArray(res) ? res : res?.products || res?.data || [];
    return { list, title: undefined, subtitle: undefined };
  } catch {
    return { list: [], title: undefined, subtitle: undefined };
  }
}

export function useHomeFeedSection(id: FeedSectionId, limit: number) {
  return useQuery({
    queryKey: ['home-feed', 'section', id, limit],
    queryFn: async () => (await loadSectionProducts(id, limit)).list,
    staleTime: 5 * 60 * 1000,
  });
}

/** Single request for full mobile home when backend supports it. */
export function useHomeFeedBundle(limitPerSection = HOME_PRODUCT_LIMIT) {
  const limit = Math.min(10, Math.max(8, limitPerSection));
  return useQuery({
    queryKey: ['home-feed', 'bundle', limit],
    queryFn: async () => {
      try {
        const feed = await homeFeedApi.getFeed({ limit });
        const map: Partial<Record<FeedSectionId, unknown[]>> = {};
        for (const section of feed.sections || []) {
          if (section?.id && Array.isArray(section.products)) {
            map[section.id] = section.products.slice(0, limit);
          }
        }
        const meta: HomeFeedBundle['meta'] = {};
        for (const section of feed.sections || []) {
          if (section?.id) {
            meta[section.id] = { title: section.title, subtitle: section.subtitle };
          }
        }
        if (Object.keys(map).length) {
          return {
            trending: (map.trending || []).slice(0, limit),
            bestsellers: (map.bestsellers || []).slice(0, limit),
            fresh: (map.fresh || []).slice(0, limit),
            foryou: (map.foryou || []).slice(0, limit),
            meta,
          } satisfies HomeFeedBundle;
        }
      } catch {
        /* per-section fallback below */
      }
      const [trending, bestsellers, fresh, foryou] = await Promise.all([
        loadSectionProducts('trending', limit),
        loadSectionProducts('bestsellers', limit),
        loadSectionProducts('fresh', limit),
        loadSectionProducts('foryou', limit),
      ]);
      return {
        trending: trending.list.slice(0, limit),
        bestsellers: bestsellers.list.slice(0, limit),
        fresh: fresh.list.slice(0, limit),
        foryou: foryou.list.slice(0, limit),
        meta: {
          trending: { title: trending.title, subtitle: trending.subtitle },
          bestsellers: { title: bestsellers.title, subtitle: bestsellers.subtitle },
          fresh: { title: fresh.title, subtitle: fresh.subtitle },
          foryou: { title: foryou.title, subtitle: foryou.subtitle },
        },
      } satisfies HomeFeedBundle;
    },
    staleTime: 5 * 60 * 1000,
  });
}
