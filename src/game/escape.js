import { legalMoves } from './rules.js';

export const SIZE = 7;
export const DIFFS = {
  facil: { name: 'Fácil', turns: 5, guardEvery: 2 },
  normal: { name: 'Normal', turns: 4, guardEvery: 1 },
  dificil: { name: 'Difícil', turns: 4, guardEvery: 1 },
};
const board = () => ({ rows: SIZE, cols: SIZE, holes: new Set(), terrain: new Map(), portals: new Map() });
const piece = (id, type, color, row, col) => ({ id, type, color, row, col });
export function newEscape(key = 'normal') {
  const diff = DIFFS[key] || DIFFS.normal;
  return { diff, board: board(), pieces: [piece('runner', 'knight', 'light', 6, 3), piece('guard', 'pawn', 'dark', 2, 3)], turns: diff.turns, over: null, last: null };
}
export const legal = (s) => s.over ? [] : legalMoves(s.pieces.find((p) => p.id === 'runner'), s.pieces, s.board).filter((m) => !m.hits.length);
export function move(s, row, col) {
  if (s.over) return false;
  const runner = s.pieces.find((p) => p.id === 'runner');
  const guard = s.pieces.find((p) => p.id === 'guard');
  const m = legal(s).find((x) => x.row === row && x.col === col);
  if (!m) return false;
  const from = { row: runner.row, col: runner.col };
  runner.row = row; runner.col = col;
  s.last = { id: runner.id, from, to: { row, col } };
  s.turns--;
  if (runner.row === 0) { s.over = 'win'; return true; }
  if ((s.diff.turns - s.turns) % s.diff.guardEvery === 0) guard.row++;
  if (guard.row === runner.row && guard.col === runner.col) s.over = 'lose';
  else if (guard.row >= SIZE || s.turns <= 0) s.over = 'lose';
  return true;
}
