import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCreative, Pagination, Parallax } from 'swiper/modules';
import { useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { usePlatformFeature } from '../../hooks/useSystemFeatures';
import { EDITORIAL_HERO_SLIDES } from './heroEditorialSlides';
import '../../styles/futuristic-hero.css';

import 'swiper/css';
import 'swiper/css/effect-creative';
import 'swiper/css/pagination';

function HeroSlideBackground({ slide }) {
  const [src, setSrc] = useState(slide.image || slide.imageFallback);

  return (
    <img
      className="fx-hero-slide__bg"
      src={src}
      alt=""
      loading={slide.id === EDITORIAL_HERO_SLIDES[0]?.id ? 'eager' : 'lazy'}
      decoding="async"
      style={{ objectPosition: slide.imgPosition || 'center center' }}
      onError={() => {
        if (slide.imageFallback && src !== slide.imageFallback) {
          setSrc(slide.imageFallback);
        }
      }}
    />
  );
}

export default function FuturisticHero({ className = '', compact = false }) {
  const reduceMotion = useReducedMotion();
  const { enabled: heroOn } = usePlatformFeature('hero_carousel');
  const slides = EDITORIAL_HERO_SLIDES;

  if (!heroOn) return null;

  const sectionClass = `fx-hero${compact ? ' fx-hero--compact' : ''} ${className}`.trim();

  return (
    <section className={sectionClass} aria-label="Featured highlights">
      <Swiper
        className="fx-hero__swiper"
        modules={[Autoplay, EffectCreative, Pagination, Parallax]}
        effect="creative"
        grabCursor={!reduceMotion}
        loop={slides.length > 1}
        speed={reduceMotion ? 0 : 1050}
        parallax
        autoplay={
          reduceMotion || slides.length < 2
            ? false
            : {
                delay: 5800,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
        }
        creativeEffect={{
          prev: {
            shadow: false,
            translate: ['-14%', 0, -360],
            rotate: [0, 10, 0],
            opacity: 0.55,
          },
          next: {
            translate: ['14%', 0, -360],
            rotate: [0, -10, 0],
            opacity: 0.55,
          },
        }}
        pagination={{
          clickable: true,
          bulletClass: 'fx-hero__dot',
          bulletActiveClass: 'fx-hero__dot--active',
        }}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="fx-hero-slide">
            <div className="fx-hero-slide__stage">
              <HeroSlideBackground slide={slide} />
              <div className="fx-hero-slide__scrim" aria-hidden />
              <div
                className="fx-hero-slide__content"
                data-swiper-parallax="-120"
                data-swiper-parallax-opacity="0.35"
              >
                <p className="fx-hero-slide__eyebrow" data-swiper-parallax="-60">
                  {slide.eyebrow}
                </p>
                <h1 className="fx-hero-slide__title" id={slide.id === slides[0]?.id ? 'fx-hero-heading' : undefined}>
                  <span className="fx-hero-slide__title-line">{slide.line1}</span>
                  {slide.line2 ? (
                    <span className="fx-hero-slide__title-line">{slide.line2}</span>
                  ) : null}
                </h1>
                {slide.detail ? (
                  <p className="fx-hero-slide__detail" data-swiper-parallax="-40">
                    {slide.detail}
                  </p>
                ) : null}
                <Link to={slide.href} className="fx-hero-slide__cta" data-swiper-parallax="-20">
                  {slide.cta}
                  <ArrowRight size={16} strokeWidth={2.25} aria-hidden />
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
