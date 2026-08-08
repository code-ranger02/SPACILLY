/** Default desktop hero — Crimson Editorial fashion slides. */
export const EDITORIAL_HERO_SLIDES = [
  {
    id: 'elevated-style',
    eyebrow: 'New season',
    line1: 'Elevated style.',
    line2: 'Effortless shopping.',
    detail: 'Discover premium fashion from verified sellers worldwide.',
    cta: 'Shop fashion',
    href: '/category/clothing',
    image: '/images/hero/editorial-1.png',
    imageFallback:
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=90',
    imgPosition: '72% center',
  },
  {
    id: 'curated-edit',
    eyebrow: 'Editorial picks',
    line1: 'Curated for you.',
    line2: 'Modern wardrobe.',
    detail: 'Statement pieces and everyday essentials in one place.',
    cta: 'Explore now',
    href: '/explore',
    image: '/images/hero/editorial-2.png',
    imageFallback:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1920&q=90',
    imgPosition: '68% center',
  },
  {
    id: 'shop-confidence',
    eyebrow: 'Spacilly marketplace',
    line1: 'Shop with confidence.',
    line2: 'Escrow protected.',
    detail: 'Secure checkout, verified sellers, and buyer protection built in.',
    cta: 'Start shopping',
    href: '/category/all',
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1920&q=90',
    imageFallback:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1920&q=90',
    imgPosition: 'center center',
  },
];

export function mapApiHeroSlides(slides) {
  if (!Array.isArray(slides) || slides.length === 0) return null;

  return slides
    .filter((s) => s && s.enabled !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((s, i) => ({
      id: `hero-api-${i}-${s.line1}`,
      eyebrow: s.eyebrow || 'Featured',
      line1: s.line1,
      line2: s.line2 || '',
      detail: s.detail || '',
      cta: s.cta || 'Shop now',
      href: s.href || '/category/all',
      image: s.imageUrl || s.image,
      imageFallback: s.imageUrl || s.image,
      imgPosition: s.imgPosition || 'center center',
    }));
}
