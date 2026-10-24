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
    const reading = within(categories).getByRole('link', { name: 'أنشطة التصنيف الحروف والقراءة' });
    expect(await within(reading).findByText('الأنشطة: 1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'التصنيفات' })).toHaveAttribute('aria-current', 'page');
  });

  it('counts the real tests and games of each category, not the server count (client 2026-10)', async () => {
    // Live, `Admin/categories` answered `count: 0` for categories that have activities.
    server.use(
      http.get(apiUrl('Admin/categories'), () =>
        HttpResponse.json([
          { id: 'c-mixed', name: 'تصنيف مختلط', count: 0 },
          { id: 'c-tests', name: 'تصنيف اختبارات', count: 0 },
          { id: 'c-empty', name: 'تصنيف فارغ', count: 0 },
        ]),
      ),
      http.get(apiUrl('Admin/activities/:type'), ({ params }) =>
        HttpResponse.json(
          params.type === 'game'
            ? [{ id: 'g1', title: 'لعبة', categoryId: 'c-mixed', categoryName: 'تصنيف مختلط' }]
            : [
                { id: 't1', title: 'اختبار 1', categoryId: 'c-mixed', categoryName: 'تصنيف مختلط' },
                {
                  id: 't2',
                  title: 'اختبار 2',
                  categoryId: 'c-tests',
                  categoryName: 'تصنيف اختبارات',
                },
                {
                  id: 't3',
                  title: 'اختبار 3',
                  categoryId: 'c-tests',
                  categoryName: 'تصنيف اختبارات',
                },
              ],
        ),
      ),
    );
    renderContent(ADMIN_PATHS.categories);
    const categories = await list();

    const card = (name: string) =>
      within(categories).getByRole('link', { name: `أنشطة التصنيف ${name}` });
    expect(await within(card('تصنيف مختلط')).findByText('الأنشطة: 2')).toBeInTheDocument();
    expect(within(card('تصنيف مختلط')).getByText('اختبارات: 1')).toBeInTheDocument();
    expect(within(card('تصنيف مختلط')).getByText('ألعاب: 1')).toBeInTheDocument();
    expect(within(card('تصنيف اختبارات')).getByText('الأنشطة: 2')).toBeInTheDocument();
    expect(within(card('تصنيف فارغ')).getByText('الأنشطة: 0')).toBeInTheDocument();
  });

  it('refreshes the counts after an activity is created', async () => {
    renderContent(ADMIN_PATHS.categories);
    const categories = await list();
    const memory = within(categories).getByRole('link', { name: 'أنشطة التصنيف الذاكرة والتسلسل' });
    expect(await within(memory).findByText('ألعاب: 1')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('link', { name: 'الأنشطة والأسئلة' }));
    await userEvent.click(await screen.findByRole('button', { name: 'الألعاب' }));
    await userEvent.click(
      screen.getAllByRole('button', { name: 'إضافة لعبة' })[0] ?? document.body,
    );
    const dialog = screen.getByRole('dialog', { name: 'إضافة لعبة' });
    await userEvent.type(within(dialog).getByLabelText(/عنوان النشاط/), 'لعبة جديدة');
    await userEvent.type(within(dialog).getByLabelText(/المعرّف المختصر/), 'new-game');
    await userEvent.selectOptions(within(dialog).getByLabelText(/^التصنيف/), 'الذاكرة والتسلسل');
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ' }));
    await screen.findByRole('link', { name: 'لعبة جديدة' });

    await userEvent.click(screen.getByRole('link', { name: 'التصنيفات' }));
    const updated = within(await list()).getByRole('link', {
      name: 'أنشطة التصنيف الذاكرة والتسلسل',
    });
    expect(await within(updated).findByText('ألعاب: 2')).toBeInTheDocument();
  });

  it('makes the whole category card a keyboard link to its activities', async () => {
    const { router } = renderContent(ADMIN_PATHS.categories);
    const categories = await list();
    const link = within(categories).getByRole('link', { name: 'أنشطة التصنيف الأرقام والحساب' });
    expect(within(link).queryByRole('button')).not.toBeInTheDocument();

    link.focus();
    await userEvent.keyboard('{Enter}');
    expect(router.state.location.pathname).toBe(
      ADMIN_PATHS.categoryActivities('cat00000-0000-4000-8000-000000000002'),
    );
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
