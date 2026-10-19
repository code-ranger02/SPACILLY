
import { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import OverlayPortal from '../OverlayPortal';
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

import { useTranslation } from '../../i18n/useTranslation';
import { useMobileMenuOverlay } from '../../stores/mobileMenuOverlayStore';
import { useAuthStore } from '../../stores/authStore';
import { useBuyerCart } from '../../stores/buyerCartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useNotificationStore } from '../../stores/notificationStore';
import '../../styles/mobile-menu-overlay.css';

const EASE = [0.22, 1, 0.36, 1];

function NavItem({ icon: Icon, label, to, badge, active, onNavigate }) {
  return (
    <li>
      <Link
        to={to}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        className={`mmo-nav-link${active ? ' mmo-nav-link--active' : ''}`}
      >
        <span className="mmo-nav-icon" aria-hidden="true">
          <Icon size={20} strokeWidth={1.75} />
        </span>

        <span className="mmo-nav-label">{label}</span>

        {badge > 0 && (
          <span className="mmo-nav-badge">
            {badge > 99 ? '99+' : badge}
          </span>
        )}

        <ChevronRight
          className="mmo-nav-chevron"
          size={16}
          strokeWidth={2}
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

  const cartCount = useBuyerCart((s) =>
    s.items.reduce((n, item) => n + (item.quantity || 1), 0)
  );

  const wishlistCount = useWishlistStore((s) => s.items.length);
  const messageCount = useNotificationStore((s) => s.unreadMessageCount);
  const dragControls = useDragControls();

  const onNavigate = () => close();

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
            match: (pathname) =>
              pathname === '/category/all' ||
              (pathname.startsWith('/category/') &&
                pathname !== '/category/all'),
          },
          {
            icon: Store,
            label: t('footer.links.shop.allProducts'),
            to: '/category/all',
            match: () => false,
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
            to: '/account',
            match: () => false,
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

    document.documentElement.classList.add('rx-menu-open');

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') close();
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.documentElement.classList.remove('rx-menu-open');
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, close]);

  const isItemActive = (item) => {
    if (item.match) return item.match(location.pathname);

    const [path, query] = item.to.split('?');

    if (location.pathname !== path) return false;

    if (!query) {
      return !location.search && item.to !== '/account';
    }

    return location.search === `?${query}`;
  };

  return (
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
              transition={{ duration: 0.22, ease: EASE }}
              onClick={close}
            />

            <motion.aside
              className="mmo-panel"
              initial={{ x: '-100%', opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 0.28, ease: EASE }}
              drag="x"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ left: -120, right: 0 }}
              dragElastic={0.08}
              onDragEnd={(_, info) => {
                if (info.offset.x < -72 || info.velocity.x < -400) {
                  close();
                }
              }}
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
                  <X size={20} strokeWidth={1.85} />
                </button>
              </header>

              <Link
                to={user ? '/account' : '/login'}
                onClick={onNavigate}
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
                      <Crown size={11} />
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
                  <p className="mmo-premium-title">Upgrade to Premium</p>
                  <p className="mmo-premium-sub">
                    Free shipping, exclusive deals &amp; more
                  </p>
                </div>

                <button
                  type="button"
                  className="mmo-premium-cta"
                  onClick={() => {
                    close();
                    // Connect this to your existing premium route/action.
                  }}
                >
                  Upgrade
                </button>
              </div>

              <nav className="mmo-scroll" aria-label="Main navigation">
                {navSections.map((section) => (
                  <section
                    className="mmo-nav-section"
                    key={section.label}
                  >
                    <p className="mmo-section-label">{section.label}</p>

                    <ul className="mmo-nav-list">
                      {section.items.map((item) => (
                        <NavItem
                          key={`${item.to}-${item.label}`}
                          icon={item.icon}
                          label={item.label}
                          to={item.to}
                          badge={item.badge || 0}
                          active={isItemActive(item)}
                          onNavigate={onNavigate}
                        />
                      ))}
                    </ul>
                  </section>
                ))}
              </nav>

              <footer className="mmo-footer">
                <button
                  type="button"
                  className="mmo-logout"
                  onClick={async () => {
                    close();
                    await signOut();
                  }}
                >
                  <LogOut size={18} strokeWidth={1.75} />
                  Logout
                </button>
              </footer>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </OverlayPortal>
  );
}
