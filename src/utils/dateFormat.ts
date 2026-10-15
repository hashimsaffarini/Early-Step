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
