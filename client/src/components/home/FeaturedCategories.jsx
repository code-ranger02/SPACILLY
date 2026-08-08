import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useStorefrontCategories } from '../../hooks/useBuyerSiteContent';
import '../../styles/spacilly-commerce.css';

const CATEGORY_IMAGES = {
  electronics:
    'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=240&q=80&auto=format&fit=crop',
  clothing:
    'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=240&q=80&auto=format&fit=crop',
  accessories:
    'https://images.unsplash.com/photo-1611591437281-460bf4d0a6a2?w=240&q=80&auto=format&fit=crop',
  'home-garden':
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=240&q=80&auto=format&fit=crop',
  sports:
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=240&q=80&auto=format&fit=crop',
  beauty:
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=240&q=80&auto=format&fit=crop',
  books:
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=240&q=80&auto=format&fit=crop',
  toys:
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=240&q=80&auto=format&fit=crop',
  automotive:
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=240&q=80&auto=format&fit=crop',
  'food-grocery':
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=240&q=80&auto=format&fit=crop',
};

const FALLBACK = [
  { id: 'electronics', label: 'Electronics', href: '/category/electronics' },
  { id: 'clothing', label: 'Fashion', href: '/category/clothing' },
  { id: 'home-garden', label: 'Home', href: '/category/home-garden' },
  { id: 'sports', label: 'Sports', href: '/category/sports' },
  { id: 'beauty', label: 'Beauty', href: '/category/beauty' },
  { id: 'toys', label: 'Gaming', href: '/category/toys' },
  { id: 'books', label: 'Books', href: '/category/books' },
  { id: 'automotive', label: 'Auto', href: '/category/automotive' },
].map((item) => ({
  ...item,
  img: CATEGORY_IMAGES[item.id] || CATEGORY_IMAGES.clothing,
}));

function resolveImage(slug, apiImage) {
  if (apiImage) return apiImage;
  return CATEGORY_IMAGES[slug] || CATEGORY_IMAGES.clothing;
}

export default function FeaturedCategories() {
  const headerRef = useRef(null);
  const inView = useInView(headerRef, { once: true, margin: '-80px' });
  const { data: categories = [] } = useStorefrontCategories();

  const items =
    categories.length > 0
      ? categories.map((c) => ({
          id: c.slug,
          label: c.name,
          href: `/category/${encodeURIComponent(c.slug)}`,
          img: resolveImage(c.slug, c.image),
        }))
      : FALLBACK;

  return (
    <section className="sp-shop-categories" aria-labelledby="sp-shop-categories-title">
      <div ref={headerRef} className="sp-shop-categories__head">
        <div>
          <motion.p
            className="sp-shop-categories__eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45 }}
          >
            Browse by category
          </motion.p>
          <motion.h2
            id="sp-shop-categories-title"
            className="sp-shop-categories__title"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.06 }}
          >
            Shop by category
          </motion.h2>
        </div>
        <Link to="/category/all" className="sp-shop-categories__link">
          View all
        </Link>
      </div>

      <div className="sp-shop-categories__track">
        {items.map((cat, index) => (
          <motion.div
            key={cat.id}
            className="sp-shop-categories__item"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: index * 0.04 }}
          >
            <Link to={cat.href} className="sp-shop-cat-circle">
              <span className="sp-shop-cat-circle__img-wrap">
                <img src={cat.img} alt="" className="sp-shop-cat-circle__img" loading="lazy" decoding="async" />
              </span>
              <span className="sp-shop-cat-circle__label">{cat.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
