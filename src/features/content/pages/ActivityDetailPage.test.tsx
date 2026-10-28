import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { ADMIN_PATHS } from '@/constants/routes';
import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';

import { LETTERS_TEST_ID, renderContent } from '@/test/contentTestUtils';

const DETAIL = ADMIN_PATHS.activityDetail('test', LETTERS_TEST_ID);

describe('ActivityDetailPage', () => {
  it('shows questions with their options and answers', async () => {
    renderContent(DETAIL);

    expect(await screen.findByRole('heading', { name: 'الأسئلة (2)' })).toBeInTheDocument();
    const options = screen.getByRole('list', { name: 'خيارات السؤال 1' });
    expect(within(options).getByText('بطة')).toBeInTheDocument();
    expect(within(options).getByText('إجابة صحيحة')).toBeInTheDocument();
    expect(screen.getByText('الترتيب الصحيح: 1')).toBeInTheDocument();
  });

  it('adds a single-choice question with indexed option fields', async () => {
    let received: FormData | undefined;
    server.use(
      http.post(apiUrl('Admin/activities/:activityId/questions'), async ({ request }) => {
        received = await request.clone().formData();
        return undefined;
      }),
    );
    renderContent(DETAIL);
    await screen.findByRole('heading', { name: 'الأسئلة (2)' });

    await userEvent.click(screen.getByRole('button', { name: 'إضافة سؤال' }));
    const dialog = screen.getByRole('dialog', { name: 'إضافة سؤال' });
    await userEvent.type(within(dialog).getByLabelText(/نص السؤال/), 'ما الحرف الأول في «سمكة»؟');
    await userEvent.type(within(dialog).getByLabelText('نص الخيار 1'), 'س');
    await userEvent.type(within(dialog).getByLabelText('نص الخيار 2'), 'م');

    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ السؤال' }));
    expect(within(dialog).getByText('حدّد إجابة صحيحة واحدة فقط')).toBeInTheDocument();

    await userEvent.click(within(dialog).getByLabelText('الخيار 1 هو الإجابة الصحيحة'));
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ السؤال' }));

    expect(await screen.findByRole('heading', { name: 'الأسئلة (3)' })).toBeInTheDocument();
    expect(received?.get('Type')).toBe('SingleChoice');
    expect(received?.get('Options[0].OptionText')).toBe('س');
    expect(received?.get('Options[0].IsCorrect')).toBe('true');
    expect(received?.get('Options[1].IsCorrect')).toBe('false');
    expect(received?.get('Options[1].Order')).toBe('2');
  });

  it('edits an option', async () => {
    renderContent(DETAIL);
    await screen.findByRole('heading', { name: 'الأسئلة (2)' });

    await userEvent.click(screen.getByRole('button', { name: 'تعديل الخيار: تفاحة' }));
    const dialog = screen.getByRole('dialog', { name: 'تعديل الخيار' });
    const input = within(dialog).getByLabelText('نص الخيار');
    await userEvent.clear(input);
    await userEvent.type(input, 'تمر');
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ' }));

    expect(await screen.findByText('تمر')).toBeInTheDocument();
  });

  it('deletes an option and all options only after confirmation', async () => {
    renderContent(DETAIL);
    await screen.findByRole('heading', { name: 'الأسئلة (2)' });

    await userEvent.click(screen.getByRole('button', { name: 'حذف الخيار: تفاحة' }));
    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'حذف الخيار' })).getByRole('button', {
        name: 'حذف',
      }),
    );
    await waitFor(() => {
      expect(screen.queryByText('تفاحة')).not.toBeInTheDocument();
    });

    const [deleteAll] = screen.getAllByRole('button', { name: 'حذف كل الخيارات' });
    if (!deleteAll) throw new Error('button not found');
    await userEvent.click(deleteAll);
    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'حذف جميع الخيارات' })).getByRole('button', {
        name: 'حذف',
      }),
    );
    expect(await screen.findByText('لا توجد خيارات لهذا السؤال.')).toBeInTheDocument();
  });

  it('edits the question text', async () => {
    renderContent(DETAIL);
    await screen.findByRole('heading', { name: 'الأسئلة (2)' });

    const [edit] = screen.getAllByRole('button', { name: 'تعديل السؤال' });
    if (!edit) throw new Error('button not found');
    await userEvent.click(edit);
    const dialog = screen.getByRole('dialog', { name: 'تعديل السؤال' });
    const text = within(dialog).getByLabelText(/نص السؤال/);
    await userEvent.clear(text);
    await userEvent.type(text, 'سؤال معدّل');
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ' }));

    expect(await screen.findByRole('heading', { name: '1. سؤال معدّل' })).toBeInTheDocument();
  });

  it('shows not-found for an unknown activity', async () => {
    renderContent(ADMIN_PATHS.activityDetail('test', 'missing'));

    expect(await screen.findByText('لم يتم العثور على النشاط')).toBeInTheDocument();
  });
});

