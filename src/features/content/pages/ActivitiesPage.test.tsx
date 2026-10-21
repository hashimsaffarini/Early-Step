import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { ADMIN_PATHS } from '@/constants/routes';
import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';

import { renderContent } from '@/test/contentTestUtils';

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

    await userEvent.click(screen.getByRole('button', { name: 'إضافة اختبار' }));
    const dialog = screen.getByRole('dialog', { name: 'إضافة اختبار' });
    await userEvent.type(within(dialog).getByLabelText(/عنوان النشاط/), 'اختبار الكلمات');
    await userEvent.type(within(dialog).getByLabelText(/المعرّف المختصر/), 'words-test');
    await userEvent.selectOptions(within(dialog).getByLabelText(/^التصنيف/), 'الحروف والقراءة');
    const icon = new File(['png'], 'icon.png', { type: 'image/png' });
    await userEvent.upload(within(dialog).getByLabelText('أيقونة النشاط'), icon);
    expect(within(dialog).getByRole('img', { name: 'معاينة الصورة المختارة' })).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'إضافة اختبار' })).not.toBeInTheDocument();
    });
    expect(received?.get('Title')).toBe('اختبار الكلمات');
    expect(received?.get('Slug')).toBe('words-test');
    expect(received?.get('CategoryId')).toBe('cat00000-0000-4000-8000-000000000001');
    // MSW parses the body in another realm, so check the file by its properties.
    expect(received?.get('Icon')).toMatchObject({ type: 'image/png', size: 3 });
  });

  it('rejects an invalid slug before sending', async () => {
    renderContent(ADMIN_PATHS.activities);
    await screen.findByRole('link', { name: 'اختبار الحروف' });

    await userEvent.click(screen.getByRole('button', { name: 'إضافة اختبار' }));
    const dialog = screen.getByRole('dialog', { name: 'إضافة اختبار' });
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

  it('explains that no games exist yet and offers «إضافة لعبة» (no demo games)', async () => {
    server.use(http.get(apiUrl('Admin/activities/:type'), () => HttpResponse.json([])));
    renderContent(`${ADMIN_PATHS.activities}?type=game`);

    expect(await screen.findByText('لا توجد ألعاب مضافة حالياً')).toBeInTheDocument();
    expect(
      screen.getByText('يمكن للإدارة إضافة ألعاب ليتم إسنادها لاحقاً ضمن الخطة التدريبية.'),
    ).toBeInTheDocument();
    const addButtons = await screen.findAllByRole('button', { name: 'إضافة لعبة' });
    expect(addButtons).toHaveLength(2); // page action + empty-state action
    await userEvent.click(addButtons[1] ?? addButtons[0] ?? document.body);
    const dialog = screen.getByRole('dialog', { name: 'إضافة لعبة' });
    expect(within(dialog).getByText('النوع: الألعاب')).toBeInTheDocument();
  });

  it('creates a real game through the game activity type and lists it afterwards', async () => {
    let createdType: unknown;
    server.events.on('request:start', ({ request }) => {
      if (request.method === 'POST' && request.url.includes('Admin/activities/')) {
        createdType = new URL(request.url).pathname.split('/').pop();
      }
    });
    renderContent(`${ADMIN_PATHS.activities}?type=game`);
    await screen.findByRole('link', { name: 'لعبة الذاكرة' });

    await userEvent.click(screen.getByRole('button', { name: 'إضافة لعبة' }));
    const dialog = screen.getByRole('dialog', { name: 'إضافة لعبة' });
    await userEvent.type(within(dialog).getByLabelText(/عنوان النشاط/), 'لعبة الألوان');
    await userEvent.type(within(dialog).getByLabelText(/المعرّف المختصر/), 'colors-game');
    await userEvent.selectOptions(within(dialog).getByLabelText(/^التصنيف/), 'الحروف والقراءة');
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ' }));

    expect(await screen.findByRole('link', { name: 'لعبة الألوان' })).toBeInTheDocument();
    expect(createdType).toBe('game');
    server.events.removeAllListeners();
  });

  it('groups activities under their category with the type on each row', async () => {
    renderContent(ADMIN_PATHS.activities);

    const reading = await screen.findByRole('region', { name: /الحروف والقراءة/ });
    const math = screen.getByRole('region', { name: /الأرقام والحساب/ });
    expect(within(reading).getByRole('link', { name: 'اختبار الحروف' })).toBeInTheDocument();
    expect(within(math).getByRole('link', { name: 'اختبار الأعداد' })).toBeInTheDocument();
    expect(within(reading).queryByRole('link', { name: 'اختبار الأعداد' })).not.toBeInTheDocument();
    expect(within(reading).getAllByText('اختبار').length).toBeGreaterThan(0);
  });

  it('shows the real activity icon and falls back to a neutral icon when it fails', async () => {
    server.use(
      http.get(apiUrl('Admin/activities/:type'), () =>
        HttpResponse.json([
          {
            id: 'a-icon',
            title: 'نشاط بأيقونة',
            iconUrl: '/uploads/icon.png',
            categoryId: 'cat00000-0000-4000-8000-000000000001',
            categoryName: 'الحروف والقراءة',
          },
        ]),
      ),
    );
    const { container } = renderContent(`${ADMIN_PATHS.activities}?type=test`);
    await screen.findByRole('link', { name: 'نشاط بأيقونة' });

    const image = container.querySelector('img');
    expect(image).toHaveAttribute('src', expect.stringContaining('/uploads/icon.png') as string);
    image?.dispatchEvent(new Event('error'));
    await waitFor(() => {
      expect(container.querySelector('img')).toBeNull();
    });
  });

  it('shows an empty state for tests too', async () => {
    server.use(http.get(apiUrl('Admin/activities/:type'), () => HttpResponse.json([])));
    renderContent(`${ADMIN_PATHS.activities}?type=test`);

    expect(await screen.findByText('لا توجد الاختبارات هنا بعد')).toBeInTheDocument();
  });

  describe('game templates (client revision 2026-10)', () => {
    it('lists the four templates and creates a game whose Slug carries the template', async () => {
      let received: FormData | undefined;
      server.use(
        http.post(apiUrl('Admin/activities/:type'), async ({ request, params }) => {
          expect(params.type).toBe('game');
          received = await request.formData();
          return HttpResponse.json({ id: 'new-game' });
        }),
      );
      renderContent(`${ADMIN_PATHS.activities}?type=game`);

      const templates = await screen.findByRole('list', { name: 'قوالب الألعاب' });
      expect(within(templates).getAllByRole('listitem')).toHaveLength(4);
      await userEvent.click(
        within(templates).getByRole('button', { name: 'إنشاء لعبة من قالب صيد الحروف' }),
      );

      const dialog = screen.getByRole('dialog', { name: 'إضافة لعبة' });
      expect(within(dialog).getByLabelText('نوع اللعبة')).toHaveValue('letter-hunt');
      expect(
        within(dialog).getByText(/أنواع الأسئلة المناسبة: اختيار إجابة واحدة/),
      ).toBeInTheDocument();
      expect(within(dialog).getByLabelText(/المعرّف المختصر/)).toHaveValue('letter-hunt');
      await userEvent.type(within(dialog).getByLabelText(/عنوان النشاط/), 'صيد حروف الحيوانات');
      await userEvent.selectOptions(within(dialog).getByLabelText(/^التصنيف/), 'الحروف والقراءة');
      await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ' }));

      await waitFor(() => {
        expect(received?.get('Slug')).toBe('letter-hunt');
      });
      expect(received?.get('Title')).toBe('صيد حروف الحيوانات');
    });

    it('keeps a suffix when switching template and shows each template’s question types', async () => {
      renderContent(`${ADMIN_PATHS.activities}?type=game`);
      await screen.findByRole('list', { name: 'قوالب الألعاب' });
      await userEvent.click(
        screen.getAllByRole('button', { name: 'إضافة لعبة' })[0] ?? document.body,
      );
      const dialog = screen.getByRole('dialog', { name: 'إضافة لعبة' });
      const template = within(dialog).getByLabelText('نوع اللعبة');
      expect(template).toHaveValue('');

      await userEvent.selectOptions(template, 'memory-sequence');
      expect(within(dialog).getByText(/أنواع الأسئلة المناسبة: ترتيب/)).toBeInTheDocument();
      const slug = within(dialog).getByLabelText(/المعرّف المختصر/);
      await userEvent.clear(slug);
      await userEvent.type(slug, 'memory-sequence-2');
      await userEvent.selectOptions(template, 'focus-challenge');

      expect(slug).toHaveValue('focus-challenge-2');
      expect(
        within(dialog).getByText(/أنواع الأسئلة المناسبة: اختيار عدة إجابات/),
      ).toBeInTheDocument();
    });

    it('rejects a slug that does not belong to the chosen template', async () => {
      renderContent(`${ADMIN_PATHS.activities}?type=game`);
      await screen.findByRole('list', { name: 'قوالب الألعاب' });
      await userEvent.click(screen.getByRole('button', { name: 'إنشاء لعبة من قالب طابق الرقم' }));
      const dialog = screen.getByRole('dialog', { name: 'إضافة لعبة' });
      await userEvent.type(within(dialog).getByLabelText(/عنوان النشاط/), 'لعبة');
      await userEvent.selectOptions(within(dialog).getByLabelText(/^التصنيف/), 'الأرقام والحساب');
      const slug = within(dialog).getByLabelText(/المعرّف المختصر/);
      await userEvent.clear(slug);
      await userEvent.type(slug, 'numbers');
      await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ' }));

      expect(
        await within(dialog).findByText(
          'يجب أن يبدأ المعرّف بـ number-match ليفتح الطفل لعبة «طابق الرقم».',
        ),
      ).toBeInTheDocument();
    });

    it('shows no template section on the tests tab', async () => {
      renderContent(`${ADMIN_PATHS.activities}?type=test`);
      await screen.findByRole('link', { name: 'اختبار الحروف' });

      expect(screen.queryByRole('list', { name: 'قوالب الألعاب' })).not.toBeInTheDocument();
    });
  });
});
