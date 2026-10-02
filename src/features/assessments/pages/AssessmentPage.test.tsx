import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RoleAreaContext } from '@/hooks/useRoleArea';
import { renderWithRouter } from '@/test/renderWithRouter';

import { ASSESSMENT_SECTIONS } from '../content/sections';

import { AssessmentPage } from './AssessmentPage';

function renderAssessment(childId: string, role: 'Parent' | 'Teacher' = 'Parent') {
  const namespace = role === 'Parent' ? '/parent' : '/teacher';
  return renderWithRouter(
    [
      {
        path: `${namespace}/assessment/:childId`,
        element: (
          <RoleAreaContext value={role}>
            <AssessmentPage />
          </RoleAreaContext>
        ),
      },
    ],
    `${namespace}/assessment/${childId}`,
  );
}

/** Answers every question of the section currently on screen, then finishes it. */
async function playCurrentSection() {
  for (;;) {
    const ready = screen.queryByRole('button', { name: 'أنا جاهز' });
    if (ready) await userEvent.click(ready);
    const [firstAnswer] = within(screen.getByRole('group', { name: 'الإجابات' })).getAllByRole(
      'button',
    );
    if (!firstAnswer) throw new Error('no answers rendered');
    await userEvent.click(firstAnswer);
    const finish = screen.queryByRole('button', { name: /إنهاء القسم/ });
    if (finish) {
      await userEvent.click(finish);
      return;
    }
    await userEvent.click(screen.getByRole('button', { name: /التالي/ }));
  }
}

describe('AssessmentPage', () => {
  it('greets a known child and lists the four sections', () => {
    renderAssessment('mock-child-1');

    expect(screen.getByRole('heading', { level: 2, name: 'مرحباً يا يوسف!' })).toBeInTheDocument();
    const sections = screen.getByRole('list', { name: 'أقسام التقييم' });
    expect(within(sections).getAllByRole('article')).toHaveLength(4);
    expect(screen.getByText('الأقسام المكتملة: 0 من 4')).toBeInTheDocument();
  });

  it('shows a not-found state for an unknown child', () => {
    renderAssessment('unknown-child');

    expect(screen.getByText('لم يتم العثور على الطفل')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'العودة إلى قائمة الأطفال' })).toHaveAttribute(
      'href',
      '/parent/children',
    );
  });

  it('highlights the chosen answer without marking it right or wrong', async () => {
    renderAssessment('mock-child-1');
    await userEvent.click(screen.getByRole('button', { name: 'ابدأ قسم الحروف والقراءة' }));

    const next = screen.getByRole('button', { name: /التالي/ });
    expect(next).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: /بطة/ }));

    expect(screen.getByRole('button', { name: /بطة/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('تم اختيار إجابتك');
    expect(screen.queryByText(/إجابة صحيحة|إجابة غير صحيحة/)).not.toBeInTheDocument();
    expect(next).toBeEnabled();
  });

  it('marks a section complete on the intro after playing it to the end', async () => {
    renderAssessment('mock-child-2');
    await userEvent.click(screen.getByRole('button', { name: 'ابدأ قسم الأرقام والحساب' }));

    await playCurrentSection();
    await userEvent.click(screen.getByRole('button', { name: /العودة إلى الأقسام/ }));

    const tile = screen.getByRole('article', { name: 'الأرقام والحساب' });
    expect(within(tile).getByText('مكتمل')).toBeInTheDocument();
    expect(screen.getByText('الأقسام المكتملة: 1 من 4')).toBeInTheDocument();
  });

  it('shows "أرني مرة أخرى" for memory questions', async () => {
    renderAssessment('mock-child-1');
    await userEvent.click(screen.getByRole('button', { name: 'ابدأ قسم الذاكرة والتسلسل' }));

    expect(screen.getByRole('list', { name: 'صور للتذكّر' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'أنا جاهز' }));
    await userEvent.click(screen.getByRole('button', { name: /أرني مرة أخرى/ }));

    expect(screen.getByRole('list', { name: 'صور للتذكّر' })).toBeInTheDocument();
  });

  it('reaches the neutral results screen after playing all sections', async () => {
    renderAssessment('mock-child-1');
    await userEvent.click(screen.getByRole('button', { name: /العب الكل بالترتيب/ }));

    for (const [index] of ASSESSMENT_SECTIONS.entries()) {
      await playCurrentSection();
      const label = index === ASSESSMENT_SECTIONS.length - 1 ? /عرض النتيجة/ : /القسم التالي/;
      await userEvent.click(screen.getByRole('button', { name: label }));
    }

    expect(screen.getByRole('heading', { name: 'اكتمل التقييم الأولي' })).toBeInTheDocument();
    expect(screen.getByText('شكراً لك يا يوسف! أنهيت كل الأقسام.')).toBeInTheDocument();
    expect(screen.getAllByText('تم الإكمال')).toHaveLength(4);
    expect(document.body.textContent).not.toMatch(/%/);
    expect(screen.getByRole('link', { name: 'العودة إلى ملف الطفل' })).toHaveAttribute(
      'href',
      '/parent/children/mock-child-1',
    );
  });

  it('exits to the child profile of the current role area', () => {
    renderAssessment('mock-child-5', 'Teacher');

    expect(screen.getByRole('link', { name: 'خروج' })).toHaveAttribute(
      'href',
      '/teacher/children/mock-child-5',
    );
  });
});
