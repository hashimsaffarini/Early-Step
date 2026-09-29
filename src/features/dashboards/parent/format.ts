/** Arabic, Gregorian, Latin digits (project convention). */
const DISPLAY_LOCALE = 'ar-u-ca-gregory-nu-latn';

export function formatDisplayDate(isoDate: string): string {
  return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoDate));
}

export function formatTodayLong(date: Date): string {
  return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

const MORNING_END_HOUR = 12;

/** Time-of-day greeting (Replit dashboard). */
export function getGreeting(date: Date): string {
  return date.getHours() < MORNING_END_HOUR ? 'صباح الخير' : 'مساء الخير';
}

const AGE_DUAL = 2;
const AGE_PLURAL_MAX = 10;

/** Arabic age phrase: "سنتان" / "5 سنوات" / "11 سنة". */
export function formatAge(years: number): string {
  if (years === 1) return 'سنة واحدة';
  if (years === AGE_DUAL) return 'سنتان';
  if (years <= AGE_PLURAL_MAX) return `${years} سنوات`;
  return `${years} سنة`;
}
