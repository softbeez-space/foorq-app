import { api } from '@/shared/api/client';
import type {
  ActionCheck,
  BranchScore,
  Forecast,
  HistoryWeek,
  MidweekPulse,
  WeeklyReport,
} from '@/entities/analytics';

export async function fetchWeeklyReport(branchId: string, week?: string): Promise<WeeklyReport> {
  const res = await api.get('/analytics/weekly', { params: { branchId, ...(week ? { week } : {}) } });
  return res.data.data;
}

export async function generateAiReport(branchId: string, week?: string): Promise<WeeklyReport> {
  const res = await api.post('/analytics/weekly/generate', { branchId, week });
  return res.data.data;
}

export async function saveActionChecks(
  branchId: string,
  week: string,
  checks: { title: string; done: boolean }[],
): Promise<ActionCheck[]> {
  const res = await api.patch('/analytics/weekly/actions', { branchId, week, checks });
  return res.data.data;
}

export async function fetchPulse(branchId: string): Promise<MidweekPulse> {
  const res = await api.get('/analytics/pulse', { params: { branchId } });
  return res.data.data;
}

export async function fetchBranchScores(week?: string): Promise<BranchScore[]> {
  const res = await api.get('/analytics/branches', { params: { ...(week ? { week } : {}) } });
  return res.data.data;
}

export async function fetchForecast(branchId: string): Promise<Forecast> {
  const res = await api.get('/analytics/forecast', { params: { branchId } });
  return res.data.data;
}

export async function fetchHistory(branchId: string, weeks = 12): Promise<HistoryWeek[]> {
  const res = await api.get('/analytics/history', { params: { branchId, weeks } });
  return res.data.data ?? [];
}
