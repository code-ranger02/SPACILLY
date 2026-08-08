import { Link } from 'react-router-dom';
import { useHomePromoBanners } from '../../../hooks/useBuyerSiteContent';

const HERO_MODEL_IMG =
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=640&q=85&auto=format&fit=crop';

const FALLBACK = {
  title: 'Student Budget',
  cta: 'Find products',
  href: '/explore',
};

export default function SpacillyMobilePromoHero() {
  const { data } = useHomePromoBanners();
  const promo = data?.banners?.[0];

  const banner = promo
    ? {
        title: promo.title,
        cta: promo.cta || FALLBACK.cta,
        href: promo.href || FALLBACK.href,
      }
    : FALLBACK;

  return (
    <Link to={banner.href} className="sp-mob-promo sp-mob-promo--editorial">
      <div className="sp-mob-promo__copy">
        <h2 className="sp-mob-promo__title">{banner.title}</h2>
        <span className="sp-mob-promo__cta">{banner.cta}</span>
      </div>
      <div className="sp-mob-promo__visual" aria-hidden>
        <img
          className="sp-mob-promo__model"
          src={HERO_MODEL_IMG}
          alt=""
          loading="eager"
          decoding="async"
        />
      </div>
    </Link>
  );
}
