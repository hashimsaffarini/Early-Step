import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { getAreaPaths, ROLE_NAMESPACES, type AreaRole } from '@/constants/routes';
import { RoleAreaContext } from '@/hooks/useRoleArea';
import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { renderWithRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

import { installTestAuthHeader } from '../test/installTestAuth';

import { ChildPlansPage } from './ChildPlansPage';

installTestAuthHeader();

const YOUSEF = 'c0000000-0000-4000-8000-000000000001';
const NOUR = 'c0000000-0000-4000-8000-000000000002';
const SALMA = 'c0000000-0000-4000-8000-000000000005';

function renderPlans(role: AreaRole, childId: string) {
  signInAs(role);
  return renderWithRouter(
    [
      {
        path: `${ROLE_NAMESPACES[role]}/children/:childId/plans`,
        element: (
          <RoleAreaContext value={role}>
            <ChildPlansPage />
          </RoleAreaContext>
        ),
      },
      { path: '*', element: <p>صفحة أخرى</p> },
    ],
    getAreaPaths(role).childPlans(childId),
  );
}

describe('ChildPlansPage — read-only roles', () => {
  it('shows the parent the plan activities, their status and real progress', async () => {
    renderPlans('Parent', YOUSEF);

    const list = await screen.findByRole('list', { name: 'أنشطة الخطة التدريبية' });
    expect(screen.getByRole('heading', { level: 1, name: 'الخطة التدريبية' })).toBeInTheDocument();
    expect(screen.getByText('للطفل: يوسف')).toBeInTheDocument();
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(within(list).getByText('مكتمل')).toBeInTheDocument();
    expect(within(list).getByText('لم يكتمل بعد')).toBeInTheDocument();
    expect(within(list).getByText(/إجابات صحيحة: 3/)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '1 من 2 أنشطة');
    expect(screen.queryByRole('button', { name: 'إضافة نشاط' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /إزالة/ })).not.toBeInTheDocument();
  });

  it('shows an empty state when the plan has no activities', async () => {
    renderPlans('Teacher', NOUR);

    expect(await screen.findByText('لا توجد أنشطة في الخطة بعد')).toBeInTheDocument();
  });

  it('shows not-found for a child the role cannot see', async () => {
    renderPlans('Parent', SALMA);

    expect(await screen.findByText('لم يتم العثور على الطفل')).toBeInTheDocument();
  });

  it('shows an error with retry when the plan cannot be loaded', async () => {
    server.use(
      http.get(apiUrl('TrainingPlan/children/:childId/activities'), () =>
        HttpResponse.json({ message: 'خطأ' }, { status: 500 }),
      ),
    );
    renderPlans('Parent', YOUSEF);

    expect(await screen.findByText('تعذّر تحميل الخطة التدريبية')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'إعادة المحاولة' })).toBeInTheDocument();
  });

  it('tells the admin that plans are not available for this role (backend gap)', () => {
    renderPlans('Admin', YOUSEF);

    expect(screen.getByText('الخطط التدريبية غير متاحة لحساب المدير بعد')).toBeInTheDocument();
  });
});

describe('ChildPlansPage — specialist', () => {
  it('explains when the child has no plan yet', async () => {
    renderPlans('Specialist', NOUR);

    expect(await screen.findByText(/لا توجد خطة تدريبية لهذا الطفل بعد/)).toBeInTheDocument();
  });

  it('adds an available activity with POST { activityId } and refreshes the plan', async () => {
    let body: unknown;
    server.events.on('request:start', ({ request }) => {
      if (request.method === 'POST' && request.url.endsWith(`/children/${YOUSEF}/activities`)) {
        void request
          .clone()
          .json()
          .then((json: unknown) => {
            body = json;
          });
      }
    });
    renderPlans('Specialist', YOUSEF);
    await screen.findByRole('list', { name: 'أنشطة الخطة التدريبية' });

    await userEvent.click(screen.getByRole('button', { name: 'إضافة نشاط' }));
    const dialog = await screen.findByRole('dialog', { name: 'إضافة نشاط إلى الخطة' });
    expect(await within(dialog).findAllByText('مُضاف إلى الخطة')).toHaveLength(2);
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'إضافة «اختبار الذاكرة القصيرة» إلى الخطة' }),
    );

    expect(
      await within(dialog).findByText('تمت إضافة «اختبار الذاكرة القصيرة» إلى الخطة.'),
    ).toBeInTheDocument();
    expect(body).toEqual({ activityId: 'a0000000-0000-4000-8000-000000000003' });
    const list = screen.getByRole('list', { name: 'أنشطة الخطة التدريبية' });
    await waitFor(() => {
      expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    });
    server.events.removeAllListeners();
  });

  it('lists games in the second tab', async () => {
    renderPlans('Specialist', YOUSEF);
    await screen.findByRole('list', { name: 'أنشطة الخطة التدريبية' });

    await userEvent.click(screen.getByRole('button', { name: 'إضافة نشاط' }));
    const dialog = await screen.findByRole('dialog', { name: 'إضافة نشاط إلى الخطة' });
    await userEvent.click(within(dialog).getByRole('tab', { name: /ألعاب/ }));

    expect(await within(dialog).findByText('مطابقة البطاقات')).toBeInTheDocument();
    expect(within(dialog).queryByText('اختبار الحروف')).not.toBeInTheDocument();
  });

  it('removes an activity only after confirmation (DELETE by catalogue activity id)', async () => {
    const deleted: string[] = [];
    server.events.on('request:start', ({ request }) => {
      if (request.method === 'DELETE') deleted.push(new URL(request.url).pathname);
    });
    renderPlans('Specialist', YOUSEF);
    await screen.findByRole('list', { name: 'أنشطة الخطة التدريبية' });

    await userEvent.click(screen.getByRole('button', { name: 'إزالة «اختبار الأعداد» من الخطة' }));
    let dialog = screen.getByRole('dialog', { name: 'إزالة النشاط من الخطة' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'إلغاء' }));
    expect(deleted).toHaveLength(0);

    await userEvent.click(screen.getByRole('button', { name: 'إزالة «اختبار الأعداد» من الخطة' }));
    dialog = screen.getByRole('dialog', { name: 'إزالة النشاط من الخطة' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'إزالة' }));

    await waitFor(() => {
      expect(screen.queryByText('اختبار الأعداد')).not.toBeInTheDocument();
    });
    expect(deleted).toEqual([
      `/api/TrainingPlan/specialist/children/${YOUSEF}/activities/a0000000-0000-4000-8000-000000000002`,
    ]);
    server.events.removeAllListeners();
  });
});
