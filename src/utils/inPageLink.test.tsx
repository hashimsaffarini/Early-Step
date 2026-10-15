import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { jumpToElement } from './inPageLink';

describe('jumpToElement (hash-router safe in-page links)', () => {
  it('focuses the target without changing the URL hash (which would be a route)', async () => {
    // jsdom has no scrollIntoView (every browser does).
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    window.location.hash = '#/parent/dashboard';
    render(
      <>
        <a
          href="#main-content"
          onClick={(event) => {
            jumpToElement(event, 'main-content');
          }}
        >
          تخطَّ إلى المحتوى
        </a>
        <main id="main-content">المحتوى</main>
      </>,
    );

    await userEvent.click(screen.getByRole('link', { name: 'تخطَّ إلى المحتوى' }));

    expect(window.location.hash).toBe('#/parent/dashboard');
    expect(screen.getByRole('main')).toHaveFocus();
    expect(scrollIntoView).toHaveBeenCalled();
  });
});
