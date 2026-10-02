export type NotificationType = 'report' | 'plan' | 'message' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  /** ISO date-time. */
  createdAt: string;
  isRead: boolean;
}
