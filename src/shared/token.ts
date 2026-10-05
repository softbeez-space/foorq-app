// Counter-call token: ORD-20260101-0042 → "42". Mirrors the backend
// pickupTokenFromOrderNumber exactly — unique per day, shoutable.
export function pickupToken(orderNumber?: string): string {
  const suffix = (orderNumber || '').split('-').pop() || '';
  const stripped = suffix.replace(/^0+/, '');
  return stripped || '0';
}
