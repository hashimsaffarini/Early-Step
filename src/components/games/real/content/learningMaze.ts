import type { Difficulty, MazeLevel } from '../types';

/**
 * Early Step educational content for «متاهة التعلم». Grid cells: `#` wall, `.` path, `S` start,
 * `A`–`C` targets. Every target is reachable; only `correct` ends the game.
 */
export const MAZE_LEVELS: Readonly<Record<Difficulty, MazeLevel>> = {
  easy: {
    prompt: 'أوصل السلحفاة إلى التفاحة 🍎',
    grid: ['S..#.', '.#...', '.#.#.', '...#A', '##...'],
    targets: { A: { emoji: '🍎', label: 'تفاحة' } },
    correct: 'A',
  },
  medium: {
    prompt: 'أوصل السلحفاة إلى حرف ب',
    grid: ['S...#..', '.##.#.A', '.#..#..', '.#.##.#', '...#...', '#.#..#.', 'B.....#'],
    targets: {
      A: { emoji: 'أ', label: 'حرف أ' },
      B: { emoji: 'ب', label: 'حرف ب' },
    },
    correct: 'B',
  },
  hard: {
    prompt: 'أوصل السلحفاة إلى الرقم 3',
    grid: [
      'S.#......',
      '..#.####.',
      '#...#..A.',
      '..#.#.##.',
      '.##...#..',
      '...##.#.#',
      '#.#B..#..',
      '..#.###..',
      '.C.....#.',
    ],
    targets: {
      A: { emoji: '5', label: 'الرقم 5' },
      B: { emoji: '3', label: 'الرقم 3' },
      C: { emoji: '8', label: 'الرقم 8' },
    },
    correct: 'B',
  },
};
