import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TOAST_DURATION_MS, ToastProvider } from './ToastProvider';
import { useToast } from './toastContext';

function Trigger() {
  const toast = useToast();
  return (
    <button
      type="button"
      onClick={() => {
        toast.success('تم حفظ البيانات بنجاح');
      }}
    >
      حفظ
    </button>
  );
}

describe('Toast', () => {
  it('announces a temporary success message in a polite live region and hides it by itself', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    const region = document.querySelector('[data-toast-region]');
    expect(region).toHaveAttribute('aria-live', 'polite');

    await userEvent.click(screen.getByRole('button', { name: 'حفظ' }));
    expect(screen.getByText('تم حفظ البيانات بنجاح')).toBeInTheDocument();
    expect(region).toContainElement(screen.getByText('تم حفظ البيانات بنجاح'));

    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS + 10);
    });
    expect(screen.queryByText('تم حفظ البيانات بنجاح')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('can be closed early with its labelled close button', async () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'حفظ' }));
    await userEvent.click(screen.getByRole('button', { name: 'إغلاق التنبيه' }));

    expect(screen.queryByText('تم حفظ البيانات بنجاح')).not.toBeInTheDocument();
  });
});
