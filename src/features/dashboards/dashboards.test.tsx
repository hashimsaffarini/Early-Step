import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { renderInRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

import { AdminDashboardPage } from './admin/pages/AdminDashboardPage';
import { SpecialistDashboardPage } from './specialist/pages/SpecialistDashboardPage';
import { TeacherDashboardPage } from './teacher/pages/TeacherDashboardPage';

describe('TeacherDashboardPage', () => {
  it('shows server stats and the assigned children with profile links', async () => {
    signInAs('Teacher');
    renderInRouter(<TeacherDashboardPage userName="أ. سارة خالد" />);

    const summary = await screen.findByRole('region', { name: 'ملخص' });
    expect(within(summary).getByText('عدد الأطفال')).toBeInTheDocument();
    expect(within(summary).getByText('الملاحظات')).toBeInTheDocument();

    const list = await screen.findByRole('list', { name: 'طلاب الفصل' });
    expect(within(list).getByRole('heading', { name: 'يوسف' })).toBeInTheDocument();
    expect(within(list).getByRole('link', { name: 'عرض ملف يوسف' })).toHaveAttribute(
      'href',
      '/teacher/children/c0000000-0000-4000-8000-000000000001',
    );
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('shows an error with retry when the dashboard request fails', async () => {
    server.use(
      http.get(apiUrl('Teacher/dashboard'), () => new HttpResponse(null, { status: 500 })),
    );
    signInAs('Teacher');
    renderInRouter(<TeacherDashboardPage userName="أ. سارة خالد" />);

    expect(await screen.findByText('تعذّر تحميل الإحصائيات')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'إعادة المحاولة' }).length).toBeGreaterThan(0);
  });

  it('shows the empty state when the teacher has no children', async () => {
    server.use(http.get(apiUrl('Teacher/children'), () => HttpResponse.json([])));
    signInAs('Teacher');
    renderInRouter(<TeacherDashboardPage userName="أ. سارة خالد" />);

    expect(await screen.findByText('لا يوجد طلاب مُسنَدون لك بعد')).toBeInTheDocument();
  });
});

describe('SpecialistDashboardPage', () => {
  it('renders server stats and children without any report entry (client revision 2026-10)', async () => {
    signInAs('Specialist');
    renderInRouter(<SpecialistDashboardPage userName="أ. ليلى حسن" />);

    const summary = await screen.findByRole('region', { name: 'ملخص' });
    expect(within(summary).getByText('عدد الأطفال')).toBeInTheDocument();
    expect(within(summary).queryByText('التقارير')).not.toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /يوسف/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /تقرير|تقاريري/ })).not.toBeInTheDocument();
  });

  it('only shows numbers the server sent', async () => {
    server.use(
      http.get(apiUrl('specialist/dashboard'), () => HttpResponse.json({ totalChildren: 9 })),
    );
    signInAs('Specialist');
    renderInRouter(<SpecialistDashboardPage userName="أ. ليلى حسن" />);

    const summary = await screen.findByRole('region', { name: 'ملخص' });
    expect(within(summary).getAllByRole('listitem')).toHaveLength(1);
    expect(within(summary).getByText('9')).toBeInTheDocument();
  });
});

describe('AdminDashboardPage', () => {
  it('shows the Admin dashboard fields with their Arabic labels and shortcuts', async () => {
    signInAs('Admin');
    renderInRouter(<AdminDashboardPage userName="خالد سعيد" />);

    const summary = await screen.findByRole('region', { name: 'ملخص' });
    for (const label of ['إجمالي المستخدمين', 'إجمالي التقارير', 'إجمالي الأنشطة', 'عدد الأطفال']) {
      expect(within(summary).getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: 'إدارة المستخدمين' })).toHaveAttribute(
      'href',
      '/admin/users',
    );
  });
});
