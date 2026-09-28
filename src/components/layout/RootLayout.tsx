import { Outlet } from 'react-router';

/** Top-level route element shared by every route. */
export function RootLayout() {
  return (
    <div className="app-root">
      <Outlet />
    </div>
  );
}
