import { Link } from 'react-router-dom';

export default function SpacillyMobileHomeHeader() {
  return (
    <header className="sp-mob-brand-header">
      <Link to="/" className="sp-mob-brand-header__logo" aria-label="Spacilly home">
        SPACILLY
      </Link>
    </header>
  );
}
