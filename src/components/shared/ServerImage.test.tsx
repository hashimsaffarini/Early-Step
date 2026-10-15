import { fireEvent, render, screen } from '@testing-library/react';

import { ServerImage } from './ServerImage';

describe('ServerImage', () => {
  it('resolves a server path against the API host', () => {
    render(<ServerImage path="/uploads/icon.png" alt="أيقونة" />);
    expect(screen.getByRole('img', { name: 'أيقونة' })).toHaveAttribute(
      'src',
      'https://api.test/uploads/icon.png',
    );
  });

  it('shows the neutral fallback only when the field is null or the image fails', () => {
    const { rerender } = render(
      <ServerImage path={null} alt="أيقونة" fallback={<span>بديل</span>} />,
    );
    expect(screen.getByText('بديل')).toBeInTheDocument();

    rerender(<ServerImage path="/uploads/missing.png" alt="أيقونة" fallback={<span>بديل</span>} />);
    expect(screen.queryByText('بديل')).not.toBeInTheDocument();
    fireEvent.error(screen.getByRole('img', { name: 'أيقونة' }));
    expect(screen.getByText('بديل')).toBeInTheDocument();
  });
});
