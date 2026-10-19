
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import {
  Home,
  LayoutGrid,
  Package,
  Heart,
  ShoppingBag,
  Ticket,
  User,
  MapPin,
  CreditCard,
  Clock,
  Star,
  Bell,
  MessageSquare,
  Settings,
  HelpCircle,
  Info,
  Store,
  Radio,
  LogOut,
  ChevronRight,
  Crown,
  X,
} from 'lucide-react';

import OverlayPortal from '../OverlayPortal';
import { useTranslation } from '../../i18n/useTranslation';
import { useMobileMenuOverlay } from '../../stores/mobileMenuOverlayStore';
import { useAuthStore } from '../../stores/authStore';
import { useBuyerCart } from '../../stores/buyerCartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useNotificationStore } from '../../stores/notificationStore';

const EASE = [0.22, 1, 0.36, 1];

const MENU_CSS = `
.mmo-root {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  overflow: hidden;
  isolation: isolate;
  font-family: inherit;
}
.mmo-backdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: rgb(15 18 28 / 42%);
}
.mmo-panel {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  flex: 0 0 min(86vw, 400px);
  width: min(86vw, 400px);
  height: 100%;
  height: 100dvh;
  min-height: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 0;
  background: #fff;
  color: #242129;
  box-shadow: 8px 0 28px rgb(20 20 30 / 10%);
}
.mmo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 0 0 auto;
  min-height: 58px;
  padding: 8px 14px;
  border-bottom: 1px solid #f0eef0;
}
.mmo-brand-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.mmo-logo-mark {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  place-items: center;
  border-radius: 11px;
  background: #ce1246;
  color: white;
  font-size: 21px;
  font-weight: 800;
}
.mmo-brand-text {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: .035em;
}
.mmo-brand-accent { color: #c30d43; }
.mmo-close {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  place-items: center;
  border: 0;
  border-radius: 10px;
  background: #f5f5f6;
  color: #55515a;
}
.mmo-profile-card {
  display: flex;
  align-items: center;
  gap: 11px;
  flex: 0 0 auto;
  min-width: 0;
  margin: 10px 12px 6px;
  padding: 10px;
  border: 1px solid #ece9ec;
  border-radius: 12px;
  background: #f8f7f8;
  color: inherit;
  text-decoration: none;
  transition: padding .18s ease, margin .18s ease;
}
.mmo-avatar {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  place-items: center;
  border-radius: 50%;
  background: #7158e8;
  color: white;
  font-weight: 700;
}
.mmo-profile-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  gap: 3px;
}
.mmo-profile-name {
  overflow: hidden;
  font-size: 15px;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mmo-profile-email {
  overflow: hidden;
  color: #77727b;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mmo-member {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #a85d20;
  font-size: 11px;
  font-weight: 700;
}
.mmo-premium-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex: 0 0 auto;
  margin: 5px 12px 8px;
  padding: 11px;
  border: 1px solid #f0d1db;
  border-radius: 12px;
  background: #fff5f7;
  transition: padding .18s ease, margin .18s ease;
}
.mmo-premium-copy { flex: 1; min-width: 0; }
.mmo-premium-title {
  margin: 0;
  color: #29242a;
  font-size: 14px;
  font-weight: 750;
}
.mmo-premium-sub {
  margin: 4px 0 0;
  color: #746c73;
  font-size: 11px;
  line-height: 1.4;
}
.mmo-premium-cta {
  flex: 0 0 auto;
  min-height: 34px;
  padding: 7px 12px;
  border: 0;
  border-radius: 999px;
  background: #b50038;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.mmo-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #d9d5d9 transparent;
  padding: 2px 12px 14px;
}
.mmo-nav-section { margin: 0; padding: 0; }
.mmo-section-label {
  margin: 13px 4px 6px;
  color: #928b93;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .15em;
  line-height: 1.5;
  text-transform: uppercase;
}
.mmo-nav-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.mmo-nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 4px 8px;
  border-radius: 9px;
  color: #353039;
  text-decoration: none;
  transition: background .14s ease, color .14s ease;
}
.mmo-nav-link--active {
  background: #faeaf0;
  color: #b20b40;
  font-weight: 650;
}
.mmo-nav-icon {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  place-items: center;
  border-radius: 9px;
  background: #f3f2f3;
  color: #77727a;
}
.mmo-nav-link--active .mmo-nav-icon {
  background: white;
  color: #b20b40;
}
.mmo-nav-label {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
  font-size: 13px;
  line-height: 1.35;
}
.mmo-nav-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 999px;
  background: #b50038;
  color: white;
  font-size: 10px;
  font-weight: 750;
}
.mmo-nav-chevron { flex: 0 0 auto; color: #a19ba3; }
.mmo-footer {
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
  padding: 9px 12px max(9px, env(safe-area-inset-bottom));
  border-top: 1px solid #efedf0;
  background: white;
}
.mmo-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: 100%;
  min-height: 42px;
  padding: 8px 12px;
  border: 1px solid #f1cbd6;
  border-radius: 10px;
  background: #fff3f5;
  color: #c3224a;
  font-size: 14px;
  font-weight: 750;
}
.mmo-logout:disabled { opacity: .65; cursor: wait; }
.mmo-panel--compact .mmo-profile-card {
  margin-top: 5px;
  margin-bottom: 3px;
  padding: 6px 9px;
}
.mmo-panel--compact .mmo-avatar {
  width: 34px;
  height: 34px;
  flex-basis: 34px;
  font-size: 14px;
}
.mmo-panel--compact .mmo-profile-email,
.mmo-panel--compact .mmo-member,
.mmo-panel--compact .mmo-premium-sub { display: none; }
.mmo-panel--compact .mmo-premium-banner {
  margin-top: 3px;
  margin-bottom: 5px;
  padding: 7px 10px;
}
.mmo-panel--compact .mmo-premium-title { font-size: 12px; }
.mmo-panel--compact .mmo-premium-cta {
  min-height: 30px;
  padding: 5px 10px;
  font-size: 11px;
}
@media (max-width: 380px) {
  .mmo-panel {
    width: 88vw;
    flex-basis: 88vw;
  }
  .mmo-header { padding-inline: 10px; }
  .mmo-profile-card, .mmo-premium-banner { margin-inline: 8px; }
  .mmo-scroll { padding-inline: 8px; }
  .mmo-footer { padding-inline: 8px; }
}
@media (max-height: 650px) {
  .mmo-header { min-height: 50px; }
  .mmo-logo-mark { width: 32px; height: 32px; }
  .mmo-profile-card {
    margin-top: 5px;
    margin-bottom: 3px;
    padding: 6px 8px;
  }
  .mmo-avatar { width: 34px; height: 34px; flex-basis: 34px; }
  .mmo-premium-banner {
    margin-top: 3px;
    margin-bottom: 4px;
    padding: 7px 9px;
  }
  .mmo-premium-sub { display: none; }
  .mmo-nav-link { min-height: 38px; }
  .mmo-section-label { margin-top: 9px; }
}
@media (prefers-reduced-motion: reduce) {
  .mmo-profile-card, .mmo-premium-banner, .mmo-nav-link {
    transition: none;
  }
}
`;

