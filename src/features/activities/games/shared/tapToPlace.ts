import { shuffle } from './shuffle';

/** A word or letter chip that moves between the tray and the answer line. */
export interface PlaceToken {
  id: string;
  text: string;
}

export interface PlaceState {
  tray: PlaceToken[];
  placed: PlaceToken[];
}

/** Tokens (in answer order) → shuffled tray, empty answer line. */
export function createPlaceState(
  texts: readonly string[],
  random: () => number = Math.random,
): PlaceState {
  const tokens = texts.map((text, index) => ({ id: `${index.toString()}-${text}`, text }));
  let tray = shuffle(tokens, random);
  // Never start already solved (when there is more than one distinct order).
  if (tokens.length > 1 && tray.every((token, index) => token.id === tokens[index]?.id)) {
    tray = [...tray.slice(1), ...tray.slice(0, 1)];
  }
  return { tray, placed: [] };
}

/** Moves a tray token to the end of the answer line. */
export function placeToken(state: PlaceState, id: string): PlaceState {
  const token = state.tray.find((item) => item.id === id);
  if (!token) return state;
  return { tray: state.tray.filter((item) => item.id !== id), placed: [...state.placed, token] };
}

/** Returns a placed token to the tray. */
export function removeToken(state: PlaceState, id: string): PlaceState {
  const token = state.placed.find((item) => item.id === id);
  if (!token) return state;
  return { tray: [...state.tray, token], placed: state.placed.filter((item) => item.id !== id) };
}

/** True when the answer line reads exactly one of the accepted answers. */
export function matchesAnswer(
  placed: readonly PlaceToken[],
  accepted: readonly (readonly string[])[],
): boolean {
  const texts = placed.map((token) => token.text);
  return accepted.some(
    (answer) =>
      answer.length === texts.length && answer.every((text, index) => texts[index] === text),
  );
}
