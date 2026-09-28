import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

import { IconButton } from '@/components/ui/IconButton';

import styles from './MobileNavDrawer.module.css';

const LABELS = {
  drawer: 'القائمة الرئيسية',
  close: 'إغلاق القائمة',
} as const;

export interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
  children: ReactNode;
}

/** Modal navigation drawer (native `<dialog>`: focus trap, Escape, inert page). */
export function MobileNavDrawer({ isOpen, onClose, id, children }: MobileNavDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      id={id}
      className={styles.drawer}
      aria-label={LABELS.drawer}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {isOpen ? (
        <>
          <IconButton
            className={styles.close}
            label={LABELS.close}
            icon={X}
            variant="muted"
            onClick={onClose}
          />
          {children}
        </>
      ) : null}
    </dialog>
  );
}
