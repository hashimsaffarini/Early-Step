import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { toChoiceAnswer } from '@/components/players';

import { FocusChallenge } from './focus-challenge/FocusChallenge';
import { LetterHunt } from './letter-hunt/LetterHunt';
import { MemorySequence } from './memory-sequence/MemorySequence';
import { NumberMatch } from './number-match/NumberMatch';
import type { ChallengeProps, GameQuestion } from './types';

type Engine = (props: ChallengeProps) => React.ReactNode;

/** Renders an engine with real selection state and exposes the backend payload it produces. */
function play(Engine: Engine, question: GameQuestion) {
  const payload: { current: unknown } = { current: null };
  function Harness() {
    const [selection, setSelection] = useState<string[]>([]);
    payload.current = toChoiceAnswer(
      question.id,
      question.type,
      question.options.length,
      selection,
    );
    return <Engine question={question} selection={selection} onSelectionChange={setSelection} />;
  }
  render(<Harness />);
  return payload;
}

const opt = (id: string, text: string, imageUrl: string | null = null) => ({ id, text, imageUrl });

describe('LetterHunt (SingleChoice → selectedOptionId)', () => {
  const question: GameQuestion = {
    id: 'q1',
    text: 'ما الحرف الأول في كلمة «أسد»؟',
    imageUrl: null,
    type: 'SingleChoice',
    options: [opt('o1', 'أ'), opt('o2', 'ب'), opt('o3', 'ت')],
  };

  it('renders the backend options as big cards and maps the tapped one', async () => {
    const payload = play(LetterHunt, question);
    const cards = within(screen.getByRole('list', { name: 'البطاقات' })).getAllByRole('button');
    expect(cards.map((card) => card.getAttribute('aria-label'))).toEqual(['أ', 'ب', 'ت']);

    await userEvent.click(screen.getByRole('button', { name: 'ب' }));
    expect(screen.getByRole('button', { name: 'ب — مختارة' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await userEvent.click(screen.getByRole('button', { name: 'أ' }));

    expect(payload.current).toEqual({ questionId: 'q1', selectedOptionId: 'o1' });
    expect(screen.getByRole('button', { name: 'ب' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('is keyboard operable (native buttons)', async () => {
    const payload = play(LetterHunt, question);
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(payload.current).toEqual({ questionId: 'q1', selectedOptionId: 'o1' });
  });
});

describe('NumberMatch (SingleChoice → selectedOptionId)', () => {
  it('renders the backend number options and maps the chosen one', async () => {
    const payload = play(NumberMatch, {
      id: 'q2',
      text: 'كم عدد أصابع اليد؟',
      imageUrl: null,
      type: 'SingleChoice',
      options: [opt('n3', '3'), opt('n5', '5'), opt('n6', '6')],
    });
    const cards = screen.getByRole('list', { name: 'بطاقات الأرقام' });
    expect(within(cards).getAllByRole('button')).toHaveLength(3);

    await userEvent.click(screen.getByRole('button', { name: '5' }));
    expect(payload.current).toEqual({ questionId: 'q2', selectedOptionId: 'n5' });
  });

  it('shows the option image and falls back to a named card when it is missing', () => {
    play(NumberMatch, {
      id: 'q3',
      text: 'اختر الصورة',
      imageUrl: null,
      type: 'SingleChoice',
      options: [opt('i1', '', '/uploads/three.png'), opt('i2', 'خمسة')],
    });
    const image = screen.getByRole('button', { name: 'الخيار 1' }).querySelector('img');
    expect(image).toHaveAttribute('src', expect.stringContaining('/uploads/three.png') as string);
    if (image) fireEvent.error(image);
    // A failed image never shows a broken icon; the card keeps its accessible name.
    expect(screen.getByRole('button', { name: 'الخيار 1' }).querySelector('img')).toBeNull();
  });
});

describe('MemorySequence (Sequence → orderedOptionIds)', () => {
  const question: GameQuestion = {
    id: 'q4',
    text: 'رتّب حروف كلمة «قلم»',
    imageUrl: null,
    type: 'Sequence',
    options: [opt('l', 'ل'), opt('m', 'م'), opt('q', 'ق')],
  };

  it('orders by tapping, shows the order, and sends the exact order', async () => {
    const payload = play(MemorySequence, question);

    await userEvent.click(screen.getByRole('button', { name: 'ق' }));
    await userEvent.click(screen.getByRole('button', { name: 'ل' }));
    expect(payload.current).toBeNull(); // incomplete until every card has a place
    await userEvent.click(screen.getByRole('button', { name: 'م' }));

    expect(payload.current).toEqual({ questionId: 'q4', orderedOptionIds: ['q', 'l', 'm'] });
    expect(screen.getByRole('button', { name: 'ق — الترتيب 1' })).toBeDisabled();
    const slots = within(screen.getByRole('region', { name: 'ترتيبك' })).getAllByRole('listitem');
    expect(slots.map((slot) => slot.textContent)).toEqual(['1ق', '2ل', '3م']);
  });

  it('undoes the last card and resets the order', async () => {
    const payload = play(MemorySequence, question);
    await userEvent.click(screen.getByRole('button', { name: 'م' }));
    await userEvent.click(screen.getByRole('button', { name: 'ق' }));

    await userEvent.click(screen.getByRole('button', { name: 'تراجع' }));
    expect(screen.getByRole('button', { name: 'ق' })).toBeEnabled();
    await userEvent.click(screen.getByRole('button', { name: 'إعادة الترتيب' }));
    expect(screen.getByRole('button', { name: 'م' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'تراجع' })).toBeDisabled();

    for (const name of ['ل', 'ق', 'م']) {
      await userEvent.click(screen.getByRole('button', { name }));
    }
    expect(payload.current).toEqual({ questionId: 'q4', orderedOptionIds: ['l', 'q', 'm'] });
  });
});

describe('FocusChallenge (MultiSelect → selectedOptionIds)', () => {
  it('selects several cards, toggles one off, clears, and sends the selected list', async () => {
    const payload = play(FocusChallenge, {
      id: 'q5',
      text: 'اختر كل الفواكه',
      imageUrl: null,
      type: 'MultiSelect',
      options: [opt('a', 'تفاحة'), opt('b', 'كرسي'), opt('c', 'موز')],
    });

    await userEvent.click(screen.getByRole('button', { name: 'تفاحة' }));
    await userEvent.click(screen.getByRole('button', { name: 'كرسي' }));
    await userEvent.click(screen.getByRole('button', { name: 'موز' }));
    await userEvent.click(screen.getByRole('button', { name: 'كرسي — مختارة' }));
    expect(screen.getByText('اخترت 2 من 3')).toBeInTheDocument();
    expect(payload.current).toEqual({ questionId: 'q5', selectedOptionIds: ['a', 'c'] });

    await userEvent.click(screen.getByRole('button', { name: 'مسح الاختيار' }));
    expect(payload.current).toBeNull();
    expect(screen.getByText('اخترت 0 من 3')).toBeInTheDocument();
  });
});

describe('mobile-safe markup', () => {
  it('uses shrinkable grid columns and large tap targets, logical properties only', async () => {
    const { readFileSync } = await import('node:fs');
    const css = readFileSync(
      `${process.cwd()}/src/components/games/shared/Game.module.css`,
      'utf8',
    ).replace(/\s+/g, ' ');
    expect(css).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))');
    expect(css).toContain('min-block-size: 7rem');
    expect(css).toContain('overflow-wrap: anywhere');
    expect(css).toContain('prefers-reduced-motion');
    expect(css).not.toMatch(/(margin|padding|border)-(left|right)|\b(left|right):/);
  });
});
