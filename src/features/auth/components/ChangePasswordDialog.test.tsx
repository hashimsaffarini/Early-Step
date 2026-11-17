import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { renderInRouter } from '@/test/renderWithRouter';

import { ChangePasswordDialog } from './ChangePasswordDialog';

const NEW_PASSWORD = 'Strong#Pass9';

function renderDialog(onClose = vi.fn()) {
  renderInRouter(<ChangePasswordDialog isOpen onClose={onClose} />);
  return onClose;
}

async function fill(current: string, next: string, confirm: string) {
  await userEvent.type(screen.getByLabelText(/^كلمة المرور الحالية/), current);
  await userEvent.type(screen.getByLabelText(/^كلمة المرور الجديدة/), next);
  await userEvent.type(screen.getByLabelText(/^تأكيد كلمة المرور الجديدة/), confirm);
  await userEvent.click(screen.getByRole('button', { name: 'حفظ كلمة المرور' }));
}

describe('ChangePasswordDialog', () => {
  it('validates before sending: required, mismatch and same as current', async () => {
    renderDialog();
    await userEvent.click(screen.getByRole('button', { name: 'حفظ كلمة المرور' }));
    expect(await screen.findByText('كلمة المرور الحالية مطلوبة')).toBeInTheDocument();

    await fill(NEW_PASSWORD, NEW_PASSWORD, 'Other#Pass9');
    expect(await screen.findByText('كلمتا المرور غير متطابقتين')).toBeInTheDocument();
    expect(screen.getByText('يجب أن تختلف كلمة المرور الجديدة عن الحالية')).toBeInTheDocument();
  });

  it('sends the Swagger body and closes with a success toast', async () => {
    let body: unknown;
    server.use(
      http.post(apiUrl('Auth/change-password'), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json('تم تغيير كلمة المرور بنجاح');
      }),
    );
    const onClose = renderDialog();

    await fill('Old#Pass12', NEW_PASSWORD, NEW_PASSWORD);

    expect(await screen.findByText('تم تغيير كلمة المرور بنجاح')).toBeInTheDocument();
    expect(body).toEqual({
      currentPassword: 'Old#Pass12',
      newPassword: NEW_PASSWORD,
      confirmPassword: NEW_PASSWORD,
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("shows the server's message when the current password is wrong", async () => {
    server.use(
      http.post(apiUrl('Auth/change-password'), () =>
        HttpResponse.json({ message: 'كلمة المرور الحالية غير صحيحة.' }, { status: 400 }),
      ),
    );
    const onClose = renderDialog();

    await fill('Wrong#Pass1', NEW_PASSWORD, NEW_PASSWORD);

    expect(await screen.findByText('كلمة المرور الحالية غير صحيحة.')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
