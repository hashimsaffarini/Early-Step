import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { routes } from '@/app/router/routes';
import { getAreaPaths, ROUTE_PATHS } from '@/constants/routes';
import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { useSessionStore } from '@/services/session';
import { renderWithRouter } from '@/test/renderWithRouter';
import { signInAs, signInForPath } from '@/test/session';

/** Renders the real route tree, signed in as the role that owns the path. */
function renderAt(path: string) {
  signInForPath(path);
  return renderWithRouter(routes, path).router;
}

describe('route guards', () => {
  it('sends a signed-out visitor to login and remembers the target', async () => {
    const { router } = renderWithRouter(routes, getAreaPaths('Teacher').reports);

    expect(await screen.findByRole('heading', { name: 'أهلاً بعودتك!' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(ROUTE_PATHS.login);
    expect(router.state.location.state).toEqual({ from: getAreaPaths('Teacher').reports });
  });

  it('blocks a signed-in user from another role area', async () => {
    signInAs('Parent');
    const { router } = renderWithRouter(routes, getAreaPaths('Admin').dashboard);

    expect(await screen.findByText('غير مصرّح لك بالوصول')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(ROUTE_PATHS.unauthorized);
  });

  it('sends a signed-in user away from the login page to their own area', async () => {
    signInAs('Specialist');
    const { router } = renderWithRouter(routes, ROUTE_PATHS.login);

    await screen.findAllByRole('navigation', { name: 'القائمة الرئيسية' });
    expect(router.state.location.pathname).toBe(getAreaPaths('Specialist').dashboard);
  });

  it('logs out locally: clears the session and the cache, then shows login', async () => {
    const router = renderAt(ROUTE_PATHS.parentDashboard);
    await screen.findByRole('heading', { level: 1, name: /محمد أحمد/ });

    const [logout] = screen.getAllByRole('button', { name: 'تسجيل الخروج' });
    if (!logout) throw new Error('logout not found');
    await userEvent.click(logout);

    expect(await screen.findByRole('heading', { name: 'أهلاً بعودتك!' })).toBeInTheDocument();
    expect(useSessionStore.getState().session).toBeNull();
    expect(router.state.location.pathname).toBe(ROUTE_PATHS.login);
  });
});

/** What the store holds after a reload: a stored token, not yet confirmed by `Auth/me`. */
function reloadWithToken(accessToken: string) {
  useSessionStore.setState({ session: null, pending: { accessToken, expiresAt: null } });
}

describe('session restore after a reload (GET Auth/me)', () => {
  it('confirms the stored token, then opens the requested page', async () => {
    reloadWithToken('mock-token-u-parent');
    renderWithRouter(routes, ROUTE_PATHS.parentChildren);

    expect(await screen.findByText('جارٍ التحقق من الجلسة…')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 1, name: 'أطفالي' })).toBeInTheDocument();
    expect(useSessionStore.getState().session?.user).toMatchObject({
      id: 'u-parent',
      role: 'Parent',
    });
  });

  it('signs out and shows login when the stored token is rejected (401)', async () => {
    reloadWithToken('expired-or-invalid');
    const { router } = renderWithRouter(routes, ROUTE_PATHS.parentChildren);

    expect(await screen.findByRole('heading', { name: 'أهلاً بعودتك!' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(ROUTE_PATHS.login);
    expect(useSessionStore.getState()).toMatchObject({ session: null, pending: null });
  });

  it('uses the role from Auth/me for direct navigation to another area', async () => {
    reloadWithToken('mock-token-u-parent');
    const { router } = renderWithRouter(routes, getAreaPaths('Admin').dashboard);

    expect(await screen.findByText('غير مصرّح لك بالوصول')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(ROUTE_PATHS.unauthorized);
  });

  it('keeps the token and offers a retry when Auth/me fails for another reason', async () => {
    let calls = 0;
    server.use(
      http.get(apiUrl('Auth/me'), () => {
        calls += 1;
        return calls === 1
          ? HttpResponse.json({ message: 'unavailable' }, { status: 503 })
          : HttpResponse.json({ id: 'u-parent', fullName: 'محمد أحمد', roles: ['ولي أمر'] });
      }),
    );
    reloadWithToken('mock-token-u-parent');
    renderWithRouter(routes, ROUTE_PATHS.parentChildren);

    expect(await screen.findByText('تعذّر التحقق من الجلسة')).toBeInTheDocument();
    expect(useSessionStore.getState().pending).not.toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'إعادة المحاولة' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'أطفالي' })).toBeInTheDocument();
  }, 15_000);
});

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
    expect(hrefs).toEqual([paths.dashboard, paths.children, paths.reports, paths.messages]);
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
