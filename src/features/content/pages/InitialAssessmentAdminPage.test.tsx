import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { ADMIN_PATHS } from '@/constants/routes';
import { mockAssessmentQuestionIds } from '@/mocks/fixtures/content';
import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { renderContent } from '@/test/contentTestUtils';

const hierarchy = () => screen.findByRole('list', { name: 'تصنيفات التقييم المبدئي' });

describe('InitialAssessmentAdminPage (category → questions, client revision 2026-10)', () => {
  it('shows each assessment category with the questions that belong to it', async () => {
    renderContent(ADMIN_PATHS.initialAssessment);

    const list = await hierarchy();
    const reading = within(list).getByRole('heading', { name: 'التصنيف: الحروف والقراءة' });
    const block = reading.closest('li');
    if (!block) throw new Error('category block not found');
    const group = await within(block).findByRole('region', { name: 'اختبار الحروف' });
    expect(within(group).getByText('أي كلمة تبدأ بحرف الباء؟')).toBeInTheDocument();
    expect(within(group).getByText('رتّب حروف كلمة «قمر».')).toBeInTheDocument();
    // Categories that are not in the assessment are not listed in the hierarchy.
    expect(within(list).queryByText('التصنيف: الأرقام والحساب')).not.toBeInTheDocument();
  });

  it('adds a category — it appears at once — and removes it again', async () => {
    renderContent(ADMIN_PATHS.initialAssessment);
    await hierarchy();

    const all = screen.getByRole('list', { name: 'كل التصنيفات' });
    await userEvent.click(
      within(all).getByRole('button', { name: 'إضافة الأرقام والحساب إلى التقييم' }),
    );
    expect(
      await within(await hierarchy()).findByRole('heading', { name: 'التصنيف: الأرقام والحساب' }),
    ).toBeInTheDocument();
    expect(within(all).getAllByText('ضمن التقييم')).toHaveLength(2);

    await userEvent.click(
      within(all).getByRole('button', { name: 'إزالة الأرقام والحساب من التقييم' }),
    );
    await waitFor(() => {
      expect(screen.queryByText('التصنيف: الأرقام والحساب')).not.toBeInTheDocument();
    });
    expect(within(all).getAllByText('ضمن التقييم')).toHaveLength(1);
  });

  it('lists every category, including one without test activities', async () => {
    renderContent(ADMIN_PATHS.initialAssessment);
    const all = await screen.findByRole('list', { name: 'كل التصنيفات' });
    expect(within(all).getByText('الذاكرة والتسلسل')).toBeInTheDocument();
    expect(within(all).getAllByText('غير مضاف')).toHaveLength(2);
  });

  it('shows an honest empty state when no category is in the assessment', async () => {
    server.use(
      http.get(apiUrl('initial-assessment/categories'), () =>
        HttpResponse.json({ categories: [] }),
      ),
    );
    renderContent(ADMIN_PATHS.initialAssessment);
    expect(await screen.findByText('لا توجد تصنيفات في التقييم المبدئي بعد')).toBeInTheDocument();
  });

  it('shows an error with retry instead of guessing when membership cannot be read', async () => {
    server.use(
      http.get(
        apiUrl('initial-assessment/categories'),
        () => new HttpResponse(null, { status: 403 }),
      ),
    );
    renderContent(ADMIN_PATHS.initialAssessment);

    expect(
      (await screen.findAllByRole('button', { name: 'إعادة المحاولة' })).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByRole('list', { name: 'تصنيفات التقييم المبدئي' })).not.toBeInTheDocument();
  });

  it('adds a question and reports only what happened in this session', async () => {
    renderContent(ADMIN_PATHS.initialAssessment);
    const list = await hierarchy();
    expect(screen.getByText(/لا توفّر الواجهة البرمجية قائمة بالأسئلة/)).toBeInTheDocument();

    await userEvent.click(
      await within(list).findByRole('button', {
        name: 'إضافة «أي كلمة تبدأ بحرف الباء؟» إلى التقييم',
      }),
    );

    expect(await screen.findByText('أُضيف إلى التقييم في هذه الجلسة.')).toBeInTheDocument();
    expect(mockAssessmentQuestionIds.has('q0000000-0000-4000-8000-000000000001')).toBe(true);
  });
});
