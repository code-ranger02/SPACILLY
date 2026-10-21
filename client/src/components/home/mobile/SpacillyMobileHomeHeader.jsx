import { Link } from 'react-router-dom';
import BrandLogo from '../../BrandLogo';

export default function SpacillyMobileHomeHeader() {
  return (
    <header className="sp-mob-brand-header">
      <Link to="/" className="sp-mob-brand-header__logo" aria-label="Spacilly home">
        <BrandLogo className="h-10 max-w-[180px] mx-auto object-center" />
      </Link>
    </header>
  );
}
