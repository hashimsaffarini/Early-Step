import type { Difficulty, SortLevel } from '../types';

/** Early Step educational content for «رتّب وطابق»: put every object in its place. */
export const SORT_LEVELS: Readonly<Record<Difficulty, SortLevel>> = {
  easy: {
    zones: [
      { id: 'sea', label: 'البحر', emoji: '🌊' },
      { id: 'farm', label: 'المزرعة', emoji: '🏡' },
    ],
    items: [
      { id: 'fish', visual: { emoji: '🐟', label: 'سمكة' }, zoneId: 'sea' },
      { id: 'cow', visual: { emoji: '🐄', label: 'بقرة' }, zoneId: 'farm' },
      { id: 'whale', visual: { emoji: '🐳', label: 'حوت' }, zoneId: 'sea' },
      { id: 'hen', visual: { emoji: '🐔', label: 'دجاجة' }, zoneId: 'farm' },
    ],
  },
  medium: {
    zones: [
      { id: 'fruit', label: 'فواكه', emoji: '🧺' },
      { id: 'vehicle', label: 'وسائل نقل', emoji: '🛣️' },
      { id: 'clothes', label: 'ملابس', emoji: '👕' },
    ],
    items: [
      { id: 'apple', visual: { emoji: '🍎', label: 'تفاحة' }, zoneId: 'fruit' },
      { id: 'car', visual: { emoji: '🚗', label: 'سيارة' }, zoneId: 'vehicle' },
      { id: 'hat', visual: { emoji: '🧢', label: 'قبعة' }, zoneId: 'clothes' },
      { id: 'banana', visual: { emoji: '🍌', label: 'موزة' }, zoneId: 'fruit' },
      { id: 'bus', visual: { emoji: '🚌', label: 'حافلة' }, zoneId: 'vehicle' },
      { id: 'sock', visual: { emoji: '🧦', label: 'جورب' }, zoneId: 'clothes' },
    ],
  },
  hard: {
    zones: [
      { id: 'small', label: 'أعداد أصغر من 5', emoji: '🔹' },
      { id: 'big', label: 'أعداد أكبر من 5', emoji: '🔷' },
      { id: 'letters', label: 'حروف', emoji: '🔤' },
      { id: 'shapes', label: 'أشكال', emoji: '🔺' },
    ],
    items: [
      { id: 'n2', visual: { emoji: '2', label: 'الرقم 2' }, zoneId: 'small' },
      { id: 'n8', visual: { emoji: '8', label: 'الرقم 8' }, zoneId: 'big' },
      { id: 'lm', visual: { emoji: 'م', label: 'حرف م' }, zoneId: 'letters' },
      { id: 'circle', visual: { emoji: '⚪', label: 'دائرة' }, zoneId: 'shapes' },
      { id: 'n3', visual: { emoji: '3', label: 'الرقم 3' }, zoneId: 'small' },
      { id: 'n9', visual: { emoji: '9', label: 'الرقم 9' }, zoneId: 'big' },
      { id: 'lk', visual: { emoji: 'ك', label: 'حرف ك' }, zoneId: 'letters' },
      { id: 'square', visual: { emoji: '🟦', label: 'مربع' }, zoneId: 'shapes' },
    ],
  },
};
