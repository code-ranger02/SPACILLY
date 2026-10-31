
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import {
  ShoppingCart,
  Search,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Filter,
  Printer,
  Upload,
  X,
  MapPin,
  CreditCard,
  User,
  Calendar,
  Clock,
  RefreshCw,
  ArrowUpRight,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Download,
  ClipboardList,
  PackageCheck,
  AlertCircle,
  RotateCcw,
  SlidersHorizontal,
  Mail,
  Phone,
  Hash,
  Receipt,
  Loader2,
  Check,
  Boxes,
  CircleDollarSign,
  ArrowDownWideNarrow,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

import SellerGuidancePanel from '@/components/seller/SellerGuidancePanel';

import { API_BASE_URL } from '@/lib/config';
import { useToastStore } from '@/stores/toastStore';

const SELLER_ORDERS_API = `${API_BASE_URL}/seller/orders`;

// --------------------------------------------------
// TYPES
// --------------------------------------------------

type OrderStatus =
  | 'pending'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  variant?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  status: OrderStatus;
  date: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
  timeline: {
    status: string;
    date: string;
    time: string;
  }[];
}

type SortOption =
  | 'newest'
  | 'oldest'
  | 'highest'
  | 'lowest';

const STATUS_OPTIONS: OrderStatus[] = [
  'pending',
  'processing',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
];

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount) || 0);

const formatDate = (date: string) => {
  if (!date) return 'Date unavailable';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return date;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
};

const getInitials = (name: string) =>
  (name || 'Customer')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const escapeHtml = (value: string) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char] || char);

const getStatusConfig = (status: OrderStatus) => {
  const configs = {
    pending: {
      label: 'Pending',
      icon: Clock,
      className:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
      dot: 'bg-amber-500',
    },
    processing: {
      label: 'Processing',
      icon: Package,
      className:
        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
      dot: 'bg-blue-500',
    },
    packed: {
      label: 'Packed',
      icon: PackageCheck,
      className:
        'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20',
      dot: 'bg-violet-500',
    },
    shipped: {
      label: 'Shipped',
      icon: Truck,
      className:
        'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
      dot: 'bg-indigo-500',
    },
    delivered: {
      label: 'Delivered',
      icon: CheckCircle,
      className:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
      dot: 'bg-emerald-500',
    },
    cancelled: {
      label: 'Cancelled',
      icon: XCircle,
      className:
        'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
      dot: 'bg-red-500',
    },
  };

  return configs[status] || configs.pending;
};

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getErrorMessage = async (
  response: Response,
  fallback: string,
) => {
  const data = await response.json().catch(() => null);
  return data?.message || fallback;
};

// --------------------------------------------------
// COMPONENTS
// --------------------------------------------------

const StatusBadge = ({
  status,
}: {
  status: OrderStatus;
}) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
};

