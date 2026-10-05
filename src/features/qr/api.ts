import { api } from '@/shared/api/client';

export interface QrDesign {
  fgColor: string;
  bgColor: string;
  dotStyle: string;
  cornerStyle: string;
  logo?: string;
}

export const DEFAULT_QR_DESIGN: QrDesign = {
  fgColor: '#0f172a',
  bgColor: '#ffffff',
  dotStyle: 'squares',
  cornerStyle: 'squares',
  logo: '',
};

/** Restaurant-level saved design (branch overrides stay web-managed). */
export async function fetchQrDesign(): Promise<QrDesign> {
  const res = await api.get('/restaurant');
  return { ...DEFAULT_QR_DESIGN, ...(res.data?.data?.settings?.qrDesign ?? {}) };
}

export async function saveQrDesign(design: QrDesign): Promise<void> {
  await api.put('/restaurant', { 'settings.qrDesign': design });
}

export interface QrHistoryEntry {
  _id: string;
  kind: 'branch' | 'table';
  ref: string;
  url: string;
  qrCode: string;
  fgColor: string;
  bgColor: string;
  createdAt: string;
}

export async function updateBranchQrDesign(
  branchId: string,
  design: Partial<QrDesign>
): Promise<void> {
  await api.put(`/restaurant/branches/${branchId}`, { qrDesign: design });
}

export async function fetchQrHistory(branchId: string): Promise<QrHistoryEntry[]> {
  const res = await api.get(`/restaurant/branches/${branchId}/qr-history`);
  return res.data.data ?? [];
}

export async function restoreQrHistory(branchId: string, entryId: string): Promise<void> {
  await api.post(`/restaurant/branches/${branchId}/qr-history/${entryId}/restore`);
}
