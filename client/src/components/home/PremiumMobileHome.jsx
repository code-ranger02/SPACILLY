import { motion } from 'framer-motion';
import { useHomeFeedBundle } from '../../hooks/useHomeFeedSections';
import { HOME_PRODUCT_LIMIT } from './mobile/HomeExploreSection';
import HomeExploreSection from './mobile/HomeExploreSection';
import SpacillyMobileHomeHeader, { SpacillyMobileSearchBar } from './mobile/SpacillyMobileHomeHeader';
import SpacillyMobilePromoHero from './mobile/SpacillyMobilePromoHero';
import SpacillyCategoryCircles from './mobile/SpacillyCategoryCircles';
import { explorePath } from '../explore/exploreConfig';
import '../../styles/spacilly-commerce.css';
import '../../styles/explore-all.css';
import '../../styles/home-explore-bridge.css';

export default function PremiumMobileHome() {
  const { data: feed, isPending } = useHomeFeedBundle(HOME_PRODUCT_LIMIT);

  const trending = feed?.trending ?? [];
  const bestSellers = feed?.bestsellers ?? [];
  const aiRecs = feed?.foryou ?? [];
  const picks = aiRecs.length > 0 ? aiRecs : trending;

  const loading = {
    picks: isPending && !picks.length,
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
      <SpacillyMobilePromoHero />
      <SpacillyMobileSearchBar />
      <SpacillyCategoryCircles />

      <HomeExploreSection
        id="mob-picks"
        sectionKey="foryou"
        title="Fashion picks for you"
        href={explorePath('foryou')}
        linkLabel="See all"
        products={picks}
        loading={loading.picks}
        layout="grid"
        variant="trending"
      />

      {bestSellers.length > 0 || loading.best ? (
        <HomeExploreSection
          id="mob-bestsellers"
          sectionKey="bestsellers"
          title="Best sellers"
          href={explorePath('bestseller')}
          linkLabel="See all"
          products={bestSellers}
          loading={loading.best}
          layout="grid"
          variant="bestseller"
        />
      ) : null}
    </motion.div>
  );
}
