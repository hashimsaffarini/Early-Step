import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createTestSound } from '@/features/activities/games/shared/testSound';

import { STORIES } from './content';
import { StorySequenceGame } from './StorySequenceGame';

/** Moves each event up with the buttons until the list matches the story order. */
async function sortWithButtons(events: readonly { text: string }[]) {
  for (const [target, event] of events.entries()) {
    const list = screen.getByRole('list', { name: 'أحداث القصة' });
    let position = within(list)
      .getAllByRole('listitem')
      .findIndex((item) => item.textContent.includes(event.text));
    while (position > target) {
      await userEvent.click(screen.getByRole('button', { name: `حرّك «${event.text}» للأعلى` }));
      position -= 1;
    }
  }
}

describe('StorySequenceGame', () => {
  it('reorders events with buttons, checks them and finishes without crashing', async () => {
    const onFinish = vi.fn();
    render(<StorySequenceGame onFinish={onFinish} sound={createTestSound()} />);

    for (const [index, story] of STORIES.entries()) {
      expect(screen.getByRole('heading', { name: story.title })).toBeInTheDocument();
      await sortWithButtons(story.events);
      await userEvent.click(screen.getByRole('button', { name: 'تحقق' }));
      expect(screen.getByRole('status')).toHaveTextContent('أحسنت! القصة مرتبة');

      const isLast = index === STORIES.length - 1;
      await userEvent.click(
        screen.getByRole('button', { name: isLast ? 'إنهاء اللعبة' : 'القصة التالية' }),
      );
    }

    expect(onFinish).toHaveBeenCalledWith({ correct: STORIES.length, total: STORIES.length });
  });

  it('marks events that are out of place', async () => {
    render(<StorySequenceGame onFinish={vi.fn()} sound={createTestSound()} />);

    await userEvent.click(screen.getByRole('button', { name: 'تحقق' }));

    expect(screen.getByRole('status')).toHaveTextContent('بعض الأحداث في غير مكانها');
    expect(screen.getAllByText('✗ ليس هنا').length).toBeGreaterThan(0);
  });
});
