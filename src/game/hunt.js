// La cacería: atrapa al peón fugitivo con movimientos legales de Zug antes de que alcance la salida.
import { legalMoves } from './rules.js';

export const SIZE = 7;
export const DIFFS = {
  facil: { name: 'Fácil', turns: 7, fleeEvery: 3 },
  normal: { name: 'Normal', turns: 6, fleeEvery: 2 },
  dificil: { name: 'Difícil', turns: 5, fleeEvery: 1 },
};
const board = () => ({ rows: SIZE, cols: SIZE, holes: new Set(), terrain: new Map(), portals: new Map() });
const make = (id, type, color, row, col) => ({ id, type, color, row, col });
export function newHunt(key = 'normal') {
  const diff = DIFFS[key] || DIFFS.normal;
  return { diff, board: board(), pieces: [make('hunter', 'rook', 'light', 6, 3), make('runner', 'pawn', 'dark', 3, 3)], turns: diff.turns, over: null, last: null, escaped: 0 };
}
export const legal = (s) => s.over ? [] : legalMoves(s.pieces.find((p) => p.id === 'hunter'), s.pieces, s.board);
export function move(s, row, col) {
  if (s.over) return false;
  const hunter = s.pieces.find((p) => p.id === 'hunter');
  const runner = s.pieces.find((p) => p.id === 'runner');
  const m = legal(s).find((x) => x.row === row && x.col === col);
  if (!m) return false;
  const from = { row: hunter.row, col: hunter.col };
  const caught = m.hits.some((p) => p.id === runner.id);
  hunter.row = row; hunter.col = col;
  s.last = { id: hunter.id, from, to: { row, col }, caught: false };
  s.turns--;
  if (caught) { s.pieces = [hunter]; s.over = 'win'; s.last.caught = true; return true; }
  if ((s.diff.turns - s.turns) % s.diff.fleeEvery === 0) {
    const choices = [-1, 0, 1].map((dc) => ({ row: runner.row - 1, col: runner.col + dc }))
      .filter((p) => p.row >= 0 && p.col >= 0 && p.col < SIZE && !(p.row === hunter.row && p.col === hunter.col));
    if (!choices.length) { s.over = 'win'; s.pieces = [hunter]; return true; }
    choices.sort((a, b) => Math.abs(a.col - hunter.col) - Math.abs(b.col - hunter.col));
    const next = choices[0];
    runner.row = next.row; runner.col = next.col;
    if (runner.row === 0) { s.over = 'lose'; s.escaped = 1; }
  }
  if (!s.over && s.turns <= 0) s.over = 'lose';
  return true;
}
