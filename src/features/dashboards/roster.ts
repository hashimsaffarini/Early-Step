import type { UserRole } from '@/types/roles';

import type { RosterChild, RosterUser } from './types';

/** Case-insensitive name search (trimmed). An empty query matches everything. */
export function matchesName(name: string, query: string): boolean {
  const needle = query.trim().toLowerCase();
  return needle === '' || name.toLowerCase().includes(needle);
}

export function countByStatus(children: readonly RosterChild[], status: RosterChild['status']) {
  return children.filter((child) => child.status === status).length;
}

export function countReports(children: readonly RosterChild[]): number {
  return children.reduce((total, child) => total + child.reportCount, 0);
}

export function countUsersByRole(users: readonly RosterUser[], role: UserRole): number {
  return users.filter((user) => user.role === role).length;
}
