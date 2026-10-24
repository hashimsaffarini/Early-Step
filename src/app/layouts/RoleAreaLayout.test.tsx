import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { routes } from '@/app/router/routes';
import { getAreaPaths, ROUTE_PATHS } from '@/constants/routes';
import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { renderWithRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

async function desktopNav() {
  const [nav] = await screen.findAllByRole('navigation', { name: 'القائمة الرئيسية' });
  if (!nav) throw new Error('navigation not found');
  return nav;
}

// The app registers these in AuthHttpBridge (AppProviders); render helpers don't mount it.

describe('RoleAreaLayout', () => {
  it('shows the unread-messages badge from Chats/unread-count', async () => {
    server.use(http.get(apiUrl('Chats/unread-count'), () => HttpResponse.json(4)));
    signInAs('Parent');
    renderWithRouter(routes, getAreaPaths('Parent').dashboard);

    const messages = within(await desktopNav()).getByRole('link', { name: /الرسائل/ });
    expect(await within(messages).findByText('4 غير مقروءة')).toBeInTheDocument();
  });

  it.each(['Parent', 'Teacher', 'Specialist', 'Admin'] as const)(
    'shows no notifications icon for the %s (client revision 2026-10)',
    async (role) => {
      signInAs(role);
      renderWithRouter(routes, getAreaPaths(role).dashboard);
      await desktopNav();

      expect(screen.queryByRole('button', { name: /الإشعارات/ })).not.toBeInTheDocument();
    },
  );

  it('shows no notifications icon for the Super Admin', async () => {
    signInAs('SuperAdmin');
    renderWithRouter(routes, ROUTE_PATHS.superAdmin);
    await desktopNav();

    expect(screen.queryByRole('button', { name: /الإشعارات/ })).not.toBeInTheDocument();
  });

  it('does not request the unread count in the super admin area', async () => {
    const requested: string[] = [];
    server.events.on('request:start', ({ request }) => {
      requested.push(new URL(request.url).pathname);
    });
    signInAs('SuperAdmin');
    renderWithRouter(routes, ROUTE_PATHS.superAdmin);
    await desktopNav();

    expect(requested.some((path) => path.endsWith('/Chats/unread-count'))).toBe(false);
    server.events.removeAllListeners();
  });
});
