export interface InsightItem {
  title: string;
  detail: string;
}

export interface ActionCheck {
  title: string;
  detail: string;
  done: boolean;
  doneAt?: string;
}

export interface WeekKpis {
  revenue: number;
  orders: number;
  aov: number;
  expenses: number;
  profit: number;
  margin: number | null;
  discountsGiven: number;
  discountedOrders: number;
  cancelled: number;
}

export interface WeekDeltas {
  revenue: number | null;
  orders: number | null;
  aov: number | null;
  profit: number | null;
}

export interface DayPoint {
  date: string;
  day: string;
  revenue: number;
  orders: number;
}

export interface RankedItem {
  _id: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  image?: string;
  categoryName?: string;
}

export interface HistoryWeek {
  weekStart: string;
  weekEnd: string;
  revenue: number;
  orders: number;
  expenses: number;
  profit: number;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  timezone: string;
  facts: {
    kpis: WeekKpis;
    deltas: WeekDeltas;
    daily: DayPoint[];
    bestDay: { day: string; revenue: number; share: number } | null;
    slowestDay: { day: string; revenue: number; share: number } | null;
    topItems: RankedItem[];
    slowItems: RankedItem[];
    paymentMix: { method: string; count: number; revenue: number }[];
    orderTypeMix: { type: string; count: number; revenue: number }[];
    expensesByCategory: { category: string; total: number; count: number }[];
    repeat: { distinctCustomers: number; repeatCustomers: number; repeatRate: number | null };
    drawer: { closes: number; varianceSum: number; worstVariance: number };
    loyalty: { pointsEarned: number; pointsBurned: number };
  };
  highlights: {
    wins: InsightItem[];
    problems: InsightItem[];
    actions: InsightItem[];
  };
  source: 'rules' | 'ai';
  aiReport: { summaryEn: string; summaryBn: string } | null;
  aiGeneratedAt: string | null;
  actionChecklist: ActionCheck[];
  generatedAt: string;
}

export interface MidweekPulse {
  alert: boolean;
  pctBehind: number | null;
  headline: string;
  suggestion: string;
  weekStart: string;
  weekEnd: string;
  revenueSoFar: number;
  ordersSoFar: number;
  baselineRevenue: number;
  baselineOrders: number;
  slowestDaySoFar: string | null;
  topItemSoFar: string | null;
}

export interface BranchScore {
  branchId: string;
  branchName: string;
  revenue: number;
  orders: number;
  profit: number;
  margin: number | null;
  revenueDelta: number | null;
  rank: number;
}

export interface Forecast {
  projectedRevenue: number;
  low: number;
  high: number;
  projectedOrders: number;
  trend: 'up' | 'steady' | 'down';
  weeksUsed: number;
}
