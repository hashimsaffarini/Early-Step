import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { UserRole } from '@/types/roles';

import { useNotifications } from '../hooks/useNotifications';

import { NotificationsMenu } from './NotificationsMenu';
import { getPanelPosition } from './panelPosition';

function Harness({ role }: { role: UserRole }) {
  const state = useNotifications(role);
  return <NotificationsMenu {...state} />;
}

const getBell = () => screen.getByRole('button', { name: /^الإشعارات/ });

describe('NotificationsMenu', () => {
  it('announces the unread count on the bell', () => {
    render(<Harness role="Parent" />);

    expect(getBell()).toHaveAccessibleName('الإشعارات (2 غير مقروءة)');
    expect(getBell()).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens the panel, focuses it, and closes with Escape returning focus', async () => {
    render(<Harness role="Parent" />);

    await userEvent.click(getBell());
    const panel = screen.getByRole('dialog', { name: 'الإشعارات' });
    expect(panel).toHaveFocus();
    expect(getBell()).toHaveAttribute('aria-expanded', 'true');
    expect(within(panel).getAllByRole('listitem')).toHaveLength(3);

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(getBell()).toHaveFocus();
  });

  it('closes when the bell is pressed again or on an outside click', async () => {
    render(
      <>
        <Harness role="Parent" />
        <p>خارج القائمة</p>
      </>,
    );

    await userEvent.click(getBell());
    await userEvent.click(getBell());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(getBell());
    await userEvent.click(screen.getByText('خارج القائمة'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('marks everything as read and updates the badge', async () => {
    render(<Harness role="Parent" />);
    await userEvent.click(getBell());

    await userEvent.click(screen.getByRole('button', { name: 'تعليم الكل كمقروء' }));

    expect(getBell()).toHaveAccessibleName('الإشعارات');
    expect(screen.queryByText('جديد')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'تعليم الكل كمقروء' })).not.toBeInTheDocument();
  });

  it('deletes a notification and shows the empty state when none remain', async () => {
    render(<Harness role="Admin" />);
    await userEvent.click(getBell());

    await userEvent.click(screen.getByRole('button', { name: 'حذف الإشعار: حساب جديد' }));

    expect(screen.getByText('لا توجد إشعارات')).toBeInTheDocument();
    expect(getBell()).toHaveAccessibleName('الإشعارات');
  });
});

describe('getPanelPosition', () => {
  const anchor = (right: number) => ({ bottom: 60, right }) as DOMRect;

  it('keeps the desktop panel inside the viewport', () => {
    const position = getPanelPosition(anchor(1400), { width: 1440, height: 900 });

    expect(position.insetInlineStart).toBe(40);
    expect(position.inlineSize).toBe(352);
  });

  it('clamps a panel that would overflow the far edge', () => {
    const position = getPanelPosition(anchor(200), { width: 1100, height: 900 });

    expect(position.insetInlineStart).toBe(1100 - 12 - 352);
  });

  it('becomes a full-width sheet on small screens', () => {
    const position = getPanelPosition(anchor(100), { width: 500, height: 800 });

    expect(position).toMatchObject({ insetInlineStart: 12, insetInlineEnd: 12 });
  });
});
