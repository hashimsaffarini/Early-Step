import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { renderInRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

import type { Question } from '../types';

import { CorrectAnswersDialog } from './CorrectAnswersDialog';

const MULTI: Question = {
  id: 'q-multi',
  text: 'اختر الحيوانات',
  imageUrl: null,
  type: 'MultiSelect',
  order: null,
  options: [
    { id: 'o1', text: 'قطة', imageUrl: null, isCorrect: true, order: 0, correctOrder: null },
    { id: 'o2', text: 'كرسي', imageUrl: null, isCorrect: false, order: 0, correctOrder: null },
    { id: 'o3', text: 'أرنب', imageUrl: null, isCorrect: false, order: 0, correctOrder: null },
  ],
};

describe('CorrectAnswersDialog — MultiSelect', () => {
  it('marks several correct options and sends only the changed ones', async () => {
    const bodies: [string, FormDataEntryValue | null][] = [];
    server.use(
      http.put(apiUrl('Admin/question-options/:optionId'), async ({ request, params }) => {
        bodies.push([String(params.optionId), (await request.formData()).get('IsCorrect')]);
        return HttpResponse.json({});
      }),
    );
    signInAs('Admin');
    const onClose = vi.fn();
    renderInRouter(<CorrectAnswersDialog question={MULTI} number="1" onClose={onClose} />);

    expect(screen.getByRole('checkbox', { name: 'قطة' })).toBeChecked();
    await userEvent.click(screen.getByRole('checkbox', { name: 'أرنب' }));
    await userEvent.click(screen.getByRole('button', { name: 'حفظ الإجابة الصحيحة' }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
    expect(bodies).toEqual([['o3', 'true']]);
  });

  it('refuses to save with no correct answer', async () => {
    signInAs('Admin');
    renderInRouter(<CorrectAnswersDialog question={MULTI} number="1" onClose={vi.fn()} />);

    await userEvent.click(screen.getByRole('checkbox', { name: 'قطة' }));
    await userEvent.click(screen.getByRole('button', { name: 'حفظ الإجابة الصحيحة' }));

    expect(screen.getByText('اختر إجابة صحيحة واحدة على الأقل.')).toBeInTheDocument();
  });
});
