import type { CSSProperties } from 'react';

const DESKTOP_MIN_WIDTH_PX = 1024; // 64rem — the sidebar breakpoint
const GAP_PX = 8;
const MARGIN_PX = 12;
const PANEL_WIDTH_PX = 352; // 22rem
const PANEL_MAX_HEIGHT_PX = 448; // 28rem

/**
 * Viewport position for the notifications panel under its bell.
 * Desktop: aligned to the bell's inline-start edge (RTL: its right edge), growing toward the
 * content and clamped inside the viewport. Small screens: a full-width sheet under the header.
 * The app is RTL-only, so `insetInlineStart` is the distance from the right edge.
 */
export function getPanelPosition(anchor: DOMRect, viewport: { width: number; height: number }) {
  const top = anchor.bottom + GAP_PX;
  const maxBlockSize = Math.min(PANEL_MAX_HEIGHT_PX, viewport.height - top - MARGIN_PX);

  if (viewport.width < DESKTOP_MIN_WIDTH_PX) {
    return {
      insetBlockStart: top,
      insetInlineStart: MARGIN_PX,
      insetInlineEnd: MARGIN_PX,
      maxBlockSize,
    } satisfies CSSProperties;
  }

  const inlineSize = Math.min(PANEL_WIDTH_PX, viewport.width - 2 * MARGIN_PX);
  const fromRight = Math.max(viewport.width - anchor.right, MARGIN_PX);
  return {
    insetBlockStart: top,
    insetInlineStart: Math.min(fromRight, viewport.width - MARGIN_PX - inlineSize),
    inlineSize,
    maxBlockSize,
  } satisfies CSSProperties;
}
