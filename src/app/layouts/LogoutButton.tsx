import { useQueryClient } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/Button';
import { ROUTE_PATHS } from '@/constants/routes';
import { useSessionStore } from '@/services/session';

/**
 * Local logout: the backend has no logout/revoke endpoint, so the token is dropped from storage
 * and every cached query is cleared (no data from this account survives for the next one).
 */
export function LogoutButton() {
  const queryClient = useQueryClient();
  const signOut = useSessionStore((state) => state.signOut);
  const navigate = useNavigate();
  return (
    <Button
      variant="ghost"
      fullWidth
      iconStart={<LogOut aria-hidden="true" />}
      onClick={() => {
        signOut();
        queryClient.clear();
        void navigate(ROUTE_PATHS.login, { replace: true });
      }}
    >
      تسجيل الخروج
    </Button>
  );
}