describe('ActivityDetailPage — correct answers (client revision 2026-10)', () => {
  function capturePuts() {
    const puts: {
      id: string;
      isCorrect: string | null;
      correctOrder: string | null;
      order: string | null;
    }[] = [];
    server.events.on('request:start', ({ request }) => {
      if (request.method !== 'PUT' || !request.url.includes('question-options')) return;
      void request
        .clone()
        .formData()
        .then((form) => {
          puts.push({
            id: request.url.split('/').pop() ?? '',
            isCorrect: form.get('IsCorrect') as string | null,
            correctOrder: form.get('CorrectOrder') as string | null,
            order: form.get('Order') as string | null,
          });
        });
    });
    return puts;
  }

  afterEach(() => {
    server.events.removeAllListeners();
  });

  it('SingleChoice: picks another answer — clears the old one first, then re-fetches', async () => {
    const puts = capturePuts();
    renderContent(DETAIL);
    await screen.findByRole('heading', { name: 'الأسئلة (2)' });

    const [first] = screen.getAllByRole('button', { name: 'الإجابة الصحيحة' });
    if (!first) throw new Error('button not found');
    await userEvent.click(first);
    const dialog = screen.getByRole('dialog', { name: 'الإجابة الصحيحة — السؤال 1' });
    expect(within(dialog).getByRole('radio', { name: 'بطة' })).toBeChecked();
    await userEvent.click(within(dialog).getByRole('radio', { name: 'تفاحة' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ الإجابة الصحيحة' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(puts.map((put) => [put.isCorrect, put.order])).toEqual([
      ['false', '1'],
      ['true', '2'],
    ]);
    // Re-fetched from the server: the new answer is marked.
    const options = screen.getByRole('list', { name: 'خيارات السؤال 1' });
    await waitFor(() => {
      expect(within(options).getByText('تفاحة').parentElement).toHaveTextContent('إجابة صحيحة');
    });
    expect(within(options).getByText('بطة').parentElement).not.toHaveTextContent('إجابة صحيحة');
  });

  it('Sequence: moves an option and saves the new CorrectOrder values', async () => {
    const puts = capturePuts();
    renderContent(DETAIL);
    await screen.findByRole('heading', { name: 'الأسئلة (2)' });

    const [, second] = screen.getAllByRole('button', { name: 'الإجابة الصحيحة' });
    if (!second) throw new Error('button not found');
    await userEvent.click(second);
    const dialog = screen.getByRole('dialog', { name: 'الإجابة الصحيحة — السؤال 2' });
    const order = within(dialog).getByRole('list', { name: 'الترتيب الصحيح' });
    expect(
      within(order)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual([
      expect.stringContaining('ق'),
      expect.stringContaining('م'),
      expect.stringContaining('ر'),
    ]);
    await userEvent.click(within(dialog).getByRole('button', { name: 'تأخير ق' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ الإجابة الصحيحة' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    // ق: 1 → 2, م: 2 → 1 (ر unchanged, not sent).
    expect(puts.map((put) => put.correctOrder).sort()).toEqual(['1', '2']);
    await waitFor(() => {
      expect(screen.getByText('الترتيب الصحيح: 2').parentElement).toHaveTextContent('ق');
    });
  });
});

describe('ActivityDetailPage — game template (client revision 2026-10)', () => {
  const gameDetail = (slug: string) =>
    http.get(apiUrl('Admin/activities/:type/:id'), () =>
      HttpResponse.json({
        id: 'g-1',
        title: 'لعبة الحروف',
        description: '',
        slug,
        type: 'game',
        iconUrl: '/uploads/letters.png',
        categoryId: 'cat00000-0000-4000-8000-000000000001',
        categoryName: 'الحروف والقراءة',
        questions: [
          { id: 'q1', questionText: 'سؤال 1', type: 'SingleChoice', order: 1, options: [] },
          { id: 'q2', questionText: 'سؤال 2', type: 'Sequence', order: 2, options: [] },
        ],
      }),
    );

  it('shows the template from the saved slug and which questions fit it', async () => {
    server.use(gameDetail('letter-hunt-2'));
    renderContent(ADMIN_PATHS.activityDetail('game', 'g-1'));

    const panel = await screen.findByRole('region', { name: 'نوع اللعبة' });
    expect(within(panel).getByText('نوع اللعبة: صيد الحروف')).toBeInTheDocument();
    expect(within(panel).getByText(/1 من الأسئلة من نوع آخر/)).toBeInTheDocument();
    // The real icon is shown, with an Arabic alt.
    expect(screen.getByRole('img', { name: 'أيقونة لعبة الحروف' })).toHaveAttribute(
      'src',
      expect.stringContaining('/uploads/letters.png') as string,
    );
  });

  it('explains the visual default for a game without a template', async () => {
    server.use(gameDetail('memory-game'));
    renderContent(ADMIN_PATHS.activityDetail('game', 'g-1'));

    expect(await screen.findByText(/لا يوجد قالب محدد لهذا النشاط/)).toBeInTheDocument();
  });
  it('opens an editable level draft without writing until the Admin saves it', async () => {
    let saved: FormData | null = null;
    server.use(
      gameDetail('spot-it'),
      http.post(apiUrl('Admin/activities/:id/questions'), async ({ request }) => {
        saved = await request.formData();
        return HttpResponse.json({});
      }),
    );
    renderContent(ADMIN_PATHS.activityDetail('game', 'g-1'));
    await userEvent.click(await screen.findByRole('button', { name: 'إضافة مستوى جاهز' }));
    const dialog = screen.getByRole('dialog', { name: 'إضافة مستوى للعبة' });
    expect(saved).toBeNull();
    expect(within(dialog).getByLabelText(/نص السؤال/)).toHaveValue(
      'ابحث عن كل القطط 🐱 في اللوحة.',
    );
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ السؤال' }));
    await waitFor(() => {
      expect(saved).not.toBeNull();
    });
    expect((saved as FormData | null)?.get('Type')).toBe('MultiSelect');
    expect((saved as FormData | null)?.get('Options[11].OptionText')).toBe('🐶');
    expect((saved as FormData | null)?.get('Options[4].IsCorrect')).toBe('true');
  });

  it('previews saved game options without submitting results or creating content', async () => {
    let writes = 0;
    server.use(
      http.get(apiUrl('Admin/activities/:type/:id'), () =>
        HttpResponse.json({
          id: 'g-1',
          title: 'ابحث وجِد',
          slug: 'spot-it',
          type: 'game',
          questions: [
            {
              id: 'q-search',
              questionText: 'ابحث عن القطة',
              type: 'MultiSelect',
              options: [
                { id: 'cat', optionText: '🐱', isCorrect: true },
                { id: 'dog', optionText: '🐶', isCorrect: false },
              ],
            },
          ],
        }),
      ),
    );
    server.events.on('request:start', ({ request }) => {
      if (request.method !== 'GET') writes += 1;
    });
    renderContent(ADMIN_PATHS.activityDetail('game', 'g-1'));
    await userEvent.click(await screen.findByRole('button', { name: 'معاينة اللعبة' }));
    const dialog = screen.getByRole('dialog', { name: 'معاينة اللعبة' });
    await userEvent.click(within(dialog).getByRole('button', { name: '🐱' }));
    expect(within(dialog).getByRole('status')).toHaveTextContent('اخترت 1 من 2');
    expect(writes).toBe(0);
    server.events.removeAllListeners();
  });
});
