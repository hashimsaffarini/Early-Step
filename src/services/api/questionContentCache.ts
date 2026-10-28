import { z } from 'zod';
import { getEnv } from '@/config/env';

const PREFIX = 'early-step.question-content.v1:';
const MAX_QUESTIONS = 128;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const schema = z.object({
  id: z.string(),
  text: z.string(),
  type: z.string().nullable(),
  imageUrl: z.string().nullable(),
  options: z.array(z.object({ id: z.string(), text: z.string(), imageUrl: z.string().nullable() })),
});
export type CachedQuestionContent = z.infer<typeof schema>;
const entrySchema = z.object({ savedAt: z.number(), question: schema });
const entriesSchema = z.array(entrySchema);

function key(): string {
  return PREFIX + getEnv().apiBaseUrl;
}
function entries() {
  try {
    const parsed = entriesSchema.safeParse(JSON.parse(localStorage.getItem(key()) ?? '[]'));
    return parsed.success
      ? parsed.data.filter((entry) => Date.now() - entry.savedAt < MAX_AGE_MS)
      : [];
  } catch {
    return [];
  }
}
function write(value: z.infer<typeof entriesSchema>): void {
  try {
    localStorage.setItem(key(), JSON.stringify(value.slice(-MAX_QUESTIONS)));
  } catch {
    /* Optional local content fallback. */
  }
}

/** Cache actual choice ids only; strip admin correctness, scores and any extra fields. */
export function rememberQuestionContent(
  question: Omit<CachedQuestionContent, 'options'> & {
    options: readonly CachedQuestionContent['options'][number][];
  },
): void {
  if (question.options.length === 0) return;
  const parsed = schema.safeParse(question);
  if (!parsed.success) return;
  write([
    ...entries().filter((entry) => entry.question.id !== question.id),
    { savedAt: Date.now(), question: parsed.data },
  ]);
}
export function recalledQuestionContent(id: string): CachedQuestionContent | null {
  return entries().find((entry) => entry.question.id === id)?.question ?? null;
}
export function forgetQuestionContent(id: string): void {
  write(entries().filter((entry) => entry.question.id !== id));
}
export function forgetOptionContent(id: string): void {
  write(
    entries()
      .map((entry) => ({
        ...entry,
        question: {
          ...entry.question,
          options: entry.question.options.filter((option) => option.id !== id),
        },
      }))
      .filter((entry) => entry.question.options.length > 0),
  );
}

/** The exact missing-initial-راء typo reported by the client; unrelated prompts stay untouched. */
export function correctedQuestionText(text: string): string {
  return text.replace(/^(\s*)ت[\u064b-\u065f]*ب(?=\s+الحروف\s+التالية\s+لتكوين\s+كلمة)/u, '$1رتّب');
}

export function clearQuestionContent(): void {
  try {
    localStorage.removeItem(key());
  } catch {
    /* Storage unavailable. */
  }
}
