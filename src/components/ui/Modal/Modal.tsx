import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

import { IconButton } from '@/components/ui/IconButton';
import { cx } from '@/utils/classNames';

import styles from './Modal.module.css';

const CLOSE_LABEL = 'إغلاق';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  footer?: ReactNode;
  children?: ReactNode;
}

/**
 * Accessible modal built on the native `<dialog>` element: focus is trapped,
 * the page behind is inert, and Escape closes it.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  footer,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className={cx(styles.dialog, size !== 'md' && styles[size])}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // Click on the backdrop (the dialog element itself) closes the modal.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {isOpen ? (
        <>
          <header className={styles.header}>
            <div>
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
              {description ? (
                <p id={descriptionId} className={styles.description}>
                  {description}
                </p>
              ) : null}
            </div>
            <IconButton label={CLOSE_LABEL} icon={X} variant="muted" onClick={onClose} />
          </header>
          {children ? <div className={styles.body}>{children}</div> : null}
          {footer ? <footer className={styles.footer}>{footer}</footer> : null}
        </>
      ) : null}
    </dialog>
  );
}
