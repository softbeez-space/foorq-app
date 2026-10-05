import { api } from '@/shared/api/client';
import type { RestaurantFull } from '@/entities/restaurant';

export async function fetchRestaurant(): Promise<RestaurantFull> {
  const res = await api.get('/restaurant');
  return res.data.data;
}

export async function updateRestaurant(body: Record<string, unknown>): Promise<RestaurantFull> {
  const res = await api.put('/restaurant', body);
  return res.data.data;
}

export async function updateVatSettings(body: {
  vatEnabled: boolean;
  taxMode: string;
  vatType: string;
  bin: string;
  vatRate?: number;
  turnoverRate?: number;
}): Promise<RestaurantFull> {
  const res = await api.put('/restaurant/settings/vat', body);
  return res.data.data;
}

export async function uploadLogo(fileUri: string): Promise<string> {
  const formData = new FormData();
  const filename = fileUri.split('/').pop() ?? 'logo.jpg';
  formData.append('image', {
    uri: fileUri,
    name: filename,
    type: 'image/jpeg',
  } as any);
  const res = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data.url;
}
