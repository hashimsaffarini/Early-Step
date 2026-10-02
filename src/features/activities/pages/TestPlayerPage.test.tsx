import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithRouter } from '@/test/renderWithRouter';

import { findTest } from '../data/tests';

import { TestPlayerPage } from './TestPlayerPage';

function renderPlayer(testId: string) {
  return renderWithRouter(
    [{ path: '/parent/tests/:testId/play', element: <TestPlayerPage /> }],
    `/parent/tests/${testId}/play`,
  );
}

function answerTile(label: string) {
  return screen.getByRole('button', { name: new RegExp(`^(أ|ب|ج|د)?\\s*${label}`) });
}

describe('TestPlayerPage', () => {
  it('reaches the result with the number of correct answers', async () => {
    const test = findTest('letters-test');
    if (!test) throw new Error('missing test');
    renderPlayer('letters-test');

    expect(screen.getByText('السؤال 1 من 4')).toBeInTheDocument();
    for (const [index, question] of test.questions.entries()) {
      // Answer the first question wrong, the rest correctly.
      const optionIndex = index === 0 ? (question.correctIndex + 1) % 4 : question.correctIndex;
      const option = question.options[optionIndex];
      if (!option) throw new Error('missing option');
      await userEvent.click(answerTile(option.label));
      await userEvent.click(
        screen.getByRole('button', {
          name: index === test.questions.length - 1 ? 'عرض النتيجة' : 'التالي',
        }),
      );
    }

    expect(screen.getByRole('heading', { level: 2, name: /أحسنت/ })).toBeInTheDocument();
    expect(screen.getByText('3 من 4 إجابات صحيحة')).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('reveals the correct answer after a wrong pick, without colour alone', async () => {
    renderPlayer('letters-test');

    await userEvent.click(answerTile('م'));

    expect(screen.getByRole('status')).toHaveTextContent('الإجابة الصحيحة هي «ق»');
    expect(answerTile('ق')).toHaveAccessibleName(/إجابة صحيحة/);
    expect(answerTile('م')).toHaveAccessibleName(/إجابة غير صحيحة/);
    expect(answerTile('ر')).toBeDisabled();
  });

  it('isolates math expressions left-to-right', () => {
    renderPlayer('numbers-test');

    const expression = screen.getByText('3 + 4 = ?');
    expect(expression.tagName).toBe('BDI');
    expect(expression).toHaveAttribute('dir', 'ltr');
  });

  it('restarts from the first question', async () => {
    const test = findTest('listening-test');
    if (!test) throw new Error('missing test');
    renderPlayer('listening-test');

    for (const [index, question] of test.questions.entries()) {
      const option = question.options[question.correctIndex];
      if (!option) throw new Error('missing option');
      await userEvent.click(answerTile(option.label));
      await userEvent.click(
        screen.getByRole('button', {
          name: index === test.questions.length - 1 ? 'عرض النتيجة' : 'التالي',
        }),
      );
    }
    expect(screen.getByText('3 من 3 إجابات صحيحة')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'أعد الاختبار' }));

    expect(screen.getByText('السؤال 1 من 3')).toBeInTheDocument();
    expect(screen.getByText('النقاط: 0')).toBeInTheDocument();
  });

  it('shows a not-found state for an unknown test', () => {
    renderPlayer('missing');

    expect(screen.getByText('لم يتم العثور على الاختبار')).toBeInTheDocument();
    for (const link of screen.getAllByRole('link', { name: /العودة للاختبارات|خروج/ })) {
      expect(link).toHaveAttribute('href', '/parent/tests');
    }
  });
});
