import { ArrowLeft, Flag } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/Button';

export interface NextButtonProps {
  isLast: boolean;
  onClick: () => void;
  label?: string | undefined;
}

/**
 * «التالي» (or «إنهاء اللعبة» on the last round) — the child sets the pace.
 * Takes focus when it appears, because the answer buttons become disabled after answering.
 */
export function NextButton({ isLast, onClick, label }: NextButtonProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    wrapperRef.current?.querySelector('button')?.focus();
  }, []);

  return (
    <span ref={wrapperRef}>
      <Button
        size="lg"
        onClick={onClick}
        iconEnd={isLast ? <Flag aria-hidden="true" /> : <ArrowLeft aria-hidden="true" />}
      >
        {label ?? (isLast ? 'إنهاء اللعبة' : 'التالي')}
      </Button>
    </span>
  );
}
