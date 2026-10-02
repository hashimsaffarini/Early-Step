import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderInRouter } from '@/test/renderWithRouter';

import { SuperAdminPanelPage } from './SuperAdminPanelPage';

const NAME = 'عبدالله منصور';

async function openUsersTab() {
  renderInRouter(<SuperAdminPanelPage userName={NAME} />);
  await userEvent.click(screen.getByRole('tab', { name: /المستخدمون/ }));
  return screen.getByRole('list', { name: 'المستخدمون' });
}

describe('SuperAdminPanelPage', () => {
  it('greets the super admin and shows the overview with users by role', () => {
    renderInRouter(<SuperAdminPanelPage userName={NAME} />);

    expect(screen.getByRole('heading', { level: 1, name: new RegExp(NAME) })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /نظرة عامة/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: 'المستخدمون حسب الدور' })).toBeInTheDocument();
    expect(screen.getByText('إجمالي المستخدمين')).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('switches to the children and reports tabs', async () => {
    renderInRouter(<SuperAdminPanelPage userName={NAME} />);

    await userEvent.click(screen.getByRole('tab', { name: /الأطفال/ }));
    const children = screen.getByRole('list', { name: 'الأطفال المسجّلون في النظام' });
    expect(within(children).getAllByRole('article')).toHaveLength(7);

    await userEvent.click(screen.getByRole('tab', { name: /التقارير/ }));
    expect(
      within(screen.getByRole('list', { name: 'جميع التقارير' })).getAllByRole('listitem'),
    ).toHaveLength(6);
  });

  it('searches and filters users by role', async () => {
    const list = await openUsersTab();
    expect(within(list).getAllByRole('listitem')).toHaveLength(10);

    await userEvent.click(screen.getByRole('button', { name: /^الأخصائي/ }));
    expect(
      within(screen.getByRole('list', { name: 'المستخدمون' })).getAllByRole('listitem'),
    ).toHaveLength(2);

    await userEvent.click(screen.getByRole('button', { name: /^الكل/ }));
    await userEvent.type(screen.getByRole('searchbox', { name: 'ابحث عن مستخدم...' }), 'سامي');
    expect(
      within(screen.getByRole('list', { name: 'المستخدمون' })).getAllByRole('listitem'),
    ).toHaveLength(1);
  });

  it('removes a user locally only after confirming', async () => {
    await openUsersTab();

    await userEvent.click(screen.getByRole('button', { name: 'حذف علي حسن' }));
    const dialog = screen.getByRole('dialog', { name: 'حذف المستخدم' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'إلغاء' }));
    expect(screen.getByText('علي حسن')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'حذف علي حسن' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'حذف' }));

    expect(screen.queryByText('علي حسن')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('من القائمة المحلية فقط');
    expect(screen.getByRole('tab', { name: /المستخدمون/ })).toHaveTextContent('9');
  });

  it('does not let the super admin delete their own account', async () => {
    await openUsersTab();

    expect(screen.getByRole('button', { name: `حذف ${NAME}` })).toBeDisabled();
    for (const button of screen.getAllByRole('button', { name: /تغيير الدور/ })) {
      expect(button).toBeDisabled();
    }
  });
});
