/** Arabic text, Gregorian calendar, Latin digits (project convention — Replit mixed digits). */
const LOCALE = 'ar-u-ca-gregory-nu-latn';

/** "12:30 م" */
export function formatMessageTime(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', minute: '2-digit' }).format(
    new Date(iso),
  );
}

/** "28 سبتمبر" */
export function formatMessageDay(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long' }).format(new Date(iso));
}

/** Calendar-day key `YYYY-MM-DD` in local time (for date separators). */
export function toDayKey(iso: string): string {
  const date = new Date(iso);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${String(date.getFullYear())}-${month}-${day}`;
}
