import type { MouseEvent } from 'react';

/**
 * In-page anchors (`href="#id"`) for hash routing: production uses hash URLs on GitHub Pages, so
 * changing `location.hash` would navigate to a route. Scroll to and focus the target instead.
 */
export function jumpToElement(event: MouseEvent<HTMLAnchorElement>, id: string): void {
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.scrollIntoView({ block: 'start' });
  target.focus({ preventScroll: true });
}
