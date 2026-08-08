import { Link } from 'react-router-dom';
import { useStorefrontCategories } from '../../../hooks/useBuyerSiteContent';

const FALLBACK = [
  {
    id: 'hoodies',
    label: 'Hoodie',
    href: '/category/clothing',
    img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=240&q=80&auto=format&fit=crop',
  },
  {
    id: 'shirts',
    label: 'Shirts',
    href: '/category/clothing',
    img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b00?w=240&q=80&auto=format&fit=crop',
  },
  {
    id: 'jackets',
    label: 'Jackets',
    href: '/category/clothing',
    img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=240&q=80&auto=format&fit=crop',
  },
  {
    id: 'dresses',
    label: 'Dresses',
    href: '/category/clothing',
    img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=240&q=80&auto=format&fit=crop',
  },
  {
    id: 'pants',
    label: 'Pants',
    href: '/category/clothing',
    img: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=240&q=80&auto=format&fit=crop',
  },
];

export default function SpacillyCategoryCircles() {
  const { data: categories = [] } = useStorefrontCategories();
  const items =
    categories.length > 0
      ? categories.slice(0, 5).map((c) => ({
          id: c.slug,
          label: c.name,
          href: `/category/${encodeURIComponent(c.slug)}`,
          img: c.image || FALLBACK[0].img,
        }))
      : FALLBACK;

  return (
    <section className="sp-mob-categories" aria-labelledby="sp-mob-cat-title">
      <h2 id="sp-mob-cat-title" className="sp-mob-categories__title">
        Fashion categories
      </h2>
      <div className="sp-mob-categories__grid">
        {items.map((cat) => (
          <Link key={cat.id} to={cat.href} className="sp-mob-cat-circle">
            <div className="sp-mob-cat-circle__img-wrap">
              <img src={cat.img} alt="" className="sp-mob-cat-circle__img" loading="lazy" decoding="async" />
            </div>
            <span className="sp-mob-cat-circle__label">{cat.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
