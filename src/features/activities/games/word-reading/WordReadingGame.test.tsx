import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createTestSound } from '@/test/testSound';

import { WORD_READING_ROUNDS } from './content';
import { WordReadingGame } from './WordReadingGame';

describe('WordReadingGame', () => {
  it('gives feedback in words and reports the right counts at the end', async () => {
    const onFinish = vi.fn();
    render(<WordReadingGame onFinish={onFinish} sound={createTestSound()} />);

    for (const [index, round] of WORD_READING_ROUNDS.entries()) {
      const answerCorrectly = index < 3;
      const choice = answerCorrectly
        ? round.answer
        : (round.options.find((option) => option !== round.answer) ?? '');
      await userEvent.click(screen.getByRole('button', { name: choice }));

      expect(screen.getByRole('status')).toHaveTextContent(
        answerCorrectly ? 'أحسنت! إجابة صحيحة' : 'لا بأس، حاول مرة أخرى',
      );
      const isLast = index === WORD_READING_ROUNDS.length - 1;
      await userEvent.click(
        screen.getByRole('button', { name: isLast ? 'إنهاء اللعبة' : 'التالي' }),
      );
    }

    expect(onFinish).toHaveBeenCalledWith({ correct: 3, total: WORD_READING_ROUNDS.length });
  });

  it('locks the answers once one is chosen', async () => {
    render(<WordReadingGame onFinish={vi.fn()} sound={createTestSound()} />);
    const round = WORD_READING_ROUNDS[0];
    if (!round) throw new Error('no content');

    await userEvent.click(screen.getByRole('button', { name: round.answer }));

    for (const option of round.options) {
      expect(screen.getByRole('button', { name: new RegExp(option) })).toBeDisabled();
    }
    expect(screen.getByRole('button', { name: /إجابة صحيحة/ })).toHaveTextContent(round.answer);
  });
});
