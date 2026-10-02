/** Arabic count phrase for answered questions ("سؤال واحد", "سؤالان", "6 أسئلة", "11 سؤالاً"). */
export function formatQuestionCount(count: number): string {
  if (count === 1) return 'سؤال واحد';
  if (count === 2) return 'سؤالان';
  if (count >= 3 && count <= 10) return `${count.toString()} أسئلة`;
  return `${count.toString()} سؤالاً`;
}
