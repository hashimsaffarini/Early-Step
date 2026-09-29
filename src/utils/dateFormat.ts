/** Arabic, Gregorian calendar, Latin digits (project convention). */
const DISPLAY_LOCALE = 'ar-u-ca-gregory-nu-latn';

/** "26 سبتمبر 2026" */
export function formatDisplayDate(isoDate: string): string {
  return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoDate));
}

/** "الثلاثاء، 29 سبتمبر" */
export function formatTodayLong(date: Date): string {
  return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

/** Local calendar date as `YYYY-MM-DD` (for `<input type="date">` bounds). */
export function toIsoDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
