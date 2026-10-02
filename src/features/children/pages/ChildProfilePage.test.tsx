import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { routes } from '@/app/router/routes';
import { buildParentChildProfilePath, getAreaPaths, ROUTE_PATHS } from '@/constants/routes';
import { renderWithRouter } from '@/test/renderWithRouter';

async function renderProfile(childId: string) {
  const result = renderWithRouter(routes, buildParentChildProfilePath(childId));
  await screen.findAllByRole('link', { name: 'العودة إلى أطفالي' });
  return result;
}

const getTab = (name: RegExp) => screen.getByRole('tab', { name });

describe('ChildProfilePage — routing', () => {
  it('renders the profile of a known child ID', async () => {
    await renderProfile('mock-child-1');

    expect(screen.getByRole('heading', { level: 1, name: 'يوسف' })).toBeInTheDocument();
    expect(screen.queryByText('لم يتم العثور على الطفل')).not.toBeInTheDocument();
  });

  it('renders a not-found state for an unknown child ID', async () => {
    await renderProfile('unknown-child');

    expect(screen.getByText('لم يتم العثور على الطفل')).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    for (const link of screen.getAllByRole('link', { name: 'العودة إلى أطفالي' })) {
      expect(link).toHaveAttribute('href', ROUTE_PATHS.parentChildren);
    }
  });

  it('opens the profile from the children list card', async () => {
    const { router } = renderWithRouter(routes, ROUTE_PATHS.parentChildren);

    await userEvent.click(await screen.findByRole('link', { name: 'عرض ملف نور' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'نور' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(buildParentChildProfilePath('mock-child-2'));
  });
});

describe('ChildProfilePage — header', () => {
  it('shows name, age, birth date, gender and a neutral status', async () => {
    await renderProfile('mock-child-1');
    const details = screen.getByRole('list', { name: 'بيانات الطفل' });

    expect(within(details).getByText('لديه خطة تدريبية')).toBeInTheDocument();
    expect(within(details).getByText(/العمر:/)).toBeInTheDocument();
    expect(within(details).getByText(/تاريخ الميلاد:.*2019/)).toBeInTheDocument();
    expect(within(details).getByText('ولد')).toBeInTheDocument();
  });

  it('shows no diagnosis, risk or percentages', async () => {
    await renderProfile('mock-child-1');

    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/تشخيص|خطورة|العمر النمائي/)).not.toBeInTheDocument();
  });

  it('keeps future actions disabled', async () => {
    await renderProfile('mock-child-1');

    expect(screen.getByRole('button', { name: /تعديل البيانات/ })).toBeDisabled();
  });
});

describe('ChildProfilePage — tabs', () => {
  it('renders the four tabs with overview selected', async () => {
    await renderProfile('mock-child-1');

    expect(within(screen.getByRole('tablist')).getAllByRole('tab')).toHaveLength(4);
    expect(getTab(/نظرة عامة/)).toHaveAttribute('aria-selected', 'true');
  });

  it('switches content when a tab is clicked', async () => {
    await renderProfile('mock-child-1');

    await userEvent.click(getTab(/الأنشطة/));
    expect(getTab(/الأنشطة/)).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('region', { name: 'الألعاب المُعيَّنة' })).toBeInTheDocument();
    expect(screen.getByText('مطابقة البطاقات')).toBeInTheDocument();

    await userEvent.click(getTab(/التقارير/));
    expect(screen.getByText('تقرير متابعة')).toBeInTheDocument();
    expect(screen.queryByText('مطابقة البطاقات')).not.toBeInTheDocument();
  });

  it('moves between tabs with the arrow keys (RTL order)', async () => {
    await renderProfile('mock-child-1');

    getTab(/نظرة عامة/).focus();
    await userEvent.keyboard('{ArrowLeft}');

    expect(getTab(/التقييمات/)).toHaveAttribute('aria-selected', 'true');
    expect(getTab(/التقييمات/)).toHaveFocus();
    expect(screen.getByRole('region', { name: 'سجل التقييمات' })).toBeInTheDocument();

    await userEvent.keyboard('{ArrowRight}');
    expect(getTab(/نظرة عامة/)).toHaveAttribute('aria-selected', 'true');
  });

  it('jumps to the activities tab from the plan summary', async () => {
    await renderProfile('mock-child-1');

    await userEvent.click(screen.getByRole('button', { name: /عرض الأنشطة/ }));

    expect(getTab(/الأنشطة/)).toHaveAttribute('aria-selected', 'true');
  });
});

describe('ChildProfilePage — overview', () => {
  it('summarises the assessment, training plan and reports', async () => {
    await renderProfile('mock-child-1');

    const assessment = screen.getByRole('region', { name: 'التقييم المبدئي' });
    expect(within(assessment).getByText('تم إكمال التقييم المبدئي')).toBeInTheDocument();

    const plan = screen.getByRole('region', { name: 'الخطة التدريبية' });
    expect(within(plan).getByText('خطة المهارات الأساسية')).toBeInTheDocument();
    expect(within(plan).getByRole('progressbar')).toHaveAttribute('aria-valuetext', '3 من 8 أنشطة');

    const reports = screen.getByRole('region', { name: 'أحدث التقارير' });
    expect(within(reports).getByText('تقرير متابعة')).toBeInTheDocument();

    expect(screen.getByRole('region', { name: 'آخر النشاطات' })).toBeInTheDocument();
  });

  it('shows the pending assessment state for a child who has not started', async () => {
    await renderProfile('mock-child-3');

    const assessment = screen.getByRole('region', { name: 'التقييم المبدئي' });
    expect(within(assessment).getByText('لم يبدأ التقييم المبدئي بعد')).toBeInTheDocument();
    expect(
      within(assessment).getByRole('link', { name: 'بدء التقييم المبدئي لـ ريم' }),
    ).toHaveAttribute('href', getAreaPaths('Parent').assessment('mock-child-3'));
  });
});

