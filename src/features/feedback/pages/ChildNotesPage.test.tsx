import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { RoleAreaContext } from '@/hooks/useRoleArea';
import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { renderWithRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

import { ChildNotesPage } from './ChildNotesPage';

const YOUSEF = 'c0000000-0000-4000-8000-000000000001';

function renderNotes(childId = YOUSEF) {
  signInAs('Teacher');
  return renderWithRouter(
    [
      {
        path: '/teacher/children/:childId/notes',
        element: (
          <RoleAreaContext value="Teacher">
            <ChildNotesPage />
          </RoleAreaContext>
        ),
      },
    ],
    `/teacher/children/${childId}/notes`,
  );
}

async function addNote(text: string) {
  await userEvent.type(screen.getByLabelText(/ملاحظة جديدة/), text);
  await userEvent.click(screen.getByRole('button', { name: 'حفظ الملاحظة' }));
}

describe('ChildNotesPage', () => {
  it("lists the child's earlier notes from GET Teacher/children/{childId}/feedbacks", async () => {
    server.use(
      http.get(apiUrl('Teacher/children/:childId/feedbacks'), () =>
        HttpResponse.json([
          {
            id: 'n-1',
            content: 'ملاحظة سابقة',
            createdAt: '2026-10-01T09:00:00Z',
            updatedAt: null,
          },
        ]),
      ),
    );
    renderNotes();

    expect(
      await screen.findByRole('heading', { name: 'ملاحظات المعلم — يوسف' }),
    ).toBeInTheDocument();
    const list = await screen.findByRole('list', { name: 'الملاحظات' });
    expect(within(list).getByText('ملاحظة سابقة')).toBeInTheDocument();
    expect(within(list).getByRole('button', { name: 'تعديل الملاحظة' })).toBeInTheDocument();
  });

  it('shows an empty state when the child has no notes', async () => {
    renderNotes();

    expect(await screen.findByText('لا توجد ملاحظات لهذا الطفل بعد')).toBeInTheDocument();
  });

  it('validates and creates a note, then shows it from the server', async () => {
    let body: unknown;
    renderNotes();
    await screen.findByRole('heading', { name: 'ملاحظات المعلم — يوسف' });

    await userEvent.click(screen.getByRole('button', { name: 'حفظ الملاحظة' }));
    expect(screen.getByText('نص الملاحظة مطلوب')).toBeInTheDocument();

    server.events.on('request:start', ({ request }) => {
      if (request.method === 'POST') {
        void request
          .clone()
          .json()
          .then((json: unknown) => {
            body = json;
          });
      }
    });
    await addNote('أنجز يوسف لعبة الحروف بتركيز.');

    const list = await screen.findByRole('list', { name: 'الملاحظات' });
    expect(await within(list).findByText('أنجز يوسف لعبة الحروف بتركيز.')).toBeInTheDocument();
    expect(body).toEqual({ content: 'أنجز يوسف لعبة الحروف بتركيز.' });
    server.events.removeAllListeners();
  });

  it('edits a note', async () => {
    renderNotes();
    await screen.findByRole('heading', { name: 'ملاحظات المعلم — يوسف' });
    await addNote('ملاحظة أولى');
    const list = await screen.findByRole('list', { name: 'الملاحظات' });
    await within(list).findByText('ملاحظة أولى');

    await userEvent.click(within(list).getByRole('button', { name: 'تعديل الملاحظة' }));
    const field = within(list).getByLabelText(/تعديل الملاحظة/);
    await userEvent.clear(field);
    await userEvent.type(field, 'ملاحظة معدّلة');
    await userEvent.click(within(list).getByRole('button', { name: 'حفظ التعديل' }));

    expect(await within(list).findByText('ملاحظة معدّلة')).toBeInTheDocument();
  });

  it('deletes a note after confirmation', async () => {
    renderNotes();
    await screen.findByRole('heading', { name: 'ملاحظات المعلم — يوسف' });
    await addNote('ملاحظة للحذف');
    const list = await screen.findByRole('list', { name: 'الملاحظات' });
    await within(list).findByText('ملاحظة للحذف');

    await userEvent.click(within(list).getByRole('button', { name: 'حذف الملاحظة' }));
    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'حذف الملاحظة' })).getByRole('button', {
        name: 'حذف',
      }),
    );

    expect(await screen.findByText('لا توجد ملاحظات لهذا الطفل بعد')).toBeInTheDocument();
  });

  it('shows the server error when saving fails and keeps the text', async () => {
    server.use(
      http.post(apiUrl('Teacher/children/:childId/notes'), () =>
        HttpResponse.json({ message: 'تعذّر حفظ الملاحظة.' }, { status: 400 }),
      ),
    );
    renderNotes();
    await screen.findByRole('heading', { name: 'ملاحظات المعلم — يوسف' });

    await addNote('نص');

    expect(await screen.findByText('تعذّر حفظ الملاحظة.')).toBeInTheDocument();
    expect(screen.getByLabelText(/ملاحظة جديدة/)).toHaveValue('نص');
  });

  it('shows not-found for a child not assigned to the teacher', async () => {
    renderNotes('c0000000-0000-4000-8000-000000000003');

    expect(await screen.findByText('لم يتم العثور على الطفل')).toBeInTheDocument();
  });
});
