/**
 * Seller marketing / info pages that use BuyerLayout and should keep
 * storefront navbar + mobile bottom nav (not hidden like /seller/* dashboard).
 */
export const SELLER_PATHS_WITH_BUYER_NAV = [
  '/seller/advertise',
  '/seller/fees',
  '/seller/guidelines',
];

export function isSellerPathWithBuyerNav(pathname) {
  return SELLER_PATHS_WITH_BUYER_NAV.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/** Prefixes where mobile bottom nav + menu overlay are hidden. */
export const NO_BUYER_BOTTOM_NAV_PREFIXES = [
  '/checkout',
  '/auth',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/verify-otp',
  '/select-role',
  '/auth/google',
  '/approve-device-success',
  '/onboarding',
  '/seller',
  '/admin',
  '/dashboard',
];

/** @deprecated Use NO_BUYER_BOTTOM_NAV_PREFIXES */
export const NO_BUYER_CHROME_PREFIXES = NO_BUYER_BOTTOM_NAV_PREFIXES;

/** Prefixes where the storefront Navbar is hidden. */
export const NO_BUYER_NAVBAR_PREFIXES = [
  '/checkout',
  '/seller',
  '/admin',
  '/dashboard',
];

/** Full-page auth flows (navbar shown on desktop only). */
export const AUTH_ROUTE_PREFIXES = [
  '/auth',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/verify-email-pending',
  '/verify-otp',
  '/select-role',
  '/auth/google',
  '/auth/approve-device-success',
];

function matchesChromeHidePrefix(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isAuthRoute(pathname) {
  return AUTH_ROUTE_PREFIXES.some((p) => matchesChromeHidePrefix(pathname, p));
}

/** Account settings — distraction-free (no storefront navbar / bottom nav). */
export function isAccountSettingsRoute(pathname, search = '') {
  if (pathname !== '/account') return false;
  const tab = new URLSearchParams(search).get('tab');
  return tab === 'settings';
}

/** Category browse — own top bar + search; hide storefront header. */
export function isCategoryBrowseRoute(pathname) {
  if (pathname === '/category/all') return false;
  return pathname === '/category' || pathname.startsWith('/category/');
}

/** Product detail — own mobile top bar; hide storefront header. */
export function isProductDetailRoute(pathname) {
  return pathname.startsWith('/product/') || pathname.startsWith('/products/');
}

export function isBuyerHeaderHidden(pathname) {
  return isCategoryBrowseRoute(pathname) || isProductDetailRoute(pathname);
}

/** Hide mobile bottom nav and related chrome on these routes. */
export function isBuyerBottomNavHidden(pathname, search = '') {
  if (isSellerPathWithBuyerNav(pathname)) return false;
  if (isAccountSettingsRoute(pathname, search)) return true;
  return NO_BUYER_BOTTOM_NAV_PREFIXES.some((p) => matchesChromeHidePrefix(pathname, p));
}

/** Hide GlobalNavbar on these routes (auth flows are fully chrome-free). */
export function isBuyerNavbarHidden(pathname, search = '') {
  if (isAuthRoute(pathname)) return true;
  if (isSellerPathWithBuyerNav(pathname)) return false;
  if (isBuyerHeaderHidden(pathname)) return true;
  if (isAccountSettingsRoute(pathname, search)) return true;
  return NO_BUYER_NAVBAR_PREFIXES.some((p) => matchesChromeHidePrefix(pathname, p));
}

/** Viewport-aware navbar visibility (auth always hidden). */
export function isBuyerNavbarHiddenOnViewport(pathname, search = '', isMobile = false) {
  void isMobile;
  return isBuyerNavbarHidden(pathname, search);
}

/** @deprecated Alias for bottom-nav hiding */
export function isBuyerChromeHidden(pathname, search = '') {
  return isBuyerBottomNavHidden(pathname, search);
}
