/**
 * TEMPORARY development mock — there is no authentication yet.
 * The parent area renders with this display-only user so the dashboard UI can be built.
 * Remove when real auth provides the signed-in user. Not a security boundary.
 */
import type { ShellUser } from '@/components/layout/navigation';
import { ROLE_LABELS } from '@/constants/roleLabels';

export const MOCK_PARENT_USER: ShellUser = {
  name: 'محمد أحمد',
  roleLabel: ROLE_LABELS.Parent,
};
