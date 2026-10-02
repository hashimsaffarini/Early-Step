import { SPOT_LEVELS } from './content';
import { buildSpotGrid } from './spotLogic';

describe('spot it logic', () => {
  it.each(SPOT_LEVELS.map((level, index) => [index + 1, level] as const))(
    'level %i has the right grid size and number of targets',
    (_, level) => {
      const grid = buildSpotGrid(level);

      expect(grid).toHaveLength(level.gridSize);
      expect(grid.filter((cell) => cell.isTarget)).toHaveLength(level.count);
      expect(new Set(grid.map((cell) => cell.id)).size).toBe(level.gridSize);
    },
  );
});
