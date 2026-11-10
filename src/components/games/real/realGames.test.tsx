import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';

import { LearningMaze } from './learning-maze/LearningMaze';
import { MemoryPairs } from './memory-pairs/MemoryPairs';
import { RealGameSession } from './RealGameSession';
import { difficultyForAge, REAL_GAME_LIST, REAL_GAMES, resolveRealGame } from './registry';
import { SequenceTrain } from './sequence-train/SequenceTrain';
import { SortAndMatch } from './sort-and-match/SortAndMatch';
import { TargetCatch } from './target-catch/TargetCatch';
import {
  CATCH_LEVELS,
  MAZE_LEVELS,
  MEMORY_PAIRS_LEVELS,
  SEQUENCE_LEVELS,
  SORT_LEVELS,
} from './content';
import { DIFFICULTIES } from './types';

/** Deterministic shuffles; with 0 every «اصطد الهدف» balloon is a target. */
const fixed = () => 0;

const cat = { emoji: '🐱', label: 'قطة' };
const fish = { emoji: '🐟', label: 'سمكة' };

describe('real games — registry', () => {
  it('lists exactly the five real games in order', () => {
    expect(REAL_GAME_LIST.map((game) => game.slug)).toEqual([
      'memory-pairs',
      'sort-and-match',
      'target-catch',
      'sequence-train',
      'learning-maze',
    ]);
    for (const game of REAL_GAME_LIST) {
      expect(game.name).not.toBe('');
      expect(game.skill).not.toBe('');
      expect(game.instruction).not.toBe('');
    }
  });

  it('resolves a slug exactly or with a suffix, and nothing else', () => {
    expect(resolveRealGame('memory-pairs')?.name).toBe('لعبة الذاكرة');
    expect(resolveRealGame('learning-maze-2')?.name).toBe('متاهة التعلم');
    expect(resolveRealGame('memory-pairsx')).toBeNull();
    expect(resolveRealGame('letter-hunt')).toBeNull();
    expect(resolveRealGame(null)).toBeNull();
  });

  it.each([
    [2, 'easy'],
    [4, 'easy'],
    [5, 'medium'],
    [7, 'medium'],
    [8, 'hard'],
    [10, 'hard'],
    [null, 'easy'],
  ] as const)('picks the default difficulty for age %s → %s', (age, difficulty) => {
    expect(difficultyForAge(age)).toBe(difficulty);
  });

  it('has content for every game and difficulty', () => {
    for (const difficulty of DIFFICULTIES) {
      expect(MEMORY_PAIRS_LEVELS[difficulty].pairs.length).toBeGreaterThan(0);
      expect(SORT_LEVELS[difficulty].items.length).toBeGreaterThan(0);
      expect(CATCH_LEVELS[difficulty].goal).toBeGreaterThan(0);
      expect(SEQUENCE_LEVELS[difficulty].stages.length).toBeGreaterThan(0);
      expect(MAZE_LEVELS[difficulty].targets[MAZE_LEVELS[difficulty].correct]).toBeDefined();
    }
  });
});

