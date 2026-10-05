export interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  lastOrderDate?: string;
  createdAt: string;
  updatedAt: string;
}
