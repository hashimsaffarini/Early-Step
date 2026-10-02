import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderInRouter } from '@/test/renderWithRouter';

import { TeacherDashboardPage } from './TeacherDashboardPage';

describe('TeacherDashboardPage', () => {
  it('greets the teacher and shows the stat cards', () => {
    renderInRouter(<TeacherDashboardPage userName="أ. سارة خالد" />);

    expect(screen.getByRole('heading', { level: 1, name: /أ. سارة خالد/ })).toBeInTheDocument();
    const summary = screen.getByRole('region', { name: 'ملخص' });
    for (const label of ['طلابي', 'خطط تدريبية نشطة', 'تقييمات مكتملة', 'تقارير الفصل']) {
      expect(within(summary).getByText(label)).toBeInTheDocument();
    }
    expect(screen.queryByText(/%|خطر/)).not.toBeInTheDocument();
  });

  it('lists the assigned students with teacher-scoped profile links', () => {
    renderInRouter(<TeacherDashboardPage userName="أ. سارة خالد" />);
    const list = screen.getByRole('list', { name: 'طلاب الفصل' });

    expect(within(list).getAllByRole('article')).toHaveLength(4);
    expect(within(list).getByRole('link', { name: 'عرض ملف سلمى' })).toHaveAttribute(
      'href',
      '/teacher/children/mock-child-5',
    );
    expect(within(list).queryByText('ريم')).not.toBeInTheDocument();
  });

  it('filters students by name and shows a no-results state', async () => {
    renderInRouter(<TeacherDashboardPage userName="أ. سارة خالد" />);
    const search = screen.getByRole('searchbox', { name: 'ابحث عن طالب...' });

    await userEvent.type(search, 'آدم');
    expect(screen.getAllByRole('article')).toHaveLength(1);

    await userEvent.clear(search);
    await userEvent.type(search, 'غير موجود');
    expect(screen.getByText('لا نتائج للبحث')).toBeInTheDocument();
  });

  it('shows an empty state when no students are assigned', () => {
    renderInRouter(<TeacherDashboardPage userName="أ. سارة خالد" students={[]} />);

    expect(screen.getByText('لا يوجد طلاب مُسنَدون لك بعد')).toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });
});
