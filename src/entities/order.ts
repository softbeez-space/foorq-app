import type { OrderStatus, PaymentStatus, OrderType } from '@/shared/constants/status';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  addons: string[];
  specialInstructions: string;
  subtotal: number;
}

export interface OrderStatusEvent {
  status: string;
  byRole?: string;
  byName?: string;
  note?: string;
  at: string;
}

export interface OrderPaymentEvent {
  type: 'paid' | 'refunded-cash';
  method: string;
  amount: number;
  tendered?: number;
  change?: number;
  byName?: string;
  note?: string;
  at: string;
}

export interface OrderDiscount {
  type?: 'percentage' | 'fixed';
  value?: number;
  amount?: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  vatRateApplied?: number | null;
  binSnapshot?: string;
  buyerName?: string;
  buyerBin?: string;
  taxMode?: string;
  discount?: OrderDiscount;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  customerName?: string;
  customerPhone?: string;
  orderType: OrderType;
  tableNumber?: number;
  sessionId?: string;
  origin?: string;
  requiresConfirmation?: boolean;
  statusHistory?: OrderStatusEvent[];
  paymentEvents?: OrderPaymentEvent[];
  estimatedTime?: number;
  createdAt: string;
}
