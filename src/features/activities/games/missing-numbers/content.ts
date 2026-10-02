/** TEMPORARY UI DEMO CONTENT — number sequences with one gap (the rule is never shown). */
export interface MissingNumberRound {
  /** `null` marks the gap. */
  sequence: readonly (number | null)[];
  options: readonly string[];
  answer: string;
}

export const MISSING_NUMBER_ROUNDS: readonly MissingNumberRound[] = [
  { sequence: [1, 2, null, 4, 5], options: ['2', '3', '6', '7'], answer: '3' },
  { sequence: [2, 4, null, 8, 10], options: ['5', '6', '7', '9'], answer: '6' },
  { sequence: [1, 3, 5, null, 9], options: ['6', '7', '8', '10'], answer: '7' },
  { sequence: [5, 10, null, 20, 25], options: ['11', '12', '15', '18'], answer: '15' },
  { sequence: [10, 8, null, 4, 2], options: ['5', '6', '7', '9'], answer: '6' },
  { sequence: [3, 6, 9, null, 15], options: ['10', '11', '12', '13'], answer: '12' },
];
