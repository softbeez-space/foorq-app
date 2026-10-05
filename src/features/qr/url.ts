import { ENV } from '@/shared/config/env';

export function buildBranchQrUrl(restaurantSlug: string, branchSlug: string): string {
  return `${ENV.menuBaseUrl}/${restaurantSlug}/${branchSlug}`;
}

export function buildTableQrUrl(restaurantSlug: string, branchSlug: string, tableNumber: string): string {
  return `${buildBranchQrUrl(restaurantSlug, branchSlug)}?table=${encodeURIComponent(tableNumber)}`;
}
