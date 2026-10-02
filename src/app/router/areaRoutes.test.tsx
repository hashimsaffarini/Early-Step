import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { routes } from '@/app/router/routes';
import { getAreaPaths, ROUTE_PATHS } from '@/constants/routes';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('role area routing', () => {
  it('redirects /parent to /parent/dashboard', async () => {
    const router = renderAt(ROUTE_PATHS.parentRoot);

    expect(await screen.findByRole('heading', { level: 1, name: /محمد أحمد/ })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(ROUTE_PATHS.parentDashboard);
  });

  it('renders parent navigation with the dashboard marked active', async () => {
    renderAt(ROUTE_PATHS.parentDashboard);
    await screen.findByRole('heading', { level: 1, name: /محمد أحمد/ });

    const [desktopNav] = screen.getAllByRole('navigation', { name: 'القائمة الرئيسية' });
    if (!desktopNav) throw new Error('navigation not found');
    expect(within(desktopNav).getByRole('link', { name: 'الرئيسية' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('renders /parent/children with "أطفالي" marked active', async () => {
    renderAt(ROUTE_PATHS.parentChildren);

    expect(await screen.findByRole('heading', { level: 1, name: 'أطفالي' })).toBeInTheDocument();
    const [desktopNav] = screen.getAllByRole('navigation', { name: 'القائمة الرئيسية' });
    if (!desktopNav) throw new Error('navigation not found');
    expect(within(desktopNav).getByRole('link', { name: 'أطفالي' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(desktopNav).getByRole('link', { name: 'الرئيسية' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('links every parent sidebar item to a real route (no unavailable items)', async () => {
    renderAt(ROUTE_PATHS.parentDashboard);
    await screen.findByRole('heading', { level: 1, name: /محمد أحمد/ });

    const [desktopNav] = screen.getAllByRole('navigation', { name: 'القائمة الرئيسية' });
    if (!desktopNav) throw new Error('navigation not found');
    const hrefs = within(desktopNav)
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));
    const paths = getAreaPaths('Parent');
    expect(hrefs).toEqual([
      paths.dashboard,
      paths.children,
      paths.tests,
      paths.games,
      paths.reports,
      paths.messages,
    ]);
    expect(within(desktopNav).queryByText('قريباً')).not.toBeInTheDocument();
  });

  it.each([
    ['Teacher', '/teacher'],
    ['Specialist', '/specialist'],
    ['Admin', '/admin'],
  ] as const)('redirects the %s area root to its dashboard', async (role, root) => {
    const router = renderAt(root);

    await screen.findAllByRole('navigation', { name: 'القائمة الرئيسية' });
    expect(router.state.location.pathname).toBe(getAreaPaths(role).dashboard);
  });

  it('renders the super admin panel with a single nav item', async () => {
    renderAt(ROUTE_PATHS.superAdmin);

    const [desktopNav] = await screen.findAllByRole('navigation', { name: 'القائمة الرئيسية' });
    if (!desktopNav) throw new Error('navigation not found');
    expect(within(desktopNav).getAllByRole('link')).toHaveLength(1);
  });
});
