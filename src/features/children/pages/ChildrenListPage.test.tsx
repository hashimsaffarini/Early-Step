import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { routes } from '@/app/router/routes';
import { getAreaPaths } from '@/constants/routes';
import { mockChildren } from '@/mocks/fixtures/children';
import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { renderWithRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';
import type { AreaRole } from '@/constants/routes';

function renderList(role: AreaRole) {
  signInAs(role);
  return renderWithRouter(routes, getAreaPaths(role).children);
}

const list = () => screen.findByRole('list', { name: 'قائمة الأطفال' });

describe('ChildrenListPage — parent', () => {
  it('loads the parent children from the API', async () => {
    renderList('Parent');

    expect(await screen.findByText('جارٍ تحميل الأطفال…')).toBeInTheDocument();
    const cards = within(await list()).getAllByRole('article');
    expect(cards).toHaveLength(3);
    expect(screen.getByRole('heading', { name: 'يوسف' })).toBeInTheDocument();
    expect(screen.getAllByText('العمر: 7 سنوات').length).toBeGreaterThan(0);
    expect(screen.queryByText(/ولي الأمر:/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'عرض ملف يوسف' })).toHaveAttribute(
      'href',
      getAreaPaths('Parent').childProfile('c0000000-0000-4000-8000-000000000001'),
    );
  });

  it('shows an error state with a working retry', async () => {
    let calls = 0;
    server.use(
      http.get(apiUrl('Parent/GetMyChildren'), () => {
        calls += 1;
        return calls === 1 ? new HttpResponse(null, { status: 500 }) : HttpResponse.json([]);
      }),
    );
    renderList('Parent');

    expect(await screen.findByText('تعذّر تحميل قائمة الأطفال')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'إعادة المحاولة' }));

    expect(await screen.findByText('لا يوجد أطفال هنا')).toBeInTheDocument();
  });

  it('filters by name', async () => {
    renderList('Parent');
    await list();

    await userEvent.type(screen.getByRole('searchbox', { name: 'البحث عن طفل' }), 'نور');

    expect(screen.getAllByRole('article')).toHaveLength(1);
  });

  it('validates the add-child form (age is a whole number)', async () => {
    renderList('Parent');
    await list();
    await userEvent.click(screen.getByRole('button', { name: 'إضافة طفل' }));
    const dialog = screen.getByRole('dialog', { name: 'إضافة ملف طفل جديد' });

    await userEvent.type(within(dialog).getByLabelText(/اسم الطفل/), 'سارة');
    await userEvent.type(within(dialog).getByLabelText(/العمر/), '0');
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ' }));

    expect(within(dialog).getByText(/يجب أن يكون العمر عدداً صحيحاً/)).toBeInTheDocument();
    expect(within(dialog).getByText('يرجى اختيار الجنس')).toBeInTheDocument();
  });

  it('adds a child through the API (multipart FullName/Age/Gender) and refreshes the list', async () => {
    let received: FormData | undefined;
    server.use(
      http.post(apiUrl('Parent'), async ({ request }) => {
        received = await request.clone().formData();
        return undefined; // fall through to the default handler (stores the child)
      }),
    );
    renderList('Parent');
    await list();
    await userEvent.click(screen.getByRole('button', { name: 'إضافة طفل' }));
    const dialog = screen.getByRole('dialog', { name: 'إضافة ملف طفل جديد' });

    await userEvent.type(within(dialog).getByLabelText(/اسم الطفل/), 'سارة');
    await userEvent.type(within(dialog).getByLabelText(/العمر/), '6');
    await userEvent.selectOptions(within(dialog).getByLabelText(/الجنس/), 'بنت');
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ' }));

    expect(await screen.findByText('تمت إضافة سارة إلى قائمة أطفالك.')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'سارة' })).toBeInTheDocument();
    expect(received?.get('FullName')).toBe('سارة');
    expect(received?.get('Age')).toBe('6');
    expect(received?.get('Gender')).toBe('بنت');
  });

  it('keeps the dialog open and shows the server error when adding fails', async () => {
    server.use(
      http.post(apiUrl('Parent'), () =>
        HttpResponse.json({ message: 'تعذّر إضافة الطفل.' }, { status: 400 }),
      ),
    );
    renderList('Parent');
    await list();
    await userEvent.click(screen.getByRole('button', { name: 'إضافة طفل' }));
    const dialog = screen.getByRole('dialog', { name: 'إضافة ملف طفل جديد' });

    await userEvent.type(within(dialog).getByLabelText(/اسم الطفل/), 'سارة');
    await userEvent.type(within(dialog).getByLabelText(/العمر/), '6');
    await userEvent.selectOptions(within(dialog).getByLabelText(/الجنس/), 'بنت');
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ' }));

    expect(await within(dialog).findByText('تعذّر إضافة الطفل.')).toBeInTheDocument();
    expect(dialog).toHaveAttribute('open');
    expect(mockChildren.some((child) => child.fullName === 'سارة')).toBe(false);
  });

  it('shows the empty state with an add action when the parent has no children', async () => {
    server.use(http.get(apiUrl('Parent/GetMyChildren'), () => HttpResponse.json([])));
    renderList('Parent');

    expect(await screen.findByText('لا يوجد أطفال هنا')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'إضافة طفل' }));
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'إضافة ملف طفل جديد' })).toHaveAttribute('open');
    });
  });
});

describe('ChildrenListPage — staff and admin', () => {
  it('shows the teacher their assigned children with parent names and no add button', async () => {
    renderList('Teacher');

    const cards = within(await list()).getAllByRole('article');
    expect(cards).toHaveLength(3);
    expect(screen.getByRole('heading', { name: 'سلمى' })).toBeInTheDocument();
    expect(screen.getByText('ولي الأمر: خالد يوسف')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'إضافة طفل' })).not.toBeInTheDocument();
  });

  it('explains that the admin has no children endpoint and links to users', async () => {
    renderList('Admin');

    expect(await screen.findByText('لا تتوفر قائمة أطفال للمدير من الخادم')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'الانتقال إلى المستخدمين' })).toHaveAttribute(
      'href',
      '/admin/users',
    );
  });
});
