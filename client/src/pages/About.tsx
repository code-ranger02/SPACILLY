
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Globe2,
  HeartHandshake,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Store,
} from 'lucide-react';

import BuyerLayout from '../components/buyer/BuyerLayout';
import { PageSeo } from '../components/seo/PageSeo';
import { getPreferredSiteOrigin } from '../lib/siteOrigin';
import { buildLocaleAlternates } from '../utils/localeAlternateLinks';

const principles = [
  {
    icon: ShieldCheck,
    title: 'Protection built into checkout',
    description:
      'Escrow-protected checkout is designed to help safeguard transactions and provide a path for resolving eligible disputes.',
  },
  {
    icon: Globe2,
    title: 'Local needs, global reach',
    description:
      'We bring localized shopping experiences together with international commerce and payment standards.',
  },
  {
    icon: HeartHandshake,
    title: 'Trust through transparency',
    description:
      'Clear information, seller trust signals, and order visibility help buyers make more informed decisions.',
  },
];

const steps = [
  {
    number: '01',
    icon: ShoppingBag,
    title: 'Discover',
    description:
      'Explore products, compare your options, and find items that fit your needs.',
  },
  {
    number: '02',
    icon: LockKeyhole,
    title: 'Checkout with confidence',
    description:
      'Use the available secure checkout options and review the terms that apply to your order.',
  },
  {
    number: '03',
    icon: PackageCheck,
    title: 'Follow your order',
    description:
      'Stay informed about fulfilment and use the available support and dispute-resolution process when needed.',
  },
];

function SectionEyebrow({ children }) {
  return (
    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
      {children}
    </p>
  );
}