const MetricCard = ({
  title,
  value,
  description,
  icon: Icon,
  color,
  loading,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  color: string;
  loading: boolean;
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
    <div className="flex items-start justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>

        <div className="mt-3">
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
          ) : (
            <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {value}
            </p>
          )}
        </div>

        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>

      <div className={`rounded-xl p-3 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

// --------------------------------------------------
// MAIN PAGE
// --------------------------------------------------

const OrdersPage: React.FC = () => {
  const showToast = useToastStore((s) => s.showToast);
  const navigate = useNavigate();

  // Data
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Selection
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<OrderStatus | ''>('');

  // Dialogs
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showBulkShippingModal, setShowBulkShippingModal] = useState(false);

  // Form state
  const [trackingNumber, setTrackingNumber] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [bulkCarrier, setBulkCarrier] = useState<'ups' | 'fedex' | 'dhl'>('ups');

  // Operation state
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  // ------------------------------------------------
  // FETCH ORDERS
  // ------------------------------------------------

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(SELLER_ORDERS_API, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.status === 401 || response.status === 403) {
        navigate(response.status === 401 ? '/login' : '/');
        return;
      }

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, 'Unable to load orders.')
        );
      }

      const data = await response.json();

      const mapped: Order[] = (data.orders || []).map((o: any) => ({
        id: String(o._id || ''),
        orderNumber: o.orderNumber || 'N/A',
        customer: o.customer || 'Unknown customer',
        customerEmail: o.customerEmail || '',
        customerPhone: o.customerPhone || '',

        items: (o.items || []).map((item: any, index: number) => ({
          id: String(item._id || item.productId || index),
          name: item.name || 'Unnamed product',
          quantity: Number(item.quantity) || 0,
          price: Number(item.price) || 0,
          variant: item.variant,
        })),

        subtotal: Number(o.subtotal) || 0,
        shipping: Number(o.shipping) || 0,
        tax: Number(o.tax) || 0,
        total: Number(o.total) || 0,

        status: STATUS_OPTIONS.includes(o.status)
          ? o.status
          : 'pending',

        date: o.date || '',

        shippingAddress: {
          name: o.shippingAddress?.name || '',
          street: o.shippingAddress?.street || '',
          city: o.shippingAddress?.city || '',
          state: o.shippingAddress?.state || '',
          zip: o.shippingAddress?.zip || '',
          country: o.shippingAddress?.country || '',
        },

        paymentMethod: o.paymentMethod || 'Not specified',
        trackingNumber: o.trackingNumber || '',

        timeline: (o.timeline || []).map((t: any) => ({
          status: t.status || '',
          date: t.date || '',
          time: t.time || '',
        })),
      }));

      setOrders(mapped);
    } catch (err) {
      console.error('Orders fetch failed:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while loading orders.'
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ------------------------------------------------
  // METRICS
  // ------------------------------------------------

  const metrics = useMemo(() => {
    const revenue = orders
      .filter((order) => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0);

    const pending = orders.filter(
      (order) => order.status === 'pending'
    ).length;

    const processing = orders.filter(
      (order) =>
        order.status === 'processing' ||
        order.status === 'packed'
    ).length;

    const delivered = orders.filter(
      (order) => order.status === 'delivered'
    ).length;

    return {
      total: orders.length,
      revenue,
      pending,
      processing,
      delivered,
    };
  }, [orders]);

  // ------------------------------------------------
  // FILTER + SORT
  // ------------------------------------------------

  const filteredOrders = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    return orders
      .filter((order) => {
        const matchesSearch =
          !query ||
          order.orderNumber.toLowerCase().includes(query) ||
          order.customer.toLowerCase().includes(query) ||
          order.customerEmail.toLowerCase().includes(query) ||
          order.items.some((item) =>
            item.name.toLowerCase().includes(query)
          );

        const matchesStatus =
          statusFilter === 'all' ||
          order.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'oldest':
            return new Date(a.date).getTime() -
              new Date(b.date).getTime();

          case 'highest':
            return b.total - a.total;

          case 'lowest':
            return a.total - b.total;

          default:
            return new Date(b.date).getTime() -
              new Date(a.date).getTime();
        }
      });
  }, [orders, searchTerm, statusFilter, sortBy]);

  const selectedOrders = useMemo(
    () => orders.filter((order) =>
      selectedOrderIds.includes(order.id)
    ),
    [orders, selectedOrderIds]
  );

  const allVisibleSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((order) =>
      selectedOrderIds.includes(order.id)
    );

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: orders.length,
    };

    STATUS_OPTIONS.forEach((status) => {
      counts[status] = orders.filter(
        (order) => order.status === status
      ).length;
    });

    return counts;
  }, [orders]);

  // ------------------------------------------------
  // SELECTION
  // ------------------------------------------------

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const handleSelectAll = () => {
    if (allVisibleSelected) {
      const visibleIds = filteredOrders.map((o) => o.id);

      setSelectedOrderIds((previous) =>
        previous.filter((id) => !visibleIds.includes(id))
      );
    } else {
      setSelectedOrderIds((previous) => [
        ...new Set([
          ...previous,
          ...filteredOrders.map((o) => o.id),
        ]),
      ]);
    }
  };

  const clearSelection = () => {
    setSelectedOrderIds([]);
    setBulkStatus('');
  };

  // ------------------------------------------------
  // ORDER STATUS UPDATE
  // ------------------------------------------------

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    reason?: string
  ) => {
    const response = await fetch(
      `${SELLER_ORDERS_API}/${orderId}/status`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          status,
          ...(reason ? { reason } : {}),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(response, 'Unable to update order.')
      );
    }
  };

  const handleMarkAsPacked = async (orderId: string) => {
    try {
      setActionLoading(orderId);

      await updateOrderStatus(orderId, 'packed');

      showToast('Order marked as packed.', 'success');

      await fetchOrders();

      setSelectedOrder((previous) =>
        previous?.id === orderId
          ? { ...previous, status: 'packed' }
          : previous
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Update failed.',
        'error'
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ------------------------------------------------
  // TRACKING
  // ------------------------------------------------

  const openTrackingModal = (order: Order) => {
    setSelectedOrder(order);
    setTrackingNumber(order.trackingNumber || '');
    setShowTrackingModal(true);
  };

  const handleSubmitTracking = async () => {
    if (!selectedOrder || !trackingNumber.trim()) return;

    try {
      setActionLoading(selectedOrder.id);

      const response = await fetch(
        `${SELLER_ORDERS_API}/${selectedOrder.id}/tracking`,
        {
          method: 'PATCH',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({
            trackingNumber: trackingNumber.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, 'Unable to save tracking.')
        );
      }

      showToast('Tracking information saved.', 'success');

      setShowTrackingModal(false);
      setShowOrderDetails(false);
      setTrackingNumber('');

      await fetchOrders();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Tracking update failed.',
        'error'
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ------------------------------------------------
  // CANCEL ORDER
  // ------------------------------------------------

  const openCancelModal = (order: Order) => {
    setSelectedOrder(order);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancelReason.trim()) return;

    try {
      setActionLoading(selectedOrder.id);

      await updateOrderStatus(
        selectedOrder.id,
        'cancelled',
        cancelReason.trim()
      );

      showToast('Order cancelled successfully.', 'success');

      setShowCancelModal(false);
      setShowOrderDetails(false);
      setCancelReason('');

      await fetchOrders();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Cancellation failed.',
        'error'
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ------------------------------------------------
  // BULK STATUS UPDATE
  // ------------------------------------------------

  const handleBatchStatusUpdate = async () => {
    if (!selectedOrderIds.length || !bulkStatus) return;

    try {
      setBulkLoading(true);

      const results = await Promise.allSettled(
        selectedOrderIds.map((id) =>
          updateOrderStatus(id, bulkStatus)
        )
      );

      const succeeded = results.filter(
        (result) => result.status === 'fulfilled'
      ).length;

      const failed = results.length - succeeded;

      await fetchOrders();

      if (failed) {
        showToast(
          `${succeeded} updated. ${failed} failed.`,
          'error'
        );
      } else {
        showToast(
          `${succeeded} orders updated successfully.`,
          'success'
        );
      }

      clearSelection();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Bulk update failed.',
        'error'
      );
    } finally {
      setBulkLoading(false);
    }
  };

  // ------------------------------------------------
  // PRINTING
  // ------------------------------------------------

  const printOrders = (
    ordersToPrint: Order[],
    type: 'invoice' | 'packing'
  ) => {
    if (!ordersToPrint.length) return;

    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      showToast(
        'Please allow pop-ups to print documents.',
        'error'
      );
      return;
    }

    const title = type === 'invoice'
      ? 'Order Invoice'
      : 'Packing Slip';

    const documents = ordersToPrint.map((order) => `
      <section class="document">
        <header>
          <div>
            <h1>${title}</h1>
            <p>Order #${escapeHtml(order.orderNumber)}</p>
          </div>
          <div class="date">${escapeHtml(formatDate(order.date))}</div>
        </header>

        <div class="info">
          <div>
            <h3>Customer</h3>
            <p>${escapeHtml(order.customer)}</p>
            <p>${escapeHtml(order.customerEmail)}</p>
            <p>${escapeHtml(order.customerPhone)}</p>
          </div>

          <div>
            <h3>Shipping Address</h3>
            <p>${escapeHtml(order.shippingAddress.name)}</p>
            <p>${escapeHtml(order.shippingAddress.street)}</p>
            <p>${escapeHtml(order.shippingAddress.city)}, ${escapeHtml(order.shippingAddress.state)} ${escapeHtml(order.shippingAddress.zip)}</p>
            <p>${escapeHtml(order.shippingAddress.country)}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              ${type === 'invoice' ? '<th>Price</th>' : ''}
              <th>Quantity</th>
              ${type === 'invoice' ? '<th>Total</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item) => `
              <tr>
                <td>
                  ${escapeHtml(item.name)}
                  ${item.variant ? `<br><small>${escapeHtml(item.variant)}</small>` : ''}
                </td>
                ${type === 'invoice' ? `<td>${formatMoney(item.price)}</td>` : ''}
                <td>${item.quantity}</td>
                ${type === 'invoice' ? `<td>${formatMoney(item.price * item.quantity)}</td>` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${type === 'invoice' ? `
          <div class="totals">
            <p>Subtotal: ${formatMoney(order.subtotal)}</p>
            <p>Shipping: ${formatMoney(order.shipping)}</p>
            <p>Tax: ${formatMoney(order.tax)}</p>
            <h2>Total: ${formatMoney(order.total)}</h2>
          </div>
        ` : ''}

        <footer>
          <p>Order ${escapeHtml(order.orderNumber)}</p>
          <p>${type === 'packing' ? 'Please verify all items before dispatch.' : 'Thank you for your purchase.'}</p>
        </footer>
      </section>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #222;
              margin: 35px;
            }
            .document {
              max-width: 850px;
              margin: 0 auto;
              padding: 20px 0;
              page-break-after: always;
            }
            header, .info {
              display: flex;
              justify-content: space-between;
              gap: 30px;
              margin-bottom: 30px;
            }
            h1 { font-size: 28px; }
            h3 { font-size: 13px; color: #666; }
            p { font-size: 13px; line-height: 1.5; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 25px;
            }
            th, td {
              padding: 12px;
              border-bottom: 1px solid #ddd;
              text-align: left;
              font-size: 13px;
            }
            th { background: #f4f4f4; }
            .totals {
              text-align: right;
              margin-top: 25px;
            }
            footer {
              margin-top: 60px;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
            @media print {
              .document { page-break-after: always; }
            }
          </style>
        </head>
        <body>${documents}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handleBatchPrintInvoices = () => {
    printOrders(selectedOrders, 'invoice');
  };

  const handleBatchPrintPackingSlips = () => {
    printOrders(selectedOrders, 'packing');
  };

  // ------------------------------------------------
  // BULK SHIPPING
  // ------------------------------------------------

  const handleConfirmBulkShipping = async () => {
    if (!selectedOrders.length) return;

    try {
      setBulkLoading(true);

      const response = await fetch(
        `${SELLER_ORDERS_API}/bulk-process`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({
            orderIds: selectedOrders.map((order) => order.id),
            action: 'print_labels',
            carrier: bulkCarrier,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, 'Unable to generate labels.')
        );
      }

      const data = await response.json();

      showToast(
        `Shipping labels queued for ${data.processed ?? selectedOrders.length} orders.`,
        'success'
      );

      setShowBulkShippingModal(false);

      await fetchOrders();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Shipping failed.',
        'error'
      );
    } finally {
      setBulkLoading(false);
    }
  };

  // ------------------------------------------------
  // EMPTY / RESET
  // ------------------------------------------------

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('newest');
  };

  // ------------------------------------------------
  // RENDER
  // ------------------------------------------------

  return (
    <div className="min-h-screen space-y-7 pb-12">

      {/* ============================================
          HEADER
      ============================================ */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Seller Dashboard</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-gray-900 dark:text-white">
              Orders
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Orders
            <span className="ml-3 text-gray-400 dark:text-gray-600">
              ({metrics.total})
            </span>
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Manage customer orders, fulfilment, and deliveries from one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchOrders}
            disabled={loading}
            className="h-10 gap-2 border-gray-200 dark:border-gray-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            onClick={() => navigate('/seller/orders')}
            className="h-10 gap-2 bg-red-500 text-white hover:bg-red-600"
          >
            <ClipboardList className="h-4 w-4" />
            Manage orders
          </Button>
        </div>
      </div>

      {/* ============================================
          GUIDANCE
      ============================================ */}

      <SellerGuidancePanel context="shipping" />

      {/* ============================================
          METRICS
      ============================================ */}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Overview
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              A snapshot of your order activity
            </p>
          </div>

          <span className="text-xs text-gray-400">
            All-time order data
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <MetricCard
            title="Total orders"
            value={metrics.total}
            description="All customer orders"
            icon={ShoppingCart}
            color="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
            loading={loading}
          />

          <MetricCard
            title="Order revenue"
            value={formatMoney(metrics.revenue)}
            description="Excluding cancelled orders"
            icon={CircleDollarSign}
            color="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            loading={loading}
          />

          <MetricCard
            title="Needs attention"
            value={metrics.pending}
            description="Orders waiting for processing"
            icon={AlertCircle}
            color="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            loading={loading}
          />

          <MetricCard
            title="Fulfilled"
            value={metrics.delivered}
            description="Successfully delivered orders"
            icon={PackageCheck}
            color="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
            loading={loading}
          />

        </div>
      </section>

      {/* ============================================
          ORDER STATUS NAVIGATION
      ============================================ */}

      <section>
        <div className="mb-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Order status
          </h2>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">

          {[
            { value: 'all', label: 'All orders' },
            { value: 'pending', label: 'Pending' },
            { value: 'processing', label: 'Processing' },
            { value: 'packed', label: 'Packed' },
            { value: 'shipped', label: 'Shipped' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                statusFilter === tab.value
                  ? 'border-red-500 bg-red-500 text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-600'
              }`}
            >
              {tab.label}

              <span
                className={`rounded-md px-1.5 py-0.5 text-xs ${
                  statusFilter === tab.value
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {statusCounts[tab.value] ?? 0}
              </span>
            </button>
          ))}

        </div>
      </section>

      {/* ============================================
          ORDER MANAGEMENT
      ============================================ */}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

        {/* Section heading */}

        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              All orders
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {filteredOrders.length} matching orders
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="gap-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset filters
            </Button>
          </div>

        </div>

        {/* Search and sorting */}

        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 dark:border-gray-800 md:flex-row md:items-center">

          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search order ID, customer, email or product..."
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-red-400 focus:ring-2 focus:ring-red-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-gray-400" />

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as SortOption)
              }
              className="h-11 min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white md:flex-initial"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest amount</option>
              <option value="lowest">Lowest amount</option>
            </select>
          </div>

        </div>

        {/* ==========================================
            BULK ACTION TOOLBAR
        ========================================== */}

        <AnimatePresence>
          {selectedOrderIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-b border-red-200 bg-red-50/70 dark:border-red-500/20 dark:bg-red-500/5"
            >
              <div className="flex flex-col gap-4 p-4">

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-red-500" />

                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {selectedOrderIds.length} orders selected
                    </span>
                  </div>

                  <button
                    onClick={clearSelection}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-500"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear selection
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBatchPrintInvoices}
                    className="gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Invoices
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBatchPrintPackingSlips}
                    className="gap-2"
                  >
                    <ClipboardList className="h-4 w-4" />
                    Packing slips
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowBulkShippingModal(true)}
                    className="gap-2"
                  >
                    <Truck className="h-4 w-4" />
                    Shipping labels
                  </Button>

                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:justify-end">

                    <select
                      value={bulkStatus}
                      onChange={(e) =>
                        setBulkStatus(e.target.value as OrderStatus | '')
                      }
                      className="h-9 min-w-0 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    >
                      <option value="">Change status...</option>

                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {getStatusConfig(status).label}
                        </option>
                      ))}
                    </select>

                    <Button
                      size="sm"
                      disabled={!bulkStatus || bulkLoading}
                      onClick={handleBatchStatusUpdate}
                      className="bg-red-500 text-white hover:bg-red-600"
                    >
                      {bulkLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==========================================
            ORDERS LIST
        ========================================== */}

        <div className="divide-y divide-gray-100 dark:divide-gray-800">

          {/* Loading */}

          {loading && (
            <div className="space-y-4 p-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse items-center gap-4"
                >
                  <div className="h-11 w-11 rounded-xl bg-gray-100 dark:bg-gray-800" />

                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-gray-100 dark:bg-gray-800" />
                    <div className="h-3 w-48 rounded bg-gray-100 dark:bg-gray-800" />
                  </div>

                  <div className="h-8 w-20 rounded bg-gray-100 dark:bg-gray-800" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}

          {!loading && error && (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="rounded-2xl bg-red-50 p-4 dark:bg-red-500/10">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>

              <h3 className="mt-4 font-bold text-gray-900 dark:text-white">
                Unable to load orders
              </h3>

              <p className="mt-2 max-w-md text-sm text-gray-500">
                {error}
              </p>

              <Button
                onClick={fetchOrders}
                className="mt-5 gap-2 bg-red-500 text-white hover:bg-red-600"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
            </div>
          )}

          {/* Empty state */}

          {!loading && !error && filteredOrders.length === 0 && (
            <div className="flex flex-col items-center px-6 py-16 text-center">

              <div className="rounded-2xl bg-gray-100 p-5 dark:bg-gray-800">
                <ShoppingCart className="h-9 w-9 text-gray-400" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900 dark:text-white">
                {orders.length === 0
                  ? 'No orders yet'
                  : 'No matching orders'}
              </h3>

              <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                {orders.length === 0
                  ? 'Your customer orders will appear here when someone makes a purchase.'
                  : 'Try changing your search or filters to find the order you are looking for.'}
              </p>

              {orders.length > 0 && (
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="mt-5"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}

          {/* Select all */}

          {!loading && !error && filteredOrders.length > 0 && (
            <div className="flex items-center gap-3 bg-gray-50/70 px-5 py-3 dark:bg-gray-800/30">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={handleSelectAll}
                aria-label="Select all visible orders"
                className="h-4 w-4 rounded border-gray-300 accent-red-500"
              />

              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Select all {filteredOrders.length} visible orders
              </span>
            </div>
          )}

          {/* Order cards */}

          {!loading && !error && filteredOrders.map((order, index) => {
            const selected = selectedOrderIds.includes(order.id);

            const canPack = order.status === 'processing';

            const canShip =
              order.status === 'processing' ||
              order.status === 'packed';

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.025, 0.2) }}
                className={`p-4 transition-colors sm:p-5 ${
                  selected
                    ? 'bg-red-50/40 dark:bg-red-500/5'
                    : 'hover:bg-gray-50/70 dark:hover:bg-gray-800/30'
                }`}
              >

                <div className="flex flex-col gap-4 xl:flex-row xl:items-center">

                  {/* Order information */}

                  <div className="flex min-w-0 flex-1 items-start gap-3">

                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleSelectOrder(order.id)}
                      aria-label={`Select ${order.orderNumber}`}
                      className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 accent-red-500"
                    />

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      <Package className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-all text-sm font-bold text-gray-900 dark:text-white sm:text-base">
                          #{order.orderNumber}
                        </h3>

                        <StatusBadge status={order.status} />
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">

                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {order.customer}
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(order.date)}
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <Boxes className="h-3.5 w-3.5" />
                          {order.items.length} products
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {order.items.slice(0, 2).map((item) => (
                          <span
                            key={item.id}
                            className="max-w-48 truncate rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          >
                            {item.name} × {item.quantity}
                          </span>
                        ))}

                        {order.items.length > 2 && (
                          <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-800">
                            +{order.items.length - 2} more
                          </span>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Amount */}

                  <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800 sm:justify-start sm:gap-8 xl:border-0 xl:pt-0">

                    <div>
                      <p className="text-xs text-gray-400">
                        Order total
                      </p>

                      <p className="mt-1 text-lg font-bold tabular-nums text-gray-900 dark:text-white">
                        {formatMoney(order.total)}
                      </p>
                    </div>

                    {order.trackingNumber && (
                      <div className="hidden min-w-0 lg:block">
                        <p className="text-xs text-gray-400">
                          Tracking
                        </p>

                        <p className="mt-1 max-w-36 truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                          {order.trackingNumber}
                        </p>
                      </div>
                    )}

                    {/* Actions */}

                    <div className="flex flex-wrap items-center gap-2 xl:ml-auto">

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetails(true);
                        }}
                        className="gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Details
                      </Button>

                      {canPack && (
                        <Button
                          size="sm"
                          disabled={actionLoading === order.id}
                          onClick={() => handleMarkAsPacked(order.id)}
                          className="gap-1.5 bg-violet-600 text-white hover:bg-violet-700"
                        >
                          {actionLoading === order.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <PackageCheck className="h-3.5 w-3.5" />
                          )}
                          Pack
                        </Button>
                      )}

                      {canShip && (
                        <Button
                          size="sm"
                          onClick={() => openTrackingModal(order)}
                          className="gap-1.5 bg-red-500 text-white hover:bg-red-600"
                        >
                          <Truck className="h-3.5 w-3.5" />
                          Ship
                        </Button>
                      )}

                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

        </div>

        {/* Bottom information */}

        {!loading && !error && filteredOrders.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-gray-100 bg-gray-50/70 px-5 py-4 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-800/20 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {filteredOrders.length} of {orders.length} orders
            </span>

            <span>
              {selectedOrderIds.length > 0
                ? `${selectedOrderIds.length} selected`
                : 'Select orders to perform bulk actions'}
            </span>
          </div>
        )}

      </section>

      {/* ============================================
          ORDER DETAILS DIALOG
      ============================================ */}

      <Dialog
        open={showOrderDetails}
        onOpenChange={setShowOrderDetails}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto bg-white dark:bg-gray-950">

          {selectedOrder && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-3">
                  <DialogTitle className="text-xl font-bold">
                    Order #{selectedOrder.orderNumber}
                  </DialogTitle>

                  <StatusBadge status={selectedOrder.status} />
                </div>

                <DialogDescription>
                  Placed on {formatDate(selectedOrder.date)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 pt-3">

                {/* Customer */}

                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                      <User className="h-4 w-4 text-red-500" />
                      Customer information
                    </h3>

                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedOrder.customer}
                    </p>

                    <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="h-3.5 w-3.5" />
                      {selectedOrder.customerEmail || 'Not provided'}
                    </p>

                    <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="h-3.5 w-3.5" />
                      {selectedOrder.customerPhone || 'Not provided'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                      <MapPin className="h-4 w-4 text-red-500" />
                      Shipping address
                    </h3>

                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedOrder.shippingAddress.name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {selectedOrder.shippingAddress.street}
                    </p>

                    <p className="text-sm text-gray-500">
                      {selectedOrder.shippingAddress.city},{' '}
                      {selectedOrder.shippingAddress.state}{' '}
                      {selectedOrder.shippingAddress.zip}
                    </p>

                    <p className="text-sm text-gray-500">
                      {selectedOrder.shippingAddress.country}
                    </p>
                  </div>

                </div>

                {/* Payment */}

                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-bold">
                    <CreditCard className="h-4 w-4 text-red-500" />
                    Payment
                  </h3>

                  <p className="text-sm text-gray-500">
                    {selectedOrder.paymentMethod}
                  </p>
                </div>

                {/* Products */}

                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold">
                    <Package className="h-4 w-4 text-red-500" />
                    Order items ({selectedOrder.items.length})
                  </h3>

                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {item.name}
                          </p>

                          {item.variant && (
                            <p className="mt-1 text-xs text-gray-500">
                              {item.variant}
                            </p>
                          )}

                          <p className="mt-1 text-xs text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>

                        <p className="shrink-0 font-bold text-gray-900 dark:text-white">
                          {formatMoney(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 space-y-2 border-t border-gray-200 pt-4 text-sm dark:border-gray-800">

                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span>
                      <span>{formatMoney(selectedOrder.subtotal)}</span>
                    </div>

                    <div className="flex justify-between text-gray-500">
                      <span>Shipping</span>
                      <span>{formatMoney(selectedOrder.shipping)}</span>
                    </div>

                    <div className="flex justify-between text-gray-500">
                      <span>Tax</span>
                      <span>{formatMoney(selectedOrder.tax)}</span>
                    </div>

                    <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold dark:border-gray-800">
                      <span>Total</span>
                      <span>{formatMoney(selectedOrder.total)}</span>
                    </div>

                  </div>
                </div>

                {/* Tracking */}

                {selectedOrder.trackingNumber && (
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-500/20 dark:bg-indigo-500/5">
                    <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
                      Tracking number
                    </p>

                    <p className="mt-1 break-all text-sm text-gray-700 dark:text-gray-300">
                      {selectedOrder.trackingNumber}
                    </p>
                  </div>
                )}

                {/* Timeline */}

                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold">
                    <Clock className="h-4 w-4 text-red-500" />
                    Order activity
                  </h3>

                  {selectedOrder.timeline.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No activity recorded yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {selectedOrder.timeline.map((event, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`h-3 w-3 rounded-full ${
                              index === selectedOrder.timeline.length - 1
                                ? 'bg-red-500'
                                : 'bg-gray-300 dark:bg-gray-700'
                            }`} />

                            {index !== selectedOrder.timeline.length - 1 && (
                              <div className="mt-1 h-7 w-px bg-gray-200 dark:bg-gray-700" />
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {event.status}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {formatDate(event.date)} · {event.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}

                <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-5 dark:border-gray-800">

                  {selectedOrder.status === 'processing' && (
                    <Button
                      disabled={actionLoading === selectedOrder.id}
                      onClick={() => handleMarkAsPacked(selectedOrder.id)}
                      className="gap-2 bg-violet-600 text-white hover:bg-violet-700"
                    >
                      <PackageCheck className="h-4 w-4" />
                      Mark as packed
                    </Button>
                  )}

                  {(selectedOrder.status === 'processing' ||
                    selectedOrder.status === 'packed') && (
                    <Button
                      onClick={() => openTrackingModal(selectedOrder)}
                      className="gap-2 bg-red-500 text-white hover:bg-red-600"
                    >
                      <Truck className="h-4 w-4" />
                      Add tracking / Ship
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => printOrders([selectedOrder], 'invoice')}
                    className="gap-2"
                  >
                    <Receipt className="h-4 w-4" />
                    Invoice
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => printOrders([selectedOrder], 'packing')}
                    className="gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Packing slip
                  </Button>

                  {selectedOrder.status !== 'cancelled' &&
                    selectedOrder.status !== 'delivered' && (
                    <Button
                      variant="outline"
                      onClick={() => openCancelModal(selectedOrder)}
                      className="gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:text-red-400"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel order
                    </Button>
                  )}

                </div>

              </div>
            </>
          )}

        </DialogContent>
      </Dialog>

      {/* ============================================
          TRACKING DIALOG
      ============================================ */}

      <Dialog
        open={showTrackingModal}
        onOpenChange={setShowTrackingModal}
      >
        <DialogContent className="bg-white dark:bg-gray-950 sm:max-w-md">

          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-red-500" />
              Shipping information
            </DialogTitle>

            <DialogDescription>
              Add the tracking number for order #{selectedOrder?.orderNumber}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-3">

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Tracking number
              </label>

              <input
                autoFocus
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number..."
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowTrackingModal(false)}
              >
                Cancel
              </Button>

              <Button
                disabled={!trackingNumber.trim() || !!actionLoading}
                onClick={handleSubmitTracking}
                className="gap-2 bg-red-500 text-white hover:bg-red-600"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Save tracking
              </Button>
            </div>

          </div>
        </DialogContent>
      </Dialog>

      {/* ============================================
          BULK SHIPPING DIALOG
      ============================================ */}

      <Dialog
        open={showBulkShippingModal}
        onOpenChange={setShowBulkShippingModal}
      >
        <DialogContent className="bg-white dark:bg-gray-950 sm:max-w-lg">

          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-red-500" />
              Generate shipping labels
            </DialogTitle>

            <DialogDescription>
              Process shipping labels for multiple orders.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-3">

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm text-gray-500">
                Selected orders
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {selectedOrders.length}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Shipping carrier
              </label>

              <select
                value={bulkCarrier}
                onChange={(e) =>
                  setBulkCarrier(e.target.value as 'ups' | 'fedex' | 'dhl')
                }
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="ups">UPS</option>
                <option value="fedex">FedEx</option>
                <option value="dhl">DHL</option>
              </select>
            </div>

            <p className="text-xs text-gray-500">
              Your shipping integration will receive the selected orders and carrier information. Tracking numbers can be added after label generation.
            </p>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBulkShippingModal(false)}
              >
                Cancel
              </Button>

              <Button
                disabled={bulkLoading || selectedOrders.length === 0}
                onClick={handleConfirmBulkShipping}
                className="gap-2 bg-red-500 text-white hover:bg-red-600"
              >
                {bulkLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Truck className="h-4 w-4" />
                )}
                Generate labels
              </Button>
            </div>

          </div>
        </DialogContent>
      </Dialog>

      {/* ============================================
          CANCEL ORDER DIALOG
      ============================================ */}

      <Dialog
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
      >
        <DialogContent className="bg-white dark:bg-gray-950 sm:max-w-md">

          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Cancel order
            </DialogTitle>

            <DialogDescription>
              You are cancelling order #{selectedOrder?.orderNumber}. This action will update the order status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-3">

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Reason for cancellation
              </label>

              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Explain why this order is being cancelled..."
                rows={4}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(false)}
              >
                Go back
              </Button>

              <Button
                disabled={!cancelReason.trim() || !!actionLoading}
                onClick={handleCancelOrder}
                className="gap-2 bg-red-600 text-white hover:bg-red-700"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Confirm cancellation
              </Button>
            </div>

          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default OrdersPage;

              
