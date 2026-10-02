/** Honorific prefixes that should not become the initial (e.g. "أ. سارة" → "س"). */
const HONORIFIC_PREFIX = /^(?:أ|د|م)\.\s*/;

/** First letter of a person's name for avatars, skipping a leading honorific. */
export function getNameInitial(name: string): string {
  return name.trim().replace(HONORIFIC_PREFIX, '').charAt(0);
}
