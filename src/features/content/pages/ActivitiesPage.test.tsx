import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { ADMIN_PATHS } from '@/constants/routes';
import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';

import { renderContent } from './contentTestUtils';

describe('ActivitiesPage', () => {
  it('lists tests and switches to games', async () => {
    renderContent(ADMIN_PATHS.activities);

    expect(await screen.findByRole('link', { name: 'اختبار الحروف' })).toHaveAttribute(
      'href',
      ADMIN_PATHS.activityDetail('test', 'a0000000-0000-4000-8000-000000000001'),
    );
    expect(screen.getByRole('button', { name: 'الاختبارات' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await userEvent.click(screen.getByRole('button', { name: 'الألعاب' }));

    expect(await screen.findByRole('link', { name: 'لعبة الذاكرة' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'اختبار الحروف' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'الألعاب' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('filters by category', async () => {
    renderContent(ADMIN_PATHS.activities);
    await screen.findByRole('link', { name: 'اختبار الحروف' });

    await userEvent.selectOptions(screen.getByLabelText('التصنيف'), 'الأرقام والحساب');

    expect(await screen.findByRole('link', { name: 'اختبار الأعداد' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'اختبار الحروف' })).not.toBeInTheDocument();
  });

  it('creates an activity with multipart fields including the icon file', async () => {
    let received: FormData | undefined;
    server.use(
      http.post(apiUrl('Admin/activities/:type'), async ({ request, params }) => {
        received = await request.formData();
        expect(params.type).toBe('test');
        return HttpResponse.json({ id: 'new' });
      }),
    );
    renderContent(ADMIN_PATHS.activities);
    await screen.findByRole('link', { name: 'اختبار الحروف' });

    await userEvent.click(screen.getByRole('button', { name: 'إضافة نشاط' }));
    const dialog = screen.getByRole('dialog', { name: 'إضافة نشاط' });
    await userEvent.type(within(dialog).getByLabelText(/عنوان النشاط/), 'اختبار الكلمات');
    await userEvent.type(within(dialog).getByLabelText(/المعرّف المختصر/), 'words-test');
    await userEvent.selectOptions(within(dialog).getByLabelText(/^التصنيف/), 'الحروف والقراءة');
    const icon = new File(['png'], 'icon.png', { type: 'image/png' });
    await userEvent.upload(within(dialog).getByLabelText('أيقونة النشاط'), icon);
    expect(within(dialog).getByRole('img', { name: 'معاينة الصورة المختارة' })).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ' }));

    await screen.findByRole('list', { name: 'الاختبارات' });
    expect(received?.get('Title')).toBe('اختبار الكلمات');
    expect(received?.get('Slug')).toBe('words-test');
    expect(received?.get('CategoryId')).toBe('cat00000-0000-4000-8000-000000000001');
    // MSW parses the body in another realm, so check the file by its properties.
    expect(received?.get('Icon')).toMatchObject({ type: 'image/png', size: 3 });
  });

  it('rejects an invalid slug before sending', async () => {
    renderContent(ADMIN_PATHS.activities);
    await screen.findByRole('link', { name: 'اختبار الحروف' });

    await userEvent.click(screen.getByRole('button', { name: 'إضافة نشاط' }));
    const dialog = screen.getByRole('dialog', { name: 'إضافة نشاط' });
    await userEvent.type(within(dialog).getByLabelText(/المعرّف المختصر/), 'Bad Slug');
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ' }));

    expect(
      within(dialog).getByText('استخدم أحرفاً إنجليزية صغيرة وأرقاماً وشرطات فقط'),
    ).toBeInTheDocument();
    expect(within(dialog).getByText('اختر التصنيف')).toBeInTheDocument();
  });

  it('deletes an activity after confirmation', async () => {
    renderContent(ADMIN_PATHS.activities);
    await screen.findByRole('link', { name: 'اختبار الأعداد' });

    await userEvent.click(screen.getByRole('button', { name: 'حذف النشاط اختبار الأعداد' }));
    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'حذف النشاط' })).getByRole('button', {
        name: 'حذف',
      }),
    );

    expect(await screen.findByRole('link', { name: 'اختبار الحروف' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'اختبار الأعداد' })).not.toBeInTheDocument();
  });

  it('shows an empty state for a type without activities', async () => {
    server.use(http.get(apiUrl('Admin/activities/:type'), () => HttpResponse.json([])));
    renderContent(`${ADMIN_PATHS.activities}?type=game`);

    expect(await screen.findByText('لا توجد الألعاب هنا بعد')).toBeInTheDocument();
  });
});
