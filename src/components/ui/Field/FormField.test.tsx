import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FormField } from './FormField';
import { Input } from './Input';
import { PasswordInput } from './PasswordInput';

describe('FormField', () => {
  it('associates the label, hint and error with the control', () => {
    render(
      <FormField label="البريد الإلكتروني" hint="للتسجيل" error="البريد غير صحيح" isRequired>
        {(field) => <Input {...field} />}
      </FormField>,
    );
    const input = screen.getByLabelText(/البريد الإلكتروني/);

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAccessibleDescription(/للتسجيل/);
    expect(input).toHaveAccessibleDescription(/البريد غير صحيح/);
  });

  it('marks the control valid when there is no error', () => {
    render(<FormField label="الاسم">{(field) => <Input {...field} />}</FormField>);

    expect(screen.getByLabelText('الاسم')).toHaveAttribute('aria-invalid', 'false');
  });
});

describe('PasswordInput', () => {
  it('toggles visibility with an accessible button', async () => {
    render(<FormField label="كلمة المرور">{(field) => <PasswordInput {...field} />}</FormField>);
    const input = screen.getByLabelText('كلمة المرور');

    expect(input).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByRole('button', { name: 'إظهار كلمة المرور' }));
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'إخفاء كلمة المرور' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
