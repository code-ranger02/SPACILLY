import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCreative, Pagination } from 'swiper/modules';
import { useReducedMotion } from 'framer-motion';
import { EDITORIAL_HERO_SLIDES } from '../home/heroEditorialSlides';

import 'swiper/css';
import 'swiper/css/effect-creative';
import 'swiper/css/pagination';

function AuthSlideBackground({ slide }: { slide: (typeof EDITORIAL_HERO_SLIDES)[number] }) {
  const [src, setSrc] = useState(slide.image || slide.imageFallback);

  return (
    <img
      className="auth-fusion__visual-slide-bg"
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

/** Editorial auto-slide hero for auth visual panel (same slides as home). */
export default function AuthVisualHero() {
  const reduceMotion = useReducedMotion();
  const slides = EDITORIAL_HERO_SLIDES;

  if (slides.length === 0) return null;

  return (
    <div className="auth-fusion__visual-hero" aria-hidden>
      <Swiper
        className="auth-fusion__visual-swiper"
        modules={[Autoplay, EffectCreative, Pagination]}
        effect="creative"
        grabCursor={!reduceMotion}
        loop={slides.length > 1}
        speed={reduceMotion ? 0 : 950}
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
            translate: ['-12%', 0, -320],
            rotate: [0, 8, 0],
            opacity: 0.5,
          },
          next: {
            translate: ['12%', 0, -320],
            rotate: [0, -8, 0],
            opacity: 0.5,
          },
        }}
        pagination={{
          clickable: true,
          bulletClass: 'auth-fusion__visual-dot',
          bulletActiveClass: 'auth-fusion__visual-dot--active',
        }}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="auth-fusion__visual-slide">
            <AuthSlideBackground slide={slide} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
