import type { Ref, TextareaHTMLAttributes } from 'react';

import { cx } from '@/utils/classNames';

import styles from './controls.module.css';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({ className, ...rest }: TextareaProps) {
  return <textarea className={cx(styles.control, styles.textarea, className)} {...rest} />;
}
