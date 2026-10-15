import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import { AuthHttpBridge } from '@/app/providers/AuthHttpBridge';
import { createQueryClient } from '@/app/providers/queryClient';
import { AppErrorBoundary } from '@/components/shared/AppErrorBoundary';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Single place where global providers are composed.
 * The session itself is a Zustand store (`services/session`); `AuthHttpBridge` wires it to HTTP.
 */
export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(createQueryClient);

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthHttpBridge />
        {children}
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}
