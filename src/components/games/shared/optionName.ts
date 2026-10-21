import type { GameOption } from '../types';

/** The name of an option for screen readers (an image-only option gets its position). */
export function optionName(option: GameOption, index: number): string {
  return option.text.trim() || `الخيار ${(index + 1).toString()}`;
}
