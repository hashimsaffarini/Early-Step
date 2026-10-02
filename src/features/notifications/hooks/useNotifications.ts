import { useCallback, useState } from 'react';

import type { UserRole } from '@/types/roles';

import { getMockNotifications } from '../mock/notifications.mock';
import type { AppNotification } from '../types';

export interface NotificationsState {
  items: readonly AppNotification[];
  onMarkAllRead: () => void;
  onRemove: (notificationId: string) => void;
}

/**
 * Local notifications state for a role area (UI only — mock data, nothing persisted).
 * Owned by the layout so the sidebar bell and the mobile-header bell stay in sync.
 */
export function useNotifications(role: UserRole): NotificationsState {
  const [items, setItems] = useState<readonly AppNotification[]>(() => getMockNotifications(role));

  const onMarkAllRead = useCallback(() => {
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
  }, []);

  const onRemove = useCallback((notificationId: string) => {
    setItems((current) => current.filter((item) => item.id !== notificationId));
  }, []);

  return { items, onMarkAllRead, onRemove };
}
