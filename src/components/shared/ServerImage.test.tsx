import { saveLocalMedia, mediaKeys } from '@/services/media/localMedia';
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
  it('tries a replacement image after a previous image failed', () => {
    const { rerender } = render(
      <ServerImage path="/uploads/old.png" alt="صورة" fallback={<span>بديل</span>} />,
    );
    fireEvent.error(screen.getByRole('img', { name: 'صورة' }));
    expect(screen.getByText('بديل')).toBeInTheDocument();
    rerender(
      <ServerImage path="/uploads/replacement.png" alt="صورة" fallback={<span>بديل</span>} />,
    );
    expect(screen.getByRole('img', { name: 'صورة' })).toHaveAttribute(
      'src',
      'https://api.test/uploads/replacement.png',
    );
    expect(screen.queryByText('بديل')).not.toBeInTheDocument();
  });
  it('shows the locally uploaded image when the server image fails', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:local-image');
    URL.revokeObjectURL = vi.fn();
    await saveLocalMedia(
      mediaKeys.option('o1'),
      new File(['png'], 'option.png', { type: 'image/png' }),
    );
    render(<ServerImage path="/uploads/404.png" mediaKey={mediaKeys.option('o1')} alt="الخيار" />);
    fireEvent.error(screen.getByRole('img', { name: 'الخيار' }));
    expect(await screen.findByRole('img', { name: 'الخيار' })).toHaveAttribute(
      'src',
      'blob:local-image',
    );
  });
});
