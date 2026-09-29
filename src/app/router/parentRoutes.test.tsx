import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { routes } from '@/app/router/routes';
import { ROUTE_PATHS } from '@/constants/routes';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('parent area routing', () => {
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

  it('shows unfinished parent areas as unavailable items, not links', async () => {
    renderAt(ROUTE_PATHS.parentDashboard);
    await screen.findByRole('heading', { level: 1, name: /محمد أحمد/ });

    const [desktopNav] = screen.getAllByRole('navigation', { name: 'القائمة الرئيسية' });
    if (!desktopNav) throw new Error('navigation not found');
    expect(within(desktopNav).getAllByRole('link')).toHaveLength(2);
    expect(
      within(desktopNav).getByText('التقييمات').closest('[aria-disabled="true"]'),
    ).not.toBeNull();
    expect(within(desktopNav).getAllByText('قريباً').length).toBeGreaterThan(0);
  });
});
