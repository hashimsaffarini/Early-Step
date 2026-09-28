import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { Tabs } from './Tabs';

const ITEMS = [
  { value: 'a', label: 'الأول' },
  { value: 'b', label: 'الثاني' },
  { value: 'c', label: 'الثالث' },
] as const;

function Harness() {
  const [value, setValue] = useState<'a' | 'b' | 'c'>('a');
  return (
    <Tabs label="أقسام" items={ITEMS} value={value} onChange={setValue}>
      <p>محتوى {value}</p>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('selects a tab on click and shows its panel', async () => {
    render(<Harness />);

    await userEvent.click(screen.getByRole('tab', { name: 'الثاني' }));

    expect(screen.getByRole('tab', { name: 'الثاني' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('محتوى b');
  });

  it('follows RTL arrow-key order (ArrowLeft = next) and wraps around', async () => {
    render(<Harness />);
    screen.getByRole('tab', { name: 'الأول' }).focus();

    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'الثاني' })).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'الثالث' })).toHaveAttribute('aria-selected', 'true');
  });
});
