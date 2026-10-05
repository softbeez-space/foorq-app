export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'completed'
  | 'cancelled'
  | 'delivered';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'served',
  'completed',
];

export const STATUS_COLOR_KEY: Record<OrderStatus, 'amber' | 'accent' | 'primary' | 'lime' | 'rose'> = {
  pending: 'amber',
  confirmed: 'accent',
  preparing: 'accent',
  ready: 'primary',
  served: 'lime',
  completed: 'lime',
  cancelled: 'rose',
  delivered: 'lime',
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Served',
  completed: 'Completed',
  cancelled: 'Cancelled',
  delivered: 'Delivered',
};
