import { Match } from '../../game/match.js';
import { makePiece } from '../../game/generate.js';
import { RIVALS } from '../../game/difficulty.js';

export const DIAMOND_RADIUS = 6;
export const DIAMOND_SIZE = DIAMOND_RADIUS * 2 + 1;
export const DIAMOND_TILE_COUNT = 1 + 2 * DIAMOND_RADIUS * (DIAMOND_RADIUS + 1);
export const DIAMOND_DIFFICULTIES = Object.freeze({
  facil: { id: 'facil', name: 'Fácil', rival: 'aprendiz' },
  normal: { id: 'normal', name: 'Normal', rival: 'oficial' },
  dificil: { id: 'dificil', name: 'Difícil', rival: 'maestro' },
});

export function createDiamondBoard(radius = DIAMOND_RADIUS) {
  if (!Number.isInteger(radius) || radius < 3 || radius > 9) throw new RangeError('El radio del rombo debe estar entre 3 y 9.');
  const size = radius * 2 + 1;
  const center = radius;
  const holes = new Set();
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (Math.abs(row - center) + Math.abs(col - center) > radius) holes.add(row + ',' + col);
    }
  }
  return { rows: size, cols: size, holes, protectRows: 0, shape: 'diamond', radius };
}

export function createDiamondPieces() {
  return [
    makePiece('king', 'light', 6, 0, { royal: true }),
    makePiece('rook', 'light', 4, 2),
    makePiece('bishop', 'light', 6, 2),
    makePiece('knight', 'light', 8, 2),
    makePiece('king', 'dark', 6, 12, { royal: true }),
    makePiece('rook', 'dark', 4, 10),
    makePiece('bishop', 'dark', 6, 10),
    makePiece('knight', 'dark', 8, 10),
  ];
}

export function createDiamondMatch(difficulty = 'normal', players) {
  const setting = DIAMOND_DIFFICULTIES[difficulty] || DIAMOND_DIFFICULTIES.normal;
  return new Match({
    board: createDiamondBoard(),
    pieces: createDiamondPieces(),
    players: players || [
      { color: 'light', kind: 'human', name: 'Tú' },
      { color: 'dark', kind: 'bot', name: 'Rival' },
    ],
    rival: RIVALS[setting.rival],
  });
}
