import { COLOR_PADS, type ColorPadId } from './content';

/** Adds one random pad to the sequence (a new level). */
export function extendSequence(
  sequence: readonly ColorPadId[],
  random: () => number = Math.random,
): ColorPadId[] {
  const pad = COLOR_PADS[Math.floor(random() * COLOR_PADS.length)] ?? COLOR_PADS[0];
  return [...sequence, pad.id];
}

export type InputCheck = 'continue' | 'complete' | 'mistake';

/** Checks the child's taps so far against the sequence. */
export function checkInput(
  sequence: readonly ColorPadId[],
  input: readonly ColorPadId[],
): InputCheck {
  const isPrefix = input.every((pad, index) => sequence[index] === pad);
  if (!isPrefix) return 'mistake';
  return input.length === sequence.length ? 'complete' : 'continue';
}
