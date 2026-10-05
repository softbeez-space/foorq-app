// Dhaka business-week helpers (Sat→Fri), mirroring the web client.

const TZ = 'Asia/Dhaka';
const WD: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function dhakaDateStr(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

function addDaysStr(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  const p = (v: number) => String(v).padStart(2, '0');
  return `${t.getUTCFullYear()}-${p(t.getUTCMonth() + 1)}-${p(t.getUTCDate())}`;
}

/** YYYY-MM-DD of the Saturday starting the week containing `ref`, in Dhaka. */
export function saturdayOfWeek(ref: Date = new Date()): string {
  const wd = WD[new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' }).format(ref)] ?? 0;
  return addDaysStr(dhakaDateStr(ref), -((wd + 1) % 7));
}

export function isWednesday(ref: Date = new Date()): boolean {
  return new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' }).format(ref) === 'Wed';
}

export function shortLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

export function weekRangeLabel(weekStart: string): string {
  return `${shortLabel(weekStart)} – ${shortLabel(addDaysStr(weekStart, 6))}`;
}

export function shiftWeek(weekStart: string, weeks: number): string {
  return addDaysStr(weekStart, weeks * 7);
}
