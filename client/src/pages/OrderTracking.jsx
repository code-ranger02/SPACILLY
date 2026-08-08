import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Truck,
  ArrowLeft,
  Copy,
  Loader2,
  Search,
  Info,
  MapPin,
  Phone,
} from 'lucide-react';
import BuyerLayout from '../components/buyer/BuyerLayout';
import { useToastStore } from '../stores/toastStore';
import { useAuthStore } from '../stores/authStore';
import { orderAPI } from '../services/api';
import { SERVER_URL } from '../lib/config';
import { formatOrderMoney } from '../lib/formatOrderMoney';
import '../styles/order-tracking.css';

const SUCCESS = 'var(--text-in-stock)';

const STATUS_STEP_INDEX = {
  pending: 0,
  processing: 1,
  packed: 1,
  paid: 1,
  shipped: 3,
  delivered: 4,
  completed: 4,
  cancelled: -1,
};

const STATUS_COPY = {
  pending: { headline: 'Order received', badge: 'Processing' },
  processing: { headline: 'We\'re preparing your order', badge: 'Processing' },
  packed: { headline: 'Your order is packed', badge: 'Packed' },
  paid: { headline: 'Payment confirmed', badge: 'Processing' },
  shipped: { headline: 'Order is on the way', badge: 'In transit' },
  delivered: { headline: 'Order delivered', badge: 'Delivered' },
  completed: { headline: 'Order complete', badge: 'Complete' },
  cancelled: { headline: 'Order cancelled', badge: 'Cancelled' },
};

const TIMELINE_DEFS = [
  { key: 'placed', label: 'Order created' },
  { key: 'packed', label: 'Packed' },
  { key: 'courier', label: 'Handed to courier' },
  { key: 'transit', label: 'In transit' },
  { key: 'arrived', label: 'Order arrived' },
];

function resolveImg(src) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  return `${SERVER_URL}${src}`;
}

function normalizeOrder(data) {
  const o = data?.order || data;
  if (!o) return null;
  const currency = o.currency || o.payment?.currency || 'RWF';
  const addr = o.shipping_address || o.shippingAddress || {};
  return {
    ...o,
    id: o.id || o._id,
    order_number: o.order_number || o.orderNumber,
    status: String(o.status || 'processing').toLowerCase(),
    tracking_number: o.tracking_number || o.trackingNumber,
    can_confirm_receipt: o.can_confirm_receipt ?? o.canConfirmReceipt,
    payment_method: o.payment_method || o.paymentMethod,
    subtotal: o.subtotal,
    shipping: o.shipping,
    tax: o.tax,
    total: o.total,
    currency,
    items: o.items || [],
    timeline: o.timeline || [],
    carrier: o.carrier || o.fulfillment?.carrier || 'Spacilly Express',
    estimated_delivery: o.estimated_delivery || o.estimatedDelivery,
    estimated_delivery_to: o.estimated_delivery_to || o.estimatedDeliveryTo,
    shipping_address: {
      fullName: addr.fullName || addr.name,
      address: addr.address || addr.street,
      city: addr.city,
      country: addr.country,
      postalCode: addr.postalCode || addr.zip,
      phone: addr.phone,
    },
  };
}

function formatEtaRange(order) {
  const from = order?.estimated_delivery;
  const to = order?.estimated_delivery_to;
  const fmt = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  const a = fmt(from);
  const b = fmt(to);
  if (a && b && a !== b) return `Estimated arrival ${a} – ${b}`;
  if (a) return `Estimated arrival ${a}`;
  if (b) return `Estimated arrival by ${b}`;
  return 'Delivery estimate will appear once shipped';
}

function formatAddress(addr) {
  if (!addr) return '—';
  const parts = [addr.address, addr.city, addr.country].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
}

