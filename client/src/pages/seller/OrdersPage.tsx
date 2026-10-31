import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Download,
  Filter,
  Loader2,
  Menu,
  Package,
  PackageCheck,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Truck,
  UserRound,
  Wallet,
  X,
  XCircle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SellerGuidancePanel from "@/components/seller/SellerGuidancePanel";
import { API_BASE_URL } from "@/lib/config";
import { useToastStore } from "@/stores/toastStore";

type OrderStatus =
  | "pending"
  | "processing"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  variant?: string;
  image?: string;
};

type Order = {
  id: string;
  orderNumber: string;
  customer: string;
  customerEmail?: string;
  customerPhone?: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  status: OrderStatus;
  date: string;
  shippingAddress?: string;
  paymentMethod?: string;
  trackingNumber?: string;
  timeline?: {
    status: string;
    date: string;
    note?: string;
  }[];
};

type FilterStatus = "all" | OrderStatus;

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    background: string;
    icon: typeof Clock3;
  }
> = {
  pending: {
    label: "Pending",
    color: "text-amber-700",
    background: "bg-amber-50 border-amber-100",
    icon: Clock3,
  },
  processing: {
    label: "Processing",
    color: "text-blue-700",
    background: "bg-blue-50 border-blue-100",
    icon: RefreshCw,
  },
  packed: {
    label: "Packed",
    color: "text-indigo-700",
    background: "bg-indigo-50 border-indigo-100",
    icon: PackageCheck,
  },
  shipped: {
    label: "Shipped",
    color: "text-violet-700",
    background: "bg-violet-50 border-violet-100",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "text-green-700",
    background: "bg-green-50 border-green-100",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-rose-700",
    background: "bg-rose-50 border-rose-100",
    icon: XCircle,
  },
  returned: {
    label: "Returned",
    color: "text-purple-700",
    background: "bg-purple-50 border-purple-100",
    icon: RotateCcw,
  },
};

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount || 0));

