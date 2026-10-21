
import BuyerLayout from '../components/buyer/BuyerLayout';
import { PageSeo } from '../components/seo/PageSeo';
import { getPreferredSiteOrigin } from '../lib/siteOrigin';
import { buildLocaleAlternates } from '../utils/localeAlternateLinks';

const principles = [
  {
    number: '01',
    title: 'Shop with more clarity.',
    description:
      'Product information, seller details, and available order updates help you make informed shopping decisions.',
  },
  {
    number: '02',
    title: 'Understand your protection.',
    description:
      'Learn how checkout protection and the applicable dispute-resolution process work before placing an order.',
  },
  {
    number: '03',
    title: 'Stay connected to your order.',
    description:
      'Use available order information and support channels when you need help with a purchase.',
  },
];

export default function About() {
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
      'Learn about Spacilly, a marketplace connecting buyers and sellers with a focus on transparent shopping and buyer support.',
    ...(origin
      ? {
          mainEntity: { '@id': `${origin}/#organization` },
          isPartOf: { '@id': `${origin}/#website` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
              { '@type': 'ListItem', position: 2, name: 'About', item: canonical },
            ],
          },
        }
      : {}),
  };

  return (
    <BuyerLayout>
      <PageSeo
        title="About Spacilly | A marketplace built around trust"
        description="Discover Spacilly, a marketplace connecting buyers and sellers with transparent shopping, checkout protection, and buyer support."
        canonicalUrl={canonical}
        ogImage={origin ? `${origin}/logo.jpg` : undefined}
        ogType="website"
        hreflangAlternates={hreflangAlternates}
        jsonLd={aboutLd}
      />

      <main
        className="pb-16"
        style={{
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Editorial hero */}
        <section className="mx-auto max-w-[1440px] px-5 pt-10 sm:px-8 sm:pt-16 lg:px-12 lg:pt-20">
          <p
            className="mb-6 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: '#9f234f' }}
          >
            ABOUT SPACILLY
          </p>

          <div className="grid items-end gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <h1 className="max-w-5xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                Making online shopping feel more{' '}
                <span style={{ color: '#9f234f' }}>human.</span>
              </h1>
            </div>

            <div className="max-w-md pb-1 lg:col-span-4">
              <p
                className="text-base leading-7 sm:text-lg"
                style={{ color: 'var(--text-muted)' }}
              >
                Spacilly brings buyers and sellers together in one marketplace,
                with a focus on transparency, checkout protection, and a
                clearer shopping experience.
              </p>

              <a
                href="/"
                className="mt-6 inline-flex min-h-11 items-center gap-3 border-b pb-2 text-sm font-semibold transition-opacity hover:opacity-65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700"
                style={{ borderColor: '#9f234f' }}
              >
                Explore the marketplace
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          {/* Large editorial image */}
          <figure className="mt-10 sm:mt-14 lg:mt-16">
            <div className="relative aspect-[5/3] overflow-hidden bg-stone-100 sm:aspect-[2.15/1]">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2200&q=85"
                alt="A thoughtfully arranged retail space representing the connection between shoppers and sellers"
                className="h-full w-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-black/10" />
              <p className="absolute bottom-5 left-5 max-w-sm text-sm font-medium leading-6 text-white drop-shadow sm:bottom-8 sm:left-8 sm:text-base">
                A marketplace shaped around the people on both sides of every
                purchase.
              </p>
            </div>
          </figure>
        </section>

        {/* Brand story */}
        <section className="mx-auto grid max-w-[1440px] gap-8 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-12 lg:gap-12 lg:px-12">
          <div className="lg:col-span-4">
            <p
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: '#9f234f' }}
            >
              WHY WE EXIST
            </p>
          </div>

          <div className="max-w-3xl lg:col-span-8">
            <h2 className="text-3xl font-medium leading-tight tracking-[-0.035em] sm:text-4xl lg:text-5xl">
              Shopping should be about finding what you need, not wondering
              what happens next.
            </h2>

            <div
              className="mt-6 max-w-2xl space-y-4 text-base leading-8"
              style={{ color: 'var(--text-muted)' }}
            >
              <p>
                We built Spacilly around a simple idea: online commerce works
                better when buyers can understand their choices and sellers
                have a place to reach customers.
              </p>
              <p>
                From product discovery to checkout and order support, we aim
                to make the important details easier to find and the next
                steps easier to understand.
              </p>
            </div>
          </div>
        </section>

        {/* Three principles, editorial rather than card-based */}
        <section
          className="border-y"
          style={{ borderColor: 'var(--border-color, #e5e7eb)' }}
        >
          <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
            <div className="mb-10 max-w-2xl">
              <p
                className="mb-4 text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: '#9f234f' }}
              >
                WHAT MATTERS
              </p>
              <h2 className="text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
                A better experience, in the details.
              </h2>
            </div>

            <div>
              {principles.map((item) => (
                <article
                  key={item.number}
                  className="grid gap-3 border-t py-6 sm:grid-cols-12 sm:gap-8 sm:py-8"
                  style={{ borderColor: 'var(--border-color, #e5e7eb)' }}
                >
                  <p
                    className="text-sm font-medium sm:col-span-1"
                    style={{ color: '#9f234f' }}
                  >
                    {item.number}
                  </p>

                  <h3 className="text-xl font-medium tracking-tight sm:col-span-4 sm:text-2xl">
                    {item.title}
                  </h3>

                  <p
                    className="max-w-xl text-sm leading-7 sm:col-span-7 sm:text-base"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* East Africa context */}
        <section className="mx-auto grid max-w-[1440px] items-center gap-8 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:px-12">
          <div className="max-w-xl">
            <p
              className="mb-5 text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: '#9f234f' }}
            >
              OUR PERSPECTIVE
            </p>

            <h2 className="text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              Rooted in local needs. Open to a wider world.
            </h2>

            <p
              className="mt-6 text-base leading-8"
              style={{ color: 'var(--text-muted)' }}
            >
              With an East African perspective and connections to global
              payment partners, Spacilly aims to support shopping experiences
              that reflect local needs while making use of dependable
              commerce practices.
            </p>
          </div>

          <figure className="overflow-hidden bg-stone-100">
            <img
              src="https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&w=1400&q=85"
              alt="A working space representing the people and ideas behind an online marketplace"
              className="aspect-[4/3] h-full w-full object-cover"
              loading="lazy"
            />
          </figure>
        </section>

        {/* Single, quiet closing CTA */}
        <section className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div
            className="flex flex-col justify-between gap-6 border-t pt-8 sm:flex-row sm:items-end sm:pt-10"
            style={{ borderColor: 'var(--border-color, #e5e7eb)' }}
          >
            <h2 className="max-w-2xl text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
              Find something that feels right for you.
            </h2>

            <a
              href="/"
              className="inline-flex min-h-11 shrink-0 items-center gap-3 self-start border-b pb-2 text-sm font-semibold transition-opacity hover:opacity-65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700 sm:self-auto"
              style={{ borderColor: '#9f234f' }}
            >
              Shop Spacilly
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
      </main>
    </BuyerLayout>
  );
}
