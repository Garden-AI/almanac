/** Compact byte count: GB / MB / KB / B. One decimal at the small end,
 *  zero at the large end — keeps the Size column visually narrow. */
export function formatBytes(n: number | undefined | null): string {
  if (n == null) return '';
  if (n >= 1e9) return (n / 1e9).toFixed(n >= 10e9 ? 0 : 1) + ' GB';
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 10e6 ? 0 : 1) + ' MB';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + ' KB';
  return n + ' B';
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** "January 2026" from "YYYY-MM" or "YYYY-MM-DD". Returns null on no match. */
export function formatMonthYear(s: string | undefined | null): string | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})/.exec(s);
  if (!m) return null;
  return MONTHS[parseInt(m[2], 10) - 1] + ' ' + m[1];
}

/** Year extracted from an ISO-ish date, or null. */
export function yearOf(s: string | undefined | null): number | null {
  if (!s) return null;
  const m = /^(\d{4})/.exec(s);
  return m ? parseInt(m[1], 10) : null;
}
