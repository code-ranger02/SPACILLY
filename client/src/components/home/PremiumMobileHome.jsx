import { motion } from 'framer-motion';
import FuturisticHero from './FuturisticHero';
import { useHomeFeedBundle } from '../../hooks/useHomeFeedSections';
import { HOME_PRODUCT_LIMIT } from './mobile/HomeExploreSection';
import HomeExploreSection from './mobile/HomeExploreSection';
import SpacillyMobileHomeHeader from './mobile/SpacillyMobileHomeHeader';
import SpacillyCategoryCircles from './mobile/SpacillyCategoryCircles';
import { explorePath } from '../explore/exploreConfig';
import { HOME_SECTION_COPY } from '../../lib/productFeedFlags';
import '../../styles/spacilly-commerce.css';
import '../../styles/explore-all.css';
import '../../styles/home-explore-bridge.css';

function sectionTitle(feed, id, fallback) {
  const fromApi = feed?.meta?.[id]?.title;
  return (typeof fromApi === 'string' && fromApi.trim()) || fallback;
}

function sectionSub(feed, id, fallback) {
  const fromApi = feed?.meta?.[id]?.subtitle;
  return (typeof fromApi === 'string' && fromApi.trim()) || fallback;
}

export default function PremiumMobileHome() {
  const { data: feed, isPending } = useHomeFeedBundle(HOME_PRODUCT_LIMIT);

  const trending = feed?.trending ?? [];
  const bestSellers = feed?.bestsellers ?? [];
  const forYou = feed?.foryou ?? [];

  const loading = {
    trending: isPending && !trending.length,
    foryou: isPending && !forYou.length,
    best: isPending && !bestSellers.length,
  };

  return (
    <motion.div
      className="sp-mobile-home mob-page md:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28 }}
    >
      <SpacillyMobileHomeHeader />
      <FuturisticHero compact className="fx-hero--mobile-home" />
      <SpacillyCategoryCircles />

      <HomeExploreSection
        id="mob-foryou"
        sectionKey="foryou"
        title={sectionTitle(feed, 'foryou', HOME_SECTION_COPY.foryou.title)}
        subtitle={sectionSub(feed, 'foryou', HOME_SECTION_COPY.foryou.subtitle)}
        href={explorePath(HOME_SECTION_COPY.foryou.hrefTab)}
        linkLabel="See all"
        products={forYou}
        loading={loading.foryou}
        variant="ai"
      />

      <HomeExploreSection
        id="mob-trending"
        sectionKey="trending"
        title={sectionTitle(feed, 'trending', HOME_SECTION_COPY.trending.title)}
        subtitle={sectionSub(feed, 'trending', HOME_SECTION_COPY.trending.subtitle)}
        href={explorePath(HOME_SECTION_COPY.trending.hrefTab)}
        linkLabel="See all"
        products={trending}
        loading={loading.trending}
        variant="trending"
      />

      <HomeExploreSection
        id="mob-bestsellers"
        sectionKey="bestsellers"
        title={sectionTitle(feed, 'bestsellers', HOME_SECTION_COPY.bestsellers.title)}
        subtitle={sectionSub(feed, 'bestsellers', HOME_SECTION_COPY.bestsellers.subtitle)}
        href={explorePath(HOME_SECTION_COPY.bestsellers.hrefTab)}
        linkLabel="See all"
        products={bestSellers}
        loading={loading.best}
        variant="bestseller"
      />
    </motion.div>
  );
}
