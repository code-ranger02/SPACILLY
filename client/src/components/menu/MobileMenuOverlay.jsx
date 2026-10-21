
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
import BrandLogo from '../BrandLogo';

const EASE = [0.22, 1, 0.36, 1];

const CSS = `
.mmo-root,
.mmo-root * {
  box-sizing: border-box;
}

.mmo-root {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  width: 100%;
  height: 100%;
  height: 100dvh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  isolation: isolate;
  overscroll-behavior: none;
  font-family: inherit;
  -webkit-tap-highlight-color: transparent;
}

.mmo-backdrop {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: rgb(15 18 28 / 48%);
  cursor: pointer;
}

.mmo-panel {
  position: absolute;
  inset: 0 auto 0 0;
  z-index: 1;
  display: flex;
  flex: none;
  flex-direction: column;
  width: min(82vw, 400px);
  max-width: 400px;
  height: 100%;
  height: 100dvh;
  min-height: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 0;
  background: #fff;
  color: #27232b;
  box-shadow: 5px 0 24px rgb(0 0 0 / 16%);
  will-change: transform;
  overscroll-behavior: none;
}

.mmo-header {
  display: flex;
  flex: 0 0 60px;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
  padding: 0 14px;
  border-bottom: 1px solid #efedf0;
  background: #fff;
}

.mmo-brand-row {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 9px;
}

.mmo-logo-mark {
  display: grid;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 10px;
  background: #c81046;
  color: #fff;
  font-family: Georgia, serif;
  font-size: 23px;
  font-weight: 800;
  box-shadow: 0 3px 10px rgb(200 16 70 / 16%);
}

.mmo-brand-text {
  overflow: hidden;
  color: #211c28;
  font-size: 18px;
  font-weight: 850;
  letter-spacing: .02em;
  white-space: nowrap;
}

.mmo-brand-accent {
  color: #c81046;
}

.mmo-close {
  display: grid;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: #f4f3f5;
  color: #514c56;
  cursor: pointer;
  transition: background .16s ease;
}

.mmo-close:hover {
  background: #eae8ec;
}

.mmo-profile-card {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 10px;
  min-width: 0;
  margin: 10px 10px 0;
  padding: 9px;
  border: 1px solid #ebe8ed;
  border-radius: 12px;
  background: #faf9fb;
  color: inherit;
  text-decoration: none;
}

.mmo-avatar {
  display: grid;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  place-items: center;
  overflow: hidden;
  border-radius: 50%;
  background: #7158df;
  color: #fff;
  font-size: 15px;
  font-weight: 750;
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
  color: #29252d;
  font-size: 14px;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mmo-profile-email {
  overflow: hidden;
  color: #77717c;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mmo-member {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #9b651d;
  font-size: 10px;
  font-weight: 700;
}

.mmo-profile-chevron {
  flex: 0 0 auto;
  color: #99939e;
}

.mmo-premium-banner {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
  margin: 8px 10px 5px;
  padding: 9px;
  border: 1px solid #f0d5df;
  border-radius: 10px;
  background: #fff5f7;
}

.mmo-premium-copy {
  flex: 1;
  min-width: 0;
}

.mmo-premium-title {
  margin: 0;
  color: #30252b;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.4;
}

.mmo-premium-sub {
  margin: 3px 0 0;
  color: #786c73;
  font-size: 10px;
  line-height: 1.4;
}

.mmo-premium-cta {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 10px;
  border: 0;
  border-radius: 8px;
  background: #b90b40;
  color: #fff;
  font-family: inherit;
  font-size: 11px;
  font-weight: 750;
  white-space: nowrap;
  cursor: pointer;
  transition: background .16s ease;
}

.mmo-premium-cta:hover {
  background: #990832;
}

.mmo-scroll {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #d9d5dc transparent;
  padding: 3px 10px 12px;
}

.mmo-scroll::-webkit-scrollbar {
  width: 3px;
}

.mmo-scroll::-webkit-scrollbar-thumb {
  border-radius: 0;
  background: #d9d5dc;
}

.mmo-nav-section {
  margin: 0;
  padding: 0;
}

.mmo-section-label {
  margin: 12px 4px 5px;
  color: #918a96;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .14em;
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
  border: 1px solid transparent;
  border-radius: 8px;
  color: #37313c;
  text-decoration: none;
  transition: background .14s ease, color .14s ease;
}

.mmo-nav-link:hover {
  background: #f8f5f7;
}

.mmo-nav-link:active {
  background: #f4e9ee;
}

.mmo-nav-link--active {
  border-color: #f7e3ea;
  background: #fbedf2;
  color: #b20c41;
}

.mmo-nav-icon {
  display: grid;
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 8px;
  background: #f3f2f4;
  color: #77717c;
}

.mmo-nav-link--active .mmo-nav-icon {
  background: #fff;
  color: #b20c41;
}

.mmo-nav-label {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
}

.mmo-nav-link--active .mmo-nav-label {
  font-weight: 700;
}

.mmo-nav-badge {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 20px;
  background: #bd1046;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
}

.mmo-nav-chevron {
  flex: 0 0 auto;
  color: #a29ba5;
}

.mmo-footer {
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
  width: 100%;
  margin: 0;
  padding: 9px 10px calc(9px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid #efedf0;
  background: #fff;
}

.mmo-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 43px;
  padding: 8px 12px;
  border: 1px solid #f0cbd7;
  border-radius: 9px;
  background: #fff4f6;
  color: #bd204b;
  font-family: inherit;
  font-size: 13px;
  font-weight: 750;
  text-decoration: none;
  cursor: pointer;
}

.mmo-logout:disabled {
  opacity: .65;
  cursor: wait;
}

@media (max-width: 360px) {
  .mmo-panel {
    width: 86vw;
  }

  .mmo-header {
    padding-inline: 11px;
  }

  .mmo-brand-text {
    font-size: 16px;
  }

  .mmo-profile-card {
    margin-inline: 8px;
  }

  .mmo-premium-banner {
    margin-inline: 8px;
  }

  .mmo-scroll {
    padding-inline: 8px;
  }

  .mmo-footer {
    padding-inline: 8px;
  }
}

@media (max-height: 620px) {
  .mmo-header {
    flex-basis: 50px;
  }

  .mmo-logo-mark {
    width: 32px;
    height: 32px;
    flex-basis: 32px;
    font-size: 20px;
  }

  .mmo-profile-card {
    margin-top: 6px;
    padding: 6px 8px;
  }

  .mmo-avatar {
    width: 32px;
    height: 32px;
    flex-basis: 32px;
  }

  .mmo-premium-banner {
    margin-top: 5px;
    margin-bottom: 3px;
    padding: 6px 8px;
  }

  .mmo-premium-sub {
    display: none;
  }

  .mmo-section-label {
    margin-top: 8px;
  }

  .mmo-nav-link {
    min-height: 36px;
  }

  .mmo-nav-icon {
    width: 28px;
    height: 28px;
    flex-basis: 28px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
    animation-duration: .01ms !important;
  }
}
`;

