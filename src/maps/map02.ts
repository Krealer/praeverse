import type { Tile } from '../lib/types';

const gridSize = 10;

const map02: Tile[][] = [];

for (let y = 0; y < gridSize; y++) {
  const row: Tile[] = [];
  for (let x = 0; x < gridSize; x++) {
    if (x === 0 || y === 0 || x === gridSize - 1 || y === gridSize - 1) {
      row.push({ x, y, type: 'WALL' });
    } else if (x === 2 && y === 2) {
      row.push({ x, y, type: 'DOOR', destination: 'map01' });
    } else {
      row.push({ x, y, type: 'GROUND' });
    }
  }
  map02.push(row);
}

export default map02;
