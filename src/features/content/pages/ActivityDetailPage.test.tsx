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
