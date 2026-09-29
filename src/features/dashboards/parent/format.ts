const MORNING_END_HOUR = 12;

/** Time-of-day greeting (Replit dashboard). */
export function getGreeting(date: Date): string {
  return date.getHours() < MORNING_END_HOUR ? 'صباح الخير' : 'مساء الخير';
}
