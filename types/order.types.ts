// ── Core Enums ─────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'KITCHEN_READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type OrderType   = 'DINE_IN' | 'DELIVERY' | 'PICKUP';
export type OrderSource = 'POS' | 'WEBSITE' | 'MOBILE';
export type PaymentMethod = 'CASH' | 'CARD' | 'STRIPE';
export type PaymentStatus = 'PAID' | 'PENDING';

// ── Data Interfaces ─────────────────────────────────────────────────────────────

export interface IOrderItem {
  id: string;
  quantity: number;
  price: string;
  menuItem?: { name: string; image?: string };
  variation?: { name: string };
  addons?: { name: string }[];
}

export interface IOrder {
  id: string;
  orderNo: number;
  status: OrderStatus;
  type: OrderType;
  source: OrderSource;
  total: string;
  createdAt: string;
  customerId?: string;
  riderId?: string;
  tableNumber?: string;
  deliveryAddress?: string;
  customer?: {
    name: string;
    phone: string;
    email: string;
    image?: string;
  };
  branch?: { name: string };
  items: IOrderItem[];
  payment?: { method: PaymentMethod; status: PaymentStatus };
}

export interface IRider {
  id: string;
  name: string;
  phone: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
}

// ── Status Configuration ────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    bg: string;
    dotColor: string;
    nextStatus: OrderStatus | null;
    nextLabel: string;
  }
> = {
  PENDING: {
    label: 'Pending',
    color: '#d97706',
    bg: '#fef3c7',
    dotColor: '#f59e0b',
    nextStatus: 'CONFIRMED',
    nextLabel: 'Confirm Order',
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: '#2563eb',
    bg: '#dbeafe',
    dotColor: '#3b82f6',
    nextStatus: 'PREPARING',
    nextLabel: 'Start Preparing',
  },
  PREPARING: {
    label: 'Preparing',
    color: '#7c3aed',
    bg: '#ede9fe',
    dotColor: '#8b5cf6',
    nextStatus: 'KITCHEN_READY',
    nextLabel: 'Mark Ready',
  },
  KITCHEN_READY: {
    label: 'Kitchen Ready',
    color: '#0891b2',
    bg: '#cffafe',
    dotColor: '#06b6d4',
    nextStatus: 'OUT_FOR_DELIVERY',
    nextLabel: 'Send for Delivery',
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    color: '#ea580c',
    bg: '#ffedd5',
    dotColor: '#f97316',
    nextStatus: 'DELIVERED',
    nextLabel: 'Mark Delivered',
  },
  DELIVERED: {
    label: 'Delivered',
    color: '#059669',
    bg: '#d1fae5',
    dotColor: '#10b981',
    nextStatus: null,
    nextLabel: '',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: '#dc2626',
    bg: '#fee2e2',
    dotColor: '#ef4444',
    nextStatus: null,
    nextLabel: '',
  },
};

// ── Type Configuration ──────────────────────────────────────────────────────────

export const TYPE_CONFIG: Record<
  OrderType,
  { label: string; emoji: string; color: string; bg: string }
> = {
  DINE_IN:  { label: 'Dine-In',  emoji: '🍽️', color: '#7c3aed', bg: '#ede9fe' },
  DELIVERY: { label: 'Delivery', emoji: '🚴', color: '#ea580c', bg: '#ffedd5' },
  PICKUP:   { label: 'Pickup',   emoji: '🛍',  color: '#0891b2', bg: '#cffafe' },
};
