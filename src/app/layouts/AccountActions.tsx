import { KeyRound } from 'lucide-react';
import { useState } from 'react';

import { LogoutButton } from '@/app/layouts/LogoutButton';
import { Button } from '@/components/ui/Button';
import { ChangePasswordDialog } from '@/features/auth';

import styles from './AccountActions.module.css';

/** Sidebar account actions for every role: «تغيير كلمة المرور» (client revision 2026-11) and logout. */
export function AccountActions() {
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  return (
    <div className={styles.actions}>
      <Button
        variant="ghost"
        fullWidth
        iconStart={<KeyRound aria-hidden="true" />}
        onClick={() => {
          setIsPasswordOpen(true);
        }}
      >
        تغيير كلمة المرور
      </Button>
      <LogoutButton />
      <ChangePasswordDialog
        isOpen={isPasswordOpen}
        onClose={() => {
          setIsPasswordOpen(false);
        }}
      />
    </div>
  );
}
