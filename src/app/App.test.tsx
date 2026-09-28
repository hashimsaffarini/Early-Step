import { render, screen } from '@testing-library/react';

import { App } from '@/app/App';

describe('App', () => {
  it('boots with providers and router and renders the home route', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Early Step' })).toBeInTheDocument();
  });
});
