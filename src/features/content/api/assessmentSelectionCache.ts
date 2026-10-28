import { z } from 'zod';
import { getEnv } from '@/config/env';

const PREFIX = 'early-step.assessment-actions.v1:';
const MAX_ENTRIES = 512;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const schema = z.array(z.object({ id: z.string(), include: z.boolean(), savedAt: z.number() }));
export type QuestionActions = Record<string, 'added' | 'removed'>;
function key() {
  return PREFIX + getEnv().apiBaseUrl;
}
function entries() {
  try {
    const result = schema.safeParse(JSON.parse(localStorage.getItem(key()) ?? '[]'));
    return result.success
      ? result.data.filter((entry) => Date.now() - entry.savedAt < MAX_AGE_MS)
      : [];
  } catch {
    return [];
  }
}
/** Only acknowledged API operations are recorded; this is a local history, not a global read API. */
export function rememberAssessmentActions(ids: readonly string[], include: boolean): void {
  try {
    const changed = new Set(ids);
    localStorage.setItem(
      key(),
      JSON.stringify(
        [
          ...entries().filter((entry) => !changed.has(entry.id)),
          ...ids.map((id) => ({ id, include, savedAt: Date.now() })),
        ].slice(-MAX_ENTRIES),
      ),
    );
  } catch {
    /* Optional local history. */
  }
}
export function readAssessmentActions(): QuestionActions {
  return Object.fromEntries(
    entries().map((entry) => [entry.id, entry.include ? 'added' : 'removed']),
  );
}
export function clearAssessmentActions(): void {
  try {
    localStorage.removeItem(key());
  } catch {
    /* Storage denied. */
  }
}
