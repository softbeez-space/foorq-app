export interface Staff {
  _id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'staff';
  restaurantId: string;
  branchId?: { _id: string; name: string } | string;
  phone: string;
  avatar: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}
