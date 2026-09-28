import { Outlet } from 'react-router';

/**
 * Focused, distraction-free shell for child-facing tests and games.
 * Child UX decisions (sizes, audio, exit controls, ...) are TBD.
 */
export function ChildActivityLayout() {
  return (
    <main className="child-activity-layout">
      <Outlet />
    </main>
  );
}
