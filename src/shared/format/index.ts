const currencySymbol = '৳';

export function formatCurrency(value: number | undefined | null): string {
  const v = Math.round(Number(value ?? 0));
  return `${currencySymbol}${v.toLocaleString('en-US')}`;
}

export function formatNumber(value: number | undefined | null): string {
  return Number(value ?? 0).toLocaleString('en-US');
}

export function formatPercent(value: number | undefined | null, digits = 1): string {
  const v = Number(value ?? 0);
  return `${v >= 0 ? '+' : ''}${v.toFixed(digits)}%`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function initials(name?: string | null): string {
  if (!name) return 'A';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
