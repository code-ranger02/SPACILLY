import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useImmersiveSearch } from '../../../stores/immersiveSearchStore';

export function SpacillyMobileSearchBar() {
  const openSearch = useImmersiveSearch((s) => s.openSearch);

  return (
    <div className="sp-mob-search-wrap">
      <button type="button" className="sp-mob-search sp-mob-search--pill" onClick={() => openSearch('')}>
        <Search size={18} strokeWidth={1.75} aria-hidden />
        <span>Search products</span>
      </button>
    </div>
  );
}

export default function SpacillyMobileHomeHeader() {
  return (
    <header className="sp-mob-brand-header">
      <Link to="/" className="sp-mob-brand-header__logo" aria-label="Spacilly home">
        SPACILLY
      </Link>
    </header>
  );
}
