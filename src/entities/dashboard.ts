import type { OrderType } from '@/shared/constants/status';
import type { Order } from './order';

export interface DashboardSummary {
  todayRevenue: number;
  yesterdayRevenue: number;
  todayOrders: number;
  totalOrders: number;
  totalRevenue: number;
  aov: number;
}

export interface DailyRevenuePoint {
  _id: string;
  revenue: number;
  orders: number;
}

export interface OrderTypeDatum {
  name: string;
  value: number;
}

export interface TopSellingItem {
  _id: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface StatusDistribution {
  [status: string]: number;
}

export interface PeakHourDatum {
  hour: number;
  orders: number;
}

export interface BranchRating {
  avg: number;
  count: number;
  lowCount: number;
  recent: { rating: number; comment: string; orderNumber: string; createdAt: string }[];
}

export interface DashboardStats {
  rating?: BranchRating;
  lowStockCount?: number;
  summary: DashboardSummary;
  dailyRevenue: DailyRevenuePoint[];
  orderTypeDistribution: Record<string, { count: number }>;
  statusDistribution: StatusDistribution;
  topSellingItems: TopSellingItem[];
  peakHoursHeatmap: PeakHourDatum[];
  recentOrders: Order[];
  orderTypes?: OrderType[];
}
