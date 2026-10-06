/**
 * TEMPORARY MOCK DATA — in-memory "database" behind the MSW handlers (tests + dev mock mode).
 * Fictional records following docs/MOCK_DATA.md. Feature handler files add their own tables
 * here; `resetMockDb()` restores the initial state (called before every test).
 */
import type { UserRole } from '@/types/roles';

export const MOCK_PASSWORD = 'Demo@1234';

export interface MockUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  /** Role value as the backend sends it (Arabic for the roles observed live). */
  roleValue: string;
}

export const MOCK_USERS: readonly MockUser[] = [
  {
    id: 'u-parent',
    fullName: 'محمد أحمد',
    email: 'parent@demo.test',
    role: 'Parent',
    roleValue: 'ولي أمر',
  },
  {
    id: 'u-teacher',
    fullName: 'أ. سارة خالد',
    email: 'teacher@demo.test',
    role: 'Teacher',
    roleValue: 'معلم/ة',
  },
  {
    id: 'u-specialist',
    fullName: 'أ. ليلى حسن',
    email: 'specialist@demo.test',
    role: 'Specialist',
    roleValue: 'أخصائي/ة',
  },
  {
    id: 'u-admin',
    fullName: 'خالد سعيد',
    email: 'admin@demo.test',
    role: 'Admin',
    roleValue: 'Admin',
  },
  {
    id: 'u-superadmin',
    fullName: 'عبدالله منصور',
    email: 'superadmin@demo.test',
    role: 'SuperAdmin',
    roleValue: 'SuperAdmin',
  },
  {
    id: 'u-parent-2',
    fullName: 'خالد يوسف',
    email: 'parent2@demo.test',
    role: 'Parent',
    roleValue: 'ولي أمر',
  },
];

type Reset = () => void;
const resetters: Reset[] = [];

/** Feature tables register a reset so every test starts from the same data. */
export function registerMockTable(reset: Reset): void {
  resetters.push(reset);
  reset();
}

export function resetMockDb(): void {
  for (const reset of resetters) reset();
}

let sequence = 0;
/** Deterministic GUID-like ids for records created during a session. */
export function mockId(): string {
  sequence += 1;
  return `00000000-0000-4000-8000-${sequence.toString().padStart(12, '0')}`;
}