function NavItem({ icon: Icon, label, to, badge = 0, active, onNavigate }) {
  return (
    <li>
      <Link
        to={to}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        className={`mmo-nav-link${active ? ' mmo-nav-link--active' : ''}`}
      >
        <span className="mmo-nav-icon" aria-hidden="true">
          <Icon size={19} strokeWidth={1.8} />
        </span>
        <span className="mmo-nav-label">{label}</span>
        {badge > 0 && (
          <span className="mmo-nav-badge">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
        <ChevronRight size={15} className="mmo-nav-chevron" />
      </Link>
    </li>
  );
}

export default function MobileMenuOverlay() {
  const isOpen = useMobileMenuOverlay((s) => s.isOpen);
  const close = useMobileMenuOverlay((s) => s.close);
  const { t } = useTranslation();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const [isCompact, setIsCompact] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dragControls = useDragControls();

  const cartCount = useBuyerCart((s) =>
    s.items.reduce((n, item) => n + (item.quantity || 1), 0)
  );
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const messageCount = useNotificationStore((s) => s.unreadMessageCount);

  const displayName =
    user?.full_name || user?.email?.split('@')[0] || 'Guest';

  const initials =
    displayName.split(/\s+/).filter(Boolean)
      .map((word) => word[0]).join('').slice(0, 2).toUpperCase() || 'G';

  const navSections = useMemo(() => [
    {
      label: 'Shop',
      items: [
        { icon: Home, label: t('nav.home'), to: '/', match: (p) => p === '/' },
        { icon: LayoutGrid, label: t('nav.categories'), to: '/category/all', match: (p) => p.startsWith('/category/') },
        { icon: Radio, label: 'Live shopping', to: '/live' },
      ],
    },
    {
      label: 'Account',
      items: [
        { icon: Package, label: t('nav.orders'), to: '/account?tab=orders' },
        { icon: Heart, label: t('nav.wishlist'), to: '/account?tab=wishlist', badge: wishlistCount },
        { icon: ShoppingBag, label: t('nav.cart'), to: '/cart', badge: cartCount },
        { icon: Ticket, label: 'Coupons', to: '/search?q=coupon' },
        { icon: User, label: t('nav.account'), to: '/account' },
        { icon: MapPin, label: t('account.addresses'), to: '/account?tab=addresses' },
        { icon: CreditCard, label: t('account.paymentMethods'), to: '/account?tab=payment' },
        { icon: Clock, label: 'Recently Viewed', to: '/account?tab=recently-viewed' },
        { icon: Star, label: t('footer.links.account.myReviews'), to: '/account?tab=reviews' },
      ],
    },
    {
      label: 'Support',
      items: [
        { icon: Bell, label: t('nav.notifications'), to: '/notifications' },
        { icon: MessageSquare, label: t('nav.messages'), to: '/account?tab=messages', badge: messageCount },
        { icon: Settings, label: t('nav.settings'), to: '/account?tab=settings' },
        { icon: HelpCircle, label: `${t('nav.help')} & Support`, to: '/help' },
        { icon: Info, label: t('footer.links.shop.aboutSpacilly'), to: '/about' },
        { icon: Store, label: t('header.becomeSeller'), to: '/become-seller' },
      ],
    },
  ], [t, wishlistCount, cartCount, messageCount]);

  useEffect(() => {
    if (!isOpen) {
      setIsCompact(false);
      return undefined;
    }

    const root = document.documentElement;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const hadOpenClass = root.classList.contains('rx-menu-open');

    root.classList.add('rx-menu-open');
    body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      if (!hadOpenClass) root.classList.remove('rx-menu-open');
      body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, close]);

  const isItemActive = (item) => {
    if (item.match) return item.match(location.pathname);
    const [path, query] = item.to.split('?');
    if (location.pathname !== path) return false;
    if (!query) return !location.search && item.to !== '/account';
    return location.search === `?${query}`;
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await signOut();
      close();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <style>{MENU_CSS}</style>
      <OverlayPortal active={isOpen}>
        <AnimatePresence>
          {isOpen && (
            <div className="mmo-root md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
              <motion.button
                type="button"
                className="mmo-backdrop"
                aria-label="Close menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: EASE }}
                onClick={close}
              />

              <motion.aside
                className={`mmo-panel${isCompact ? ' mmo-panel--compact' : ''}`}
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.26, ease: EASE }}
                drag="x"
                dragControls={dragControls}
                dragListener={false}
                dragDirectionLock
                dragConstraints={{ left: -100, right: 0 }}
                dragElastic={0.06}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -65 || info.velocity.x < -450) close();
                }}
              >
                <header className="mmo-header">
                  <div className="mmo-brand-row">
                    <span className="mmo-logo-mark">S</span>
                    <span className="mmo-brand-text">
                      SPAC<span className="mmo-brand-accent">ILLY</span>
                    </span>
                  </div>
                  <button type="button" className="mmo-close" onClick={close} aria-label="Close menu">
                    <X size={20} />
                  </button>
                </header>

                <Link
                  to={user ? '/account' : '/login'}
                  onClick={close}
                  className="mmo-profile-card"
                >
                  <span className="mmo-avatar">{initials}</span>
                  <span className="mmo-profile-copy">
                    <span className="mmo-profile-name">{displayName}</span>
                    <span className="mmo-profile-email">
                      {user?.email || 'Sign in for full access'}
                    </span>
                    {user && (
                      <span className="mmo-member">
                        <Crown size={11} /> Gold Member
                      </span>
                    )}
                  </span>
                  <ChevronRight size={18} className="mmo-profile-chevron" />
                </Link>

                <div className="mmo-premium-banner">
                  <div className="mmo-premium-copy">
                    <p className="mmo-premium-title">Upgrade to Premium</p>
                    <p className="mmo-premium-sub">Free shipping, exclusive deals &amp; more</p>
                  </div>
                  <button
                    type="button"
                    className="mmo-premium-cta"
                    onClick={() => {
                      // Connect your existing Premium route/action here.
                    }}
                  >
                    Upgrade
                  </button>
                </div>

                <nav
                  className="mmo-scroll"
                  aria-label="Main navigation"
                  onScroll={(event) => setIsCompact(event.currentTarget.scrollTop > 24)}
                >
                  {navSections.map((section) => (
                    <section className="mmo-nav-section" key={section.label}>
                      <p className="mmo-section-label">{section.label}</p>
                      <ul className="mmo-nav-list">
                        {section.items.map((item) => (
                          <NavItem
                            key={`${item.to}-${item.label}`}
                            {...item}
                            active={isItemActive(item)}
                            onNavigate={close}
                          />
                        ))}
                      </ul>
                    </section>
                  ))}
                </nav>

                <footer className="mmo-footer">
                  {user ? (
                    <button
                      type="button"
                      className="mmo-logout"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      <LogOut size={18} />
                      {isLoggingOut ? 'Logging out…' : 'Logout'}
                    </button>
                  ) : (
                    <Link to="/login" className="mmo-logout" onClick={close}>
                      <User size={18} /> Sign in
                    </Link>
                  )}
                </footer>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>
      </OverlayPortal>
    </>
  );
}