describe('real games — engines', () => {
  it('memory pairs: flips cards and finishes when every pair is found', async () => {
    const onComplete = vi.fn();
    render(
      <MemoryPairs
        level={{ pairs: [{ id: 'p', a: cat, b: cat }] }}
        onComplete={onComplete}
        random={fixed}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'بطاقة 1 مقلوبة' }));
    expect(screen.getByRole('button', { name: 'قطة' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'بطاقة 2 مقلوبة' }));
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
    expect(screen.getAllByRole('button', { name: 'قطة — زوج مكتشف' })).toHaveLength(2);
  });

  it('sort and match: tap a picture, then its group; a wrong group only bounces it back', async () => {
    const onComplete = vi.fn();
    render(
      <SortAndMatch
        level={{
          zones: [
            { id: 'farm', label: 'المزرعة', emoji: '🏡' },
            { id: 'sea', label: 'البحر', emoji: '🌊' },
          ],
          items: [{ id: 'fish', visual: fish, zoneId: 'sea' }],
        }}
        onComplete={onComplete}
        random={fixed}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'سمكة' }));
    expect(screen.getByRole('button', { name: 'سمكة' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: /^المزرعة/ }));
    expect(onComplete).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'سمكة' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'سمكة' }));
    await userEvent.click(screen.getByRole('button', { name: /^البحر/ }));
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith([
        { label: 'العناصر الصحيحة', value: '1 من 1' },
        { label: 'المحاولات الخاطئة', value: '1' },
      ]);
    });
  });

  it('target catch: tapping targets fills the goal, a distractor only wiggles', async () => {
    const onComplete = vi.fn();
    let flip = true;
    // Alternate target / distractor balloons.
    const alternate = () => {
      flip = !flip;
      return flip ? 0.9 : 0;
    };
    render(
      <TargetCatch
        level={{
          prompt: 'المس القطط',
          targets: [cat],
          distractors: [fish],
          goal: 2,
          balloons: 3,
          floatSeconds: 8,
        }}
        onComplete={onComplete}
        random={alternate}
      />,
    );
    const field = screen.getByRole('list', { name: 'منطقة اللعب' });
    const distractor = within(field).queryAllByRole('button', { name: 'بالون: سمكة' })[0];
    if (distractor) {
      await userEvent.click(distractor);
      expect(screen.getByRole('status')).toHaveTextContent('هذا سمكة، ابحث عن الهدف.');
    }
    for (let caught = 0; caught < 2; caught += 1) {
      const target = within(field).getAllByRole('button', { name: 'بالون: قطة' })[0];
      if (!target) throw new Error('a target balloon is always kept in the air');
      await userEvent.click(target);
    }
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByRole('progressbar', { name: 'الأهداف التي جمعتها' })).toHaveAttribute(
      'aria-valuenow',
      '2',
    );
  });

  it('sequence train: places cards in order, supports undo / reset and finishes', async () => {
    const onComplete = vi.fn();
    render(
      <SequenceTrain
        level={{ stages: [{ prompt: 'رتّب من الصغير إلى الكبير', items: [fish, cat] }] }}
        onComplete={onComplete}
        random={fixed}
      />,
    );
    const cards = screen.getByRole('list', { name: 'البطاقات' });
    // Wrong order first: a gentle message, nothing finishes.
    await userEvent.click(within(cards).getByRole('button', { name: 'قطة' }));
    await userEvent.click(screen.getByRole('button', { name: 'تراجع' }));
    expect(within(cards).getByRole('button', { name: 'قطة' })).toBeInTheDocument();
    await userEvent.click(within(cards).getByRole('button', { name: 'قطة' }));
    await userEvent.click(within(cards).getByRole('button', { name: 'سمكة' }));
    expect(screen.getByRole('status')).toHaveTextContent('الترتيب غير صحيح بعد');
    await userEvent.click(screen.getByRole('button', { name: 'إعادة' }));
    await userEvent.click(within(cards).getByRole('button', { name: 'سمكة' }));
    await userEvent.click(within(cards).getByRole('button', { name: 'قطة' }));
    expect(screen.getByRole('status')).toHaveTextContent('أحسنت! القطار مرتّب بشكل صحيح.');
    await userEvent.click(screen.getByRole('button', { name: 'إنهاء اللعبة' }));
    expect(onComplete).toHaveBeenCalledWith([
      { label: 'المراحل المكتملة', value: '1 من 1' },
      { label: 'محاولات الترتيب الخاطئة', value: '1' },
    ]);
  });

  it('learning maze: walls block, arrow buttons and keyboard move, the right target finishes', async () => {
    const onComplete = vi.fn();
    render(
      <LearningMaze
        level={{
          prompt: 'أوصل السلحفاة إلى القطة',
          grid: ['S#', '.B', 'A.'],
          targets: { A: cat, B: fish },
          correct: 'A',
        }}
        onComplete={onComplete}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'يمين' }));
    expect(screen.getByRole('status')).toHaveTextContent('هنا جدار، جرّب اتجاهاً آخر.');
    await userEvent.click(screen.getByRole('button', { name: 'أسفل' }));
    await userEvent.click(screen.getByRole('button', { name: 'يمين' }));
    expect(screen.getByRole('status')).toHaveTextContent('هذا سمكة، ابحث عن قطة.');
    expect(onComplete).not.toHaveBeenCalled();
    const board = screen.getByRole('grid', { name: 'المتاهة — استخدم الأسهم للتحرّك' });
    fireEvent.keyDown(board, { key: 'ArrowLeft' });
    fireEvent.keyDown(board, { key: 'ArrowDown' });
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith([
        { label: 'الهدف', value: 'تم الوصول إلى قطة' },
        { label: 'عدد الخطوات', value: '4' },
      ]);
    });
  });
});

describe('real games — session (start screen, end screen, replay)', () => {
  function renderSession() {
    return render(
      <MemoryRouter>
        <RealGameSession
          game={REAL_GAMES['target-catch']}
          initialDifficulty="medium"
          exitTo="/parent/children/c-1"
          random={fixed}
        />
      </MemoryRouter>,
    );
  }

  it('shows a start screen with the game, its instruction and the age-based difficulty', () => {
    renderSession();
    expect(screen.getByRole('heading', { name: 'اصطد الهدف' })).toBeInTheDocument();
    expect(screen.getByText(REAL_GAMES['target-catch'].instruction)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'متوسط' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'ابدأ اللعب' })).toBeInTheDocument();
  });

  it('ends with a real session summary and is always replayable — no stars or coins', async () => {
    renderSession();
    await userEvent.click(screen.getByRole('button', { name: 'سهل' }));
    await userEvent.click(screen.getByRole('button', { name: 'ابدأ اللعب' }));
    const goal = CATCH_LEVELS.easy.goal;
    for (let caught = 0; caught < goal; caught += 1) {
      const balloon = screen.getAllByRole('button', { name: /^بالون:/ })[0];
      if (!balloon) throw new Error('no balloon');
      await userEvent.click(balloon);
    }

    expect(await screen.findByRole('heading', { name: 'أحسنت!' })).toBeInTheDocument();
    expect(screen.getByText('أنهيت اللعبة بنجاح')).toBeInTheDocument();
    const summary = screen.getByLabelText('ملخص اللعب');
    expect(summary).toHaveTextContent(`${goal.toString()} من ${goal.toString()}`);
    expect(screen.queryByText(/نجوم|نجمة|عملات|⭐/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'العودة للخطة' })).toHaveAttribute(
      'href',
      '/parent/children/c-1',
    );
    // Replay starts a fresh round right away (no submission involved).
    await userEvent.click(screen.getByRole('button', { name: 'العب مرة أخرى' }));
    expect(screen.getByRole('progressbar', { name: 'الأهداف التي جمعتها' })).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
  });
});
