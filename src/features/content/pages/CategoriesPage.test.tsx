import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { ADMIN_PATHS } from '@/constants/routes';
import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';

import { renderContent } from '@/test/contentTestUtils';

async function list() {
  return screen.findByRole('list', { name: 'التصنيفات' });
}

describe('CategoriesPage', () => {
  it('lists categories with activity counts and the content sub-navigation', async () => {
    renderContent(ADMIN_PATHS.categories);

    const categories = await list();
    expect(within(categories).getAllByRole('listitem').length).toBeGreaterThanOrEqual(3);
    expect(
      within(categories).getByRole('heading', { name: 'الحروف والقراءة' }),
    ).toBeInTheDocument();
    expect(within(categories).getAllByText('1 أنشطة').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'التصنيفات' })).toHaveAttribute('aria-current', 'page');
  });

  it('validates and creates a category', async () => {
    renderContent(ADMIN_PATHS.categories);
    await list();

    await userEvent.click(screen.getByRole('button', { name: 'إضافة تصنيف' }));
    const dialog = screen.getByRole('dialog', { name: 'إضافة تصنيف' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ' }));
    expect(within(dialog).getByText('اسم التصنيف مطلوب')).toBeInTheDocument();

    await userEvent.type(within(dialog).getByLabelText(/اسم التصنيف/), 'الكتابة');
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ' }));

    expect(await screen.findByRole('heading', { name: 'الكتابة' })).toBeInTheDocument();
  });

  it('shows the server error when the name already exists', async () => {
    renderContent(ADMIN_PATHS.categories);
    await list();

    await userEvent.click(screen.getByRole('button', { name: 'إضافة تصنيف' }));
    const dialog = screen.getByRole('dialog', { name: 'إضافة تصنيف' });
    await userEvent.type(within(dialog).getByLabelText(/اسم التصنيف/), 'الحروف والقراءة');
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ' }));

    expect(await within(dialog).findByText('التصنيف موجود بالفعل.')).toBeInTheDocument();
  });

  it('renames a category', async () => {
    renderContent(ADMIN_PATHS.categories);
    await list();

    await userEvent.click(screen.getByRole('button', { name: 'تعديل التصنيف الأرقام والحساب' }));
    const dialog = screen.getByRole('dialog', { name: 'تعديل التصنيف' });
    const input = within(dialog).getByLabelText(/اسم التصنيف/);
    await userEvent.clear(input);
    await userEvent.type(input, 'الحساب');
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ' }));

    expect(await screen.findByRole('heading', { name: 'الحساب' })).toBeInTheDocument();
  });

  it('deletes only after confirmation', async () => {
    renderContent(ADMIN_PATHS.categories);
    await list();

    await userEvent.click(screen.getByRole('button', { name: 'حذف التصنيف الذاكرة والتسلسل' }));
    await userEvent.click(screen.getByRole('button', { name: 'إلغاء' }));
    expect(screen.getByRole('heading', { name: 'الذاكرة والتسلسل' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'حذف التصنيف الذاكرة والتسلسل' }));
    const confirm = screen.getByRole('dialog', { name: 'حذف التصنيف' });
    await userEvent.click(within(confirm).getByRole('button', { name: 'حذف' }));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'الذاكرة والتسلسل' })).not.toBeInTheDocument();
    });
  });

  it('shows the empty state', async () => {
    server.use(http.get(apiUrl('Admin/categories'), () => HttpResponse.json([])));
    renderContent(ADMIN_PATHS.categories);

    expect(await screen.findByText('لا توجد تصنيفات بعد')).toBeInTheDocument();
  });

  it('shows an error state with retry', async () => {
    let calls = 0;
    server.use(
      http.get(apiUrl('Admin/categories'), () => {
        calls += 1;
        return calls === 1
          ? new HttpResponse(null, { status: 500 })
          : HttpResponse.json([{ id: 'x', name: 'تصنيف جديد', count: 0 }]);
      }),
    );
    renderContent(ADMIN_PATHS.categories);

    expect(await screen.findByText('تعذّر تحميل البيانات')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'إعادة المحاولة' }));
    expect(await screen.findByRole('heading', { name: 'تصنيف جديد' })).toBeInTheDocument();
  });
});
