import { Component, type ErrorInfo, type ReactNode } from 'react';

import { ErrorState } from '@/components/shared/ErrorState';
import { Button } from '@/components/ui/Button';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

/**
 * Last-resort boundary for errors thrown outside the router (providers, etc.).
 * Route-level errors are handled by `RouteErrorPage`.
 */
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  override state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error(error, info.componentStack);
    }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <main className="page-center">
          <ErrorState
            title="حدث خطأ غير متوقع"
            description="يرجى إعادة تحميل الصفحة."
            action={
              <Button
                onClick={() => {
                  window.location.reload();
                }}
              >
                إعادة التحميل
              </Button>
            }
          />
        </main>
      );
    }

    return this.props.children;
  }
}