describe('ChildProfilePage — empty states', () => {
  it('shows the no-plan state for a child without a training plan', async () => {
    await renderProfile('mock-child-2');

    const plan = screen.getByRole('region', { name: 'الخطة التدريبية' });
    expect(within(plan).getByText('لا توجد خطة تدريبية بعد')).toBeInTheDocument();

    await userEvent.click(getTab(/الأنشطة/));
    expect(screen.getByText('لا توجد خطة تدريبية بعد')).toBeInTheDocument();
  });

  it('shows the no-reports state for a child without reports', async () => {
    await renderProfile('mock-child-4');

    const reports = screen.getByRole('region', { name: 'أحدث التقارير' });
    expect(within(reports).getByText('لا توجد تقارير بعد')).toBeInTheDocument();

    await userEvent.click(getTab(/التقارير/));
    expect(screen.getByText('لا توجد تقارير بعد')).toBeInTheDocument();
  });
});

describe('ChildProfilePage — links to other screens', () => {
  it('links the header to the education plans page', async () => {
    await renderProfile('mock-child-1');

    expect(screen.getByRole('link', { name: 'الخطط التعليمية' })).toHaveAttribute(
      'href',
      '/parent/children/mock-child-1/plans',
    );
  });

  it('links activities to the role-scoped players', async () => {
    await renderProfile('mock-child-1');

    await userEvent.click(getTab(/الأنشطة/));

    expect(screen.getByRole('link', { name: 'العب: مطابقة البطاقات' })).toHaveAttribute(
      'href',
      '/parent/games/memory-match/play',
    );
    expect(screen.getByRole('link', { name: 'ابدأ: اختبار الحروف' })).toHaveAttribute(
      'href',
      '/parent/tests/letters-test/play',
    );
  });

  it('links reports to the report detail', async () => {
    await renderProfile('mock-child-1');

    const summary = screen.getByRole('region', { name: 'أحدث التقارير' });
    expect(within(summary).getByRole('link', { name: 'تقرير متابعة' })).toHaveAttribute(
      'href',
      getAreaPaths('Parent').reportDetail('report-1'),
    );

    await userEvent.click(getTab(/التقارير/));
    expect(screen.getByRole('link', { name: 'عرض التقرير: تقرير متابعة' })).toHaveAttribute(
      'href',
      '/parent/reports/report-1',
    );
  });

  it('does not offer activity assignment to the parent', async () => {
    await renderProfile('mock-child-1');

    expect(screen.queryByRole('button', { name: /تعيين نشاط جديد/ })).not.toBeInTheDocument();
  });
});

describe('ChildProfilePage — staff roles', () => {
  async function renderStaffProfile(path: string) {
    const result = renderWithRouter(routes, path);
    await screen.findAllByRole('link', { name: 'العودة إلى الأطفال' });
    return result;
  }

  it('shows not-found for a child outside the role roster', async () => {
    await renderStaffProfile(getAreaPaths('Teacher').childProfile('mock-child-4'));

    expect(screen.getByText('لم يتم العثور على الطفل')).toBeInTheDocument();
  });

  it('lets a teacher assign a game locally', async () => {
    await renderStaffProfile(getAreaPaths('Teacher').childProfile('mock-child-6'));

    await userEvent.click(screen.getByRole('button', { name: /تعيين نشاط جديد/ }));
    const dialog = screen.getByRole('dialog', { name: 'تعيين نشاط للطفل' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'تعيين الكلمات المتقاطعة' }));

    expect(within(dialog).getByText('مُعيَّن')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'تم' }));
    expect(
      screen.getByText('تمت إضافة «الكلمات المتقاطعة» إلى أنشطة الطفل (محلياً فقط).'),
    ).toBeInTheDocument();

    await userEvent.click(getTab(/الأنشطة/));
    expect(screen.getByRole('link', { name: 'العب: الكلمات المتقاطعة' })).toHaveAttribute(
      'href',
      '/teacher/games/word-reading/play',
    );
  });

  it('marks activities the child already has as assigned', async () => {
    await renderStaffProfile(getAreaPaths('Specialist').childProfile('mock-child-1'));

    await userEvent.click(screen.getByRole('button', { name: /تعيين نشاط جديد/ }));
    const dialog = screen.getByRole('dialog', { name: 'تعيين نشاط للطفل' });

    expect(
      within(dialog).queryByRole('button', { name: 'تعيين مطابقة البطاقات' }),
    ).not.toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('tab', { name: /الاختبارات/ }));
    expect(within(dialog).getByRole('button', { name: 'تعيين اختبار الكتابة' })).toBeEnabled();
  });
});
