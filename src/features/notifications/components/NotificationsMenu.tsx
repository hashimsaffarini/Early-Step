import { Bell, BookOpen, CheckCheck, FileText, Info, MessageCircle, Trash2, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';

import { EmptyState } from '@/components/shared/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { cx } from '@/utils/classNames';

import type { NotificationsState } from '../hooks/useNotifications';
import type { NotificationType } from '../types';

import styles from './NotificationsMenu.module.css';
import { formatNotificationTime } from './notificationTime';
import { getPanelPosition } from './panelPosition';

const MAX_BADGE = 9;

const TYPE_ICONS = {
  report: FileText,
  plan: BookOpen,
  message: MessageCircle,
  info: Info,
} as const satisfies Record<NotificationType, unknown>;

export type NotificationsMenuProps = NotificationsState;

/**
 * Bell + notifications panel (Replit dropdown, fixed): the panel is portalled and positioned
 * inside the viewport, becomes a full-width sheet on small screens, closes on Escape or an
 * outside click, and returns focus to the bell.
 */
export function NotificationsMenu({ items, onMarkAllRead, onRemove }: NotificationsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<CSSProperties>({});
  const anchorRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const titleId = useId();

  const unread = items.filter((item) => !item.isRead).length;
  const bellLabel = unread > 0 ? `الإشعارات (${String(unread)} غير مقروءة)` : 'الإشعارات';

  /** `IconButton` does not forward refs, so the bell is found inside its anchor. */
  const getBell = () => anchorRef.current?.querySelector('button') ?? null;

  const close = (returnFocus: boolean) => {
    setIsOpen(false);
    if (returnFocus) getBell()?.focus();
  };

  const open = () => {
    const anchor = getBell()?.getBoundingClientRect();
    if (anchor) {
      setPosition(
        getPanelPosition(anchor, { width: window.innerWidth, height: window.innerHeight }),
      );
    }
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        anchorRef.current?.querySelector('button')?.focus();
      }
    };
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    const onResize = () => {
      setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('resize', onResize);
    };
  }, [isOpen]);

  const panel = (
    <div
      ref={panelRef}
      id={panelId}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={styles.panel}
      style={position}
    >
      <div className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          الإشعارات
        </h2>
        <div className={styles.headerActions}>
          {unread > 0 ? (
            <button type="button" className={styles.markAll} onClick={onMarkAllRead}>
              <CheckCheck aria-hidden="true" />
              تعليم الكل كمقروء
            </button>
          ) : null}
          <IconButton
            label="إغلاق الإشعارات"
            icon={X}
            onClick={() => {
              close(true);
            }}
          />
        </div>
      </div>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <EmptyState isBoxed={false} icon={<Bell />} title="لا توجد إشعارات" />
        </div>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => {
            const Icon = TYPE_ICONS[item.type];
            return (
              <li key={item.id} className={cx(styles.item, !item.isRead && styles.unread)}>
                <span className={cx(styles.typeIcon, styles[item.type])} aria-hidden="true">
                  <Icon />
                </span>
                <div className={styles.text}>
                  <p className={styles.itemTitle}>
                    {item.title}
                    {item.isRead ? null : <span className={styles.newTag}>جديد</span>}
                  </p>
                  <p className={styles.body}>{item.body}</p>
                  <time className={styles.time} dateTime={item.createdAt}>
                    {formatNotificationTime(item.createdAt)}
                  </time>
                </div>
                <IconButton
                  label={`حذف الإشعار: ${item.title}`}
                  icon={Trash2}
                  onClick={() => {
                    onRemove(item.id);
                  }}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  return (
    <span ref={anchorRef} className={styles.anchor}>
      <IconButton
        label={bellLabel}
        icon={Bell}
        variant="muted"
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        aria-haspopup="dialog"
        onClick={() => {
          if (isOpen) close(false);
          else open();
        }}
      />
      {unread > 0 ? (
        <span className={styles.count} aria-hidden="true">
          {unread > MAX_BADGE ? `${String(MAX_BADGE)}+` : unread}
        </span>
      ) : null}
      {isOpen ? createPortal(panel, document.body) : null}
    </span>
  );
}
