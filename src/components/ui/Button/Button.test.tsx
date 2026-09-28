import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from './Button';

describe('Button', () => {
  it('calls onClick when pressed', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>حفظ</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'حفظ' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled and busy while loading', async () => {
    const onClick = vi.fn();
    render(
      <Button isLoading onClick={onClick}>
        حفظ
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'حفظ' });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('defaults to type="button" so it never submits forms by accident', () => {
    render(<Button>إلغاء</Button>);

    expect(screen.getByRole('button', { name: 'إلغاء' })).toHaveAttribute('type', 'button');
  });
});
