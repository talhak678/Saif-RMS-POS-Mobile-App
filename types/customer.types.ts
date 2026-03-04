// ─── Core Types ───────────────────────────────────────────────────────────────

export interface ICustomer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  loyaltyPoints?: number;
  createdAt: string;
  lastOrderAt?: string | null;
  _count: { orders: number };
}

export interface ICustomerStats {
  summary: {
    totalCustomers: number;
    repeatRate: string;
    averageOrderValue: string;
    retentionRate: string;
  };
  segments: {
    newCustomers: number;
    vipCustomers: number;
    repeatBuyers: number;
    zeroOrders: number;
    dormantCustomers: number;
    frequentBuyers: number;
    cartAbandoners: number;
    oneTimeBuyers: number;
  };
}

export type SegmentKey =
  | "newCustomers"
  | "vipCustomers"
  | "repeatBuyers"
  | "zeroOrders"
  | "dormantCustomers"
  | "frequentBuyers"
  | "cartAbandoners"
  | "oneTimeBuyers"
  | null;

// ─── Segment Config ───────────────────────────────────────────────────────────

const SIXTY_DAYS = 60 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export const SEGMENT_CONFIG = [
  { key: "newCustomers",     label: "New Customers",   desc: "Joined in last 30 days",       accentColor: "#7c3aed", badgeBg: "#ede9fe", badgeText: "#7c3aed" },
  { key: "vipCustomers",     label: "VIP Customers",   desc: "More than 20 orders",          accentColor: "#4f46e5", badgeBg: "#e0e7ff", badgeText: "#4338ca" },
  { key: "repeatBuyers",     label: "Repeat Buyers",   desc: "More than 1 order",            accentColor: "#059669", badgeBg: "#d1fae5", badgeText: "#065f46" },
  { key: "zeroOrders",       label: "Zero Orders",     desc: "0 orders placed",              accentColor: "#dc2626", badgeBg: "#fee2e2", badgeText: "#991b1b" },
  { key: "dormantCustomers", label: "Dormant",         desc: "No orders in last 60 days",    accentColor: "#d97706", badgeBg: "#fef3c7", badgeText: "#92400e" },
  { key: "frequentBuyers",   label: "Frequent Buyers", desc: "More than 5 orders",           accentColor: "#0891b2", badgeBg: "#cffafe", badgeText: "#164e63" },
  { key: "cartAbandoners",   label: "Cart Abandoners", desc: "Left items in cart (10 days)", accentColor: "#ca8a04", badgeBg: "#fef9c3", badgeText: "#713f12" },
  { key: "oneTimeBuyers",    label: "One-time Buyers", desc: "Exactly 1 order placed",       accentColor: "#475569", badgeBg: "#f1f5f9", badgeText: "#334155" },
] as const;

// ─── Client-Side Segment Match ────────────────────────────────────────────────

export function matchesSegment(customer: ICustomer, key: SegmentKey): boolean {
  const orderCount = customer._count?.orders ?? 0;
  const createdAt  = customer.createdAt ? new Date(customer.createdAt).getTime() : 0;
  const lastOrder  = customer.lastOrderAt ? new Date(customer.lastOrderAt).getTime() : null;
  const now        = Date.now();

  switch (key) {
    case "newCustomers":     return now - createdAt <= THIRTY_DAYS;
    case "vipCustomers":     return orderCount > 20;
    case "repeatBuyers":     return orderCount > 1;
    case "zeroOrders":       return orderCount === 0;
    case "dormantCustomers": return orderCount > 0 && lastOrder !== null && now - lastOrder > SIXTY_DAYS;
    case "frequentBuyers":   return orderCount > 5;
    case "cartAbandoners":   return false;
    case "oneTimeBuyers":    return orderCount === 1;
    default:                 return true;
  }
}
