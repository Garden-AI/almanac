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
