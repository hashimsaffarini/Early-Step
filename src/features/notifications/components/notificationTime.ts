/** "28 سبتمبر، 12:32 م" — Arabic, Gregorian, Latin digits. */
export function formatNotificationTime(iso: string): string {
  return new Intl.DateTimeFormat('ar-u-ca-gregory-nu-latn', {
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}
