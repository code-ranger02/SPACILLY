/** True when the product itself is tagged as trending (not merely placed in a trending rail). */
export function productIsTrending(product) {
  if (!product || typeof product !== 'object') return false;
  return Boolean(
    product.aiMeta?.badges?.trendingBadge ||
      product.is_trending ||
      product.isTrending,
  );
}

/** Canonical home-section copy when the feed API does not send titles. */
export const HOME_SECTION_COPY = {
  foryou: {
    title: 'Recommended for you',
    subtitle: 'Personalized picks from across the marketplace',
    hrefTab: 'ai',
  },
  trending: {
    title: 'Trending now',
    subtitle: 'What shoppers are viewing and buying',
    hrefTab: 'trending',
  },
  bestsellers: {
    title: 'Best sellers',
    subtitle: 'Top-selling products on Spacilly',
    hrefTab: 'bestseller',
  },
  fresh: {
    title: 'New arrivals',
    subtitle: 'Just listed by verified sellers',
    hrefTab: 'new',
  },
};
