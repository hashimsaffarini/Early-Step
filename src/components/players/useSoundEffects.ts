import { useCallback, useState } from 'react';

import { playSoundEffect, type SoundEffect } from './soundEffects';

export interface SoundEffects {
  isMuted: boolean;
  toggleMuted: () => void;
  play: (effect: SoundEffect) => void;
}

/** Player sound effects with a mute switch (local state; pair with `SoundToggle`). */
export function useSoundEffects(): SoundEffects {
  const [isMuted, setIsMuted] = useState(false);

  const play = useCallback(
    (effect: SoundEffect) => {
      if (!isMuted) playSoundEffect(effect);
    },
    [isMuted],
  );

  const toggleMuted = useCallback(() => {
    setIsMuted((muted) => !muted);
  }, []);

  return { isMuted, toggleMuted, play };
}
