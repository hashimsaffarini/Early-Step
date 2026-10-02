import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { findGame } from '@/features/activities/data/games';
import { WORD_READING_ROUNDS } from '@/features/activities/games/word-reading/content';
import { renderWithRouter } from '@/test/renderWithRouter';

import { GamePlayerPage } from './GamePlayerPage';

function renderPlayer(gameId: string) {
  return renderWithRouter(
    [{ path: '/parent/games/:gameId/play', element: <GamePlayerPage /> }],
    `/parent/games/${gameId}/play`,
  );
}

async function playWordReadingPerfectly() {
  for (const [index, round] of WORD_READING_ROUNDS.entries()) {
    await userEvent.click(screen.getByRole('button', { name: round.answer }));
    const isLast = index === WORD_READING_ROUNDS.length - 1;
    await userEvent.click(screen.getByRole('button', { name: isLast ? 'إنهاء اللعبة' : 'التالي' }));
  }
}

describe('GamePlayerPage', () => {
  it('shows the start screen with instructions and an exit link to the games catalogue', () => {
    renderPlayer('word-reading');

    expect(
      screen.getByRole('heading', { level: 1, name: /الكلمات المتقاطعة/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'كيف ألعب؟' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'خروج' })).toHaveAttribute('href', '/parent/games');
    expect(screen.getByRole('button', { name: 'كتم الصوت' })).toBeInTheDocument();
  });

  it('goes start → playing → result, and «العب مرة أخرى» returns to the start', async () => {
    renderPlayer('word-reading');

    await userEvent.click(screen.getByRole('button', { name: 'ابدأ اللعبة' }));
    expect(screen.getByText('السؤال 1 من 8')).toBeInTheDocument();

    await playWordReadingPerfectly();

    expect(screen.getByRole('heading', { name: 'ممتاز! 🌟' })).toBeInTheDocument();
    expect(
      screen.getByText(
        `${WORD_READING_ROUNDS.length.toString()} من ${WORD_READING_ROUNDS.length.toString()} إجابات صحيحة`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '5 من 5 نجوم' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'كل الألعاب' })).toHaveAttribute(
      'href',
      '/parent/games',
    );
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'العب مرة أخرى' }));
    expect(screen.getByRole('heading', { name: 'كيف ألعب؟' })).toBeInTheDocument();
  });

  it('shows a friendly not-found state for an unknown game', () => {
    renderPlayer('no-such-game');

    expect(screen.getByText('لم نجد هذه اللعبة')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'كل الألعاب' })).toHaveAttribute(
      'href',
      '/parent/games',
    );
  });

  it.each([
    'memory-match',
    'missing-numbers',
    'sentence-builder',
    'pattern-logic',
    'color-memory',
    'listen-choose',
    'balloon-pop',
    'word-scramble',
    'spot-it',
    'story-sequence',
  ])('starts the %s game without errors', async (gameId) => {
    renderPlayer(gameId);

    await userEvent.click(screen.getByRole('button', { name: 'ابدأ اللعبة' }));

    expect(screen.queryByRole('heading', { name: 'كيف ألعب؟' })).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: findGame(gameId)?.title ?? '' }),
    ).toBeInTheDocument();
  });
});
