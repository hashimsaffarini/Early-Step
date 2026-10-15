import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createTestSound } from '@/test/testSound';

import { SENTENCE_ROUNDS } from './content';
import { SentenceBuilderGame } from './SentenceBuilderGame';

describe('SentenceBuilderGame', () => {
  it('builds a sentence by tapping words, and a placed word can be tapped back', async () => {
    render(<SentenceBuilderGame onFinish={vi.fn()} sound={createTestSound()} />);
    const round = SENTENCE_ROUNDS[0];
    if (!round) throw new Error('no content');
    const tray = screen.getByRole('list', { name: 'الكلمات' });

    expect(screen.getByRole('button', { name: 'تحقق' })).toBeDisabled();

    const [firstWord] = round.tokens;
    if (!firstWord) throw new Error('no words');
    await userEvent.click(within(tray).getByRole('button', { name: firstWord }));
    await userEvent.click(screen.getByRole('button', { name: `${firstWord} (اضغط لإعادتها)` }));
    expect(within(tray).getByRole('button', { name: firstWord })).toBeInTheDocument();

    for (const word of round.tokens) {
      await userEvent.click(within(tray).getByRole('button', { name: word }));
    }
    await userEvent.click(screen.getByRole('button', { name: 'تحقق' }));

    expect(screen.getByRole('status')).toHaveTextContent('أحسنت! إجابة صحيحة');
    expect(screen.getByRole('button', { name: 'التالي' })).toBeInTheDocument();
  });
});
