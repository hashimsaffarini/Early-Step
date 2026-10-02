import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { AreaRole } from '@/constants/routes';
import { RoleAreaContext } from '@/hooks/useRoleArea';
import { renderInRouter } from '@/test/renderWithRouter';

import { getMockUnreadCount } from '../mock/conversations.mock';

import { MessagesPage } from './MessagesPage';

function renderMessages(role: AreaRole = 'Parent') {
  return renderInRouter(
    <RoleAreaContext value={role}>
      <MessagesPage />
    </RoleAreaContext>,
  );
}

const getList = () => screen.getByRole('region', { name: 'المحادثات' });
const openConversation = (name: RegExp) =>
  userEvent.click(within(getList()).getByRole('button', { name }));

describe('MessagesPage', () => {
  it('lists the role’s conversations and prompts to pick one', () => {
    renderMessages('Parent');

    expect(within(getList()).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('اختر محادثة لتبدأ')).toBeInTheDocument();
  });

  it('shows the thread of the selected conversation', async () => {
    renderMessages('Parent');

    await openConversation(/أ\. ليلى حسن/);

    const thread = screen.getByRole('region', { name: 'أ. ليلى حسن' });
    expect(within(thread).getByText('الأخصائي')).toBeInTheDocument();
    expect(within(thread).getByText(/قراءة قصة مصوّرة/)).toBeInTheDocument();
    expect(within(getList()).getByRole('button', { name: /أ\. ليلى حسن/ })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('clears a conversation’s unread badge when it is opened', async () => {
    renderMessages('Parent');
    const item = within(getList()).getByRole('button', { name: /أ\. سارة خالد/ });
    expect(item).toHaveTextContent('2 رسائل غير مقروءة');

    await openConversation(/أ\. سارة خالد/);

    expect(within(getList()).getByRole('button', { name: /أ\. سارة خالد/ })).not.toHaveTextContent(
      'غير مقروءة',
    );
  });

  it('sends a message locally with Enter and clears the composer', async () => {
    renderMessages('Parent');
    await openConversation(/خالد سعيد/);
    const composer = screen.getByLabelText('اكتب رسالتك');

    expect(screen.getByRole('button', { name: 'إرسال' })).toBeDisabled();
    await userEvent.type(composer, 'مرحباً{Enter}');

    const messages = screen.getByRole('list', { name: 'الرسائل' });
    expect(within(messages).getByText('مرحباً')).toBeInTheDocument();
    expect(composer).toHaveValue('');
  });

  it('switches between list and thread views for small screens', async () => {
    const { container } = renderMessages('Teacher');
    const layout = container.querySelector('[data-view]');
    expect(layout).toHaveAttribute('data-view', 'list');

    await openConversation(/خالد يوسف/);
    expect(layout).toHaveAttribute('data-view', 'thread');
    expect(screen.getByRole('heading', { name: 'خالد يوسف' })).toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: 'العودة إلى المحادثات' }));
    expect(layout).toHaveAttribute('data-view', 'list');
    expect(within(getList()).getByRole('button', { name: /خالد يوسف/ })).toHaveFocus();
  });

  it('starts a new conversation from the contact dialog', async () => {
    renderMessages('Teacher');

    await userEvent.click(screen.getByRole('button', { name: 'محادثة جديدة' }));
    const dialog = screen.getByRole('dialog', { name: 'محادثة جديدة' });
    await userEvent.click(within(dialog).getByRole('button', { name: /علي حسن/ }));

    expect(dialog).not.toHaveAttribute('open');
    expect(within(getList()).getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByRole('region', { name: 'علي حسن' })).toHaveTextContent('ابدأ المحادثة');
  });

  it('exposes the unread total for the navigation badge', () => {
    expect(getMockUnreadCount('Parent')).toBe(3);
    expect(getMockUnreadCount('SuperAdmin')).toBe(0);
  });
});
