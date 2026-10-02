import { MOCK_SESSION_USERS } from '@/app/dev/mockSessions';
import {
  AdminDashboardPage,
  ParentDashboardPage,
  SpecialistDashboardPage,
  SuperAdminPanelPage,
  TeacherDashboardPage,
} from '@/features/dashboards';

/* Compose each role's dashboard with its TEMPORARY mock session user (no auth yet). */

export function ParentDashboardRoute() {
  return <ParentDashboardPage parentName={MOCK_SESSION_USERS.Parent.name} />;
}

export function TeacherDashboardRoute() {
  return <TeacherDashboardPage userName={MOCK_SESSION_USERS.Teacher.name} />;
}

export function SpecialistDashboardRoute() {
  return <SpecialistDashboardPage userName={MOCK_SESSION_USERS.Specialist.name} />;
}

export function AdminDashboardRoute() {
  return <AdminDashboardPage userName={MOCK_SESSION_USERS.Admin.name} />;
}

export function SuperAdminPanelRoute() {
  return <SuperAdminPanelPage userName={MOCK_SESSION_USERS.SuperAdmin.name} />;
}
