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

/** Whole years between an ISO birth date (`YYYY-MM-DD`) and `today`. */
export function ageInYears(birthDate: string, today: Date = new Date()): number {
  const birth = new Date(`${birthDate}T00:00:00`);
  let years = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) years -= 1;
  return Math.max(years, 0);
}