const formatDate = (date?: string) => {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const normalizeOrder = (raw: any): Order => ({
  id: String(raw.id ?? raw._id ?? ""),
  orderNumber: String(
    raw.orderNumber ?? raw.order_number ?? raw.id ?? raw._id ?? "Order"
  ),
  customer: String(raw.customer ?? raw.customerName ?? "Customer"),
  customerEmail: raw.customerEmail ?? raw.email ?? "",
  customerPhone: raw.customerPhone ?? raw.phone ?? "",
  items: Array.isArray(raw.items)
    ? raw.items.map((item: any, index: number) => ({
        id: String(item.id ?? item._id ?? index),
        name: String(item.name ?? item.productName ?? "Product"),
        quantity: Number(item.quantity ?? 1),
        price: Number(item.price ?? 0),
        variant: item.variant,
        image: item.image ?? item.imageUrl ?? item.productImage,
      }))
    : [],
  total: Number(raw.total ?? 0),
  subtotal: Number(raw.subtotal ?? raw.total ?? 0),
  shipping: Number(raw.shipping ?? 0),
  tax: Number(raw.tax ?? 0),
  status: (raw.status ?? "pending") as OrderStatus,
  date: raw.date ?? raw.createdAt ?? "",
  shippingAddress: raw.shippingAddress ?? raw.address ?? "",
  paymentMethod: raw.paymentMethod ?? "",
  trackingNumber: raw.trackingNumber ?? "",
  timeline: Array.isArray(raw.timeline) ? raw.timeline : [],
});

const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-bold sm:text-xs ${config.background} ${config.color}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const showToast = useToastStore((state: any) => state.showToast);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [trackingSaving, setTrackingSaving] = useState(false);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelOrderTarget, setCancelOrderTarget] = useState<Order | null>(
    null
  );
  const [cancelSaving, setCancelSaving] = useState(false);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [carrier, setCarrier] = useState("DHL");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const apiRequest = async (path: string, options: RequestInit = {}) => {
    const authToken = localStorage.getItem("auth_token");

    const response = await fetch(`${API_BASE_URL}/seller/orders${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...options.headers,
      },
    });

    const contentType = response.headers.get("content-type");
    const data = contentType?.includes("application/json")
      ? await response.json()
      : null;

    if (response.status === 401) {
      navigate("/login");
      throw new Error("Your session has expired. Please sign in again.");
    }

    if (!response.ok) {
      throw new Error(
        data?.message ??
          data?.error ??
          "Something went wrong. Please try again."
      );
    }

    return data;
  };

  const fetchOrders = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const authToken = localStorage.getItem("auth_token");

      const response = await fetch(`${API_BASE_URL}/seller/orders`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        navigate("/login");
        throw new Error("Your session has expired. Please sign in again.");
      }

      if (!response.ok) {
        throw new Error(
          data?.message ?? data?.error ?? "Unable to load orders."
        );
      }

      const normalized = Array.isArray(data?.orders)
        ? data.orders.map(normalizeOrder)
        : [];

      setOrders(normalized);
      setSelectedIds([]);
    } catch (err: any) {
      setError(err.message ?? "Unable to load orders.");
      if (!silent) setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!selectedOrder) return;

    const updated = orders.find((order) => order.id === selectedOrder.id);
    if (updated) setSelectedOrder(updated);
  }, [orders, selectedOrder]);

  const stats = useMemo(() => {
    const count = (status: OrderStatus) =>
      orders.filter((order) => order.status === status).length;

    return {
      all: orders.length,
      delivered: count("delivered"),
      pending: count("pending"),
      cancelled: count("cancelled"),
      returned: count("returned"),
      processing: count("processing"),
      packed: count("packed"),
      shipped: count("shipped"),
      fulfillment: count("packed") + count("shipped"),
      revenue: orders
        .filter((order) => order.status !== "cancelled")
        .reduce((sum, order) => sum + order.total, 0),
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders
      .filter((order) => {
        const matchesStatus =
          activeFilter === "all" || order.status === activeFilter;

        const matchesSearch =
          !query ||
          order.orderNumber.toLowerCase().includes(query) ||
          order.customer.toLowerCase().includes(query) ||
          (order.customerEmail ?? "").toLowerCase().includes(query);

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime() || 0;
        const dateB = new Date(b.date).getTime() || 0;

        if (sortBy === "oldest") return dateA - dateB;
        if (sortBy === "highest") return b.total - a.total;
        if (sortBy === "lowest") return a.total - b.total;

        return dateB - dateA;
      });
  }, [orders, search, activeFilter, sortBy]);

  const visibleIds = filteredOrders.map((order) => order.id);

  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedIds.includes(id));

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const toggleAllVisible = () => {
    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : [...new Set([...current, ...visibleIds])]
    );
  };

  const updateOrderStatus = async (
    order: Order,
    status: OrderStatus,
    reason?: string
  ) => {
    setStatusLoading(order.id);

    try {
      await apiRequest(`/${order.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, reason }),
      });

      setOrders((current) =>
        current.map((item) =>
          item.id === order.id ? { ...item, status } : item
        )
      );

      showToast?.(
        `Order updated to ${STATUS_CONFIG[status].label}.`,
        "success"
      );

      setCancelOpen(false);
      setDetailsOpen(false);
      setCancelReason("");
      setCancelOrderTarget(null);
    } catch (err: any) {
      showToast?.(err.message ?? "Unable to update order.", "error");
    } finally {
      setStatusLoading(null);
    }
  };

  const saveTracking = async () => {
    if (!trackingOrder || !trackingNumber.trim()) return;

    setTrackingSaving(true);

    try {
      await apiRequest(`/${trackingOrder.id}/tracking`, {
        method: "PATCH",
        body: JSON.stringify({ trackingNumber: trackingNumber.trim() }),
      });

      setOrders((current) =>
        current.map((item) =>
          item.id === trackingOrder.id
            ? { ...item, trackingNumber: trackingNumber.trim() }
            : item
        )
      );

      showToast?.("Tracking number saved successfully.", "success");
      setTrackingOpen(false);
      setTrackingNumber("");
    } catch (err: any) {
      showToast?.(err.message ?? "Unable to save tracking number.", "error");
    } finally {
      setTrackingSaving(false);
    }
  };

  const openTracking = (order: Order) => {
    setTrackingOrder(order);
    setTrackingNumber(order.trackingNumber ?? "");
    setTrackingOpen(true);
  };

  const printOrders = (
    selected: Order[],
    type: "invoice" | "packing-slip"
  ) => {
    if (!selected.length) return;

    const printWindow = window.open("", "_blank", "width=900,height=700");

    if (!printWindow) {
      showToast?.("Please allow pop-ups to print documents.", "error");
      return;
    }

    const documents = selected
      .map(
        (order) => `
          <section class="document">
            <div class="top">
              <div>
                <h1>${type === "invoice" ? "INVOICE" : "PACKING SLIP"}</h1>
                <p>Order #${escapeHtml(order.orderNumber)}</p>
              </div>
              <strong>SELLER HUB</strong>
            </div>
            <hr />
            <div class="meta">
              <div>
                <h3>Customer</h3>
                <p>${escapeHtml(order.customer)}</p>
                <p>${escapeHtml(order.customerEmail)}</p>
                <p>${escapeHtml(order.shippingAddress)}</p>
              </div>
              <div>
                <h3>Order details</h3>
                <p>Date: ${escapeHtml(formatDate(order.date))}</p>
                <p>Status: ${escapeHtml(order.status)}</p>
                <p>Payment: ${escapeHtml(order.paymentMethod || "N/A")}</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  ${
                    type === "invoice"
                      ? "<th>Price</th><th>Total</th>"
                      : ""
                  }
                </tr>
              </thead>
              <tbody>
                ${order.items
                  .map(
                    (item) => `
                      <tr>
                        <td>
                          ${escapeHtml(item.name)}
                          ${
                            item.variant
                              ? `<small>${escapeHtml(item.variant)}</small>`
                              : ""
                          }
                        </td>
                        <td>${item.quantity}</td>
                        ${
                          type === "invoice"
                            ? `<td>${formatMoney(item.price)}</td>
                               <td>${formatMoney(item.price * item.quantity)}</td>`
                            : ""
                        }
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>
            </table>
            ${
              type === "invoice"
                ? `<div class="totals">
                    <p>Subtotal: ${formatMoney(order.subtotal)}</p>
                    <p>Shipping: ${formatMoney(order.shipping)}</p>
                    <p>Tax: ${formatMoney(order.tax)}</p>
                    <h2>Total: ${formatMoney(order.total)}</h2>
                  </div>`
                : ""
            }
          </section>
        `
      )
      .join("");

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${type === "invoice" ? "Invoices" : "Packing slips"}</title>
          <style>
            *{box-sizing:border-box}
            body{font-family:Arial,sans-serif;color:#172033;padding:30px}
            .document{max-width:760px;margin:0 auto 45px;page-break-after:always}
            .top,.meta{display:flex;justify-content:space-between;gap:30px}
            h1{font-size:28px;margin-bottom:5px}
            h3{font-size:13px;text-transform:uppercase;color:#64748b}
            p{font-size:13px;line-height:1.6;margin:4px 0}
            table{width:100%;border-collapse:collapse;margin-top:30px}
            th,td{text-align:left;padding:13px;border-bottom:1px solid #e2e8f0}
            th{background:#f8fafc}
            small{display:block;color:#64748b}
            .totals{margin:25px 0 0 auto;width:240px}
            .totals h2{border-top:2px solid #172033;padding-top:12px}
            @media print{body{padding:0}.document{page-break-after:always}}
          </style>
        </head>
        <body>${documents}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const processBulk = async () => {
    if (!selectedIds.length) return;

    setBulkLoading(true);

    try {
      await apiRequest("/bulk-process", {
        method: "POST",
        body: JSON.stringify({
          orderIds: selectedIds,
          action: "print_labels",
          carrier,
        }),
      });

      showToast?.("Shipping labels prepared successfully.", "success");
      setBulkOpen(false);
      setSelectedIds([]);
      await fetchOrders(true);
    } catch (err: any) {
      showToast?.(
        err.message ?? "Unable to process selected orders.",
        "error"
      );
    } finally {
      setBulkLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setActiveFilter("all");
    setSortBy("newest");
  };

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const statusTabs: {
    key: FilterStatus;
    label: string;
    count: number;
  }[] = [
    { key: "all", label: "All", count: stats.all },
    { key: "delivered", label: "Delivered", count: stats.delivered },
    { key: "pending", label: "Pending", count: stats.pending },
    { key: "processing", label: "Processing", count: stats.processing },
    { key: "packed", label: "Packed", count: stats.packed },
    { key: "shipped", label: "Shipped", count: stats.shipped },
    { key: "cancelled", label: "Cancelled", count: stats.cancelled },
    { key: "returned", label: "Returned", count: stats.returned },
  ];

  const navigationItems = [
    { label: "Dashboard", icon: Wallet, path: "/seller/dashboard" },
    { label: "Orders", icon: Package, path: "/seller/orders" },
    { label: "Products", icon: PackageCheck, path: "/seller/products" },
    { label: "Finance", icon: Wallet, path: "/seller/finance" },
    { label: "Profile", icon: UserRound, path: "/seller/profile" },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f8fc] font-sans text-slate-900">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[250px] flex-col border-r border-slate-200 bg-white px-5 py-7 xl:flex">
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-600 text-white">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-extrabold tracking-tight">Casual</p>
            <p className="text-xs text-slate-500">Seller Hub</p>
          </div>
        </div>

        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Workspace
        </p>

        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = item.label === "Orders";

            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-rose-50 text-rose-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-bold">Need help?</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Get support with managing your orders.
          </p>
          <button
            onClick={() => navigate("/seller/support")}
            className="mt-3 text-xs font-bold text-rose-600"
          >
            Contact support
          </button>
        </div>
      </aside>

      <main className="min-w-0 pb-24 xl:ml-[250px] xl:pb-8">
        {/* Top header */}
        <header className="border-b border-slate-100 bg-white">
          <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-7 lg:px-10">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  aria-label="Go back"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 transition hover:bg-slate-200 xl:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white xl:hidden">
                  <Package className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-lg font-extrabold tracking-tight sm:text-xl">
                    Seller Hub
                  </p>
                  <p className="text-xs text-slate-500">Orders management</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchOrders(true)}
                  disabled={refreshing}
                  aria-label="Refresh orders"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                </button>

                <button
                  aria-label="Notifications"
                  onClick={() => navigate("/seller/notifications")}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                    3
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] space-y-5 px-3 py-4 sm:space-y-7 sm:px-7 sm:py-7 lg:px-10">
          {/* Page introduction */}
          <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#fff1f3] via-white to-[#fff7f0] px-5 py-6 sm:rounded-[30px] sm:px-8 sm:py-8">
            <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-rose-200/40 blur-3xl" />
            <div className="relative max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-rose-600">
                Seller workspace
              </p>
              <h1 className="mt-2 text-[26px] font-extrabold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                Your orders,
                <span className="text-rose-600"> under control.</span>
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600 sm:text-base">
                Manage incoming orders, prepare shipments and keep every
                customer updated.
              </p>
            </div>

            <div className="pointer-events-none absolute bottom-3 right-5 hidden h-28 w-28 items-center justify-center rounded-full bg-white/70 text-rose-500 sm:flex">
              <Package className="h-14 w-14" />
            </div>
          </section>

          {/* Summary cards */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-extrabold sm:text-base">
                Order overview
              </h2>
              <span className="text-xs text-slate-400">
                {stats.all} total orders
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {[
                {
                  label: "Delivered",
                  value: stats.delivered,
                  icon: CheckCircle2,
                  theme:
                    "border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/70 text-blue-700",
                  filter: "delivered" as FilterStatus,
                },
                {
                  label: "Pending",
                  value: stats.pending,
                  icon: Clock3,
                  theme:
                    "border-amber-100 bg-gradient-to-br from-amber-50 to-orange-100/60 text-amber-700",
                  filter: "pending" as FilterStatus,
                },
                {
                  label: "Cancelled",
                  value: stats.cancelled,
                  icon: XCircle,
                  theme:
                    "border-rose-100 bg-gradient-to-br from-rose-50 to-pink-100/70 text-rose-700",
                  filter: "cancelled" as FilterStatus,
                },
                {
                  label: "Returned",
                  value: stats.returned,
                  icon: RotateCcw,
                  theme:
                    "border-purple-100 bg-gradient-to-br from-purple-50 to-violet-100/70 text-purple-700",
                  filter: "returned" as FilterStatus,
                },
              ].map((stat) => {
                const Icon = stat.icon;

                return (
                  <button
                    key={stat.label}
                    onClick={() => setActiveFilter(stat.filter)}
                    className={`flex min-w-0 items-center gap-3 rounded-[20px] border p-3.5 text-left transition hover:shadow-sm sm:gap-4 sm:rounded-[24px] sm:p-5 ${stat.theme}`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 shadow-sm sm:h-12 sm:w-12">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-2xl font-extrabold leading-none tracking-tight sm:text-3xl">
                        {stat.value}
                      </span>
                      <span className="mt-1 block truncate text-xs font-semibold sm:text-sm">
                        {stat.label}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Revenue summary */}
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Order revenue
              </p>
              <p className="mt-1 text-xl font-extrabold tracking-tight sm:text-2xl">
                {formatMoney(stats.revenue)}
              </p>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
              <div>
                <p className="text-slate-400">Processing</p>
                <p className="mt-1 font-bold text-blue-700">
                  {stats.processing}
                </p>
              </div>
              <div>
                <p className="text-slate-400">In fulfillment</p>
                <p className="mt-1 font-bold text-violet-700">
                  {stats.fulfillment}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Total orders</p>
                <p className="mt-1 font-bold text-slate-900">{stats.all}</p>
              </div>
            </div>
          </section>

          {/* Search and filter controls */}
          <section className="space-y-3">
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search order ID or customer..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                />

                {search && (
                  <button
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowFilters((value) => !value)}
                className={`flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl border px-3.5 text-sm font-bold transition sm:px-5 ${
                  showFilters
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {showFilters && (
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-bold text-slate-500">
                    Sort orders
                  </label>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-rose-300"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="highest">Highest amount</option>
                    <option value="lowest">Lowest amount</option>
                  </select>
                </div>

                <Button
                  variant="outline"
                  className="h-11 rounded-xl"
                  onClick={resetFilters}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset filters
                </Button>
              </div>
            )}

            {/* Status filter chips */}
            <div className="-mx-3 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max gap-2">
                {statusTabs.map((tab) => {
                  const active = activeFilter === tab.key;

                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveFilter(tab.key)}
                      className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-xs font-bold transition sm:text-sm ${
                        active
                          ? "border-rose-600 bg-rose-600 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-rose-200"
                      }`}
                    >
                      {tab.label}
                      <span
                        className={
                          active ? "text-rose-100" : "text-slate-400"
                        }
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Bulk actions */}
          {selectedIds.length > 0 && (
            <section className="sticky top-2 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-white p-3 shadow-lg shadow-rose-100/50 sm:px-4">
              <div className="flex items-center gap-2 text-sm font-bold text-rose-700">
                <CheckCircle2 className="h-5 w-5" />
                {selectedIds.length} selected
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() =>
                    printOrders(
                      orders.filter((order) =>
                        selectedIds.includes(order.id)
                      ),
                      "invoice"
                    )
                  }
                >
                  <Printer className="mr-1.5 h-4 w-4" />
                  Invoice
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() =>
                    printOrders(
                      orders.filter((order) =>
                        selectedIds.includes(order.id)
                      ),
                      "packing-slip"
                    )
                  }
                >
                  <Download className="mr-1.5 h-4 w-4" />
                  Packing slip
                </Button>

                <Button
                  size="sm"
                  className="rounded-xl bg-rose-600 hover:bg-rose-700"
                  onClick={() => setBulkOpen(true)}
                >
                  <Truck className="mr-1.5 h-4 w-4" />
                  Labels
                </Button>

                <button
                  onClick={() => setSelectedIds([])}
                  className="rounded-xl px-2 text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Clear
                </button>
              </div>
            </section>
          )}

          {/* Order list heading */}
          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold sm:text-lg">
                  All orders
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {filteredOrders.length} matching orders
                </p>
              </div>

              {filteredOrders.length > 0 && (
                <button
                  onClick={toggleAllVisible}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-rose-600"
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      allVisibleSelected
                        ? "border-rose-600 bg-rose-600 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {allVisibleSelected && <Check className="h-3 w-3" />}
                  </span>
                  Select all
                </button>
              )}
            </div>

            {error && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <div className="flex items-center gap-2 text-sm text-rose-700">
                  <XCircle className="h-5 w-5 shrink-0" />
                  {error}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl border-rose-200 bg-white"
                  onClick={() => fetchOrders()}
                >
                  Try again
                </Button>
              </div>
            )}

            {/* Loading skeleton */}
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex animate-pulse items-center gap-3 rounded-[22px] border border-slate-100 bg-white p-3 sm:p-4"
                  >
                    <div className="h-[68px] w-[68px] shrink-0 rounded-2xl bg-slate-100" />
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="h-4 w-32 rounded bg-slate-100" />
                      <div className="h-3 w-40 rounded bg-slate-100" />
                      <div className="h-3 w-24 rounded bg-slate-100" />
                    </div>
                    <div className="h-7 w-20 rounded-full bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-[26px] border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                  <Package className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="mt-4 text-lg font-extrabold">
                  No orders found
                </h3>
                <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">
                  {search
                    ? "Try another search term or clear your filters."
                    : "New orders will appear here when customers place them."}
                </p>
                <Button
                  variant="outline"
                  className="mt-5 rounded-xl"
                  onClick={resetFilters}
                >
                  Reset filters
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const itemCount = order.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  );

                  const selected = selectedIds.includes(order.id);

                  return (
                    <article
                      key={order.id}
                      className={`group min-w-0 rounded-[22px] border bg-white p-3 shadow-sm transition hover:shadow-md sm:rounded-[26px] sm:p-4 ${
                        selected
                          ? "border-rose-300 ring-2 ring-rose-100"
                          : "border-slate-200/80 hover:border-rose-200"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
                        <button
                          aria-label={`Select order ${order.orderNumber}`}
                          onClick={() => toggleSelected(order.id)}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                            selected
                              ? "border-rose-600 bg-rose-600 text-white"
                              : "border-slate-300 bg-white hover:border-rose-400"
                          }`}
                        >
                          {selected && <Check className="h-3.5 w-3.5" />}
                        </button>

                        <button
                          onClick={() => openDetails(order)}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4"
                        >
                          <div className="flex h-[66px] w-[66px] shrink-0 items-center justify-center overflow-hidden rounded-[17px] bg-slate-100 sm:h-[82px] sm:w-[82px]">
                            {order.items[0]?.image ? (
                              <img
                                src={order.items[0].image}
                                alt={order.items[0].name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-7 w-7 text-slate-400" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="break-all text-[13px] font-extrabold leading-5 text-slate-900 sm:text-base">
                              #{order.orderNumber}
                            </p>

                            <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-slate-500 sm:text-sm">
                              <UserRound className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{order.customer}</span>
                            </p>

                            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-slate-500 sm:text-xs">
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {formatDate(order.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Package className="h-3.5 w-3.5" />
                                {itemCount} {itemCount === 1 ? "item" : "items"}
                              </span>
                            </div>

                            {order.items[0]?.name && (
                              <p className="mt-1.5 hidden max-w-[220px] truncate rounded-lg bg-slate-50 px-2 py-1 text-[10px] text-slate-500 sm:block">
                                {order.items[0].name}
                                {order.items.length > 1
                                  ? ` +${order.items.length - 1} more`
                                  : ""}
                              </p>
                            )}
                          </div>
                        </button>

                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <StatusBadge status={order.status} />
                          <p className="text-[13px] font-extrabold tracking-tight text-slate-900 sm:text-lg">
                            {formatMoney(order.total)}
                          </p>
                          <button
                            onClick={() => openDetails(order)}
                            aria-label={`View order ${order.orderNumber}`}
                            className="flex items-center gap-1 text-[11px] font-bold text-rose-600 sm:hidden"
                          >
                            Details
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => openDetails(order)}
                          aria-label={`View order ${order.orderNumber}`}
                          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 sm:flex"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Seller guidance */}
          <div className="pt-2">
            <SellerGuidancePanel />
          </div>
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur-xl xl:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = item.label === "Orders";

            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`relative flex min-w-0 flex-col items-center gap-1 py-1.5 text-[10px] font-semibold transition sm:text-xs ${
                  active ? "text-rose-600" : "text-slate-400"
                }`}
              >
                {active && (
                  <span className="absolute -top-2 h-1 w-10 rounded-full bg-rose-600" />
                )}
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Order details dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-h-[90dvh] w-[calc(100%-20px)] max-w-2xl overflow-y-auto rounded-[26px] p-0 sm:w-full">
          {selectedOrder && (
            <>
              <div className="border-b border-slate-100 px-5 pb-5 pt-6 sm:px-7">
                <DialogHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
                    <div>
                      <DialogTitle className="break-all text-lg font-extrabold sm:text-xl">
                        Order #{selectedOrder.orderNumber}
                      </DialogTitle>
                      <DialogDescription className="mt-1">
                        Placed on {formatDate(selectedOrder.date)}
                      </DialogDescription>
                    </div>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                </DialogHeader>
              </div>

              <div className="space-y-5 px-5 py-5 sm:space-y-6 sm:px-7">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Customer
                    </p>
                    <p className="mt-2 text-sm font-bold">
                      {selectedOrder.customer}
                    </p>
                    <p className="mt-1 break-all text-xs text-slate-500">
                      {selectedOrder.customerEmail || "No email provided"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {selectedOrder.customerPhone || "No phone provided"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Delivery address
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {selectedOrder.shippingAddress || "No address provided"}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {selectedOrder.paymentMethod ||
                        "Payment method unavailable"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-extrabold">
                    Items ordered
                  </h3>

                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Qty: {item.quantity}
                            {item.variant ? ` · ${item.variant}` : ""}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-bold">
                          {formatMoney(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span>{formatMoney(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Shipping</span>
                      <span>{formatMoney(selectedOrder.shipping)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Tax</span>
                      <span>{formatMoney(selectedOrder.tax)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-extrabold">
                      <span>Total</span>
                      <span>{formatMoney(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {selectedOrder.trackingNumber && (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-xs font-bold text-blue-700">
                      Tracking number
                    </p>
                    <p className="mt-1 break-all font-mono text-sm font-bold text-blue-900">
                      {selectedOrder.trackingNumber}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => printOrders([selectedOrder], "invoice")}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Invoice
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() =>
                      printOrders([selectedOrder], "packing-slip")
                    }
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Packing slip
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {selectedOrder.status === "pending" && (
                    <Button
                      className="rounded-xl bg-blue-600 hover:bg-blue-700"
                      disabled={statusLoading === selectedOrder.id}
                      onClick={() =>
                        updateOrderStatus(selectedOrder, "processing")
                      }
                    >
                      {statusLoading === selectedOrder.id && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Start processing
                    </Button>
                  )}

                  {selectedOrder.status === "processing" && (
                    <Button
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
                      disabled={statusLoading === selectedOrder.id}
                      onClick={() =>
                        updateOrderStatus(selectedOrder, "packed")
                      }
                    >
                      <PackageCheck className="mr-2 h-4 w-4" />
                      Mark as packed
                    </Button>
                  )}

                  {(selectedOrder.status === "packed" ||
                    selectedOrder.status === "shipped") && (
                    <Button
                      className="rounded-xl bg-violet-600 hover:bg-violet-700"
                      onClick={() => openTracking(selectedOrder)}
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      {selectedOrder.trackingNumber
                        ? "Update tracking"
                        : "Add tracking"}
                    </Button>
                  )}

                  {selectedOrder.status === "packed" && (
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      disabled={statusLoading === selectedOrder.id}
                      onClick={() =>
                        updateOrderStatus(selectedOrder, "shipped")
                      }
                    >
                      Mark as shipped
                    </Button>
                  )}

                  {selectedOrder.status === "shipped" && (
                    <Button
                      className="rounded-xl bg-green-600 hover:bg-green-700"
                      disabled={statusLoading === selectedOrder.id}
                      onClick={() =>
                        updateOrderStatus(selectedOrder, "delivered")
                      }
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark delivered
                    </Button>
                  )}

                  {!["cancelled", "returned", "delivered"].includes(
                    selectedOrder.status
                  ) && (
                    <Button
                      variant="outline"
                      className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
                      onClick={() => {
                        setCancelOrderTarget(selectedOrder);
                        setCancelOpen(true);
                      }}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel order
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Tracking dialog */}
      <Dialog open={trackingOpen} onOpenChange={setTrackingOpen}>
        <DialogContent className="w-[calc(100%-20px)] max-w-md rounded-[26px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">
              Shipping tracking
            </DialogTitle>
            <DialogDescription>
              Add the tracking number for order #{trackingOrder?.orderNumber}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <label className="block text-sm font-bold">
              Tracking number
              <input
                value={trackingNumber}
                onChange={(event) => setTrackingNumber(event.target.value)}
                placeholder="Enter tracking number"
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
              />
            </label>

            <Button
              className="h-12 w-full rounded-xl bg-rose-600 hover:bg-rose-700"
              disabled={!trackingNumber.trim() || trackingSaving}
              onClick={saveTracking}
            >
              {trackingSaving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save tracking number
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel order dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="w-[calc(100%-20px)] max-w-md rounded-[26px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">
              Cancel this order?
            </DialogTitle>
            <DialogDescription>
              Order #{cancelOrderTarget?.orderNumber}. This action will update
              the order status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <label className="block text-sm font-bold">
              Reason for cancellation
              <textarea
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Enter the reason..."
                rows={3}
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
              />
            </label>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-11 flex-1 rounded-xl"
                onClick={() => setCancelOpen(false)}
              >
                Keep order
              </Button>

              <Button
                className="h-11 flex-1 rounded-xl bg-rose-600 hover:bg-rose-700"
                disabled={cancelSaving || !cancelReason.trim()}
                onClick={async () => {
                  if (!cancelOrderTarget) return;

                  setCancelSaving(true);
                  await updateOrderStatus(
                    cancelOrderTarget,
                    "cancelled",
                    cancelReason.trim()
                  );
                  setCancelSaving(false);
                }}
              >
                {cancelSaving && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirm cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk shipping labels dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="w-[calc(100%-20px)] max-w-md rounded-[26px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">
              Create shipping labels
            </DialogTitle>
            <DialogDescription>
              Prepare labels for {selectedIds.length} selected orders.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <label className="block text-sm font-bold">
              Shipping carrier
              <select
                value={carrier}
                onChange={(event) => setCarrier(event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-rose-300"
              >
                <option value="DHL">DHL</option>
                <option value="UPS">UPS</option>
                <option value="FedEx">FedEx</option>
                <option value="USPS">USPS</option>
              </select>
            </label>

            <Button
              className="h-12 w-full rounded-xl bg-rose-600 hover:bg-rose-700"
              disabled={bulkLoading || !selectedIds.length}
              onClick={processBulk}
            >
              {bulkLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create labels
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
