import { vi } from 'vitest';

import type { SoundEffects } from '@/components/players';

/** Silent sound effects for component tests. */
export function createTestSound(): SoundEffects {
  return { isMuted: true, toggleMuted: vi.fn(), play: vi.fn() };
}
