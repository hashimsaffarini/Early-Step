import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { IconButton } from '@/components/ui/IconButton';

import { Input, type InputProps } from './Input';

const LABELS = {
  show: 'إظهار كلمة المرور',
  hide: 'إخفاء كلمة المرور',
} as const;

export type PasswordInputProps = Omit<InputProps, 'type' | 'trailing'>;

export function PasswordInput(props: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Input
      {...props}
      type={isVisible ? 'text' : 'password'}
      trailing={
        <IconButton
          label={isVisible ? LABELS.hide : LABELS.show}
          icon={isVisible ? EyeOff : Eye}
          aria-pressed={isVisible}
          onClick={() => {
            setIsVisible((visible) => !visible);
          }}
        />
      }
    />
  );
}