function NavItem({
  icon: Icon,
  label,
  to,
  badge = 0,
  active,
  onNavigate,
}) {
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

        <ChevronRight
          size={15}
          strokeWidth={1.8}
          className="mmo-nav-chevron"
          aria-hidden="true"
        />
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

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const cartCount = useBuyerCart((s) =>
    s.items.reduce((total, item) => total + (item.quantity || 1), 0)
  );

  const wishlistCount = useWishlistStore((s) => s.items.length);
  const messageCount = useNotificationStore((s) => s.unreadMessageCount);

  const displayName =
    user?.full_name || user?.email?.split('@')[0] || 'Guest';

  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'G';

  const navSections = useMemo(
    () => [
      {
        label: 'Shop',
        items: [
          {
            icon: Home,
            label: t('nav.home'),
            to: '/',
            match: (pathname) => pathname === '/',
          },
          {
            icon: LayoutGrid,
            label: t('nav.categories'),
            to: '/category/all',
            match: (pathname) => pathname.startsWith('/category/'),
          },
          {
            icon: Radio,
            label: 'Live shopping',
            to: '/live',
          },
        ],
      },
      {
        label: 'Account',
        items: [
          {
            icon: Package,
            label: t('nav.orders'),
            to: '/account?tab=orders',
          },
          {
            icon: Heart,
            label: t('nav.wishlist'),
            to: '/account?tab=wishlist',
            badge: wishlistCount,
          },
          {
            icon: ShoppingBag,
            label: t('nav.cart'),
            to: '/cart',
            badge: cartCount,
          },
          {
            icon: Ticket,
            label: 'Coupons',
            to: '/search?q=coupon',
          },
          {
            icon: User,
            label: t('nav.account'),
            to: '/account',
          },
          {
            icon: MapPin,
            label: t('account.addresses'),
            to: '/account?tab=addresses',
          },
          {
            icon: CreditCard,
            label: t('account.paymentMethods'),
            to: '/account?tab=payment',
          },
          {
            icon: Clock,
            label: 'Recently Viewed',
            to: '/account?tab=recently-viewed',
          },
          {
            icon: Star,
            label: t('footer.links.account.myReviews'),
            to: '/account?tab=reviews',
          },
        ],
      },
      {
        label: 'Support',
        items: [
          {
            icon: Bell,
            label: t('nav.notifications'),
            to: '/notifications',
          },
          {
            icon: MessageSquare,
            label: t('nav.messages'),
            to: '/account?tab=messages',
            badge: messageCount,
          },
          {
            icon: Settings,
            label: t('nav.settings'),
            to: '/account?tab=settings',
          },
          {
            icon: HelpCircle,
            label: `${t('nav.help')} & Support`,
            to: '/help',
          },
          {
            icon: Info,
            label: t('footer.links.shop.aboutSpacilly'),
            to: '/about',
          },
          {
            icon: Store,
            label: t('header.becomeSeller'),
            to: '/become-seller',
          },
        ],
      },
    ],
    [t, wishlistCount, cartCount, messageCount]
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    const root = document.documentElement;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const hadOpenClass = root.classList.contains('rx-menu-open');

    root.classList.add('rx-menu-open');
    body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') close();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (!hadOpenClass) {
        root.classList.remove('rx-menu-open');
      }

      body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
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

  const handlePremium = () => {
    // Connect this button to your existing Premium route/action.
    // Example: navigate('/premium') if that route exists in your app.
  };

  return (
    <>
      <style>{CSS}</style>

      <OverlayPortal active={isOpen}>
        <AnimatePresence>
          {isOpen && (
            <div
              className="mmo-root md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Main menu"
            >
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
                className="mmo-panel"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                <header className="mmo-header">
                  <div className="mmo-brand-row">
                    <BrandLogo className="h-9 max-w-[150px]" />
                  </div>

                  <button
                    type="button"
                    className="mmo-close"
                    onClick={close}
                    aria-label="Close menu"
                  >
                    <X size={21} strokeWidth={1.8} />
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
                        <Crown size={12} />
                        Gold Member
                      </span>
                    )}
                  </span>

                  <ChevronRight
                    size={18}
                    className="mmo-profile-chevron"
                    aria-hidden="true"
                  />
                </Link>

                <div className="mmo-premium-banner">
                  <div className="mmo-premium-copy">
                    <p className="mmo-premium-title">
                      Upgrade to Premium
                    </p>
                    <p className="mmo-premium-sub">
                      Free shipping, exclusive deals &amp; more
                    </p>
                  </div>

                  <button
                    type="button"
                    className="mmo-premium-cta"
                    onClick={handlePremium}
                  >
                    Upgrade
                  </button>
                </div>

                <nav
                  className="mmo-scroll"
                  aria-label="Main navigation"
                >
                  {navSections.map((section) => (
                    <section
                      className="mmo-nav-section"
                      key={section.label}
                    >
                      <p className="mmo-section-label">
                        {section.label}
                      </p>

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
                      <LogOut size={17} />
                      {isLoggingOut ? 'Logging out…' : 'Logout'}
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="mmo-logout"
                      onClick={close}
                    >
                      <User size={17} />
                      Sign in
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
