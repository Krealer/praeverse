import type { Tile } from '../lib/types';

const gridSize = 10;

const map01: Tile[][] = [];

for (let y = 0; y < gridSize; y++) {
  const row: Tile[] = [];
  for (let x = 0; x < gridSize; x++) {
    if (x === 0 || y === 0 || x === gridSize - 1 || y === gridSize - 1 || (x === 5 && y !== 2)) {
      row.push({ x, y, type: 'WALL' });
    } else if (x === 5 && y === 2) {
      row.push({ x, y, type: 'DOOR', destination: 'map02' });
    } else if (x === 3 && y === 3) {
      row.push({ x, y, type: 'NPC', npcColor: '#2aa', dialogueId: 'npc_1' });
    } else {
      row.push({ x, y, type: 'GROUND' });
    }
  }
  map01.push(row);
}

export default map01;
