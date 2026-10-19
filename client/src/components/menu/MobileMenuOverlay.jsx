
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
  overflow: hidden;
  isolation: isolate;
  font-family: inherit;
  overscroll-behavior: none;
}

.mmo-backdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: rgb(20 18 26 / 48%);
  -webkit-tap-highlight-color: transparent;
}

.mmo-panel {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 0 0 min(88vw, 380px);
  flex-direction: column;
  width: min(88vw, 380px);
  height: 100%;
  height: 100dvh;
  min-height: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 0;
  background: #fff;
  color: #25232a;
  box-shadow: 5px 0 24px rgb(0 0 0 / 10%);
  will-change: transform;
}

.mmo-header {
  display: flex;
  flex: 0 0 62px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
  padding: 0 16px;
  border-bottom: 1px solid #f0edf0;
  background: #fff;
}

.mmo-brand-row {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 10px;
}

.mmo-logo-mark {
  display: grid;
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 12px;
  background: #c81046;
  color: #fff;
  font-family: Georgia, serif;
  font-size: 24px;
  font-weight: 800;
  box-shadow: 0 4px 12px rgb(200 16 70 / 17%);
}

.mmo-brand-text {
  overflow: hidden;
  color: #211c28;
  font-size: 18px;
  font-weight: 850;
  letter-spacing: .025em;
  white-space: nowrap;
}

.mmo-brand-accent {
  color: #c81046;
}

.mmo-close {
  display: grid;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 0;
  border-radius: 10px;
  background: #f5f4f6;
  color: #514c56;
  cursor: pointer;
  transition: background .18s ease;
}

.mmo-close:hover {
  background: #ece9ed;
}

.mmo-profile-card {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 11px;
  min-width: 0;
  margin: 12px 12px 0;
  padding: 11px;
  border: 1px solid #ebe8ed;
  border-radius: 14px;
  background: #faf9fb;
  color: inherit;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}

.mmo-avatar {
  display: grid;
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  place-items: center;
  overflow: hidden;
  border-radius: 50%;
  background: #7158df;
  color: #fff;
  font-size: 16px;
  font-weight: 750;
}

.mmo-profile-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  gap: 4px;
}

.mmo-profile-name {
  overflow: hidden;
  color: #29252d;
  font-size: 15px;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mmo-profile-email {
  overflow: hidden;
  color: #77717c;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mmo-member {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #9b651d;
  font-size: 11px;
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
  gap: 10px;
  min-width: 0;
  margin: 10px 12px 8px;
  padding: 12px;
  border: 1px solid #f0d5df;
  border-radius: 13px;
  background: #fff5f7;
}

.mmo-premium-copy {
  flex: 1;
  min-width: 0;
}

.mmo-premium-title {
  margin: 0;
  color: #30252b;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.4;
}

.mmo-premium-sub {
  margin: 4px 0 0;
  color: #786c73;
  font-size: 11px;
  line-height: 1.5;
}

.mmo-premium-cta {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 12px;
  border: 0;
  border-radius: 9px;
  background: #b90b40;
  color: #fff;
  font-size: 12px;
  font-weight: 750;
  white-space: nowrap;
  cursor: pointer;
}

.mmo-scroll {
  flex: 1 1 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 4px 12px 18px;
}

.mmo-scroll::-webkit-scrollbar {
  display: none;
}

.mmo-nav-section {
  margin: 0;
  padding: 0;
}

.mmo-section-label {
  margin: 13px 5px 7px;
  color: #918a96;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .15em;
  line-height: 1.5;
  text-transform: uppercase;
}

.mmo-nav-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.mmo-nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 5px 9px;
  border: 1px solid transparent;
  border-radius: 10px;
  color: #37313c;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  transition: background .15s ease, color .15s ease;
}

.mmo-nav-link:active {
  background: #f7f2f5;
}

.mmo-nav-link--active {
  border-color: #f7e3ea;
  background: #fbedf2;
  color: #b20c41;
}

.mmo-nav-icon {
  display: grid;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 9px;
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
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  overflow-wrap: anywhere;
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
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid #efedf0;
  background: #fff;
}

.mmo-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: 100%;
  min-height: 44px;
  padding: 9px 12px;
  border: 1px solid #f0cbd7;
  border-radius: 11px;
  background: #fff4f6;
  color: #bd204b;
  font-family: inherit;
  font-size: 14px;
  font-weight: 750;
  text-decoration: none;
  cursor: pointer;
}

.mmo-logout:disabled {
  opacity: .65;
  cursor: wait;
}

@media (min-width: 600px) {
  .mmo-panel {
    flex-basis: min(390px, 86vw);
    width: min(390px, 86vw);
  }
}

@media (max-height: 680px) {
  .mmo-header {
    flex-basis: 54px;
  }

  .mmo-logo-mark {
    width: 34px;
    height: 34px;
    flex-basis: 34px;
    font-size: 21px;
  }

  .mmo-profile-card {
    margin-top: 7px;
    padding: 8px 10px;
  }

  .mmo-avatar {
    width: 36px;
    height: 36px;
    flex-basis: 36px;
  }

  .mmo-premium-banner {
    margin-top: 7px;
    margin-bottom: 4px;
    padding: 8px 10px;
  }

  .mmo-premium-sub {
    display: none;
  }

  .mmo-section-label {
    margin-top: 9px;
  }

  .mmo-nav-link {
    min-height: 39px;
  }

  .mmo-nav-icon {
    width: 30px;
    height: 30px;
    flex-basis: 30px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mmo-close,
  .mmo-nav-link {
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
    s.items.reduce((n, item) => n + (item.quantity || 1), 0)
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
            match: (p) => p === '/',
          },
          {
            icon: LayoutGrid,
            label: t('nav.categories'),
            to: '/category/all',
            match: (p) => p.startsWith('/category/'),
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
          { icon: Package, label: t('nav.orders'), to: '/account?tab=orders' },
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
          { icon: Ticket, label: 'Coupons', to: '/search?q=coupon' },
          { icon: User, label: t('nav.account'), to: '/account' },
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

    const onKeyDown = (event) => {
      if (event.key === 'Escape') close();
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      if (!hadOpenClass) {
        root.classList.remove('rx-menu-open');
      }

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
      <style>{CSS}</style>

      <OverlayPortal active={isOpen}>
        <AnimatePresence>
          {isOpen && (
            <div
              className="mmo-root md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
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
                    <span className="mmo-logo-mark">S</span>
                    <span className="mmo-brand-text">
                      SPAC<span className="mmo-brand-accent">ILLY</span>
                    </span>
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
                    onClick={() => {
                      // Connect the existing Premium page or upgrade flow here.
                    }}
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
                      <LogOut size={18} />
                      {isLoggingOut ? 'Logging out…' : 'Logout'}
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="mmo-logout"
                      onClick={close}
                    >
                      <User size={18} />
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
