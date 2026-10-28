/// <reference types="node" />
import { readFileSync } from 'node:fs';

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  AssessmentCategoryPicker,
  type AssessmentCategoryPickerProps,
} from './AssessmentCategoryPicker';

const category = (id: string, name: string) => ({ id, name, description: null, iconUrl: null });

function renderPicker(overrides: Partial<AssessmentCategoryPickerProps> = {}) {
  const props: AssessmentCategoryPickerProps = {
    childName: 'سارة',
    cards: [
      { category: category('k1', 'تصنيف أ'), progress: null },
      { category: category('k2', 'تصنيف ب'), progress: null },
    ],
    isLoading: false,
    loadError: null,
    onRetry: vi.fn(),
    startError: null,
    pendingKey: null,
    notice: null,
    exitAction: null,
    onSelect: vi.fn(),
    ...overrides,
  };
  render(<AssessmentCategoryPicker {...props} />);
  return props;
}

describe('AssessmentCategoryPicker', () => {
  it('offers one keyboard start action for the whole assessment; categories are informational', async () => {
    const props = renderPicker();
    const list = screen.getByRole('list', { name: 'تصنيفات التقييم المبدئي' });
    expect(within(list).queryByRole('button')).not.toBeInTheDocument();
    expect(within(list).getByText('تصنيف أ')).toBeInTheDocument();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'العب الكل دفعة واحدة' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(props.onSelect).toHaveBeenCalledExactlyOnceWith({ kind: 'all' });
  });

  it('prevents another start while the whole assessment is starting', () => {
    renderPicker({ pendingKey: 'all' });
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('lays cards out in two shrinkable columns, one on very narrow screens, RTL-safe', () => {
    const css = readFileSync(
      `${process.cwd()}/src/features/assessments/components/AssessmentCategoryPicker.module.css`,
      'utf8',
    ).replace(/\s+/g, ' ');
    expect(css).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))');
    expect(css).toMatch(
      /@media \(max-width: 21rem\) \{ \.grid \{ grid-template-columns: minmax\(0, 1fr\)/,
    );
    // Long category names wrap instead of widening the page.
    expect(css).toContain('overflow-wrap: anywhere');
    // Logical properties only (no physical left/right), so the layout mirrors in RTL.
    expect(css).not.toMatch(
      /(margin|padding|border)-(left|right)|\b(left|right):|text-align: (left|right)/,
    );
  });
});
