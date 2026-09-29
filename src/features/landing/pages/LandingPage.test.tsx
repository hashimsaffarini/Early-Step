import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ROUTE_PATHS } from '@/constants/routes';
import { renderWithRouter } from '@/test/renderWithRouter';

import { LandingPage } from './LandingPage';

function renderLanding() {
  return renderWithRouter([
    { path: ROUTE_PATHS.home, element: <LandingPage /> },
    { path: ROUTE_PATHS.login, element: <h1>صفحة الدخول</h1> },
    { path: ROUTE_PATHS.register, element: <h1>صفحة التسجيل</h1> },
  ]);
}

describe('LandingPage', () => {
  it('renders the hero, illustration and call to action', () => {
    renderLanding();

    expect(screen.getByRole('heading', { level: 1, name: /اكتشف إمكانات/ })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /أمّ تبتسم/ })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'جاهز لاكتشاف موهبة طفلك؟' }),
    ).toBeInTheDocument();
  });

  it('does not show fabricated statistics', () => {
    renderLanding();

    expect(screen.queryByText(/85%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/100%/)).not.toBeInTheDocument();
  });

  it('navigates to register from the primary hero CTA', async () => {
    renderLanding();

    await userEvent.click(screen.getByRole('link', { name: 'سجل مجاناً' }));

    expect(screen.getByRole('heading', { name: 'صفحة التسجيل' })).toBeInTheDocument();
  });

  it('navigates to login from the navbar', async () => {
    renderLanding();
    const [navLogin] = screen.getAllByRole('link', { name: 'تسجيل الدخول' });
    if (!navLogin) throw new Error('login link not found');

    await userEvent.click(navLogin);

    expect(screen.getByRole('heading', { name: 'صفحة الدخول' })).toBeInTheDocument();
  });
});
