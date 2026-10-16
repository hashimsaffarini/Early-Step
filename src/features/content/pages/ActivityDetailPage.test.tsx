import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http } from 'msw';

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

    const buttons = screen.getAllByRole('button', { name: 'الإجابة الصحيحة' });
    await userEvent.click(buttons[1] as HTMLElement);
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
