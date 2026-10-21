import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { IMAGE_NOT_SERVED } from '@/components/shared/ServerImage';

import { ImageField } from './ImageField';

function Controlled({ existingPath }: { existingPath: string | null }) {
  const [value, setValue] = useState<File | null>(null);
  return (
    <ImageField label="صورة الخيار" value={value} onChange={setValue} existingPath={existingPath} />
  );
}

describe('ImageField (Arabic picker, client revision 2026-10)', () => {
  it('shows the current server image and offers to replace it', () => {
    render(<Controlled existingPath="/uploads/a.png" />);
    expect(screen.getByRole('img', { name: 'الصورة الحالية' })).toHaveAttribute(
      'src',
      'https://api.test/uploads/a.png',
    );
    expect(screen.getByText('استبدال الصورة')).toBeInTheDocument();
    // The native input stays labelled for keyboard and screen-reader users.
    expect(screen.getByLabelText('صورة الخيار')).toHaveAttribute('type', 'file');
  });

  it('shows a clean placeholder and the notice when the server file does not load', () => {
    render(<Controlled existingPath="/uploads/a.png" />);
    fireEvent.error(screen.getByRole('img', { name: 'الصورة الحالية' }));
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('غير متاحة')).toBeInTheDocument();
    expect(screen.getByText(IMAGE_NOT_SERVED)).toBeInTheDocument();
  });

  it('previews a newly chosen file before saving and can cancel it', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();
    render(<Controlled existingPath={null} />);
    expect(screen.getByText('لا توجد صورة')).toBeInTheDocument();
    expect(screen.getByText('اختيار صورة')).toBeInTheDocument();

    await userEvent.upload(
      screen.getByLabelText('صورة الخيار'),
      new File(['png'], 'بطة.png', { type: 'image/png' }),
    );
    expect(screen.getByRole('img', { name: 'معاينة الصورة المختارة' })).toHaveAttribute(
      'src',
      'blob:preview',
    );
    expect(screen.getByText(/صورة جديدة: بطة\.png/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'إلغاء الصورة المختارة' }));
    expect(screen.getByText('لا توجد صورة')).toBeInTheDocument();
  });
});
