import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Package, Headphones, ChevronRight, ChevronLeft } from 'lucide-react';
import { PageSeo } from '../components/seo/PageSeo';
import { markOnboardingComplete } from '../lib/onboardingStorage';
import '../styles/spacilly-onboarding.css';

/** Time each slide stays visible before auto-advancing (ms) */
const AUTO_ADVANCE_MS = 5500;

type SlideFeature = {
  icon: typeof ShieldCheck;
  title: string;
  detail: string;
};

type Slide = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  features?: SlideFeature[];
};

const SLIDES: Slide[] = [
  {
    id: 'curated',
    eyebrow: 'Step 1 of 3',
    title: 'Curated collections from verified brands',
    body: 'Discover exclusive products from identity-verified sellers — hand-picked for quality, authenticity, and value.',
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=85&auto=format&fit=crop',
    imageAlt: 'Fashion model wearing a structured red blazer in a studio setting',
    features: [
      { icon: ShieldCheck, title: 'Verified sellers', detail: 'Every storefront passes identity checks before listing.' },
    ],
  },
  {
    id: 'escrow',
    eyebrow: 'Step 2 of 3',
    title: 'Escrow-protected checkout',
    body: 'Payments are held securely until you confirm delivery. Shop high-value items with institutional-grade buyer protection.',
    image:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=85&auto=format&fit=crop',
    imageAlt: 'Customer completing a secure contactless payment at checkout',
    features: [
      { icon: Package, title: 'Funds held safely', detail: 'Release only after you approve the order.' },
    ],
  },
  {
    id: 'support',
    eyebrow: 'Step 3 of 3',
    title: 'Real-time tracking and 24/7 support',
    body: 'Follow every shipment from warehouse to doorstep. Our support team is available around the clock when you need help.',
    image:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=85&auto=format&fit=crop',
    imageAlt: 'Logistics worker scanning packages in a fulfillment center',
    features: [
      { icon: Headphones, title: 'Always-on support', detail: 'Chat, email, and order tools in one place.' },
    ],
  },
];

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [autoPaused, setAutoPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pauseTimerRef = useRef<number | null>(null);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  const finish = useCallback(() => {
    markOnboardingComplete();
    navigate('/', { replace: true });
  }, [navigate]);

  const goNext = useCallback(() => {
    setIndex((i) => (i >= SLIDES.length - 1 ? i : i + 1));
  }, []);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const goToSlide = useCallback((i: number) => {
    setIndex(i);
  }, []);

  const pauseAuto = useCallback(() => {
    setAutoPaused(true);
    if (pauseTimerRef.current != null) window.clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = window.setTimeout(() => {
      setAutoPaused(false);
      pauseTimerRef.current = null;
    }, AUTO_ADVANCE_MS * 2);
  }, []);

  useEffect(() => {
    return () => {
      if (pauseTimerRef.current != null) window.clearTimeout(pauseTimerRef.current);
    };
  }, []);

  /* Auto-advance slides (stops on the last slide so users can choose CTA) */
  useEffect(() => {
    if (autoPaused || prefersReducedMotion() || isLast) return;

    const timer = window.setTimeout(() => {
      goNext();
    }, AUTO_ADVANCE_MS);

    return () => window.clearTimeout(timer);
  }, [index, autoPaused, goNext, isLast]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        pauseAuto();
        if (isLast) finish();
        else goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        pauseAuto();
        goPrev();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [finish, goNext, goPrev, isLast, pauseAuto]);

  const onTouchStart = (e: React.TouchEvent) => {
    pauseAuto();
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(delta) > 56) {
      if (delta < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  useEffect(() => {
    panelRef.current?.focus();
  }, [index]);

  const shellStyle = {
    '--sp-onboarding-duration': `${AUTO_ADVANCE_MS}ms`,
  } as React.CSSProperties;

  return (
    <div className="sp-onboarding" style={shellStyle}>
      <PageSeo
        title="Welcome to Spacilly"
        description="Get started with curated collections, escrow-protected checkout, and real-time order support."
        noIndex
      />

      <div
        key={isLast ? 'done' : slide.id}
        className="sp-onboarding__progress"
        role="progressbar"
        aria-valuenow={index + 1}
        aria-valuemin={1}
        aria-valuemax={SLIDES.length}
        aria-label={`Onboarding step ${index + 1} of ${SLIDES.length}`}
      >
        <div
          className={`sp-onboarding__progress-fill${autoPaused || isLast ? ' is-paused' : ''}`}
          style={isLast ? { width: '100%' } : undefined}
        />
      </div>

      <div
        className="sp-onboarding__shell"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => setAutoPaused(true)}
        onMouseLeave={() => setAutoPaused(false)}
      >
        <div className="sp-onboarding__hero">
          <button type="button" className="sp-onboarding__skip" onClick={finish}>
            Skip
          </button>
          <img
            key={slide.id}
            src={slide.image}
            alt={slide.imageAlt}
            className="sp-onboarding__hero-img"
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        </div>

        <div
          ref={panelRef}
          className="sp-onboarding__panel"
          tabIndex={-1}
          aria-labelledby="onboarding-title"
        >
          <p className="sp-onboarding__sr-live" role="status" aria-live="polite">
            {slide.eyebrow}: {slide.title}
          </p>

          <p className="sp-onboarding__eyebrow">{slide.eyebrow}</p>
          <h1 id="onboarding-title" className="sp-onboarding__title">
            {slide.title}
          </h1>
          <p className="sp-onboarding__body">{slide.body}</p>

          {slide.features && slide.features.length > 0 && (
            <ul className="sp-onboarding__features" aria-label="Key capabilities">
              {slide.features.map(({ icon: Icon, title, detail }) => (
                <li key={title} className="sp-onboarding__feature">
                  <Icon size={18} className="sp-onboarding__feature-icon" aria-hidden />
                  <span>
                    <strong>{title}</strong>
                    {detail}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <ol className="sp-onboarding__dots" aria-label="Onboarding steps">
            {SLIDES.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  className="sp-onboarding__dot"
                  aria-label={`Go to step ${i + 1}: ${s.title}`}
                  aria-current={i === index ? 'step' : undefined}
                  onClick={() => {
                    pauseAuto();
                    goToSlide(i);
                  }}
                />
              </li>
            ))}
          </ol>

          <p className="sp-onboarding__step-label">
            Slides advance automatically · swipe or tap dots to navigate
          </p>

          <div className={`sp-onboarding__actions${isLast ? ' sp-onboarding__actions--split' : ''}`}>
            {index > 0 && (
              <button
                type="button"
                className="sp-onboarding__btn sp-onboarding__btn--ghost"
                onClick={() => {
                  pauseAuto();
                  goPrev();
                }}
              >
                <ChevronLeft size={16} aria-hidden />
                Back
              </button>
            )}
            {!isLast ? (
              <button
                type="button"
                className="sp-onboarding__btn sp-onboarding__btn--primary"
                onClick={() => {
                  pauseAuto();
                  goNext();
                }}
              >
                Continue
                <ChevronRight size={16} aria-hidden />
              </button>
            ) : (
              <>
                <button type="button" className="sp-onboarding__btn sp-onboarding__btn--primary" onClick={finish}>
                  Explore marketplace
                </button>
                <Link
                  to="/auth?tab=login"
                  className="sp-onboarding__btn sp-onboarding__btn--secondary"
                  onClick={markOnboardingComplete}
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
