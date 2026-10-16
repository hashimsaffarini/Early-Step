import { fireEvent, render, screen } from '@testing-library/react';

import { IMAGE_NOT_SERVED } from '@/components/shared/ServerImage';

import { ImageField } from './ImageField';

describe('ImageField', () => {
  it('shows the current server image, resolved against the API host', () => {
    render(
      <ImageField label="الصورة" value={null} onChange={vi.fn()} existingPath="/uploads/a.png" />,
    );
    expect(screen.getByRole('img', { name: 'الصورة الحالية' })).toHaveAttribute(
      'src',
      'https://api.test/uploads/a.png',
    );
  });

  it('says the image is saved but not served when the server file fails to load', () => {
    render(
      <ImageField label="الصورة" value={null} onChange={vi.fn()} existingPath="/uploads/a.png" />,
    );
    fireEvent.error(screen.getByRole('img', { name: 'الصورة الحالية' }));
    expect(screen.getByText(IMAGE_NOT_SERVED)).toBeInTheDocument();
  });

  it('shows nothing extra when there is no server image', () => {
    render(<ImageField label="الصورة" value={null} onChange={vi.fn()} existingPath={null} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByText(IMAGE_NOT_SERVED)).not.toBeInTheDocument();
  });
});
