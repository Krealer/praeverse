import type { Tile } from './types';

export function findPath(
  grid: Tile[][],
  start: { x: number; y: number },
  goal: { x: number; y: number }
): { x: number; y: number }[] {
  if (start.x === goal.x && start.y === goal.y) return [];
  const height = grid.length;
  const width = grid[0]?.length || 0;
  const inBounds = (x: number, y: number) => x >= 0 && y >= 0 && x < width && y < height;
  const isWalkable = (x: number, y: number) => {
    if (!inBounds(x, y)) return false;
    const type = grid[y][x].type;
    return type === 'GROUND' || type === 'DOOR';
  };

  const startKey = `${start.x},${start.y}`;
  const visited = new Set<string>([startKey]);
  const queue: { pos: { x: number; y: number }; path: { x: number; y: number }[] }[] = [
    { pos: start, path: [] },
  ];

  while (queue.length > 0) {
    const { pos, path } = queue.shift()!;

    const neighbors = [
      { x: pos.x + 1, y: pos.y },
      { x: pos.x - 1, y: pos.y },
      { x: pos.x, y: pos.y + 1 },
      { x: pos.x, y: pos.y - 1 },
    ];

    for (const n of neighbors) {
      const key = `${n.x},${n.y}`;
      if (visited.has(key) || !isWalkable(n.x, n.y)) continue;
      const newPath = [...path, { x: n.x, y: n.y }];
      if (n.x === goal.x && n.y === goal.y) {
        return newPath;
      }
      visited.add(key);
      queue.push({ pos: n, path: newPath });
    }
  }

  return [];
}
