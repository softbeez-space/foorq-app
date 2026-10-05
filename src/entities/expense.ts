export interface Expense {
  _id: string;
  restaurantId: string;
  branchId: { _id: string; name: string } | string;
  title: string;
  description?: string;
  amount: number;
  category: 'Inventory' | 'Salary' | 'Utility' | 'Rent' | 'Marketing' | 'Maintenance' | 'Others';
  date: string;
  paymentMethod: 'Cash' | 'Bank' | 'Mobile Banking';
  attachment: string;
  createdBy: { _id: string; name: string } | string;
  createdAt: string;
  updatedAt: string;
}
