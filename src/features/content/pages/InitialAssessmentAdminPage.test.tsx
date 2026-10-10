import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { ADMIN_PATHS } from '@/constants/routes';
import { mockAssessmentQuestionIds } from '@/mocks/fixtures/content';
import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';

import { renderContent } from './contentTestUtils';

describe('InitialAssessmentAdminPage', () => {
  it('adds and removes categories from the assessment', async () => {
    renderContent(ADMIN_PATHS.initialAssessment);

    await userEvent.click(
      await screen.findByRole('button', { name: 'إضافة الأرقام والحساب إلى التقييم' }),
    );

    expect(
      await screen.findByRole('button', { name: 'إزالة الأرقام والحساب من التقييم' }),
    ).toBeInTheDocument();
    const categories = screen.getByRole('list', { name: 'تصنيفات الاختبارات' });
    expect(within(categories).getAllByText('ضمن التقييم')).toHaveLength(2);
  });

  it('warns that membership is unknown when the server refuses the admin (live 403)', async () => {
    server.use(
      http.get(
        apiUrl('initial-assessment/categories'),
        () => new HttpResponse(null, { status: 403 }),
      ),
    );
    renderContent(ADMIN_PATHS.initialAssessment);

    expect(await screen.findByText(/لا تظهر حالة كل\s+تصنيف/)).toBeInTheDocument();
    const categories = screen.getByRole('list', { name: 'تصنيفات الاختبارات' });
    expect(within(categories).queryByText('ضمن التقييم')).not.toBeInTheDocument();
    expect(within(categories).getAllByText('الحالة غير معروفة').length).toBeGreaterThan(0);
  });

  it('adds a question and reports only what happened in this session', async () => {
    renderContent(ADMIN_PATHS.initialAssessment);
    expect(screen.getByText(/لا توفّر الواجهة البرمجية قائمة بالأسئلة/)).toBeInTheDocument();

    await screen.findByRole('option', { name: 'اختبار الحروف' });
    await userEvent.selectOptions(
      screen.getByLabelText('اختر اختباراً لعرض أسئلته'),
      'اختبار الحروف',
    );
    await userEvent.click(
      await screen.findByRole('button', { name: 'إضافة «أي كلمة تبدأ بحرف الباء؟» إلى التقييم' }),
    );

    expect(await screen.findByText('أُضيف إلى التقييم في هذه الجلسة.')).toBeInTheDocument();
    expect(mockAssessmentQuestionIds.has('q0000000-0000-4000-8000-000000000001')).toBe(true);
  });
});
