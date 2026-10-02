/** TEMPORARY UI DEMO CONTENT — the four colour pads (each has a name and a symbol, not colour only). */
export const COLOR_PADS = [
  { id: 'red', name: 'أحمر', symbol: '●' },
  { id: 'blue', name: 'أزرق', symbol: '■' },
  { id: 'green', name: 'أخضر', symbol: '▲' },
  { id: 'yellow', name: 'أصفر', symbol: '★' },
] as const;

export type ColorPadId = (typeof COLOR_PADS)[number]['id'];

export const COLOR_MEMORY_LEVELS = 5;
