import { Outlet } from 'react-router';

/**
 * Structural layout for login / register screens.
 * Visual design is TBD — follow the Replit reference (docs/DESIGN_SYSTEM.md).
 */
export function AuthLayout() {
  return (
    <main className="auth-layout">
      <div className="auth-layout__panel">
        <Outlet />
      </div>
    </main>
  );
}
