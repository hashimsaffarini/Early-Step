const AGE_DUAL = 2;
const AGE_PLURAL_MAX = 10;

/** Arabic age phrase: "سنة واحدة" / "سنتان" / "5 سنوات" / "11 سنة" / "أقل من سنة". */
export function formatAge(years: number): string {
  if (years < 1) return 'أقل من سنة';
  if (years === 1) return 'سنة واحدة';
  if (years === AGE_DUAL) return 'سنتان';
  if (years <= AGE_PLURAL_MAX) return `${years} سنوات`;
  return `${years} سنة`;
}
