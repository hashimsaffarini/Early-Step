import {
  AdminDashboardPage,
  ParentDashboardPage,
  SpecialistDashboardPage,
  SuperAdminPanelPage,
  TeacherDashboardPage,
} from '@/features/dashboards';
import { useSession } from '@/services/session';

/* Compose each role's dashboard with the signed-in user's name (routes are behind RequireRole). */

function useUserName(): string {
  return useSession()?.user.name ?? '';
}

export function ParentDashboardRoute() {
  return <ParentDashboardPage parentName={useUserName()} />;
}

export function TeacherDashboardRoute() {
  return <TeacherDashboardPage userName={useUserName()} />;
}

export function SpecialistDashboardRoute() {
  return <SpecialistDashboardPage userName={useUserName()} />;
}

export function AdminDashboardRoute() {
  return <AdminDashboardPage userName={useUserName()} />;
}

export function SuperAdminPanelRoute() {
  return <SuperAdminPanelPage userName={useUserName()} />;
}
