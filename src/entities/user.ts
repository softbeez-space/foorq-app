export type UserRole = 'owner' | 'manager' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  restaurantId?: string;
  branchId?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  planSetupComplete?: boolean;
  accentColor?: string;
}
