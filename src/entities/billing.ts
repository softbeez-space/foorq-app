export interface PlanConfig {
  tier: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  priceLifetime: number;
  limits: {
    maxBranches: number;
    maxMenuItems: number;
    maxStaff: number;
  };
  features: string[];
  popular?: boolean;
}

export interface Subscription {
  id: string;
  plan: string;
  cycle: string;
  status: string;
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  paymentHistory: PaymentRecord[];
}

export interface PaymentRecord {
  transactionId: string;
  amount: number;
  method: string;
  paidAt: string;
  notes?: string;
}

export interface Usage {
  branches: number;
  menuItems: number;
  staff: number;
}

export interface MyPlanResponse {
  subscription: Subscription;
  plan: PlanConfig;
  allowedUpgrades: PlanConfig[];
}

export interface InitPaymentResponse {
  gatewayUrl: string;
  transactionId: string;
}
