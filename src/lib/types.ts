export type TileType = 'GROUND' | 'WALL' | 'NPC' | 'DOOR';

export interface Tile {
  x: number;
  y: number;
  type: TileType;
  npcColor?: string;
  dialogueId?: string;
  destination?: string;
}