function About() {
  const origin = getPreferredSiteOrigin();
  const canonical = origin ? `${origin}/about` : '/about';
  const hreflangAlternates = origin
    ? buildLocaleAlternates(origin, '/about')
    : undefined;

  const aboutLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Spacilly',
    url: canonical,
    description:
      'Discover Spacilly, a global marketplace focused on buyer protection, transparent shopping, and connecting buyers with sellers.',
    ...(origin
      ? {
          mainEntity: { '@id': `${origin}/#organization` },
          isPartOf: { '@id': `${origin}/#website` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${origin}/`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'About',
                item: canonical,
              },
            ],
          },
        }
      : {}),
  };

  return (
    <BuyerLayout>
      <PageSeo
        title="About Spacilly | Shop with greater confidence"
        description="Discover Spacilly, a global marketplace built around escrow-protected checkout, seller trust signals, transparent shopping, and buyer support."
        canonicalUrl={canonical}
        ogImage={origin ? `${origin}/logo.jpg` : undefined}
        ogType="website"
        hreflangAlternates={hreflangAlternates}
        jsonLd={aboutLd}
      />

      <main
        className="overflow-hidden"
        style={{
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Hero */}
        <section className="relative isolate">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                'radial-gradient(ellipse at 85% 15%, rgba(190, 24, 93, 0.10), transparent 38%)',
            }}
          />

          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              <div
                className="mb-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold"
                style={{
                  borderColor: 'rgba(190, 24, 93, 0.20)',
                  background: 'rgba(190, 24, 93, 0.06)',
                  color: 'var(--text-primary)',
                }}
              >
                <ShieldCheck size={15} className="text-rose-700" />
                Shopping built around trust
              </div>

              <h1 className="max-w-xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                A better way to shop.{' '}
                <span className="text-rose-700">
                  A stronger foundation for trust.
                </span>
              </h1>

              <p
                className="mt-6 max-w-xl text-base leading-8 sm:text-lg"
                style={{ color: 'var(--text-muted)' }}
              >
                Spacilly connects buyers and sellers through a marketplace
                designed to make online shopping more transparent, more
                accessible, and more reassuring from checkout to fulfilment.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-rose-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-900/10 transition hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
                >
                  Explore Spacilly
                  <ArrowRight size={17} />
                </a>

                <a
                  href="/"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
                  style={{ borderColor: 'var(--border-color, #e5e7eb)' }}
                >
                  Discover the marketplace
                  <ArrowUpRight size={16} />
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3">
                {[
                  'Buyer-focused experience',
                  'Transparent trust signals',
                  'Order support',
                ].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <CheckCircle2
                      size={16}
                      className="shrink-0 text-rose-700"
                    />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Brand illustration */}
            <div className="relative mx-auto w-full max-w-xl">
              <div
                className="absolute -inset-4 -z-10 rounded-[2rem] blur-2xl"
                style={{ background: 'rgba(190, 24, 93, 0.08)' }}
              />

              <div
                className="relative overflow-hidden rounded-[2rem] border p-6 sm:p-8"
                style={{
                  borderColor: 'var(--border-color, #e5e7eb)',
                  background:
                    'linear-gradient(145deg, #fff7f8 0%, #ffffff 52%, #f8fafc 100%)',
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-rose-800">
                      The Spacilly experience
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Discover. Shop. Stay informed.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-3 shadow-sm">
                    <ShoppingBag
                      size={24}
                      className="text-rose-700"
                    />
                  </div>
                </div>

                <div className="my-7 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
                    <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-rose-50">
                      <ShieldCheck
                        size={23}
                        className="text-rose-700"
                      />
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      Buyer protection
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Protection-oriented checkout and dispute resolution.
                    </p>
                  </div>

                  <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-slate-50">
                      <Store size={23} className="text-slate-700" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      Connected marketplace
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      A place for buyers and sellers to connect.
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-3 rounded-2xl border p-4"
                  style={{
                    borderColor: 'rgba(190, 24, 93, 0.15)',
                    background: 'rgba(255,255,255,0.85)',
                  }}
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-100">
                    <HeartHandshake
                      size={21}
                      className="text-rose-700"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      Confidence at every step
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Clear information helps you make informed decisions.
                    </p>
                  </div>
                </div>

                <div
                  aria-hidden="true"
                  className="absolute -right-8 -top-8 size-28 rounded-full border-[18px] border-rose-100/60"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Trust principles */}
        <section
          className="border-y"
          style={{
            borderColor: 'var(--border-color, #e5e7eb)',
            background: 'var(--bg-secondary, #fafafa)',
          }}
        >
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <SectionEyebrow>What guides us</SectionEyebrow>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Trust should be part of the experience.
              </h2>
              <p
                className="mx-auto mt-4 max-w-xl text-sm leading-7 sm:text-base"
                style={{ color: 'var(--text-muted)' }}
              >
                Good commerce is about more than finding a product. It is
                about understanding your choices and knowing where to turn
                when you need help.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {principles.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="rounded-2xl border p-6 transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                    style={{
                      borderColor: 'var(--border-color, #e5e7eb)',
                      background: 'var(--bg-primary, #ffffff)',
                    }}
                  >
                    <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
                      <Icon size={24} />
                    </div>

                    <h3 className="text-lg font-bold">{item.title}</h3>
                    <p
                      className="mt-3 text-sm leading-7"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section>
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
              <div className="max-w-lg">
                <SectionEyebrow>How it works</SectionEyebrow>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  From discovery to delivery, with more clarity.
                </h2>
                <p
                  className="mt-5 text-base leading-8"
                  style={{ color: 'var(--text-muted)' }}
                >
                  We want the important parts of online shopping to feel
                  straightforward. Here is the journey Spacilly is designed
                  to support.
                </p>
              </div>

              <div className="space-y-3">
                {steps.map((step) => {
                  const Icon = step.icon;

                  return (
                    <article
                      key={step.number}
                      className="flex gap-4 rounded-2xl border p-5 sm:gap-5 sm:p-6"
                      style={{
                        borderColor: 'var(--border-color, #e5e7eb)',
                        background: 'var(--bg-primary, #ffffff)',
                      }}
                    >
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
                        <Icon size={23} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold tracking-widest text-rose-700">
                            {step.number}
                          </span>
                          <h3 className="font-bold">{step.title}</h3>
                        </div>

                        <p
                          className="mt-2 text-sm leading-7"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {step.description}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Our approach */}
        <section>
          <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
            <div
              className="grid overflow-hidden rounded-3xl border md:grid-cols-2"
              style={{
                borderColor: 'var(--border-color, #e5e7eb)',
                background: 'var(--bg-secondary, #fafafa)',
              }}
            >
              <div className="p-7 sm:p-10 lg:p-12">
                <SectionEyebrow>Our approach</SectionEyebrow>
                <h2 className="text-3xl font-bold tracking-tight">
                  Built for real-world commerce.
                </h2>
                <p
                  className="mt-5 text-sm leading-7 sm:text-base"
                  style={{ color: 'var(--text-muted)' }}
                >
                  With roots in East Africa and connections to global payment
                  partners, Spacilly aims to bring together locally relevant
                  shopping experiences and dependable commerce practices.
                </p>
                <p
                  className="mt-4 text-sm leading-7 sm:text-base"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Our focus is on transparency, privacy, secure transactions,
                  and useful support, so buyers and sellers can navigate
                  online commerce with greater confidence.
                </p>
              </div>

              <div
                className="flex min-h-64 flex-col justify-between p-7 sm:p-10 lg:p-12"
                style={{
                  background:
                    'linear-gradient(145deg, #881337 0%, #be123c 55%, #e11d48 100%)',
                  color: '#ffffff',
                }}
              >
                <div className="flex size-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                  <Globe2 size={25} />
                </div>

                <div className="mt-10">
                  <p className="text-sm font-medium text-white/75">
                    Our commitment
                  </p>
                  <h3 className="mt-3 max-w-md text-2xl font-bold leading-snug sm:text-3xl">
                    Make the online shopping experience easier to understand
                    and easier to trust.
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div
              className="rounded-3xl px-6 py-10 text-center sm:px-12 sm:py-14"
              style={{
                background:
                  'linear-gradient(135deg, #fff1f2 0%, #fff7f8 50%, #fdf2f8 100%)',
              }}
            >
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-rose-700 shadow-sm">
                <ShoppingBag size={24} />
              </div>

              <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Your next great find starts here.
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                Explore the marketplace, discover new products, and shop
                with a clearer understanding of the protections and support
                available to you.
              </p>

              <a
                href="/"
                className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-rose-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-900/10 transition hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
              >
                Start exploring
                <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </section>
      </main>
    </BuyerLayout>
  );
}

export default About;
