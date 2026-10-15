import { MockModeBanner } from '@/app/dev/MockModeBanner';
import { AppProviders } from '@/app/providers/AppProviders';
import { AppRouter } from '@/app/router/AppRouter';

export function App() {
  return (
    <AppProviders>
      <MockModeBanner />
      <AppRouter />
    </AppProviders>
  );
}
