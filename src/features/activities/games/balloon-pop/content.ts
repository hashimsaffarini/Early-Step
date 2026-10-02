/** TEMPORARY UI DEMO CONTENT — simple sums; each answer is carried by a balloon. */
export interface BalloonRound {
  /** Left-to-right math expression, rendered inside `<bdi dir="ltr">`. */
  expression: string;
  /** How the question is read aloud / announced. */
  spoken: string;
  options: readonly string[];
  answer: string;
}

export const BALLOON_ROUNDS: readonly BalloonRound[] = [
  { expression: '2 + 3', spoken: 'اثنان زائد ثلاثة', options: ['4', '5', '6', '7'], answer: '5' },
  { expression: '4 + 4', spoken: 'أربعة زائد أربعة', options: ['6', '7', '8', '9'], answer: '8' },
  { expression: '9 - 3', spoken: 'تسعة ناقص ثلاثة', options: ['5', '6', '7', '12'], answer: '6' },
  { expression: '3 + 4', spoken: 'ثلاثة زائد أربعة', options: ['6', '7', '8', '1'], answer: '7' },
  { expression: '10 - 5', spoken: 'عشرة ناقص خمسة', options: ['4', '5', '6', '15'], answer: '5' },
  { expression: '6 + 3', spoken: 'ستة زائد ثلاثة', options: ['8', '9', '10', '3'], answer: '9' },
];
