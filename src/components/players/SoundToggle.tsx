import { Volume2, VolumeX } from 'lucide-react';

import { IconButton } from '@/components/ui/IconButton';

export interface SoundToggleProps {
  isMuted: boolean;
  onToggle: () => void;
}

/** Mute/unmute player sound effects. */
export function SoundToggle({ isMuted, onToggle }: SoundToggleProps) {
  return (
    <IconButton
      label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
      icon={isMuted ? VolumeX : Volume2}
      variant="muted"
      aria-pressed={isMuted}
      onClick={onToggle}
    />
  );
}