function itemLineTotal(item, currency) {
  const raw = item.total ?? (item.price != null ? item.price * (item.quantity || 1) : null);
  if (raw == null) return null;
  return formatOrderMoney(raw, currency);
}

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.showToast);
  const user = useAuthStore((s) => s.user);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [guestMode, setGuestMode] = useState(!user && !orderId);
  const [guestForm, setGuestForm] = useState({ orderNumber: '', email: '', phone: '' });
  const [guestSearching, setGuestSearching] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      setGuestMode(!user);
      return;
    }
    if (!user) {
      setGuestMode(true);
      setGuestForm((f) => ({ ...f, orderNumber: orderId }));
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setLoadError(null);
      const data = await orderAPI.getById(orderId);
      setOrder(normalizeOrder(data));
      setGuestMode(false);
    } catch (err) {
      setLoadError(err?.response?.data?.message || 'Could not load order');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId, user]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const searchGuestOrder = async (e) => {
    e?.preventDefault();
    const num = guestForm.orderNumber.trim();
    const email = guestForm.email.trim();
    const phone = guestForm.phone.trim();
    if (!num || (!email && !phone)) {
      showToast('Enter order number and email or phone', 'error');
      return;
    }
    setGuestSearching(true);
    setLoadError(null);
    try {
      const data = await orderAPI.trackByNumber(num, { email: email || undefined, phone: phone || undefined });
      setOrder(normalizeOrder(data));
      setGuestMode(false);
      navigate(`/track/${encodeURIComponent(num)}`, { replace: true });
    } catch (err) {
      setLoadError(err?.response?.data?.message || 'Order not found. Check your details.');
      setOrder(null);
    } finally {
      setGuestSearching(false);
    }
  };

  const displayOrderId = order?.order_number || orderId || guestForm.orderNumber || '—';
  const status = String(order?.status || 'processing').toLowerCase();
  const isCod = String(order?.payment_method || '').toLowerCase().includes('cash');
  const isDelivered = status === 'delivered' || status === 'completed';
  const canConfirm = Boolean(order?.can_confirm_receipt) && user;
  const currentStepIndex = STATUS_STEP_INDEX[status] ?? 1;
  const trackingNumber = order?.tracking_number || '—';
  const mongoId = String(order?.id || orderId || '');
  const statusCopy = STATUS_COPY[status] || STATUS_COPY.processing;

  const timelineSteps = useMemo(() => {
    const apiTimeline = Array.isArray(order?.timeline) ? order.timeline : [];

    return TIMELINE_DEFS.map((step, idx) => {
      const match = apiTimeline.find((t) => {
        const s = String(t.status || t.label || '').toLowerCase();
        if (step.key === 'placed') return s.includes('place') || s.includes('pending');
        if (step.key === 'packed') return s.includes('pack') || s.includes('process');
        if (step.key === 'courier') return s.includes('courier') || s.includes('hand');
        if (step.key === 'transit') return s.includes('ship') || s.includes('transit') || s.includes('way');
        if (step.key === 'arrived') return s.includes('deliver') || s.includes('arriv');
        return false;
      });

      const done = status === 'cancelled' ? idx === 0 : idx <= currentStepIndex;
      const active = status !== 'cancelled' && idx === currentStepIndex;
      const pending = !done && !active;

      let date = '—';
      if (match?.date) {
        date = new Date(match.date).toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } else if (active) {
        date = match?.location || match?.note || 'In progress';
      }

      let sub = '';
      if (step.key === 'arrived' && isCod && done) sub = 'Have exact cash ready for the driver.';
      if (step.key === 'arrived' && canConfirm && active) sub = 'Confirm receipt when you have your package.';

      return { ...step, date, done, active, pending, sub };
    });
  }, [order, status, currentStepIndex, canConfirm, isCod]);

  const copyText = (text, label) => {
    if (!text || text === '—') return;
    navigator.clipboard.writeText(text);
    showToast(`${label} copied`, 'success', 2000);
  };

  const handleConfirmDelivery = async () => {
    const id = mongoId;
    try {
      setConfirmLoading(true);
      await orderAPI.confirmReceipt(id);
      setConfirmSuccess(true);
      showToast(isCod ? 'Delivery confirmed. Thank you!' : 'Delivery confirmed — seller notified.', 'success');
      await loadOrder();
      setTimeout(() => {
        setConfirmModal(false);
        setConfirmSuccess(false);
      }, 1800);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Could not confirm delivery', 'error');
    } finally {
      setConfirmLoading(false);
    }
  };

  const firstItem = order?.items?.[0];
  const backHref = user ? '/account?tab=orders' : '/';
  const carrierLabel = order?.carrier || 'Standard courier';
  const recipientName = order?.shipping_address?.fullName || 'Recipient';
  const addressLine = formatAddress(order?.shipping_address);
  const supportPhone = order?.shipping_address?.phone;

  if (loading) {
    return (
      <BuyerLayout>
        <div className="ot-loading">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--sp-primary-container)' }} />
        </div>
      </BuyerLayout>
    );
  }

  if (guestMode && !order) {
    return (
      <BuyerLayout>
        <div className="ot-page ot-page--guest">
          <div className="ot-guest">
            <Link to="/" className="ot-topbar__btn" style={{ width: 'auto', paddingRight: 12 }} aria-label="Back home">
              <ArrowLeft size={20} strokeWidth={1.75} />
            </Link>
            <h1 className="ot-guest__title">Track your order</h1>
            <p className="ot-guest__sub">
              Enter your order number and the email or phone used at checkout.
            </p>
            <form onSubmit={searchGuestOrder} className="ot-card" style={{ padding: 16 }}>
              <label className="ot-field">
                <span className="ot-field__label">Order number</span>
                <input
                  required
                  value={guestForm.orderNumber}
                  onChange={(e) => setGuestForm((f) => ({ ...f, orderNumber: e.target.value }))}
                  placeholder="e.g. ORD-20260808-001"
                  className="ot-field__input"
                />
              </label>
              <label className="ot-field">
                <span className="ot-field__label">Email</span>
                <input
                  type="email"
                  value={guestForm.email}
                  onChange={(e) => setGuestForm((f) => ({ ...f, email: e.target.value }))}
                  className="ot-field__input"
                  placeholder="Optional if phone provided"
                />
              </label>
              <label className="ot-field">
                <span className="ot-field__label">Phone</span>
                <input
                  value={guestForm.phone}
                  onChange={(e) => setGuestForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+250..."
                  className="ot-field__input"
                />
              </label>
              {loadError && <p className="ot-error">{loadError}</p>}
              <button type="submit" disabled={guestSearching} className="ot-btn ot-btn--primary">
                {guestSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search size={16} />}
                Track order
              </button>
            </form>
            <p className="ot-guest__sub" style={{ textAlign: 'center', marginTop: 20 }}>
              Have an account?{' '}
              <Link to="/auth?tab=login" style={{ color: 'var(--sp-primary-container)', fontWeight: 600 }}>
                Sign in
              </Link>{' '}
              for full order history.
            </p>
          </div>
        </div>
      </BuyerLayout>
    );
  }

  if (loadError || !order) {
    return (
      <BuyerLayout>
        <div className="ot-page ot-page--guest">
          <div className="ot-guest" style={{ textAlign: 'center', paddingTop: 48 }}>
            <p style={{ color: 'var(--text-muted)' }}>{loadError || 'Order not found'}</p>
            <div className="ot-actions" style={{ marginTop: 20 }}>
              <button
                type="button"
                onClick={() => { setGuestMode(true); setLoadError(null); }}
                className="ot-btn ot-btn--primary"
              >
                Try guest tracking
              </button>
              <Link to="/account?tab=orders" className="ot-btn ot-btn--ghost">
                My orders
              </Link>
            </div>
          </div>
        </div>
      </BuyerLayout>
    );
  }

  const badgeClass =
    status === 'delivered' || status === 'completed'
      ? 'ot-badge ot-badge--delivered'
      : status === 'cancelled'
        ? 'ot-badge ot-badge--cancelled'
        : 'ot-badge';

  return (
    <BuyerLayout>
      <div className="ot-page">
        <header className="ot-topbar">
          <Link to={backHref} className="ot-topbar__btn" aria-label="Go back">
            <ArrowLeft size={22} strokeWidth={1.75} />
          </Link>
          <h1 className="ot-topbar__title">Order tracking</h1>
          <Link to="/help/orders-tracking/how-to-track-my-order" className="ot-topbar__btn" aria-label="Tracking help">
            <Info size={22} strokeWidth={1.75} />
          </Link>
        </header>

        <div className="ot-status-hero">
          <h2 className="ot-status-hero__title">{statusCopy.headline}</h2>
          <p className="ot-status-hero__eta">{formatEtaRange(order)}</p>
          {isCod && (
            <p className="ot-status-hero__eta" style={{ marginTop: 4 }}>
              Cash on delivery — pay when you receive your package.
            </p>
          )}
        </div>

        <div className="ot-shell">
          {firstItem && (
            <article className="ot-card ot-product">
              {firstItem.product_image ? (
                <img
                  src={resolveImg(firstItem.product_image)}
                  alt=""
                  className="ot-product__img"
                />
              ) : (
                <div className="ot-product__img" aria-hidden />
              )}
              <div className="ot-product__body">
                <p className="ot-product__name">{firstItem.product_title || firstItem.name}</p>
                <p className="ot-product__meta">
                  {firstItem.quantity || 1} item{(firstItem.quantity || 1) > 1 ? 's' : ''}
                </p>
                {itemLineTotal(firstItem, order.currency) && (
                  <p className="ot-product__price">{itemLineTotal(firstItem, order.currency)}</p>
                )}
              </div>
              <span className={badgeClass}>{statusCopy.badge}</span>
            </article>
          )}

          <article className="ot-card ot-ids">
            <div className="ot-id-row">
              <div>
                <span className="ot-id-row__label">Order no.</span>
                <p className="ot-id-row__value">#{displayOrderId}</p>
              </div>
              <button
                type="button"
                className="ot-id-row__copy"
                onClick={() => copyText(displayOrderId, 'Order number')}
                aria-label="Copy order number"
              >
                <Copy size={16} strokeWidth={1.75} />
              </button>
            </div>
            <div className="ot-id-row">
              <div>
                <span className="ot-id-row__label">
                  Tracking no. ({carrierLabel})
                </span>
                <p className="ot-id-row__value">{trackingNumber}</p>
              </div>
              <button
                type="button"
                className="ot-id-row__copy"
                onClick={() => copyText(trackingNumber, 'Tracking number')}
                aria-label="Copy tracking number"
                disabled={trackingNumber === '—'}
              >
                <Copy size={16} strokeWidth={1.75} />
              </button>
            </div>
          </article>

          <article className="ot-card ot-map" aria-label="Delivery route map">
            <svg className="ot-map__route" viewBox="0 0 400 168" preserveAspectRatio="none" aria-hidden>
              <path
                d="M48 120 C 90 80, 130 140, 180 90 S 280 60, 340 100"
                fill="none"
                stroke="var(--sp-primary-container, #d7193f)"
                strokeWidth="3"
                strokeDasharray="6 8"
                strokeLinecap="round"
              />
              <circle cx="48" cy="120" r="7" fill="var(--sp-primary-container, #d7193f)" />
              <circle cx="340" cy="100" r="7" fill="var(--sp-primary-container, #d7193f)" />
            </svg>
            <div className="ot-map__overlay">
              <p className="ot-map__overlay-title">Track your order</p>
              {trackingNumber !== '—' ? (
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(`${carrierLabel} ${trackingNumber}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ot-map__overlay-btn"
                >
                  View details
                </a>
              ) : (
                <span className="ot-map__overlay-btn" style={{ opacity: 0.6 }}>
                  Pending
                </span>
              )}
            </div>
          </article>

          <article className="ot-card ot-timeline-card">
            <h3 className="ot-section-title">Shipping history</h3>
            <ol className="ot-timeline">
              {timelineSteps.map((step) => (
                <li
                  key={step.key}
                  className={[
                    'ot-timeline__item',
                    step.done ? 'ot-timeline__item--done' : '',
                    step.active ? 'ot-timeline__item--active' : '',
                    step.pending ? 'ot-timeline__item--pending' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <div className="ot-timeline__dot">
                    {step.done && !step.active ? (
                      <Check size={14} strokeWidth={2.5} />
                    ) : step.active ? (
                      <span className="ot-timeline__dot-inner" />
                    ) : null}
                  </div>
                  <div>
                    <div className="ot-timeline__label-row">
                      <p className="ot-timeline__label">{step.label}</p>
                      {step.active && <span className="ot-timeline__now">Current</span>}
                    </div>
                    <p className="ot-timeline__meta">{step.date}</p>
                    {step.sub && <p className="ot-timeline__sub">{step.sub}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </article>

          <article className="ot-card">
            <div className="ot-info-row">
              <span className="ot-info-row__icon">
                <Truck size={18} strokeWidth={1.75} />
              </span>
              <div className="ot-info-row__body">
                <span className="ot-info-row__label">Courier</span>
                <p className="ot-info-row__value">{carrierLabel}</p>
              </div>
              {supportPhone ? (
                <a href={`tel:${supportPhone}`} className="ot-info-row__action" aria-label="Call courier">
                  <Phone size={16} strokeWidth={1.75} />
                </a>
              ) : (
                <span className="ot-info-row__action" style={{ opacity: 0.35, pointerEvents: 'none' }}>
                  <Phone size={16} strokeWidth={1.75} />
                </span>
              )}
            </div>
          </article>

          <article className="ot-card">
            <div className="ot-info-row">
              <span className="ot-info-row__icon">
                <MapPin size={18} strokeWidth={1.75} />
              </span>
              <div className="ot-info-row__body">
                <span className="ot-info-row__label">Delivery address</span>
                <p className="ot-info-row__value">{recipientName}</p>
                <p className="ot-info-row__sub">{addressLine}</p>
              </div>
            </div>
          </article>

          {Number(order?.total) > 0 && (
            <article className="ot-card" style={{ padding: '14px 16px' }}>
              <span className="ot-info-row__label">Order total</span>
              <p className="ot-info-row__value" style={{ marginTop: 4 }}>
                {formatOrderMoney(order.total, order.currency)}
              </p>
              {!isCod && String(order.payment_method || '').toLowerCase() !== 'cash_on_delivery' && (
                <p className="ot-info-row__sub" style={{ marginTop: 6 }}>
                  Paid online — funds held in escrow until you confirm delivery.
                </p>
              )}
            </article>
          )}

          <div className="ot-actions">
            {user ? (
              <button
                type="button"
                onClick={() => canConfirm && setConfirmModal(true)}
                disabled={!canConfirm || confirmLoading}
                className={`ot-btn ${canConfirm ? 'ot-btn--success' : 'ot-btn--primary'}`}
              >
                {confirmLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check size={16} strokeWidth={2} />
                )}
                {canConfirm ? 'I received my order' : isDelivered ? 'Already confirmed' : 'Confirm when delivered'}
              </button>
            ) : (
              <Link
                to={`/auth?tab=login&redirect=${encodeURIComponent(`/track/${orderId || displayOrderId}`)}`}
                className="ot-btn ot-btn--primary"
              >
                Sign in to confirm delivery
              </Link>
            )}

            {user && mongoId && (
              <Link to={`/returns?order=${mongoId}`} className="ot-btn ot-btn--danger-outline">
                Problem with this order?
              </Link>
            )}

            <Link to="/contact" className="ot-btn ot-btn--ghost">
              Contact support
            </Link>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {confirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ot-modal-backdrop"
            onClick={() => !confirmSuccess && !confirmLoading && setConfirmModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="ot-modal"
              onClick={(e) => e.stopPropagation()}
            >
              {!confirmSuccess ? (
                <>
                  <p className="ot-modal__title">Did you receive your order?</p>
                  <p className="ot-modal__text">
                    Order #{displayOrderId}
                    {isCod
                      ? ' — you should have paid cash to the driver.'
                      : ' — payment will be released to the seller.'}
                  </p>
                  <div className="ot-modal__actions">
                    <button
                      type="button"
                      disabled={confirmLoading}
                      onClick={() => setConfirmModal(false)}
                      className="ot-btn ot-btn--ghost"
                    >
                      Not yet
                    </button>
                    <button
                      type="button"
                      disabled={confirmLoading}
                      onClick={handleConfirmDelivery}
                      className="ot-btn ot-btn--primary"
                    >
                      {confirmLoading ? 'Confirming…' : 'Yes, received'}
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '9999px',
                      background: SUCCESS,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <Check className="w-7 h-7 text-white" strokeWidth={3} />
                  </div>
                  <p className="ot-modal__title">Thank you!</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </BuyerLayout>
  );
}
