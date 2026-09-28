import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { House, Users } from 'lucide-react';

import { renderWithRouter } from '@/test/renderWithRouter';

import { DashboardLayout } from './DashboardLayout';

const NAV = [
  { to: '/area', label: 'الرئيسية', icon: House, end: true },
  { to: '/area/children', label: 'الأطفال', icon: Users, badgeCount: 12 },
];

function renderLayout(path = '/area') {
  return renderWithRouter(
    [
      {
        path: '/area',
        element: <DashboardLayout navItems={NAV} user={{ name: 'سارة', roleLabel: 'ولي الأمر' }} />,
        children: [
          { index: true, element: <h1>الصفحة الرئيسية</h1> },
          { path: 'children', element: <h1>صفحة الأطفال</h1> },
        ],
      },
    ],
    path,
  );
}

describe('DashboardLayout', () => {
  it('renders navigation, the user and the routed page', () => {
    renderLayout();

    expect(screen.getByRole('heading', { name: 'الصفحة الرئيسية' })).toBeInTheDocument();
    expect(screen.getAllByText('سارة').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'الرئيسية' })).toHaveAttribute('aria-current', 'page');
  });

  it('caps the badge and gives it an accessible label', () => {
    renderLayout();

    expect(screen.getByText('9+')).toBeInTheDocument();
    expect(screen.getByText('12 غير مقروءة')).toBeInTheDocument();
  });

  it('opens the mobile drawer and closes it after navigating', async () => {
    renderLayout();
    const menuButton = screen.getByRole('button', { name: 'فتح القائمة' });

    await userEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    const drawer = screen.getByRole('dialog', { name: 'القائمة الرئيسية' });
    expect(drawer).toHaveAttribute('open');

    const drawerLinks = screen.getAllByRole('link', { name: /الأطفال/ });
    const lastLink = drawerLinks.at(-1);
    if (!lastLink) throw new Error('drawer link not found');
    await userEvent.click(lastLink);

    expect(screen.getByRole('heading', { name: 'صفحة الأطفال' })).toBeInTheDocument();
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });
});
